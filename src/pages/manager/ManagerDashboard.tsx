import { Activity, AlertTriangle, BarChart3, Cpu, Gauge, Truck, Users } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { mockVehicles, mockTrips } from '../../mocks/mockData'
import { AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const kpis = [
  { label: 'Total Vehicles', value: '18', icon: Truck },
  { label: 'Available Vehicles', value: '8', icon: Gauge },
  { label: 'Active Trips', value: '11', icon: Activity },
  { label: 'Active Transport Requests', value: '24', icon: BarChart3 },
  { label: 'Completed Requests', value: '156', icon: Users },
  { label: 'Maintenance Alerts', value: '04', icon: AlertTriangle },
  { label: 'Fleet Utilization', value: '76%', icon: Cpu },
  { label: 'Average Fuel Efficiency', value: '13.8 km/L', icon: Gauge },
]

const chartData = [
  { name: 'Mon', fuel: 12.4, target: 13.1 },
  { name: 'Tue', fuel: 13.2, target: 13.2 },
  { name: 'Wed', fuel: 12.9, target: 13.0 },
  { name: 'Thu', fuel: 13.8, target: 13.1 },
  { name: 'Fri', fuel: 14.2, target: 13.3 },
  { name: 'Sat', fuel: 13.9, target: 13.1 },
]

const utilizationData = [
  { name: 'Available', value: 58 },
  { name: 'In Use', value: 32 },
  { name: 'Maintenance', value: 10 },
]

const pieColors = ['#3b82f6', '#16a34a', '#f59e0b']

export function ManagerDashboard() {
  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Executive overview</div>
          <h2>Fleet intelligence dashboard</h2>
        </div>
      </div>

      <div className="stats-grid four-col">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <div className="stat-card compact-stat">
              <div className="stat-icon"><Icon size={18} /></div>
              <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="content-grid two-col">
        <Card title="Fleet Health Overview">
          <div className="chart-panel">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorFuel" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="fuel" stroke="#2563eb" fill="url(#colorFuel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Fleet Utilization">
          <div className="chart-panel small-chart">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={utilizationData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={74} paddingAngle={5}>
                  {utilizationData.map((entry, index) => <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="content-grid three-col">
        <Card title="Transport Request Overview">
          <div className="chart-panel small-chart">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Pending', value: 8 },
                { name: 'Assigned', value: 12 },
                { name: 'In Transit', value: 9 },
                { name: 'Delivered', value: 14 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Active Transport Trips">
          <div className="stack-list compact">
            {mockTrips.map((trip) => (
              <div key={trip.id} className="notice-item info"><strong>{trip.id}</strong><small>{trip.source} → {trip.destination}</small></div>
            ))}
          </div>
        </Card>

        <Card title="Maintenance Alerts">
          <div className="stack-list compact">
            {mockVehicles.filter((vehicle) => vehicle.maintenanceRisk > 50).map((vehicle) => (
              <div key={vehicle.id} className="notice-item warning"><strong>{vehicle.id}</strong><small>{vehicle.maintenanceRisk}% risk</small></div>
            ))}
          </div>
        </Card>
      </div>

      <div className="content-grid two-col">
        <Card title="AI Insights">
          <div className="stack-list compact">
            <div className="notice-item success"><strong>AI recommendation:</strong><small>Vehicle V-104 is most suitable for the house shifting request.</small></div>
            <div className="notice-item danger"><strong>Maintenance insight:</strong><small>V-107 requires compliance inspection before next dispatch.</small></div>
            <div className="notice-item info"><strong>Fuel forecast:</strong><small>Projected efficiency will improve by 7% with route optimization.</small></div>
          </div>
        </Card>

        <Card title="Service Health">
          <div className="stack-list compact">
            {['Vehicle Service', 'Shipment Service', 'Route Service', 'AI/ML Service'].map((name) => (
              <div key={name} className="notice-item success"><strong>{name}</strong><small>ONLINE • healthy</small></div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Recent Activity">
        <div className="timeline-list">
          {['Transport request SHP-1001 updated to In Transit', 'Vehicle V-104 assigned to house shifting request', 'AI route recommendation approved for Route B', 'Maintenance inspection scheduled for V-107'].map((item) => (
            <div key={item} className="timeline-item"><span className="dot" />{item}</div>
          ))}
        </div>
      </Card>
    </>
  )
}
