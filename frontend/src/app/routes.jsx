import { lazy, Suspense } from 'react'
import { createHashRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../shared/components/ProtectedRoute'

// Public pages
import HomePage from '../features/home/HomePage'
import RoomsPage from '../features/rooms/RoomsPage'
import RoomDetailPage from '../features/rooms/RoomDetailPage'
import ServicesPage from '../features/services/ServicesPage'
import BookingPage from '../features/bookings/BookingPage'
import AboutPage from '../features/home/AboutPage'
import ContactPage from '../features/home/ContactPage'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'

// Admin pages
import AdminLoginPage from '../features/admin/AdminLoginPage'
import AdminDashboard from '../features/admin/AdminDashboard'
import AdminRoomsPage from '../features/admin/AdminRoomsPage'
import AdminBookingsPage from '../features/admin/AdminBookingsPage'
import AdminUsersPage from '../features/admin/AdminUsersPage'

const Loading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
  </div>
)

export const router = createHashRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/rooms', element: <RoomsPage /> },
      { path: '/rooms/:id', element: <RoomDetailPage /> },
      { path: '/services', element: <ServicesPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/book', element: <BookingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ]
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />
  },
  {
    element: (
      <ProtectedRoute requireAdmin>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/admin/dashboard', element: <AdminDashboard /> },
      { path: '/admin/rooms', element: <AdminRoomsPage /> },
      { path: '/admin/bookings', element: <AdminBookingsPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
    ]
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="font-display text-6xl font-bold text-stone-200 mb-4">404</h1>
        <p className="text-stone-500 mb-6">Page introuvable</p>
        <a href="/" className="px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
          Retour à l'accueil
        </a>
      </div>
    )
  }
])
