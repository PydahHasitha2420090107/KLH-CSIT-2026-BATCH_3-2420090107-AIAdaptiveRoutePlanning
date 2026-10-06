import { API_BASE_URL, request, setAuthToken, USE_MOCK_API } from './api'
import { mockUsers } from '../mocks/mockData'
import type { User, UserRole } from '../types'

const registeredUsersKey = 'smartfleet-registered-users'

type AuthPayload = {
  success: boolean
  data: {
    token: string
    user: Omit<User, 'password'>
  }
}

type CurrentUserPayload = {
  success: boolean
  data: Omit<User, 'password'>
}

function getRegisteredUsers(): User[] {
  const stored = localStorage.getItem(registeredUsersKey)
  if (!stored) return []

  try {
    return JSON.parse(stored) as User[]
  } catch {
    return []
  }
}

function getAvailableUsers(): User[] {
  return [...mockUsers, ...getRegisteredUsers()]
}

export async function signIn(email: string, password: string, role?: UserRole): Promise<User | null> {
  try {
    const result = await request<AuthPayload>(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    })
    setAuthToken(result.data.token)
    return { ...result.data.user, password: '' }
  } catch {
    setAuthToken(null)
    if (!USE_MOCK_API) return null
  }

  if (USE_MOCK_API) {
    const user = getAvailableUsers().find(
      (entry) =>
        entry.email.toLowerCase() === email.toLowerCase() &&
        entry.password === password &&
        (!role || entry.role === role),
    )

    return user ?? null
  }

  return null
}

export async function registerUser(input: Omit<User, 'id'>): Promise<User | null> {
  try {
    const result = await request<AuthPayload>(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
    setAuthToken(result.data.token)
    return { ...result.data.user, password: '' }
  } catch {
    setAuthToken(null)
    if (!USE_MOCK_API) return null
  }

  const users = getAvailableUsers()
  const emailExists = users.some((entry) => entry.email.toLowerCase() === input.email.toLowerCase())
  if (emailExists) return null

  const user: User = { ...input, id: `${input.role.toUpperCase()}-${Date.now()}` }
  localStorage.setItem(registeredUsersKey, JSON.stringify([...getRegisteredUsers(), user]))
  return user
}

export async function getCurrentUser(): Promise<User | null> {
  const stored = localStorage.getItem('smartfleet-user')
  const token = localStorage.getItem('smartfleet-token')

  if (token) {
    try {
      const result = await request<CurrentUserPayload>(`${API_BASE_URL}/auth/me`)
      const user = { ...result.data, password: '' }
      await setCurrentUser(user)
      return user
    } catch {
      if (!USE_MOCK_API) {
        setAuthToken(null)
        localStorage.removeItem('smartfleet-user')
        return null
      }
    }
  }

  if (!stored) return null

  try {
    const user = JSON.parse(stored) as User
    return { ...user, password: '' }
  } catch {
    return null
  }
}

export async function setCurrentUser(user: User): Promise<void> {
  const { password: _password, ...safeUser } = user
  localStorage.setItem('smartfleet-user', JSON.stringify(safeUser))
}

export async function clearCurrentUser(): Promise<void> {
  localStorage.removeItem('smartfleet-user')
  setAuthToken(null)
}
