import { useMockApi } from './mockRegistry'
import type { ChatMessage, UserRole } from '../types'

export const aiService = {
  async getRecommendations(role: UserRole, context: string): Promise<string[]> {
    if (!useMockApi()) return []

    const defaults: Record<UserRole, string[]> = {
      user: ['How can I request a house shifting vehicle?', 'What vehicle suits my house shifting?', 'Where is my transport request?'],
      driver: ['What is my next transport assignment?', 'What material am I transporting?', 'Where is the pickup location?'],
      manager: ['Which vehicle suits this house shifting request?', 'Which lorry suits sand transportation?', 'Show today\'s transport requests.'],
    }

    if (context.includes('shipment') || context.includes('transport')) return defaults[role].slice(0, 3)
    if (context.includes('route')) return ['What route should I take?', 'Are there route alternatives?', 'Which route is best?']
    if (context.includes('fleet')) return ['Give me a fleet summary.', 'Which vehicles have poor fuel efficiency?', 'Which vehicles have high maintenance risk?']
    return defaults[role]
  },

  async askQuestion(role: UserRole, question: string): Promise<string> {
    if (!useMockApi()) return 'AI service is not connected yet.'

    if (question.toLowerCase().includes('where is my shipment') || question.toLowerCase().includes('transport request') || question.toLowerCase().includes('shipment')) {
      return 'Your house shifting request SHP-1001 is currently in Kurunegala and is on track to reach the Kandy residence by 16:45 today.'
    }

    if (question.toLowerCase().includes('maintenance')) {
      return 'Vehicle V-107 has the highest maintenance risk at 82%. It should be scheduled for inspection before the next trip.'
    }

    if (question.toLowerCase().includes('route')) {
      return 'AI recommends Route B because it offers the shortest predicted travel time and a lower congestion risk.'
    }

    if (question.toLowerCase().includes('assign') || question.toLowerCase().includes('vehicle')) {
      return 'The strongest recommendation is the medium covered truck V-104 for this local transport request, with low maintenance risk and strong fuel efficiency.'
    }

    if (role === 'manager') {
      return 'Fleet health is stable, with 5 vehicles active, 2 under caution, and 1 high-risk maintenance alert requiring attention.'
    }

    if (role === 'driver') {
      return 'Your next assignment is TRIP-203 for a house shifting request from Colombo 07 Residence to Kandy Residence. Route B is recommended with 3h 21m estimated travel time.'
    }

    return 'I recommend checking the next highest-priority transport request and confirming vehicle capacity before dispatch.'
  },

  async getMockChatHistory(role: UserRole): Promise<ChatMessage[]> {
    return [
      { id: 'm1', sender: 'ai', text: role === 'manager' ? 'I can help with fleet optimization and local transport requests.' : role === 'driver' ? 'I can help with route planning and transport assignments.' : 'I can help track your transport request and estimated arrival.', timestamp: '09:41 AM', roleContext: role },
      { id: 'm2', sender: 'user', text: role === 'manager' ? 'Which vehicle suits this house shifting request?' : role === 'driver' ? 'What is my next transport assignment?' : 'Where is my transport request?', timestamp: '09:42 AM', roleContext: role },
      { id: 'm3', sender: 'ai', text: role === 'manager' ? 'The medium covered truck V-104 is the strongest recommendation for this house shifting request.' : role === 'driver' ? 'Your next assignment is TRIP-203 from Colombo 07 Residence to Kandy Residence.' : 'Your house shifting request SHP-1001 is in Kurunegala and on schedule.', timestamp: '09:42 AM', roleContext: role },
    ]
  },
}
