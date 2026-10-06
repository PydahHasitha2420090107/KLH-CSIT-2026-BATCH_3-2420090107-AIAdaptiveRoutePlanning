import { useEffect, useMemo, useState } from 'react'
import { Bot, MessageSquare, Send, Sparkles, X } from 'lucide-react'
import { aiService } from '../../services/aiService'
import { useAuth } from '../../context/AuthContext'
import type { ChatMessage } from '../../types'

export function AIChatbot() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const role = user?.role ?? 'user'

  useEffect(() => {
    void (async () => {
      const history = await aiService.getMockChatHistory(role)
      setMessages(history)
    })()
  }, [role])

  const suggestions = useMemo(() => {
    if (role === 'manager') {
      return ['Which vehicle should be assigned to this shipment?', 'Which transport requests need assignment?', 'Show fleet utilization.']
    }
    if (role === 'driver') {
      return ['What is my next transport assignment?', 'Where is my pickup location?', 'What is my estimated travel time?']
    }
    return ['How can I create a transport request?', 'Where is my shipment?', 'What is my estimated delivery time?']
  }, [role])

  const sendPrompt = async (question: string) => {
    if (!question.trim() || loading) return

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roleContext: role,
    }

    setMessages((current) => [...current, newMessage])
    setInput('')
    setLoading(true)

    try {
      const answer = await aiService.askQuestion(question)
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleContext: role,
      }
      setMessages((current) => [...current, aiMessage])
    } catch (error) {
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: error instanceof Error ? error.message : 'The SmartFleet AI service is unavailable. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleContext: role,
      }
      setMessages((current) => [...current, aiMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!open && (
        <button type="button" className="chat-fab" onClick={() => setOpen(true)} aria-label="Open AI assistant">
          <Sparkles size={18} />
        </button>
      )}

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div>
              <div className="chat-title">SmartFleet AI Assistant</div>
              <div className="chat-subtitle">Your intelligent transport assistant</div>
            </div>
            <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label="Close AI assistant">
              <X size={16} />
            </button>
          </div>

          <div className="chat-suggestions">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" className="suggestion-chip" onClick={() => sendPrompt(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>

          <div className="chat-body">
            {messages.map((message) => (
              <div key={message.id} className={`chat-message ${message.sender}`}>
                <div className="chat-avatar">{message.sender === 'ai' ? <Bot size={14} /> : <MessageSquare size={14} />}</div>
                <div className="chat-bubble">
                  <div>{message.text}</div>
                  <small>{message.timestamp}</small>
                </div>
              </div>
            ))}
            {loading && <div className="chat-message ai"><div className="chat-avatar"><Bot size={14} /></div><div className="chat-bubble typing"><span /><span /><span /></div></div>}
          </div>

          <div className="chat-input-wrap">
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about transport requests, routes, or fleet health..." aria-label="Ask the AI assistant" />
            <button type="button" onClick={() => void sendPrompt(input)} aria-label="Send message">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
