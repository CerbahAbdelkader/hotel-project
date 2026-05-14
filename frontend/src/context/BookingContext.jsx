import { createContext, useContext, useEffect, useState } from 'react'
import { BOOKINGS, ROOMS as INITIAL_ROOMS, USERS as INITIAL_USERS, EVENT_RESERVATIONS as INITIAL_EVENT_RESERVATIONS } from '../data/mockData'
import { calcNights } from '../utils/formatters'
import { apiRequest, getAuthToken } from '../utils/api'
import { useAuth } from './AuthContext'
import { normalizeBookingStatus, normalizeRoomStatus } from '../utils/statusMeta'

const BookingContext = createContext(null)

const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'


const defaultAmenitiesByType = {
  single: ['Wi-Fi gratuit', 'Climatisation', 'TV satellite', 'Salle de bain privée'],
  suite: ['Wi-Fi haut debit', 'Climatisation', 'TV Smart', 'Mini-bar', 'Salle de bain premium'],
  classic: ['Wi-Fi gratuit', 'Climatisation', 'TV satellite', 'Salle de bain privee'],
  superior: ['Wi-Fi gratuit', 'Climatisation', 'TV Smart', 'Mini-bar', 'Salle de bain privee'],
  deluxe: ['Wi-Fi gratuit', 'Climatisation', 'TV Smart', 'Mini-bar', 'Coin salon'],
  family: ['Wi-Fi gratuit', 'Climatisation', 'TV satellite', 'Espace familial', 'Salle de bain privee'],
}

const addHoursIso = (dateValue, hours) => new Date(new Date(dateValue).getTime() + (hours * 60 * 60 * 1000)).toISOString()

const normalizeRoom = (room, index) => {
  const roomId = room?._id || room?.id
  const type = room?.type || 'classic'
  const name = room?.name || (room?.roomNumber ? `Chambre ${room.roomNumber}` : `Chambre ${index + 1}`)
  const image = room?.image || room?.images?.[0] || DEFAULT_ROOM_IMAGE
  const amenities = Array.isArray(room?.amenities) && room.amenities.length
    ? room.amenities
    : (defaultAmenitiesByType[type] || defaultAmenitiesByType.classic)
  const status = normalizeRoomStatus(room)

  return {
    id: roomId,
    backendId: room?._id || null,
    hotelId: room?.hotel?._id || room?.hotel || null,
    hotelName: room?.hotel?.name || '',
    roomNumber: room?.roomNumber || String(index + 1),
    name,
    type,
    price: Number(room?.price || room?.pricePerNight || 0),
    capacity: Number(room?.capacity || room?.maxGuests || 2),
    size: Number(room?.size || 25),
    floor: Number(room?.floor || 1),
    status,
    available: status === 'available',
    maintenanceNote: room?.maintenanceNote || '',
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

  const status = normalizeBookingStatus(booking?.status)
  const createdAt = booking?.createdAt || new Date().toISOString()
  const confirmationDeadline = booking?.confirmationDeadline || ((status === 'pending_confirmation' || status === 'confirmed') ? addHoursIso(createdAt, 12) : null)
  const paymentDeadline = booking?.paymentDeadline || (status === 'awaiting_payment' ? addHoursIso(createdAt, 48) : null)
  const paymentStatus = booking?.paymentStatus || (['paid', 'checked_in', 'completed'].includes(status) ? 'paid' : 'unpaid')

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
    paymentStatus,
    confirmationDeadline,
    paymentDeadline,
    cancelReason: booking?.cancelReason || '',
    notes: booking?.notes || '',
    createdAt,
  }
}

