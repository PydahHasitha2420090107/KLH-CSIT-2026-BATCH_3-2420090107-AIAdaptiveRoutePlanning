import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppRoutes } from './routes/AppRoutes'
import { AIChatbot } from './components/ai/AIChatbot'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <AIChatbot />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
