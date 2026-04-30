import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useBooking } from '../../context/BookingContext'
import { formatDZD, calcNights } from '../../utils/formatters'
import { Calendar, AlertCircle, Clock, Trash2, FileText } from 'lucide-react'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import Toast from '../../shared/ui/Toast'
import StatusBadge from '../../shared/ui/Badge'
import DeadlineCountdown from '../../shared/ui/DeadlineCountdown'
import { Link } from 'react-router-dom'

export default function MyBookingsPage() {
  const { user, isLoggedIn } = useAuth()
  const { bookings, deleteBooking } = useBooking()
  const [toast, setToast] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle size={40} className="mx-auto mb-4 text-amber-500" />
            <h2 className="font-display text-2xl font-bold text-stone-800 mb-2">Connectez-vous</h2>
            <p className="text-stone-600 mb-6">Vous devez être connecté pour voir vos réservations.</p>
            <Link to="/login">
              <Button className="w-full">Se connecter</Button>
            </Link>
            <p className="text-stone-500 text-sm mt-4">
              Ou <Link to="/check-booking" className="text-primary-600 underline">consultez une réservation existante</Link>
            </p>
          </Card>
        </div>
      </div>
    )
  }

  const userBookings = bookings.filter(b => String(b.userId) === String(user?.id))

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId)
    try {
      const result = await deleteBooking(bookingId)
      if (result?.success) {
        setToast({ type: 'success', message: 'Réservation annulée avec succès.' })
      } else {
        setToast({ type: 'error', message: result?.message || 'Erreur lors de l\'annulation.' })
      }
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Erreur lors de l\'annulation.' })
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Mes réservations</p>
          <h1 className="font-display text-4xl font-bold text-stone-800">Historique des réservations</h1>
          <p className="text-stone-500 mt-3">Visualisez et gérez toutes vos réservations d'hôtel.</p>
        </div>

        {userBookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar size={40} className="mx-auto mb-4 text-stone-300" />
            <h3 className="font-display text-xl font-semibold text-stone-800 mb-2">Aucune réservation</h3>
            <p className="text-stone-600 mb-6">Vous n'avez pas encore effectué de réservation.</p>
            <Link to="/rooms">
              <Button>Explorer les chambres</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {userBookings.map(booking => (
              <Card key={booking.id} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  {/* Room Info */}
                  <div>
                    <h3 className="font-display font-semibold text-stone-800 mb-2">{booking.roomName}</h3>
                    <div className="space-y-2 text-sm text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{booking.checkIn} → {booking.checkOut}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{booking.nights} nuit{booking.nights > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Price */}
                  <div>
                    <div className="mb-3">
                      <p className="text-xs text-stone-500 mb-1">Statut</p>
                      <StatusBadge status={booking.status} />
                    </div>
                    {(booking.status === 'pending_confirmation' || booking.status === 'confirmed') && booking.confirmationDeadline && (
                      <div className="mb-3">
                        <DeadlineCountdown deadline={booking.confirmationDeadline} prefix="La réservation expire dans" />
                      </div>
                    )}
                    {booking.status === 'awaiting_payment' && booking.paymentDeadline && (
                      <div className="mb-3">
                        <DeadlineCountdown deadline={booking.paymentDeadline} prefix="Paiement attendu dans" tone="orange" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Montant total</p>
                      <p className="font-semibold text-lg text-stone-800">{formatDZD(booking.totalPrice)}</p>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Paiement</p>
                      <p className={`text-sm font-semibold ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                        {booking.paymentStatus === 'paid' ? '✓ Payé' : 'À payer à l\'arrivée'}
                      </p>
                    </div>
                  </div>
                </div>

                {booking.cancelReason && (
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                    <FileText size={16} className="text-stone-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-stone-500 mb-1">Motif d'annulation</p>
                      <p className="text-sm text-stone-700">{booking.cancelReason}</p>
                    </div>
                  </div>
                )}

                {/* Cancel Button */}
                {!['cancelled', 'expired', 'completed'].includes(booking.status) && (
                  <div className="border-t pt-4">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancel(booking.id)}
                      loading={cancellingId === booking.id}
                      className="flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Annuler la réservation
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
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
