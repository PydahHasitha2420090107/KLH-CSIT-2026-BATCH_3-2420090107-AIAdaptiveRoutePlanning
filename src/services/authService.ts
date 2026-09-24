import { USE_MOCK_API } from './api'
import { mockUsers } from '../mocks/mockData'
import type { User, UserRole } from '../types'

const registeredUsersKey = 'smartfleet-registered-users'

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
  if (!USE_MOCK_API) return null

  const users = getAvailableUsers()
  const emailExists = users.some((entry) => entry.email.toLowerCase() === input.email.toLowerCase())
  if (emailExists) return null

  const user: User = { ...input, id: `${input.role.toUpperCase()}-${Date.now()}` }
  localStorage.setItem(registeredUsersKey, JSON.stringify([...getRegisteredUsers(), user]))
  return user
}

export async function getCurrentUser(): Promise<User | null> {
  const stored = localStorage.getItem('smartfleet-user')
  if (!stored) return null

  try {
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

export async function setCurrentUser(user: User): Promise<void> {
  localStorage.setItem('smartfleet-user', JSON.stringify(user))
}

export async function clearCurrentUser(): Promise<void> {
  localStorage.removeItem('smartfleet-user')
}
