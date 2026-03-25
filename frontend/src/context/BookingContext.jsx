import { createContext, useContext, useEffect, useState } from 'react'
import { BOOKINGS, ROOMS as INITIAL_ROOMS, USERS as INITIAL_USERS, EVENT_RESERVATIONS as INITIAL_EVENT_RESERVATIONS } from '../data/mockData'
import { calcNights } from '../utils/formatters'
import { apiRequest, getAuthToken } from '../utils/api'
import { useAuth } from './AuthContext'

const BookingContext = createContext(null)

const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'

const toFrontendRoomType = (type) => {
  if (type === 'single' || type === 'suite') return type
  if (type === 'double') return 'superior'
  return type || 'classic'
}

const toBackendRoomType = (type) => {
  if (type === 'single' || type === 'suite' || type === 'double') return type
  if (type === 'classic' || type === 'superior' || type === 'deluxe' || type === 'family') return 'double'
  return 'double'
}

const defaultAmenitiesByType = {
  single: ['Wi-Fi gratuit', 'Climatisation', 'TV satellite', 'Salle de bain privée'],
  suite: ['Wi-Fi haut debit', 'Climatisation', 'TV Smart', 'Mini-bar', 'Salle de bain premium'],
  classic: ['Wi-Fi gratuit', 'Climatisation', 'TV satellite', 'Salle de bain privee'],
  superior: ['Wi-Fi gratuit', 'Climatisation', 'TV Smart', 'Mini-bar', 'Salle de bain privee'],
  deluxe: ['Wi-Fi gratuit', 'Climatisation', 'TV Smart', 'Mini-bar', 'Coin salon'],
  family: ['Wi-Fi gratuit', 'Climatisation', 'TV satellite', 'Espace familial', 'Salle de bain privee'],
}

const normalizeRoom = (room, index) => {
  const roomId = room?._id || room?.id
  const normalizedType = toFrontendRoomType(room?.type)
  const name = room?.name || (room?.roomNumber ? `Chambre ${room.roomNumber}` : `Chambre ${index + 1}`)
  const image = room?.image || room?.images?.[0] || DEFAULT_ROOM_IMAGE
  const amenities = Array.isArray(room?.amenities) && room.amenities.length
    ? room.amenities
    : (defaultAmenitiesByType[normalizedType] || defaultAmenitiesByType.classic)

  return {
    id: roomId,
    backendId: room?._id || null,
    hotelId: room?.hotel?._id || room?.hotel || null,
    hotelName: room?.hotel?.name || '',
    roomNumber: room?.roomNumber || String(index + 1),
    name,
    type: normalizedType,
    price: Number(room?.price || room?.pricePerNight || 0),
    capacity: Number(room?.capacity || room?.maxGuests || 2),
    size: Number(room?.size || 25),
    floor: Number(room?.floor || 1),
    available: room?.available !== false,
    featured: room?.featured ?? index < 3,
    description: room?.description || `${name} confortable pour votre sejour.`,
    amenities,
    image,
    images: Array.isArray(room?.images) && room.images.length ? room.images : [image],
  }
}

const normalizeBooking = (booking, rooms = [], users = []) => {
  const roomFromBooking = booking?.room && typeof booking.room === 'object' ? booking.room : null
  const roomId = roomFromBooking?._id || booking?.roomId || booking?.room
  const room = rooms.find(r => String(r.id) === String(roomId))
  const userFromBooking = booking?.user && typeof booking.user === 'object' ? booking.user : null
  const userId = userFromBooking?._id || booking?.userId || booking?.user
  const user = users.find(u => String(u.id) === String(userId))
  const checkIn = booking?.checkIn ? new Date(booking.checkIn).toISOString().split('T')[0] : ''
  const checkOut = booking?.checkOut ? new Date(booking.checkOut).toISOString().split('T')[0] : ''
  const nights = checkIn && checkOut ? Math.max(1, calcNights(checkIn, checkOut)) : Number(booking?.nights || 1)

  let status = booking?.status || 'pending'
  if (status === 'confirmed') status = 'approved'

  return {
    id: booking?._id || booking?.id,
    backendId: booking?._id || null,
    userId,
    roomId,
    roomName: booking?.roomName || room?.name || (roomFromBooking?.roomNumber ? `Chambre ${roomFromBooking.roomNumber}` : 'Chambre'),
    guestName: booking?.guestName || userFromBooking?.name || user?.name || 'Client',
    guestEmail: booking?.guestEmail || userFromBooking?.email || user?.email || '',
    guestPhone: booking?.guestPhone || userFromBooking?.phone || user?.phone || '',
    checkIn,
    checkOut,
    nights,
    totalPrice: Number(booking?.totalPrice || (room?.price || 0) * nights),
    status,
    paymentStatus: booking?.paymentStatus || 'unpaid',
    notes: booking?.notes || '',
    createdAt: booking?.createdAt || new Date().toISOString(),
  }
}

