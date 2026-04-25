import { AuthProvider } from './AuthContext'
import { BookingProvider } from './BookingContext'

export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <BookingProvider>
        {children}
      </BookingProvider>
    </AuthProvider>
  )
}
