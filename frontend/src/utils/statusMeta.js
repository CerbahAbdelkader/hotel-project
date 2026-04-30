import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  BedDouble,
  CheckCircle,
  CircleDashed,
  Clock3,
  CreditCard,
  Hourglass,
  TimerReset,
  UserCheck,
  Wrench,
  XCircle,
} from 'lucide-react'

const bookingStatusMeta = {
  pending_confirmation: {
    label: 'En attente de confirmation',
    tone: 'amber',
    icon: Clock3,
  },
  confirmed: {
    label: 'Confirmée',
    tone: 'blue',
    icon: BadgeCheck,
  },
  awaiting_payment: {
    label: 'En attente de paiement',
    tone: 'orange',
    icon: CreditCard,
  },
  paid: {
    label: 'Payée',
    tone: 'emerald',
    icon: Banknote,
  },
  checked_in: {
    label: 'En cours de séjour',
    tone: 'indigo',
    icon: UserCheck,
  },
  completed: {
    label: 'Terminée',
    tone: 'green',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Annulée',
    tone: 'rose',
    icon: XCircle,
  },
  expired: {
    label: 'Expirée',
    tone: 'slate',
    icon: TimerReset,
  },
  pending: {
    label: 'En attente',
    tone: 'amber',
    icon: Clock3,
    alias: 'pending_confirmation',
  },
  approved: {
    label: 'Confirmée',
    tone: 'blue',
    icon: BadgeCheck,
    alias: 'awaiting_payment',
  },
  rejected: {
    label: 'Annulée',
    tone: 'rose',
    icon: XCircle,
    alias: 'cancelled',
  },
}

const roomStatusMeta = {
  available: {
    label: 'Disponible',
    tone: 'green',
    icon: CheckCircle,
  },
  reserved: {
    label: 'Réservée',
    tone: 'amber',
    icon: CircleDashed,
  },
  occupied: {
    label: 'Occupée',
    tone: 'rose',
    icon: BedDouble,
  },
  maintenance: {
    label: 'Maintenance',
    tone: 'slate',
    icon: Wrench,
  },
}

const paymentStatusMeta = {
  paid: {
    label: 'Payée',
    tone: 'emerald',
    icon: Banknote,
  },
  unpaid: {
    label: 'Non payée',
    tone: 'stone',
    icon: Hourglass,
  },
}

const toneClasses = {
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  stone: 'bg-stone-100 text-stone-700 border-stone-200',
}

export const normalizeBookingStatus = (status) => bookingStatusMeta[status]?.alias || status || 'pending_confirmation'

export const normalizeRoomStatus = (room) => {
  if (!room) return 'available'
  if (room.status && roomStatusMeta[room.status]) return room.status
  if (room.maintenanceNote) return 'maintenance'
  return room.available === false ? 'reserved' : 'available'
}

export const getStatusMeta = (status, kind = 'booking') => {
  const normalizedStatus = kind === 'booking' ? normalizeBookingStatus(status) : status
  const source = kind === 'room'
    ? roomStatusMeta
    : kind === 'payment'
      ? paymentStatusMeta
      : bookingStatusMeta

  return source[normalizedStatus] || source[status] || {
    label: status || '—',
    tone: 'stone',
    icon: AlertCircle,
  }
}

export const getStatusClasses = (status, kind = 'booking') => {
  const meta = getStatusMeta(status, kind)
  return toneClasses[meta.tone] || toneClasses.stone
}

export const getRemainingTime = (deadline) => {
  if (!deadline) return null

  const deadlineTime = new Date(deadline).getTime()
  if (Number.isNaN(deadlineTime)) return null

  const diff = deadlineTime - Date.now()
  if (diff <= 0) {
    return { expired: true, text: 'Expiré', totalMinutes: 0, hours: 0, minutes: 0 }
  }

  const totalMinutes = Math.ceil(diff / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const text = hours > 0 ? `${hours}h ${minutes.toString().padStart(2, '0')}m` : `${minutes}m`

  return { expired: false, text, totalMinutes, hours, minutes }
}

export const getBookingDeadline = (booking, type) => {
  const createdAt = booking?.createdAt ? new Date(booking.createdAt) : new Date()
  if (type === 'confirmation') {
    return booking?.confirmationDeadline || new Date(createdAt.getTime() + (12 * 60 * 60 * 1000)).toISOString()
  }
  if (type === 'payment') {
    return booking?.paymentDeadline || (normalizeBookingStatus(booking?.status) === 'awaiting_payment'
      ? new Date(createdAt.getTime() + (48 * 60 * 60 * 1000)).toISOString()
      : null)
  }
  return null
}