export function BookingProvider({ children }) {
  const { user, isAdmin, isLoggedIn } = useAuth()
  const [bookings, setBookings] = useState(BOOKINGS)
  const [rooms, setRooms] = useState(INITIAL_ROOMS)
  const [users, setUsers] = useState(INITIAL_USERS)
  const [hotels, setHotels] = useState([])
  const [eventReservations, setEventReservations] = useState(INITIAL_EVENT_RESERVATIONS)

  useEffect(() => {
    let mounted = true

    const loadRoomsAndHotels = async () => {
      try {
        // Pull hotels/rooms from backend and map fields to existing UI model.
        const [hotelsData, roomsData] = await Promise.all([
          apiRequest('/api/hotels'),
          apiRequest('/api/rooms'),
        ])

        if (!mounted) return

        const fetchedHotels = hotelsData?.hotels || []
        const fetchedRooms = (roomsData?.rooms || []).map((room, index) => normalizeRoom(room, index))
        setHotels(fetchedHotels)
        if (fetchedRooms.length) setRooms(fetchedRooms)
      } catch {
        if (!mounted) return
        setHotels([])
      }
    }

    const loadUserBoundData = async () => {
      if (!isLoggedIn || !getAuthToken()) {
        if (mounted) {
          setBookings(BOOKINGS)
          setUsers(INITIAL_USERS)
        }
        return
      }

      try {
        if (isAdmin) {
          const [bookingsData, usersData] = await Promise.all([
            apiRequest('/api/bookings', { withAuth: true }),
            apiRequest('/api/auth/allUsers', { withAuth: true }),
          ])

          if (!mounted) return

          const backendUsers = (usersData?.users || []).map(u => ({
            id: u._id || u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role || 'user',
            createdAt: u.createdAt,
          }))

          setUsers(backendUsers)
          setBookings((bookingsData?.bookings || []).map(b => normalizeBooking(b, rooms, backendUsers)))
          return
        }

        const bookingsData = await apiRequest('/api/bookings/my-bookings', { withAuth: true })
        if (!mounted) return
        setUsers(prev => prev)
        setBookings((bookingsData?.bookings || []).map(b => normalizeBooking(b, rooms, users)))
      } catch {
        if (!mounted) return
      }
    }

    loadRoomsAndHotels()
    loadUserBoundData()

    return () => {
      mounted = false
    }
  }, [isLoggedIn, isAdmin, user?.id])

  // Booking actions
  const approveBooking = (id) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b))

  const rejectBooking = (id) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected' } : b))

  const changeBookingStatus = async (id, status) => {
    const booking = bookings.find(b => b.id === id)
    if (!booking) {
      return { success: false, message: 'Reservation introuvable.' }
    }

    if (booking.backendId && getAuthToken()) {
      try {
        // Persist admin status changes through backend booking status endpoint.
        await apiRequest(`/api/bookings/${booking.backendId}/status`, {
          method: 'PATCH',
          withAuth: true,
          body: { status },
        })
      } catch {
        return { success: false, message: 'Impossible de mettre a jour le statut.' }
      }
    }

    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    return { success: true }
  }

  const markAsPaid = async (id) => {
    const booking = bookings.find(b => b.id === id)
    if (!booking) {
      return { success: false, message: 'Reservation introuvable.' }
    }

    if (booking.backendId && getAuthToken()) {
      try {
        // Persist payment state changes through backend booking payment endpoint.
        await apiRequest(`/api/bookings/${booking.backendId}/payment`, {
          method: 'PATCH',
          withAuth: true,
          body: { paymentStatus: 'paid' },
        })
      } catch {
        return { success: false, message: 'Impossible de mettre a jour le paiement.' }
      }
    }

    setBookings(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: 'paid' } : b))
    return { success: true }
  }

  const markAsUnpaid = async (id) => {
    const booking = bookings.find(b => b.id === id)
    if (!booking) {
      return { success: false, message: 'Reservation introuvable.' }
    }

    if (booking.backendId && getAuthToken()) {
      try {
        await apiRequest(`/api/bookings/${booking.backendId}/payment`, {
          method: 'PATCH',
          withAuth: true,
          body: { paymentStatus: 'unpaid' },
        })
      } catch {
        return { success: false, message: 'Impossible de mettre a jour le paiement.' }
      }
    }

    setBookings(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: 'unpaid' } : b))
    return { success: true }
  }

  const createBooking = async (data) => {
    const room = rooms.find(r => String(r.id) === String(data.roomId))
    if (!room) return { success: false, message: 'Chambre introuvable.' }
    let backendRoomId = room.backendId || room.id

    const allowGuestMockFallback = false

    // Reservation API requires authenticated user token.
    if (!isLoggedIn || !getAuthToken()) {
      if (!allowGuestMockFallback) {
        return { success: false, message: 'Please login first' }
      }

      // Optional compatibility fallback for mock-only flows.
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
      return { success: true, booking: newBooking, message: 'Reservation created locally.' }
    }

    try {
      if (!backendRoomId || !/^[a-f\d]{24}$/i.test(String(backendRoomId))) {
        // Auto-recover by resolving the Mongo room id from backend room list.
        try {
          const roomsData = await apiRequest('/api/rooms')
          const backendRooms = roomsData?.rooms || []
          const matchedBackendRoom = backendRooms.find((item) => {
            if (String(item?._id) === String(data.roomId)) return true
            if (room.roomNumber && String(item?.roomNumber) === String(room.roomNumber)) return true
            if (room.name && `Chambre ${item?.roomNumber}` === room.name) return true
            return false
          })

          if (!matchedBackendRoom?._id) {
            return { success: false, message: 'Room data is not synced with backend. Please refresh and try again.' }
          }

          backendRoomId = matchedBackendRoom._id

          setRooms(prev => prev.map((r, index) =>
            String(r.id) === String(data.roomId)
              ? normalizeRoom(matchedBackendRoom, index)
              : r
          ))
        } catch (lookupError) {
          return { success: false, message: 'Room data is not synced with backend. Please refresh and try again.' }
        }
      }

      const requestBody = {
        roomId: backendRoomId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
      }

      // Create booking in backend when user is authenticated.
      const result = await apiRequest('/api/bookings', {
        method: 'POST',
        withAuth: true,
        body: requestBody,
      })

      const created = normalizeBooking({
        ...result?.booking,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        notes: data.notes,
        paymentStatus: 'unpaid',
        status: 'pending',
      }, rooms, users)

      setBookings(prev => [created, ...prev])
      setRooms(prev => prev.map(r => String(r.id) === String(data.roomId) ? { ...r, available: false } : r))
      return { success: true, booking: created, message: 'Reservation created successfully.' }
    } catch (error) {
      return { success: false, message: error.message || 'Reservation impossible.' }
    }

  }

  const createEventReservation = (data) => {
    const newReservation = {
      id: 'EV-' + String(eventReservations.length + 1).padStart(3, '0'),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    setEventReservations(prev => [...prev, newReservation])
    return { success: true, reservation: newReservation }
  }

  const deleteBooking = async (id) => {
    const booking = bookings.find(b => b.id === id)
    if (booking?.backendId && getAuthToken()) {
      try {
        await apiRequest(`/api/bookings/${booking.backendId}/cancel`, {
          method: 'PATCH',
          withAuth: true,
        })
      } catch {
        return
      }
    }

    setBookings(prev => prev.filter(b => b.id !== id))
  }

  // Room actions
  const addRoom = async (room) => {
    if (isAdmin && getAuthToken() && hotels.length) {
      try {
        const created = await apiRequest('/api/rooms', {
          method: 'POST',
          withAuth: true,
          body: {
            hotel: hotels[0]._id,
            roomNumber: room.roomNumber || String(Date.now()).slice(-4),
            type: toBackendRoomType(room.type),
            price: Number(room.price),
            available: room.available,
            maxGuests: Number(room.capacity || 2),
          },
        })

        setRooms(prev => [...prev, normalizeRoom(created.room, prev.length)])
        return
      } catch {
        // Fall back to local optimistic behavior if backend creation fails.
      }
    }

    const newRoom = { ...room, id: String(Date.now()), available: true }
    setRooms(prev => [...prev, newRoom])
  }

  const updateRoom = async (id, updates) => {
    const existingRoom = rooms.find(r => String(r.id) === String(id))

    if (isAdmin && getAuthToken() && existingRoom?.backendId) {
      try {
        const updated = await apiRequest(`/api/rooms/${existingRoom.backendId}`, {
          method: 'PATCH',
          withAuth: true,
          body: {
            roomNumber: updates.roomNumber || existingRoom.roomNumber,
            type: toBackendRoomType(updates.type || existingRoom.type),
            price: Number(updates.price ?? existingRoom.price),
            available: updates.available ?? existingRoom.available,
            maxGuests: Number(updates.capacity ?? existingRoom.capacity),
          },
        })

        setRooms(prev => prev.map((r, index) => String(r.id) === String(id) ? normalizeRoom(updated.room, index) : r))
        return
      } catch {
        // Fall back to local update when API update is unavailable.
      }
    }

    setRooms(prev => prev.map(r => String(r.id) === String(id) ? { ...r, ...updates } : r))
  }

  const deleteRoom = async (id) => {
    const room = rooms.find(r => String(r.id) === String(id))

    if (isAdmin && getAuthToken() && room?.backendId) {
      try {
        await apiRequest(`/api/rooms/${room.backendId}`, {
          method: 'DELETE',
          withAuth: true,
        })
      } catch {
        return
      }
    }

    setRooms(prev => prev.filter(r => String(r.id) !== String(id)))
  }

  const toggleRoomAvailability = async (id) => {
    const room = rooms.find(r => String(r.id) === String(id))
    if (!room) return
    await updateRoom(id, { available: !room.available })
  }

  // User actions
  const addUser = async (userData) => {
    if (isAdmin && getAuthToken()) {
      try {
        const created = await apiRequest('/api/auth/register', {
          method: 'POST',
          body: userData,
        })

        const nextUser = {
          id: created?.user?._id || String(Date.now()),
          name: created?.user?.name || userData.name,
          email: created?.user?.email || userData.email,
          phone: created?.user?.phone || userData.phone,
          role: created?.user?.role || 'user',
          createdAt: created?.user?.createdAt || new Date().toISOString(),
        }
        setUsers(prev => [...prev, nextUser])
        return
      } catch {
        // Fall back to local creation if API fails.
      }
    }

    const newUser = { ...userData, id: String(Date.now()), role: 'user', createdAt: new Date().toISOString() }
    setUsers(prev => [...prev, newUser])
  }

  const deleteUser = async (id) => {
    if (isAdmin && getAuthToken()) {
      try {
        await apiRequest(`/api/auth/deleteuser/${id}`, {
          method: 'DELETE',
          withAuth: true,
        })
      } catch {
        return
      }
    }

    setUsers(prev => prev.filter(u => String(u.id) !== String(id)))
  }

  // Stats
  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter(r => r.available).length,
    totalUsers: users.filter(u => u.role === 'user').length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    approvedBookings: bookings.filter(b => b.status === 'approved').length,
    paidBookings: bookings.filter(b => b.paymentStatus === 'paid').length,
    totalEventReservations: eventReservations.length,
    pendingEventReservations: eventReservations.filter(e => e.status === 'pending').length,
    totalRevenue: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalPrice, 0),
    recentBookings: [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    recentEventReservations: [...eventReservations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
  }

  return (
    <BookingContext.Provider value={{
      bookings, eventReservations, rooms, users,
      approveBooking, rejectBooking, changeBookingStatus, markAsPaid, markAsUnpaid, createBooking, createEventReservation, deleteBooking,
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
