import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, setCurrentUser, clearCurrentUser, signIn, registerUser } from '../services/authService'
import type { User, UserRole } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string, role?: UserRole) => Promise<User | null>
  register: (input: Omit<User, 'id'>) => Promise<User | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    })()
  }, [])

  const login = async (email: string, password: string, role?: UserRole) => {
    const result = await signIn(email, password, role)
    if (!result) return null

    await setCurrentUser(result)
    setUser(result)
    return result
  }

  const logout = async () => {
    await clearCurrentUser()
    setUser(null)
  }

  const register = async (input: Omit<User, 'id'>) => {
    const result = await registerUser(input)
    if (!result) return null

    await setCurrentUser(result)
    setUser(result)
    return result
  }

  const value = useMemo<AuthContextValue>(() => ({ user, loading, login, register, logout }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
