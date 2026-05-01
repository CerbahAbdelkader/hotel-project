import { useState } from 'react'
import { CheckCircle2, XCircle, DollarSign, Eye, Search, Filter, Clock, RefreshCw, MoreVertical, LogIn, Trash2, TimerReset, Ban, ChevronDown } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { formatDZD, formatDate, formatDateTime } from '../../utils/formatters'
import Button from '../../shared/ui/Button'
import Modal from '../../shared/ui/Modal'
import Card from '../../shared/ui/Card'
import StatusBadge from '../../shared/ui/Badge'
import DeadlineCountdown from '../../shared/ui/DeadlineCountdown'
import Input, { Textarea } from '../../shared/ui/Input'

export default function AdminBookingsPage() {
  const { bookings, eventReservations, changeBookingStatus, markAsPaid, markAsUnpaid, changeEventReservationStatus, deleteBooking, adminDeleteBooking } = useBooking()
  const [selected, setSelected] = useState(null)
  const [selectedAction, setSelectedAction] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [submittingAction, setSubmittingAction] = useState(false)
  const [actionReason, setActionReason] = useState('')
  const [filter, setFilter] = useState({ status: 'all', search: '' })
  const [actionNotice, setActionNotice] = useState(null)

  const showActionNotice = (type, message) => {
    setActionNotice({ type, message })
    setTimeout(() => setActionNotice(null), 3500)
  }

  const openAction = (booking, action) => {
    setOpenMenuId(null)
    setPendingAction({ booking, ...action })
    setActionReason(action.defaultReason || '')
  }

  const handleActionSelect = (bookingId, label, tone) => {
    setSelectedAction({ bookingId, label, tone })
  }

  const getActionToneClass = (tone) => {
    switch (tone) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700'
      case 'danger':
        return 'border-red-200 bg-red-50 text-red-700'
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-700'
      case 'accent':
        return 'border-indigo-200 bg-indigo-50 text-indigo-700'
      case 'warn':
        return 'border-rose-200 bg-rose-50 text-rose-700'
      default:
        return 'border-stone-200 bg-stone-50 text-stone-700'
    }
  }

  const handleStatusChange = async (bookingId, status, reason) => {
    // Show immediate feedback when backend status sync succeeds/fails.
    const result = await changeBookingStatus(bookingId, status, reason ? { cancelReason: reason } : undefined)
    if (result?.success) {
      showActionNotice('success', 'Statut de reservation mis a jour.')
      setSelected(null)
    } else {
      showActionNotice('error', result?.message || 'Mise a jour du statut echouee.')
    }
  }

  const handlePaymentChange = async (bookingId, paymentStatus) => {
    const result = paymentStatus === 'paid'
      ? await markAsPaid(bookingId)
      : await markAsUnpaid(bookingId)

    if (result?.success) {
      showActionNotice('success', 'Statut de paiement mis a jour.')
      setSelected(null)
    } else {
      showActionNotice('error', result?.message || 'Mise a jour du paiement echouee.')
    }
  }

  const handleCheckedIn = async (bookingId) => {
    const result = await changeBookingStatus(bookingId, 'checked_in')
    if (result?.success) {
      showActionNotice('success', 'Réservation marquée comme entrée.')
      setSelected(null)
    } else {
      showActionNotice('error', result?.message || 'Mise à jour du statut échouée.')
    }
  }

  const handleConfirmReservation = async (bookingId) => {
    const result = await changeBookingStatus(bookingId, 'awaiting_payment')
    if (result?.success) {
      showActionNotice('success', 'Réservation confirmée et en attente de paiement.')
      setSelected(null)
    } else {
      showActionNotice('error', result?.message || 'Impossible de confirmer la réservation.')
    }
  }

  const handleRejectReservation = async (bookingId, reason) => {
    const result = await changeBookingStatus(bookingId, 'cancelled', reason)
    if (result?.success) {
      showActionNotice('success', 'Réservation annulée.')
      setSelected(null)
    } else {
      showActionNotice('error', result?.message || 'Impossible d\'annuler la réservation.')
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    const result = await adminDeleteBooking(bookingId)
    if (result?.success) {
      showActionNotice('success', 'Réservation supprimée.')
      setSelected(null)
      setSelectedAction(prev => (prev?.bookingId === bookingId ? null : prev))
    } else {
      showActionNotice('error', result?.message || 'Impossible de supprimer la réservation.')
    }
  }

  const submitPendingAction = async () => {
    if (!pendingAction || submittingAction) return

    const { booking, type, status, paymentStatus } = pendingAction

    if ((status === 'cancelled') && !actionReason.trim()) {
      showActionNotice('error', 'Un motif est requis pour cette action.')
      return
    }

    // Close confirmation modal immediately and show quick processing notice
    setPendingAction(null)
    showActionNotice('info', 'Action en cours...')
    setSubmittingAction(true)

    try {
      if (type === 'payment') {
        await handlePaymentChange(booking.id, paymentStatus)
      } else if (type === 'delete') {
        await handleDeleteBooking(booking.id)
      } else {
        if (status === 'awaiting_payment') {
          await handleConfirmReservation(booking.id)
        } else if (status === 'checked_in') {
          await handleCheckedIn(booking.id)
        } else if (status === 'cancelled') {
          await handleRejectReservation(booking.id, actionReason.trim())
        }
      }
    } finally {
      setSubmittingAction(false)
    }
  }

  const performImmediateDelete = async (booking) => {
    setOpenMenuId(null)
    handleActionSelect(booking.id, 'Supprimée', 'warn')
    showActionNotice('info', 'Suppression en cours...')
    const result = await handleDeleteBooking(booking.id)
    if (!result?.success) {
      setSelectedAction(null)
    }
  }

  const handleEventStatusChange = async (reservationId, status) => {
    const result = await changeEventReservationStatus(reservationId, status)
    if (result?.success) {
      showActionNotice('success', 'Statut de la demande evenement mis a jour.')
    } else {
      showActionNotice('error', result?.message || 'Mise a jour du statut evenement echouee.')
    }
  }

  const filtered = bookings.filter(b => {
    if (filter.status !== 'all' && b.status !== filter.status) return false
    const searchValue = filter.search.toLowerCase()
    const guestName = (b.guestName || '').toLowerCase()
    const bookingId = String(b.id || '').toLowerCase()
    if (filter.search && !guestName.includes(searchValue) && !bookingId.includes(searchValue)) return false
    return true
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const sortedEventReservations = [...eventReservations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-800">Réservations</h1>
        <p className="text-stone-500 text-sm mt-1">{bookings.length} réservation(s) au total</p>
      </div>

      {actionNotice && (
        <Card className={`p-3 mb-4 border ${actionNotice.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm ${actionNotice.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {actionNotice.message}
          </p>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-0 sm:min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              placeholder="Rechercher par nom ou numéro..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="all">Tous</option>
            <option value="pending_confirmation">En attente de confirmation</option>
            <option value="awaiting_payment">En attente de paiement</option>
            <option value="paid">Payée</option>
            <option value="checked_in">En séjour</option>
            <option value="cancelled">Annulée</option>
          </select>
          {/* payment filter removed per request */}
          <span className="text-xs text-stone-400 self-start sm:self-auto">{filtered.length} résultat(s)</span>
        </div>
      </Card>

      {/* Desktop table */}
      <Card className="overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                {['ID', 'Client', 'Chambre', 'Dates', 'Total', 'Paiement', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-stone-400">Aucune réservation trouvée.</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-warm-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{b.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-800">{b.guestName}</div>
                    <div className="text-xs text-stone-400">{b.guestPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{b.roomName}</td>
                  <td className="px-4 py-3 text-xs text-stone-500 whitespace-nowrap">
                    {b.checkIn} → {b.checkOut}<br/>
                    <span className="text-stone-400">{b.nights} nuit(s)</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-stone-800 whitespace-nowrap">{formatDZD(b.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedAction?.bookingId === b.id ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-sm ${getActionToneClass(selectedAction.tone)}`}>
                          {selectedAction.label}
                        </span>
                      ) : b.status === 'pending_confirmation' ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-sm ${getActionToneClass('warn')}`}>
                          À confirmer
                        </span>
                      ) : (
                        <StatusBadge status={b.paymentStatus} kind="payment" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelected(b)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-stone-50 border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Voir les détails de la réservation"
                      >
                        <Eye size={13} />
                      </button>
                      <div className="relative flex items-center justify-end">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === b.id ? null : b.id)}
                          className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 text-amber-700 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Cliquez pour voir les actions disponibles"
                        >
                        <span>Actions</span>
                        <ChevronDown size={14} className={`transition-transform ${openMenuId === b.id ? 'rotate-180' : ''}`} />
                      </button>
                      {openMenuId === b.id && (
                        <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-stone-200 bg-white shadow-2xl p-1 animate-in fade-in slide-in-from-top-2">
                          <button onClick={() => { handleActionSelect(b.id, 'Confirmée', 'success'); openAction(b, { type: 'status', status: 'awaiting_payment', title: 'Confirmer la réservation', confirmLabel: 'Confirmer' }) }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-emerald-50 text-emerald-700 transition-colors">
                            <CheckCircle2 size={14} /> Confirmer la réservation
                          </button>
                          <button onClick={() => { handleActionSelect(b.id, 'Annulée', 'danger'); openAction(b, { type: 'status', status: 'cancelled', title: 'Annuler la réservation', confirmLabel: 'Annuler', requiresReason: true, defaultReason: 'No availability' }) }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-red-50 text-red-700 transition-colors">
                            <XCircle size={14} /> Refuser / annuler
                          </button>
                          <button onClick={() => { handleActionSelect(b.id, 'Payée', 'info'); openAction(b, { type: 'payment', paymentStatus: 'paid', title: 'Marquer comme payée', confirmLabel: 'Marquer payée' }) }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-blue-50 text-blue-700 transition-colors">
                            <DollarSign size={14} /> Marquer comme payée
                          </button>
                          <button onClick={() => { handleActionSelect(b.id, 'Entrée', 'accent'); openAction(b, { type: 'status', status: 'checked_in', title: 'Marquer comme entrée', confirmLabel: 'Marquer entrée' }) }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-indigo-50 text-indigo-700 transition-colors">
                            <LogIn size={14} /> Marquer comme entrée
                          </button>
                          <div className="h-px bg-stone-100 my-1" />
                          <button onClick={() => performImmediateDelete(b)} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-rose-50 text-rose-700 transition-colors">
                            <Trash2 size={14} /> Supprimer la réservation
                          </button>
                        </div>
                      )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-5 text-center text-stone-400">Aucune réservation trouvée.</Card>
        ) : filtered.map(b => (
          <Card key={b.id} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="font-mono text-xs text-stone-500">{b.id}</div>
                <h3 className="font-semibold text-stone-800">{b.guestName}</h3>
                <p className="text-xs text-stone-500">{b.guestPhone}</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === b.id ? null : b.id)}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 text-amber-700 font-medium text-xs transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                  title="Cliquez pour voir les actions disponibles"
                >
                  <span>Actions</span>
                  <ChevronDown size={12} className={`transition-transform ${openMenuId === b.id ? 'rotate-180' : ''}`} />
                </button>
                {openMenuId === b.id && (
                  <div className="absolute right-0 top-11 z-20 w-56 rounded-xl border border-stone-200 bg-white shadow-2xl p-1 animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => { handleActionSelect(b.id, 'Confirmée', 'success'); openAction(b, { type: 'status', status: 'awaiting_payment', title: 'Confirmer la réservation', confirmLabel: 'Confirmer' }) }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-emerald-50 text-emerald-700 transition-colors">
                      <CheckCircle2 size={14} /> Confirmer la réservation
                    </button>
                    <button onClick={() => { handleActionSelect(b.id, 'Annulée', 'danger'); openAction(b, { type: 'status', status: 'cancelled', title: 'Annuler la réservation', confirmLabel: 'Annuler', requiresReason: true, defaultReason: 'No availability' }) }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-red-50 text-red-700 transition-colors">
                      <XCircle size={14} /> Refuser / annuler
                    </button>
                    <button onClick={() => { handleActionSelect(b.id, 'Payée', 'info'); openAction(b, { type: 'payment', paymentStatus: 'paid', title: 'Marquer comme payée', confirmLabel: 'Marquer payée' }) }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-blue-50 text-blue-700 transition-colors">
                      <DollarSign size={14} /> Marquer comme payée
                    </button>
                    <button onClick={() => { handleActionSelect(b.id, 'Entrée', 'accent'); openAction(b, { type: 'status', status: 'checked_in', title: 'Marquer comme entrée', confirmLabel: 'Marquer entrée' }) }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-indigo-50 text-indigo-700 transition-colors">
                      <LogIn size={14} /> Marquer comme entrée
                    </button>
                    <div className="h-px bg-stone-100 my-1" />
                          <button onClick={() => performImmediateDelete(b)} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-rose-50 text-rose-700 transition-colors">
                            <Trash2 size={14} /> Supprimer la réservation
                          </button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="text-stone-500">Chambre</div>
              <div className="text-stone-700 text-right">{b.roomName}</div>
              <div className="text-stone-500">Dates</div>
              <div className="text-stone-700 text-right">{b.checkIn} → {b.checkOut}</div>
              <div className="text-stone-500">Nuits</div>
              <div className="text-stone-700 text-right">{b.nights}</div>
              <div className="text-stone-500">Total</div>
              <div className="text-stone-800 font-semibold text-right">{formatDZD(b.totalPrice)}</div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedAction?.bookingId === b.id ? (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-sm ${getActionToneClass(selectedAction.tone)}`}>
                  {selectedAction.label}
                </span>
              ) : b.status === 'pending_confirmation' ? (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-sm ${getActionToneClass('warn')}`}>
                  À confirmer
                </span>
              ) : (
                <StatusBadge status={b.paymentStatus} kind="payment" />
              )}
            </div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setSelected(b)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-stone-50 border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                title="Voir les détails de la réservation"
              >
                <Eye size={13} /> Détails
              </button>
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`Réservation ${selected.id}`}
          size="md"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-400 mb-1">Client</p>
                <p className="font-semibold text-stone-800">{selected.guestName}</p>
                <p className="text-stone-500">{selected.guestPhone}</p>
                {selected.guestEmail && <p className="text-stone-500">{selected.guestEmail}</p>}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-400 mb-1">Chambre</p>
                <p className="font-semibold text-stone-800">{selected.roomName}</p>
                <p className="text-stone-500">{selected.nights} nuit(s)</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-400 mb-1">Dates</p>
                <p className="font-semibold text-stone-800">{selected.checkIn} → {selected.checkOut}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-400 mb-1">Total</p>
                <p className="font-semibold text-stone-800">{formatDZD(selected.totalPrice)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-400 mb-1">Statut</p>
                <StatusBadge status={selected.status} kind="booking" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-400 mb-1">Paiement</p>
                <StatusBadge status={selected.paymentStatus} kind="payment" />
              </div>
            </div>

            {selected.notes && (
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-400 mb-2">Notes</p>
                <div className="rounded-xl bg-stone-50 border border-stone-200 p-3 text-sm text-stone-700">
                  {selected.notes}
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button variant="secondary" onClick={() => setSelected(null)} className="w-full sm:w-auto">
                Fermer
              </Button>
            </div>
          </div>
        </Modal>
      )}



      {pendingAction && (
        <Modal
          isOpen={!!pendingAction}
          onClose={() => setPendingAction(null)}
          title={pendingAction.title}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              {pendingAction.requiresReason
                ? 'Un motif est requis avant de continuer.'
                : 'Confirmez cette action pour continuer.'}
            </p>
            {pendingAction.requiresReason && (
              <Textarea
                label="Motif"
                value={actionReason}
                onChange={e => setActionReason(e.target.value)}
                placeholder="No availability, payment timeout, duplicate booking..."
                rows={4}
              />
            )}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button variant="secondary" onClick={() => setPendingAction(null)} className="w-full sm:w-auto">
                Annuler
              </Button>
              <Button onClick={submitPendingAction} loading={submittingAction} className="w-full sm:w-auto">
                {pendingAction.confirmLabel || 'Confirmer'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <div className="mt-8">
        <h2 className="font-display text-xl font-bold text-stone-800 mb-2">Demandes d'événements</h2>
        <p className="text-stone-500 text-sm mb-4">{eventReservations.length} demande(s) d'événement au total</p>

        <Card className="overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  {['ID', 'Client', 'Type', 'Dates', 'Invités', 'Contact', 'Services', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {sortedEventReservations.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-stone-400">Aucune demande d'événement trouvée.</td></tr>
                ) : sortedEventReservations.map(e => (
                  <tr key={e.id} className="hover:bg-warm-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-stone-500">{e.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone-800">{e.clientName}</div>
                      <div className="text-xs text-stone-400">Créée le {formatDateTime(e.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3 text-stone-700">{e.eventType}</td>
                    <td className="px-4 py-3 text-xs text-stone-500 whitespace-nowrap">
                      {e.startDate} → {e.endDate}
                    </td>
                    <td className="px-4 py-3 text-stone-700">{e.guests}</td>
                    <td className="px-4 py-3 text-xs text-stone-600">
                      <div>{e.phone}</div>
                      <div>{e.email || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-600">{e.services.length ? e.services.join(', ') : '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {e.status !== 'pending' && (
                          <Button size="sm" variant="secondary" onClick={() => handleEventStatusChange(e.id, 'pending')}>
                            En attente
                          </Button>
                        )}
                        {e.status !== 'contacted' && (
                          <Button size="sm" variant="outline" onClick={() => handleEventStatusChange(e.id, 'contacted')}>
                            Contactée
                          </Button>
                        )}
                        {e.status !== 'confirmed' && (
                          <Button size="sm" variant="success" onClick={() => handleEventStatusChange(e.id, 'confirmed')}>
                            Confirmée
                          </Button>
                        )}
                        {e.status !== 'cancelled' && (
                          <Button size="sm" variant="danger" onClick={() => handleEventStatusChange(e.id, 'cancelled')}>
                            Annuler
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="md:hidden space-y-3">
          {sortedEventReservations.length === 0 ? (
            <Card className="p-5 text-center text-stone-400">Aucune demande d'événement trouvée.</Card>
          ) : sortedEventReservations.map(e => (
            <Card key={e.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-mono text-xs text-stone-500">{e.id}</div>
                  <h3 className="font-semibold text-stone-800">{e.clientName}</h3>
                  <p className="text-xs text-stone-500">{formatDateTime(e.createdAt)}</p>
                </div>
                <StatusBadge status={e.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="text-stone-500">Type</div>
                <div className="text-stone-700 text-right">{e.eventType}</div>
                <div className="text-stone-500">Dates</div>
                <div className="text-stone-700 text-right">{e.startDate} → {e.endDate}</div>
                <div className="text-stone-500">Invités</div>
                <div className="text-stone-700 text-right">{e.guests}</div>
                <div className="text-stone-500">Contact</div>
                <div className="text-stone-700 text-right">{e.phone}</div>
              </div>

              <div className="text-xs text-stone-600 mb-3">
                Services: {e.services.length ? e.services.join(', ') : '—'}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {e.status !== 'pending' && (
                  <Button size="sm" variant="secondary" onClick={() => handleEventStatusChange(e.id, 'pending')}>
                    En attente
                  </Button>
                )}
                {e.status !== 'contacted' && (
                  <Button size="sm" variant="outline" onClick={() => handleEventStatusChange(e.id, 'contacted')}>
                    Contactée
                  </Button>
                )}
                {e.status !== 'confirmed' && (
                  <Button size="sm" variant="success" onClick={() => handleEventStatusChange(e.id, 'confirmed')}>
                    Confirmée
                  </Button>
                )}
                {e.status !== 'cancelled' && (
                  <Button size="sm" variant="danger" onClick={() => handleEventStatusChange(e.id, 'cancelled')}>
                    Annuler
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
