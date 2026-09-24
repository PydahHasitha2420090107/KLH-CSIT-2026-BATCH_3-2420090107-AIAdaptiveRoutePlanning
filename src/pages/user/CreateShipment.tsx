import { useState } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Badge } from '../../components/common/Badge'

export function CreateShipment() {
  const [submitted, setSubmitted] = useState(false)
  const [priority, setPriority] = useState('High')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Local transport services</div>
          <h2>Request transport</h2>
        </div>
      </div>

      <div className="content-grid two-col">
        <Card title="Transport request">
          <form className="stack-form" onSubmit={handleSubmit}>
            <div className="form-section-title">Customer Details</div>
            <div className="two-field-grid">
              <Input label="Customer name" defaultValue="Aisha Rahman" />
              <Input label="Contact number" defaultValue="+94 77 111 2222" />
            </div>

            <div className="form-section-title">Delivery Details</div>
            <div className="two-field-grid">
              <Input label="Delivery location" defaultValue="Kandy Residence" />
              <Input label="Delivery contact" defaultValue="+94 77 222 3333" />
            </div>
            <Input label="Delivery address" defaultValue="No. 14, Peradeniya Road, Kandy" />

            <div className="form-section-title">Pickup Details</div>
            <div className="two-field-grid">
              <Input label="Pickup location" defaultValue="Colombo 07 Residence" />
              <Input label="Pickup address" defaultValue="No. 42, Ward Place, Colombo 07" />
            </div>

            <div className="form-section-title">Transport Details</div>
            <div className="two-field-grid">
              <label className="field"><span className="field-label">Transport type</span><select defaultValue="House Shifting"><option>House Shifting</option><option>Sand Transportation</option><option>Construction Materials</option><option>Furniture Transportation</option><option>Goods Transportation</option><option>Local Delivery</option><option>Other</option></select></label>
              <Input label="Material / item type" defaultValue="Furniture, appliances, and boxes" />
            </div>
            <div className="two-field-grid">
              <Input label="Approximate weight" defaultValue="420 kg" />
              <Input label="Quantity" defaultValue="12" />
            </div>
            <div className="two-field-grid">
              <Input label="Vehicle requirement" defaultValue="Medium covered truck" />
              <label className="field">
                <span className="field-label">Priority</span>
                <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
              <Input label="Load details" defaultValue="Furniture, appliances, and packed household boxes" />
            </div>

            <div className="two-field-grid">
              <Input label="Preferred date" type="date" defaultValue="2026-09-18" />
              <Input label="Preferred time" type="time" defaultValue="09:00" />
            </div>

            <div className="button-row">
              <Button type="button" variant="secondary">Cancel</Button>
              <Button type="submit">Create Transport Request</Button>
            </div>
          </form>
        </Card>

        <Card title="AI-Powered Vehicle Recommendation" className="panel-highlight">
          {submitted ? (
            <div className="recommendation-box">
              <div className="recommendation-header">
                <Badge tone="success">AI Recommended</Badge>
              </div>
              <div className="recommendation-grid">
                <div><span>Recommended vehicle</span><strong>Medium covered truck (V-104)</strong></div>
                <div><span>Predicted travel time</span><strong>3h 41m</strong></div>
                <div><span>Estimated fuel consumption</span><strong>42 L</strong></div>
                <div><span>Recommended route</span><strong>Route B</strong></div>
                <div><span>Estimated delivery time</span><strong>16:35</strong></div>
              </div>
            </div>
          ) : (
            <div className="empty-state-box">
              <p>Submit a transport request to see the vehicle and route response from the AI service.</p>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
