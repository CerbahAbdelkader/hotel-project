import { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, Clock, AlertCircle, Trash2 } from 'lucide-react'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import Toast from '../../shared/ui/Toast'
import { formatDZD } from '../../utils/formatters'
import { apiRequest } from '../../utils/api'

const statusBadge = (status) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    confirmed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
  }
  const labels = {
    pending: 'En attente',
    approved: 'Approuvé',
    confirmed: 'Confirmé',
    rejected: 'Rejeté',
    cancelled: 'Annulé',
  }
  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  )
}

export default function CheckBookingPage() {
  const [searchType, setSearchType] = useState('phone') // 'phone' or 'email'
  const [searchValue, setSearchValue] = useState('')
  const [bookings, setBookings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchValue.trim()) {
      setError('Veuillez entrer une valeur de recherche.')
      return
    }

    setLoading(true)
    setError(null)
    setBookings(null)

    try {
      let endpoint = '/api/bookings/guest/by-email'
      let payload = { email: searchValue.trim() }

      if (searchType === 'phone') {
        // Phone search uses the generic bookings endpoint with query param
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/bookings?phone=${encodeURIComponent(searchValue.trim())}`)
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Aucune réservation trouvée.')
        }
        const data = await response.json()
        setBookings(data.bookings || [])
      } else {
        // Email search
        const data = await apiRequest(endpoint, {
          method: 'POST',
          body: payload,
        })
        setBookings(data.bookings || [])
      }
    } catch (error) {
      setError(error.message || 'Erreur lors de la recherche.')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId, booking) => {
    setCancellingId(bookingId)
    try {
      const cancelPayload =
        searchType === 'email'
          ? { email: searchValue.trim() }
          : { guestPhone: searchValue.trim(), guestName: booking.guestName }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/bookings/${bookingId}/cancel`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cancelPayload),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Erreur lors de l\'annulation.')
      }

      setToast({ type: 'success', message: 'Réservation annulée avec succès.' })
      // Refresh bookings
      setBookings(prev =>
        prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b)
      )
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Erreur lors de l\'annulation.' })
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Consultez votre réservation</p>
          <h1 className="font-display text-4xl font-bold text-stone-800">Vérifier mon réservation</h1>
          <p className="text-stone-500 mt-3">Entrez votre téléphone ou email pour retrouver votre réservation.</p>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="phone"
                  checked={searchType === 'phone'}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-stone-700">Par téléphone</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="email"
                  checked={searchType === 'email'}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-stone-700">Par email</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={searchType === 'phone' ? '+213 6 12 34 56 78' : 'votre@email.com'}
                type={searchType === 'email' ? 'email' : 'tel'}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" loading={loading} className="flex items-center gap-2">
                <Search size={18} />
                Rechercher
              </Button>
            </div>
          </form>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Bookings List */}
        {bookings !== null && (
          <>
            {bookings.length === 0 ? (
              <Card className="p-12 text-center">
                <Search size={40} className="mx-auto mb-4 text-stone-300" />
                <h3 className="font-display text-xl font-semibold text-stone-800 mb-2">Aucune réservation trouvée</h3>
                <p className="text-stone-600">Vérifiez que vous avez entré le bon {searchType === 'phone' ? 'numéro de téléphone' : 'email'}.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => {
                  const checkIn = booking.checkIn ? new Date(booking.checkIn).toISOString().split('T')[0] : ''
                  const checkOut = booking.checkOut ? new Date(booking.checkOut).toISOString().split('T')[0] : ''
                  const nights = checkIn && checkOut
                    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
                    : 1

                  return (
                    <Card key={booking._id} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        {/* Info */}
                        <div>
                          <h3 className="font-display font-semibold text-stone-800 mb-3">Informations</h3>
                          <div className="space-y-2 text-sm text-stone-600">
                            <div>
                              <p className="text-xs text-stone-500">Nom</p>
                              <p className="font-medium text-stone-800">{booking.guestName}</p>
                            </div>
                            {booking.guestEmail && (
                              <div>
                                <p className="text-xs text-stone-500">Email</p>
                                <p className="font-medium text-stone-800">{booking.guestEmail}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-stone-500">Téléphone</p>
                              <p className="font-medium text-stone-800">{booking.guestPhone}</p>
                            </div>
                          </div>
                        </div>

                        {/* Dates & Duration */}
                        <div>
                          <h3 className="font-display font-semibold text-stone-800 mb-3">Dates</h3>
                          <div className="space-y-2 text-sm text-stone-600">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              <span>{checkIn}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              <span>{checkOut}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={16} />
                              <span>{nights} nuit{nights > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Price */}
                        <div>
                          <h3 className="font-display font-semibold text-stone-800 mb-3">Détails</h3>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-stone-500 mb-1">Statut</p>
                              {statusBadge(booking.status)}
                            </div>
                            <div>
                              <p className="text-xs text-stone-500">Montant</p>
                              <p className="font-semibold text-lg text-stone-800">{formatDZD(booking.totalPrice)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      {booking.status !== 'cancelled' && booking.status !== 'rejected' && (
                        <div className="border-t pt-4">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancel(booking._id, booking)}
                            loading={cancellingId === booking._id}
                            className="flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Annuler cette réservation
                          </Button>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </div>
  )
}
