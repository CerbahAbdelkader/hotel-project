import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isLoggedIn, isAdmin } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to={requireAdmin ? '/admin/login' : '/login'} state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
