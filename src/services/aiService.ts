import { useMockApi } from './mockRegistry'
import { API_BASE_URL, request } from './api'
import type { ChatMessage, UserRole } from '../types'

type ChatResponse = {
  success: boolean
  data: { message?: string; answer?: string }
  message: string
}

export const aiService = {
  async getRecommendations(role: UserRole, context: string): Promise<string[]> {
    if (!useMockApi()) return []

    const defaults: Record<UserRole, string[]> = {
      user: ['How can I create a transport request?', 'Where is my shipment?', 'What is my estimated delivery time?'],
      driver: ['What is my next transport assignment?', 'Where is my pickup location?', 'What is my estimated travel time?'],
      manager: ['Which vehicle should be assigned to this shipment?', 'Which transport requests need assignment?', 'Show fleet utilization.'],
    }

    if (context.includes('shipment') || context.includes('transport')) return defaults[role].slice(0, 3)
    if (context.includes('route')) return ['What route should I take?', 'Are there route alternatives?', 'Which route is best?']
    if (context.includes('fleet')) return ['Give me a fleet summary.', 'Which vehicles have poor fuel efficiency?', 'Which vehicles have high maintenance risk?']
    return defaults[role]
  },

  async askQuestion(question: string): Promise<string> {
    const response = await request<ChatResponse>(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      body: JSON.stringify({ message: question }),
    })
    const answer = response.data.message || response.data.answer
    if (!answer) throw new Error('The AI assistant returned an empty response.')
    return answer
  },

  async getMockChatHistory(role: UserRole): Promise<ChatMessage[]> {
    return [
      { id: 'welcome', sender: 'ai', text: 'Hello. I can answer SmartFleet questions using information available to your account.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), roleContext: role },
    ]
  },
}
