import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { Login } from '../pages/auth/Login'
import { UserLogin } from '../pages/auth/UserLogin'
import { DriverLogin } from '../pages/auth/DriverLogin'
import { ManagerLogin } from '../pages/auth/ManagerLogin'
import { Register } from '../pages/auth/Register'
import { UserDashboard } from '../pages/user/UserDashboard'
import { CreateShipment } from '../pages/user/CreateShipment'
import { MyShipments } from '../pages/user/MyShipments'
import { TrackShipment } from '../pages/user/TrackShipment'
import { DriverDashboard } from '../pages/driver/DriverDashboard'
import { DriverRouteNavigation } from '../pages/driver/DriverRouteNavigation'
import { VehicleDetails } from '../pages/driver/VehicleDetails'
import { ManagerDashboard } from '../pages/manager/ManagerDashboard'
import { Vehicles } from '../pages/manager/Vehicles'
import { Drivers } from '../pages/manager/Drivers'
import { Shipments } from '../pages/manager/Shipments'
import { Maintenance } from '../pages/manager/Maintenance'
import { RouteOptimization } from '../pages/manager/RouteOptimization'
import { AIRecommendations } from '../pages/manager/AIRecommendations'
import { FleetAnalytics } from '../pages/manager/FleetAnalytics'
import { Settings } from '../pages/common/Settings'
import { Notifications } from '../pages/common/Notifications'
import { NotFound } from '../pages/common/NotFound'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/user" element={<UserLogin />} />
      <Route path="/login/driver" element={<DriverLogin />} />
      <Route path="/login/manager" element={<ManagerLogin />} />
      <Route path="/register/user" element={<Register role="user" />} />
      <Route path="/register/driver" element={<Register role="driver" />} />
      <Route path="/register/manager" element={<Register role="manager" />} />

      <Route path="/user" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/create-shipment" element={<ProtectedRoute allowedRoles={['user']}><CreateShipment /></ProtectedRoute>} />
      <Route path="/user/my-shipments" element={<ProtectedRoute allowedRoles={['user']}><MyShipments /></ProtectedRoute>} />
      <Route path="/user/track-shipment" element={<ProtectedRoute allowedRoles={['user']}><TrackShipment /></ProtectedRoute>} />

      <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
      <Route path="/driver/shipments" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
      <Route path="/driver/routes" element={<ProtectedRoute allowedRoles={['driver']}><DriverRouteNavigation /></ProtectedRoute>} />
      <Route path="/driver/vehicle" element={<ProtectedRoute allowedRoles={['driver']}><VehicleDetails /></ProtectedRoute>} />

      <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/manager/vehicles" element={<ProtectedRoute allowedRoles={['manager']}><Vehicles /></ProtectedRoute>} />
      <Route path="/manager/drivers" element={<ProtectedRoute allowedRoles={['manager']}><Drivers /></ProtectedRoute>} />
      <Route path="/manager/shipments" element={<ProtectedRoute allowedRoles={['manager']}><Shipments /></ProtectedRoute>} />
      <Route path="/manager/maintenance" element={<ProtectedRoute allowedRoles={['manager']}><Maintenance /></ProtectedRoute>} />
      <Route path="/manager/route-optimization" element={<ProtectedRoute allowedRoles={['manager']}><RouteOptimization /></ProtectedRoute>} />
      <Route path="/manager/ai-recommendations" element={<ProtectedRoute allowedRoles={['manager']}><AIRecommendations /></ProtectedRoute>} />
      <Route path="/manager/fleet-analytics" element={<ProtectedRoute allowedRoles={['manager']}><FleetAnalytics /></ProtectedRoute>} />
      <Route path="/manager/settings" element={<ProtectedRoute allowedRoles={['manager']}><Settings /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute allowedRoles={['user','driver','manager']}><Notifications /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={['user','driver','manager']}><Settings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
