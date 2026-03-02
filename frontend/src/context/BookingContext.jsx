import { createContext, useContext, useState } from 'react'
import { BOOKINGS, ROOMS as INITIAL_ROOMS, USERS as INITIAL_USERS } from '../data/mockData'
import { calcNights } from '../utils/formatters'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(BOOKINGS)
  const [rooms, setRooms] = useState(INITIAL_ROOMS)
  const [users, setUsers] = useState(INITIAL_USERS)

  // Booking actions
  const approveBooking = (id) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b))

  const rejectBooking = (id) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected' } : b))

  const changeBookingStatus = (id, status) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))

  const markAsPaid = (id) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: 'paid' } : b))

  const markAsUnpaid = (id) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: 'unpaid' } : b))

  const createBooking = (data) => {
    const room = rooms.find(r => r.id === data.roomId)
    if (!room) return { success: false, message: 'Chambre introuvable.' }
    const nights = calcNights(data.checkIn, data.checkOut)
    const newBooking = {
      id: 'BK-' + String(bookings.length + 1).padStart(3, '0'),
      ...data,
      roomName: room.name,
      nights,
      totalPrice: room.price * nights,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
    }
    setBookings(prev => [...prev, newBooking])
    return { success: true, booking: newBooking }
  }

  const deleteBooking = (id) =>
    setBookings(prev => prev.filter(b => b.id !== id))

  // Room actions
  const addRoom = (room) => {
    const newRoom = { ...room, id: Date.now(), available: true }
    setRooms(prev => [...prev, newRoom])
  }

  const updateRoom = (id, updates) =>
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))

  const deleteRoom = (id) =>
    setRooms(prev => prev.filter(r => r.id !== id))

  const toggleRoomAvailability = (id) =>
    setRooms(prev => prev.map(r => r.id === id ? { ...r, available: !r.available } : r))

  // User actions
  const addUser = (userData) => {
    const newUser = { ...userData, id: Date.now(), role: 'user', createdAt: new Date().toISOString() }
    setUsers(prev => [...prev, newUser])
  }

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  // Stats
  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter(r => r.available).length,
    totalUsers: users.filter(u => u.role === 'user').length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    approvedBookings: bookings.filter(b => b.status === 'approved').length,
    paidBookings: bookings.filter(b => b.paymentStatus === 'paid').length,
    totalRevenue: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalPrice, 0),
    recentBookings: [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
  }

  return (
    <BookingContext.Provider value={{
      bookings, rooms, users,
      approveBooking, rejectBooking, changeBookingStatus, markAsPaid, markAsUnpaid, createBooking, deleteBooking,
      addRoom, updateRoom, deleteRoom, toggleRoomAvailability,
      addUser, deleteUser,
      stats,
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export const useBooking = () => {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider')
  return ctx
}
