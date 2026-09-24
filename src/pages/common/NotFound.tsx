import { Link } from 'react-router-dom'
import { Button } from '../../components/common/Button'

export function NotFound() {
  return (
    <div className="empty-state-container">
      <div className="empty-panel">
        <h2>Page not found</h2>
        <p>The route you requested is unavailable in SmartFleet.</p>
        <Link to="/login"><Button>Back to login</Button></Link>
      </div>
    </div>
  )
}
