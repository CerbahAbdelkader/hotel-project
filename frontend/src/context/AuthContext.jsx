import { createContext, useContext, useState } from 'react'
import { USERS as MOCK_USERS } from '../data/mockData'
import { apiRequest, clearAuthToken, setAuthToken } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hotel_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [error, setError] = useState(null)

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()
    try {
      // Authenticate against backend so frontend session mirrors server-side users/roles.
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: normalizedEmail,
          password,
        },
      })

      const safeUser = data?.user
      if (!safeUser) {
        setError('Réponse serveur invalide.')
        return { success: false }
      }

      if (data?.token) setAuthToken(data.token)

      setUser(safeUser)
      localStorage.setItem('hotel_user', JSON.stringify(safeUser))
      setError(null)
      return { success: true, role: safeUser.role }
    } catch (err) {
      const fallbackUser = MOCK_USERS.find(
        user => user.email?.toLowerCase() === normalizedEmail && user.password === password
      )

      if (fallbackUser) {
        clearAuthToken()
        const safeUser = {
          id: fallbackUser.id,
          name: fallbackUser.name,
          email: fallbackUser.email,
          phone: fallbackUser.phone,
          role: fallbackUser.role,
          createdAt: fallbackUser.createdAt,
        }

        setUser(safeUser)
        localStorage.setItem('hotel_user', JSON.stringify(safeUser))
        setError(null)
        return { success: true, role: safeUser.role }
      }

      setError(err.message || 'Email ou mot de passe incorrect.')
      return { success: false }
    }
  }

  const register = async ({ name, email, phone, password }) => {
    try {
      // Create user in backend to keep registration and login fully connected.
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        },
      })

      if (data?.token) setAuthToken(data.token)

      // Keep UX consistent: register then redirect user to login page.
      clearAuthToken()
      setUser(null)
      localStorage.removeItem('hotel_user')
      setError(null)
      return { success: true }
    } catch (err) {
      setError(err.message || 'Inscription impossible.')
      return { success: false }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('hotel_user')
    clearAuthToken()
  }

  const isAdmin = user?.role === 'admin'
  const isLoggedIn = !!user

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, isLoggedIn, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
