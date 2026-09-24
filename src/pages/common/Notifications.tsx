import { mockNotifications } from '../../mocks/mockData'
import { Card } from '../../components/common/Card'

export function Notifications() {
  return (
    <Card title="Notifications">
      <div className="stack-list">
        {mockNotifications.map((item) => (
          <div key={item.id} className={`notice-item notice-${item.type}`}>
            <strong>{item.message}</strong>
            <small>{item.role === 'all' ? 'All roles' : item.role}</small>
          </div>
        ))}
      </div>
    </Card>
  )
}
