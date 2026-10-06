import { useEffect, useState } from 'react'
import { Card } from '../../components/common/Card'
import { notificationService } from '../../services/notificationService'

type NotificationRecord = Awaited<ReturnType<typeof notificationService.list>>[number]

export function Notifications() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    try {
      setNotifications(await notificationService.list())
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadNotifications() }, [])

  const markRead = async (notification: NotificationRecord) => {
    if (notification.read) return
    try {
      await notificationService.markRead(notification.id)
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read: true } : item))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update notification.')
    }
  }

  if (loading) return <div className="empty-state-box" role="status">Loading notifications...</div>
  if (error && notifications.length === 0) return <div className="empty-state-box" role="alert">Unable to load notifications: {error}</div>

  return (
    <Card title="Notifications">
      <div className="stack-list">
        {notifications.map((item) => (
          <div key={item.id} className={`notice-item notice-${item.type}`}>
            <strong>{item.title || item.message}</strong>
            {item.title && <small>{item.message}</small>}
            <small>{item.read ? 'Read' : 'Unread'} · {new Date(item.createdAt).toLocaleString()}</small>
            {!item.read && <button className="inline-action" onClick={() => void markRead(item)}>Mark read</button>}
          </div>
        ))}
        {notifications.length === 0 && <div className="empty-state-box">No notifications are available for your account.</div>}
      </div>
    </Card>
  )
}
