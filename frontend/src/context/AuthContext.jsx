import { createContext, useContext, useState, useEffect } from 'react'
import { USERS } from '../data/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hotel_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [error, setError] = useState(null)

  const login = (email, password) => {
    const found = USERS.find(u => u.email === email && u.password === password)
    if (found) {
      const { password: _, ...safeUser } = found
      setUser(safeUser)
      localStorage.setItem('hotel_user', JSON.stringify(safeUser))
      setError(null)
      return { success: true, role: safeUser.role }
    }
    setError('Email ou mot de passe incorrect.')
    return { success: false }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('hotel_user')
  }

  const isAdmin = user?.role === 'admin'
  const isLoggedIn = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isLoggedIn, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
