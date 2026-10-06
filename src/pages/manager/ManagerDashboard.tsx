import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, BarChart3, Cpu, Gauge, Truck, Users } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { CartesianGrid, ResponsiveContainer, Tooltip, XAxis, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { dashboardService, type ManagerDashboardData } from '../../services/dashboardService'

const pieColors = ['#3b82f6', '#16a34a', '#f59e0b']

export function ManagerDashboard() {
  const [dashboard, setDashboard] = useState<ManagerDashboardData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void dashboardService.fetchManager()
      .then((result) => { if (active) setDashboard(result) })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load fleet dashboard.')
      })
    return () => { active = false }
  }, [])

  if (error) return <div className="empty-state-box" role="alert">Unable to load manager dashboard: {error}</div>
  if (!dashboard) return <div className="empty-state-box" role="status">Loading fleet dashboard...</div>

  const kpis = [
    { label: 'Total Vehicles', value: String(dashboard.kpis.totalVehicles), icon: Truck },
    { label: 'Available Vehicles', value: String(dashboard.kpis.availableVehicles), icon: Gauge },
    { label: 'Active Trips', value: String(dashboard.kpis.activeTrips), icon: Activity },
    { label: 'Active Transport Requests', value: String(dashboard.kpis.activeTransportRequests), icon: BarChart3 },
    { label: 'Completed Requests', value: String(dashboard.kpis.completedRequests), icon: Users },
    { label: 'Maintenance Alerts', value: String(dashboard.kpis.maintenanceAlerts), icon: AlertTriangle },
    { label: 'Fleet Utilization', value: `${dashboard.kpis.fleetUtilization}%`, icon: Cpu },
    { label: 'Average Fuel Efficiency', value: `${dashboard.kpis.averageFuelEfficiency} km/L`, icon: Gauge },
  ]
  const shipmentOverview = dashboard.shipmentOverview.map((item) => ({ name: item.name, value: item.value }))

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
          <div className="trip-summary">
            <div><span>Fleet utilization</span><strong>{dashboard.kpis.fleetUtilization}%</strong></div>
            <div><span>Average recorded fuel efficiency</span><strong>{dashboard.kpis.averageFuelEfficiency} km/L</strong></div>
            <div><span>Drivers in system</span><strong>{dashboard.driverCount}</strong></div>
            <div><span>Vehicles in maintenance</span><strong>{dashboard.utilizationData.find((item) => item.name === 'Maintenance')?.value ?? 0}</strong></div>
          </div>
        </Card>

        <Card title="Fleet Utilization">
          <div className="chart-panel small-chart">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={dashboard.utilizationData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={74} paddingAngle={5}>
                  {dashboard.utilizationData.map((entry, index) => <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />)}
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
                ...shipmentOverview,
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
            {dashboard.activeTrips.filter((trip) => ['in progress', 'started', 'in_progress'].includes(trip.status.toLowerCase())).map((trip) => (
              <div key={trip.id} className="notice-item info"><strong>{trip.id}</strong><small>{trip.source} → {trip.destination}</small></div>
            ))}
            {dashboard.activeTrips.filter((trip) => ['in progress', 'started', 'in_progress'].includes(trip.status.toLowerCase())).length === 0 && <div className="empty-state-box">No active trips are recorded.</div>}
          </div>
        </Card>

        <Card title="Maintenance Alerts">
          <div className="stack-list compact">
            {dashboard.maintenanceAlerts.map((vehicle) => (
              <div key={vehicle.id} className="notice-item warning"><strong>{vehicle.id}</strong><small>{vehicle.maintenanceRisk}% risk</small></div>
            ))}
            {dashboard.maintenanceAlerts.length === 0 && <div className="empty-state-box">No elevated-risk vehicles are recorded.</div>}
          </div>
        </Card>
      </div>

      <div className="content-grid two-col">
        <Card title="AI Insights">
          <div className="stack-list compact">
            {dashboard.aiRecommendations.map((item) => (
              <div key={item.id} className={`notice-item ${item.severity === 'High' ? 'warning' : 'info'}`}><strong>{item.title}</strong><small>{item.recommendation}</small></div>
            ))}
            {dashboard.aiRecommendations.length === 0 && <div className="empty-state-box">No stored operational recommendations are available.</div>}
          </div>
        </Card>

        <Card title="Service Health">
          <div className="stack-list compact">
            {dashboard.serviceHealth.map((service) => (
              <div key={service.id} className={`notice-item ${service.status === 'ONLINE' ? 'success' : 'warning'}`}><strong>{service.name}</strong><small>{service.status} • {service.detail}</small></div>
            ))}
            {dashboard.serviceHealth.length === 0 && <div className="empty-state-box">Service health records are unavailable.</div>}
          </div>
        </Card>
      </div>

      <Card title="Recent Activity">
        <div className="timeline-list">
          <div className="timeline-item"><span className="dot" />Activity event history is not recorded in the current database.</div>
        </div>
      </Card>
    </>
  )
}
