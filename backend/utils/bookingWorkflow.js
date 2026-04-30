const BOOKING_STATUS_ALIASES = {
  pending: 'pending_confirmation',
  approved: 'awaiting_payment',
  rejected: 'cancelled',
}

const BOOKING_STATUSES = [
  'pending_confirmation',
  'confirmed',
  'awaiting_payment',
  'paid',
  'checked_in',
  'completed',
  'cancelled',
  'expired',
  'pending',
  'approved',
  'rejected',
]

const ROOM_STATUSES = ['available', 'reserved', 'occupied', 'maintenance']

const BOOKING_TRANSITIONS = {
  pending_confirmation: ['confirmed', 'awaiting_payment', 'cancelled', 'expired'],
  confirmed: ['awaiting_payment', 'cancelled', 'expired'],
  awaiting_payment: ['paid', 'cancelled', 'expired'],
  paid: ['checked_in', 'completed', 'cancelled'],
  checked_in: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  expired: [],
}

const BOOKING_ROOM_STATUS = {
  pending_confirmation: 'reserved',
  confirmed: 'reserved',
  awaiting_payment: 'reserved',
  paid: 'reserved',
  checked_in: 'occupied',
  completed: 'available',
  cancelled: 'available',
  expired: 'available',
}

const CONFIRMATION_DEADLINE_HOURS = 12
const PAYMENT_DEADLINE_HOURS = 48

const addHours = (date, hours) => new Date(new Date(date).getTime() + (hours * 60 * 60 * 1000))

const normalizeBookingStatus = (status) => BOOKING_STATUS_ALIASES[status] || status || 'pending_confirmation'

const canTransitionBookingStatus = (currentStatus, nextStatus) => {
  const normalizedCurrent = normalizeBookingStatus(currentStatus)
  const normalizedNext = normalizeBookingStatus(nextStatus)

  if (normalizedCurrent === normalizedNext) return true
  return Boolean(BOOKING_TRANSITIONS[normalizedCurrent]?.includes(normalizedNext))
}

const getRoomStatusFromBookingStatus = (status) => BOOKING_ROOM_STATUS[normalizeBookingStatus(status)] || null

const normalizeRoomStatus = (room) => {
  if (!room) return 'available'

  const rawStatus = room.status || room.roomStatus
  if (rawStatus && ROOM_STATUSES.includes(rawStatus)) return rawStatus
  if (room.maintenanceNote) return 'maintenance'
  if (room.available === false) return 'reserved'
  return 'available'
}

const getConfirmationDeadline = (createdAt, existingDeadline, status) => {
  if (existingDeadline) return existingDeadline
  const normalizedStatus = normalizeBookingStatus(status)
  if (normalizedStatus === 'pending_confirmation' || normalizedStatus === 'confirmed' || normalizedStatus === 'pending') {
    return addHours(createdAt || new Date(), CONFIRMATION_DEADLINE_HOURS)
  }
  return null
}

const getPaymentDeadline = (createdAt, existingDeadline, status) => {
  if (existingDeadline) return existingDeadline
  if (normalizeBookingStatus(status) === 'awaiting_payment') {
    const baseDate = createdAt ? new Date(createdAt) : new Date()
    return addHours(baseDate, PAYMENT_DEADLINE_HOURS)
  }
  return null
}

const getBookingStateUpdate = ({ nextStatus, cancelReason, createdAt }) => {
  const normalizedNext = normalizeBookingStatus(nextStatus)
  const payload = {
    status: normalizedNext,
  }

  if (normalizedNext === 'pending_confirmation' || normalizedNext === 'confirmed') {
    payload.confirmationDeadline = addHours(createdAt || new Date(), CONFIRMATION_DEADLINE_HOURS)
    payload.paymentDeadline = null
    payload.paymentStatus = 'unpaid'
  }

  if (normalizedNext === 'awaiting_payment') {
    payload.paymentDeadline = addHours(new Date(), PAYMENT_DEADLINE_HOURS)
    payload.paymentStatus = 'unpaid'
  }

  if (normalizedNext === 'paid') {
    payload.paymentStatus = 'paid'
    payload.paymentDeadline = null
  }

  if (normalizedNext === 'cancelled' || normalizedNext === 'expired') {
    payload.paymentStatus = 'unpaid'
    payload.cancelReason = cancelReason || (normalizedNext === 'expired' ? 'Reservation expired automatically' : 'Reservation cancelled')
    payload.paymentDeadline = null
  }

  if (normalizedNext === 'checked_in' || normalizedNext === 'completed') {
    payload.paymentStatus = 'paid'
    payload.paymentDeadline = null
  }

  return payload
}

async function expireOverdueBookings({ Booking, Room }) {
  const now = new Date()
  const summary = { expired: 0, cancelled: 0 }

  const expirableBookings = await Booking.find({
    status: { $in: ['pending_confirmation', 'confirmed', 'awaiting_payment', 'pending', 'approved'] },
  }).populate('room')

  for (const booking of expirableBookings) {
    const roomId = booking.room?._id || booking.room
    if (!roomId) continue

    const confirmationDeadline = getConfirmationDeadline(booking.createdAt, booking.confirmationDeadline, booking.status)
    const paymentDeadline = getPaymentDeadline(booking.createdAt, booking.paymentDeadline, booking.status)

    const shouldExpireConfirmation = ['pending_confirmation', 'confirmed', 'pending'].includes(normalizeBookingStatus(booking.status))
      && confirmationDeadline
      && new Date(confirmationDeadline).getTime() <= now.getTime()

    const shouldCancelPayment = normalizeBookingStatus(booking.status) === 'awaiting_payment'
      && paymentDeadline
      && new Date(paymentDeadline).getTime() <= now.getTime()

    if (!shouldExpireConfirmation && !shouldCancelPayment) continue

    booking.status = shouldExpireConfirmation ? 'expired' : 'cancelled'
    booking.paymentStatus = 'unpaid'
    booking.cancelReason = shouldExpireConfirmation ? 'Reservation expired automatically' : 'Payment deadline expired'
    booking.confirmationDeadline = confirmationDeadline || booking.confirmationDeadline
    booking.paymentDeadline = null
    await booking.save()

    await Room.findByIdAndUpdate(roomId, {
      status: 'available',
      available: true,
    })

    if (shouldExpireConfirmation) summary.expired += 1
    if (shouldCancelPayment) summary.cancelled += 1
  }

  return summary
}

module.exports = {
  BOOKING_STATUSES,
  ROOM_STATUSES,
  CONFIRMATION_DEADLINE_HOURS,
  PAYMENT_DEADLINE_HOURS,
  addHours,
  normalizeBookingStatus,
  canTransitionBookingStatus,
  getRoomStatusFromBookingStatus,
  normalizeRoomStatus,
  getConfirmationDeadline,
  getPaymentDeadline,
  getBookingStateUpdate,
  expireOverdueBookings,
}