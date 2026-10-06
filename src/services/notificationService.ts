import { API_BASE_URL, request } from './api'
import type { NotificationItem } from '../types'

type NotificationRecord = NotificationItem & {
  id: string
  title?: string | null
  read: boolean
  createdAt: string
}

type ApiResponse<T> = { success: boolean; data: T; message: string }

export const notificationService = {
  list: async () => (await request<ApiResponse<NotificationRecord[]>>(`${API_BASE_URL}/notifications`)).data,
  markRead: async (id: string) => request<ApiResponse<{ id: string; read: boolean }>>(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: async () => request<ApiResponse<{ updated: number }>>(`${API_BASE_URL}/notifications/read-all`, { method: 'PATCH' }),
}