import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { shipmentService } from '../../services/shipmentService'

export function CreateShipment() {
  const { user } = useAuth()
  const [submittedId, setSubmittedId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [priority, setPriority] = useState('High')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const text = (name: string) => String(form.get(name) ?? '').trim()

    try {
      const shipment = await shipmentService.createShipment({
        origin: text('origin'),
        destination: text('destination'),
        type: text('type'),
        weight: text('weight'),
        quantity: Number(text('quantity')) || 1,
        priority,
        preferredDate: text('preferredDate'),
        preferredTime: text('preferredTime'),
        materialType: text('materialType'),
        specialHandling: text('specialHandling'),
        receiverName: text('receiverName'),
        receiverContact: text('receiverContact'),
        senderContact: text('senderContact'),
        customer: user?.name,
      })
      setSubmittedId(shipment.id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create the transport request.')
    } finally {
      setLoading(false)
    }
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
          <form className="stack-form" onSubmit={(event) => void handleSubmit(event)}>
            <div className="form-section-title">Customer Details</div>
            <div className="two-field-grid">
              <Input label="Customer name" name="customerName" defaultValue={user?.name ?? ''} required />
              <Input label="Contact number" name="senderContact" />
            </div>

            <div className="form-section-title">Delivery Details</div>
            <div className="two-field-grid">
              <Input label="Delivery location" name="receiverName" required />
              <Input label="Delivery contact" name="receiverContact" />
            </div>
            <Input label="Delivery address" name="destination" required />

            <div className="form-section-title">Pickup Details</div>
            <div className="two-field-grid">
              <Input label="Pickup location" name="origin" required />
              <Input label="Pickup address" name="pickupAddress" />
            </div>

            <div className="form-section-title">Transport Details</div>
            <div className="two-field-grid">
              <label className="field"><span className="field-label">Transport type</span><select name="type" defaultValue="General Goods"><option>E-commerce Delivery</option><option>Parcel Delivery</option><option>General Goods</option><option>House Shifting</option><option>Furniture Transportation</option><option>Sand Transportation</option><option>Construction Materials</option><option>Business Delivery</option><option>Warehouse Delivery</option><option>Other</option></select></label>
              <Input label="Material / item type" name="materialType" />
            </div>
            <div className="two-field-grid">
              <Input label="Approximate weight" name="weight" required />
              <Input label="Quantity" name="quantity" type="number" min="1" defaultValue="1" />
            </div>
            <div className="two-field-grid">
              <Input label="Vehicle requirement" name="vehicleRequirement" />
              <label className="field">
                <span className="field-label">Priority</span>
                <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
              <Input label="Load details" name="specialHandling" />
            </div>

            <div className="two-field-grid">
              <Input label="Preferred date" name="preferredDate" type="date" />
              <Input label="Preferred time" name="preferredTime" type="time" />
            </div>

            {error && <p className="field-error" role="alert">{error}</p>}

            <div className="button-row">
              <Button type="button" variant="secondary">Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Create Transport Request'}</Button>
            </div>
          </form>
        </Card>

        <Card title="AI-Powered Vehicle Recommendation" className="panel-highlight">
          {submittedId ? (
            <div className="recommendation-box" role="status">
              <div className="recommendation-grid">
                <div><span>Transport request created</span><strong>{submittedId}</strong></div>
                <div><span>Status</span><strong>Pending assignment</strong></div>
                <div><span>Next step</span><strong>A manager will review and assign a suitable vehicle and driver.</strong></div>
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
