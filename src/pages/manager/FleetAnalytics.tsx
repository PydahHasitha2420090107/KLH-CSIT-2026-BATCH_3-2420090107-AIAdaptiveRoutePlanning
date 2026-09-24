import { Card } from '../../components/common/Card'
import { AreaChart, Area, BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const fuelData = [
  { name: 'Jan', value: 920 },
  { name: 'Feb', value: 870 },
  { name: 'Mar', value: 980 },
  { name: 'Apr', value: 1030 },
  { name: 'May', value: 960 },
  { name: 'Jun', value: 890 },
]

const vehicleData = [
  { name: 'V-101', value: 14.1 },
  { name: 'V-102', value: 13.8 },
  { name: 'V-104', value: 15.4 },
  { name: 'V-107', value: 11.7 },
  { name: 'V-111', value: 14.9 },
]

export function FleetAnalytics() {
  return (
    <div className="content-grid two-col">
      <Card title="Fuel Consumption Dashboard">
        <div className="chart-panel">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={fuelData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#93c5fd" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Vehicle Efficiency">
        <div className="chart-panel">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={vehicleData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
