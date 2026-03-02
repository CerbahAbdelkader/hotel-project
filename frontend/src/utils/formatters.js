export const formatDZD = (amount) =>
  new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(amount)

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'long', year: 'numeric' })

export const formatDateTime = (dateStr) =>
  new Date(dateStr).toLocaleString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const calcNights = (checkIn, checkOut) => {
  const a = new Date(checkIn)
  const b = new Date(checkOut)
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)))
}

export const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  paid: 'bg-primary-100 text-primary-800',
  unpaid: 'bg-gray-100 text-gray-700',
}

export const STATUS_LABELS = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Refusée',
  paid: 'Payée',
  unpaid: 'Non payée',
}