const normalizeEventReservation = (reservation, index = 0) => {
  const startDate = reservation?.startDate
    ? new Date(reservation.startDate).toISOString().split('T')[0]
    : ''
  const endDate = reservation?.endDate
    ? new Date(reservation.endDate).toISOString().split('T')[0]
    : ''

  return {
    id: reservation?._id || reservation?.id || `EV-${String(index + 1).padStart(3, '0')}`,
    backendId: reservation?._id || null,
    clientName: reservation?.clientName || '',
    email: reservation?.email || '',
    phone: reservation?.phone || '',
    eventType: reservation?.eventType || '',
    guests: Number(reservation?.guests || 0),
    startDate,
    endDate,
    services: Array.isArray(reservation?.services) ? reservation.services : [],
    message: reservation?.message || '',
    status: reservation?.status || 'pending',
    createdAt: reservation?.createdAt || new Date().toISOString(),
  }
}

export function BookingProvider({ children }) {
  const { user, isAdmin, isLoggedIn } = useAuth()
  const [bookings, setBookings] = useState(BOOKINGS)
  const [rooms, setRooms] = useState(INITIAL_ROOMS)
  const [users, setUsers] = useState(INITIAL_USERS)
  const [hotels, setHotels] = useState([])
  const [eventReservations, setEventReservations] = useState(
    INITIAL_EVENT_RESERVATIONS.map((reservation, index) => normalizeEventReservation(reservation, index))
  )

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
          setEventReservations(INITIAL_EVENT_RESERVATIONS.map((reservation, index) => normalizeEventReservation(reservation, index)))
        }
        return
      }

      try {
        if (isAdmin) {
          const [bookingsData, usersData, eventReservationsData] = await Promise.all([
            apiRequest('/api/bookings', { withAuth: true }),
            apiRequest('/api/auth/allUsers', { withAuth: true }),
            apiRequest('/api/event-reservations', { withAuth: true }),
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
          setEventReservations((eventReservationsData?.reservations || []).map((reservation, index) => normalizeEventReservation(reservation, index)))
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
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'awaiting_payment' } : b))

  const rejectBooking = (id) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))

  const changeBookingStatus = async (id, status, options = {}) => {
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
          body: { status, cancelReason: options.cancelReason },
        })
      } catch {
        return { success: false, message: 'Impossible de mettre a jour le statut.' }
      }
    }

    const normalizedStatus = normalizeBookingStatus(status)
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b
      const next = { ...b, status: normalizedStatus }
      if (normalizedStatus === 'awaiting_payment') {
        next.paymentStatus = 'unpaid'
        next.paymentDeadline = addHoursIso(new Date(), 48)
      }
      if (normalizedStatus === 'paid') {
        next.paymentStatus = 'paid'
        next.paymentDeadline = null
      }
      if (normalizedStatus === 'checked_in') {
        next.paymentStatus = 'paid'
      }
      if (normalizedStatus === 'cancelled' || normalizedStatus === 'expired') {
        next.paymentStatus = 'unpaid'
        next.cancelReason = options.cancelReason || next.cancelReason || 'Reservation cancelled'
        next.paymentDeadline = null
      }
      return next
    }))
    setRooms(prev => prev.map(room => String(room.id) === String(booking.roomId)
      ? {
          ...room,
          status: normalizedStatus === 'checked_in'
            ? 'occupied'
            : (normalizedStatus === 'completed' || normalizedStatus === 'cancelled' || normalizedStatus === 'expired')
              ? 'available'
              : 'reserved',
          available: ['completed', 'cancelled', 'expired'].includes(normalizedStatus),
        }
      : room))
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

    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'paid', paymentStatus: 'paid', paymentDeadline: null } : b))
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

    setBookings(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: 'unpaid', status: b.status === 'paid' ? 'awaiting_payment' : b.status } : b))
    return { success: true }
  }

  const createBooking = async (data) => {
    const room = rooms.find(r => String(r.id) === String(data.roomId))
    if (!room) return { success: false, message: 'Chambre introuvable.' }
    let backendRoomId = room.backendId || room.id

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

      // Add guest info for non-authenticated guests, or user context will be used
      if (!isLoggedIn) {
        requestBody.guestName = data.guestName
        requestBody.guestPhone = data.guestPhone
        if (data.guestEmail) {
          requestBody.guestEmail = data.guestEmail
        }
      }

      // Create booking through API - works for both authenticated users and guests
      const result = await apiRequest('/api/bookings', {
        method: 'POST',
        withAuth: isLoggedIn,
        body: requestBody,
      })

      const created = normalizeBooking({
        ...result?.booking,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        notes: data.notes,
        paymentStatus: 'unpaid',
        status: 'pending_confirmation',
      }, rooms, users)

      setBookings(prev => [created, ...prev])
      setRooms(prev => prev.map(r => String(r.id) === String(data.roomId) ? { ...r, status: 'reserved', available: false } : r))
      return { success: true, booking: created, message: 'Reservation created successfully.' }
    } catch (error) {
      return { success: false, message: error.message || 'Reservation impossible.' }
    }

  }

  const createEventReservation = async (data) => {
    try {
      const result = await apiRequest('/api/event-reservations', {
        method: 'POST',
        withAuth: isLoggedIn,
        body: {
          clientName: data.clientName,
          email: data.email,
          phone: data.phone,
          eventType: data.eventType,
          guests: data.guests,
          startDate: data.startDate,
          endDate: data.endDate,
          services: data.services,
          message: data.message,
        },
      })
      const newReservation = normalizeEventReservation(result?.reservation || data, eventReservations.length)
      setEventReservations(prev => [...prev, newReservation])
      return { success: true, reservation: newReservation }
    } catch {
      // Fallback: save locally so the user's submission is not lost
      const newReservation = {
        id: 'EV-' + String(eventReservations.length + 1).padStart(3, '0'),
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      setEventReservations(prev => [...prev, newReservation])
      return { success: true, reservation: newReservation }
    }
  }

  const changeEventReservationStatus = async (id, status) => {
    const reservation = eventReservations.find(e => String(e.id) === String(id))
    if (!reservation) {
      return { success: false, message: 'Demande evenement introuvable.' }
    }

    const allowed = ['pending', 'contacted', 'confirmed', 'cancelled']
    if (!allowed.includes(status)) {
      return { success: false, message: 'Statut evenement invalide.' }
    }

    if (reservation.backendId && getAuthToken()) {
      try {
        await apiRequest(`/api/event-reservations/${reservation.backendId}/status`, {
          method: 'PATCH',
          withAuth: true,
          body: { status },
        })
      } catch {
        return { success: false, message: 'Impossible de mettre a jour le statut evenement.' }
      }
    }

    setEventReservations(prev => prev.map(e => String(e.id) === String(id) ? { ...e, status } : e))
    return { success: true }
  }

  const refetchUsers = async () => {
    if (!isAdmin || !getAuthToken()) {
      return { success: false, message: 'Admin access required' }
    }

    try {
      const usersData = await apiRequest('/api/auth/allUsers', { withAuth: true })
      const backendUsers = (usersData?.users || []).map(u => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role || 'user',
        createdAt: u.createdAt,
      }))
      
      setUsers(backendUsers)
      return { success: true, userCount: backendUsers.length }
    } catch (error) {
      return { success: false, message: error.message || 'Failed to refresh users' }
    }
  }

  const deleteBooking = async (id) => {
    const booking = bookings.find(b => b.id === id)
    if (booking?.backendId && getAuthToken()) {
      try {
        await apiRequest(`/api/bookings/${booking.backendId}/cancel`, {
          method: 'PATCH',
          withAuth: true,
          body: { cancelReason: 'Customer request' },
        })
      } catch {
        return { success: false, message: 'Impossible d\'annuler la reservation.' }
      }
    }

    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled', cancelReason: 'Customer request', paymentStatus: 'unpaid' } : b))
    setRooms(prev => prev.map(room => String(room.id) === String(booking?.roomId) ? { ...room, status: 'available', available: true } : room))
    return { success: true }
  }

  const adminDeleteBooking = async (id) => {
    const booking = bookings.find(b => b.id === id)
    if (!booking) return { success: false, message: 'Reservation introuvable.' }

    if (booking.backendId && getAuthToken()) {
      try {
        await apiRequest(`/api/bookings/${booking.backendId}`, {
          method: 'DELETE',
          withAuth: true,
        })
      } catch {
        return { success: false, message: 'Impossible de supprimer la reservation.' }
      }
    }

    setBookings(prev => prev.filter(b => b.id !== id))
    setRooms(prev => prev.map(room => String(room.id) === String(booking.roomId) ? { ...room, status: 'available', available: true } : room))
    return { success: true }
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
            name: room.name || '',
            type: room.type || 'classic',
            price: Number(room.price),
            status: room.status || (room.available ? 'available' : 'reserved'),
            available: room.status ? room.status === 'available' : room.available,
            maintenanceNote: room.maintenanceNote || '',
            maxGuests: Number(room.capacity || 2),
            size: Number(room.size || 25),
            floor: Number(room.floor || 1),
            description: room.description || '',
            image: room.image || '',
          },
        })

        setRooms(prev => [...prev, normalizeRoom(created.room, prev.length)])
        return { success: true }
      } catch (err) {
        return { success: false, message: err.message || 'Impossible de créer la chambre.' }
      }
    }

    const newRoom = { ...room, id: String(Date.now()), status: room.status || 'available', available: room.status ? room.status === 'available' : true, maintenanceNote: room.maintenanceNote || '' }
    setRooms(prev => [...prev, newRoom])
    return { success: true }
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
            name: updates.name || existingRoom.name,
            type: updates.type || existingRoom.type,
            price: Number(updates.price ?? existingRoom.price),
            status: updates.status || existingRoom.status,
            available: typeof updates.available === 'boolean' ? updates.available : (updates.status || existingRoom.status) === 'available',
            maintenanceNote: updates.maintenanceNote ?? existingRoom.maintenanceNote ?? '',
            maxGuests: Number(updates.capacity ?? existingRoom.capacity),
            size: Number(updates.size ?? existingRoom.size),
            floor: Number(updates.floor ?? existingRoom.floor),
            description: updates.description || existingRoom.description,
            image: updates.image || existingRoom.image,
          },
        })

        setRooms(prev => prev.map((r, index) => String(r.id) === String(id) ? normalizeRoom(updated.room, index) : r))
        return { success: true }
      } catch (err) {
        return { success: false, message: err.message || 'Impossible de mettre à jour la chambre.' }
      }
    }

    // No backendId — local-only update (mock data or offline)
    setRooms(prev => prev.map(r => String(r.id) === String(id) ? { ...r, ...updates, status: updates.status || r.status, available: (updates.status || r.status) === 'available' ? true : (updates.status === 'maintenance' ? false : updates.available ?? r.available), maintenanceNote: updates.maintenanceNote ?? r.maintenanceNote } : r))
    return { success: true }
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
    if (room.status === 'maintenance') return
    await updateRoom(id, { status: room.available ? 'reserved' : 'available' })
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
    maintenanceRooms: rooms.filter(r => r.status === 'maintenance').length,
    totalUsers: users.filter(u => u.role === 'user').length,
    pendingBookings: bookings.filter(b => b.status === 'pending_confirmation').length,
    awaitingPayments: bookings.filter(b => b.status === 'awaiting_payment').length,
    expiredBookings: bookings.filter(b => b.status === 'expired').length,
    approvedBookings: bookings.filter(b => b.status === 'awaiting_payment').length,
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
        approveBooking, rejectBooking, changeBookingStatus, markAsPaid, markAsUnpaid, createBooking, createEventReservation, changeEventReservationStatus, deleteBooking, adminDeleteBooking,
      addRoom, updateRoom, deleteRoom, toggleRoomAvailability,
      addUser, deleteUser, refetchUsers,
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
