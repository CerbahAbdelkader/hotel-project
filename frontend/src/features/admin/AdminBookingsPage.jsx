import { useState } from 'react'
import { CheckCircle, XCircle, DollarSign, Eye, Search, Filter, Clock, RefreshCw } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { formatDZD, formatDate, formatDateTime } from '../../utils/formatters'
import Button from '../../shared/ui/Button'
import Modal from '../../shared/ui/Modal'
import Card from '../../shared/ui/Card'
import StatusBadge from '../../shared/ui/Badge'

export default function AdminBookingsPage() {
  const { bookings, eventReservations, changeBookingStatus, markAsPaid, markAsUnpaid, deleteBooking } = useBooking()
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState({ status: 'all', payment: 'all', search: '' })

  const filtered = bookings.filter(b => {
    if (filter.status !== 'all' && b.status !== filter.status) return false
    if (filter.payment !== 'all' && b.paymentStatus !== filter.payment) return false
    if (filter.search && !b.guestName.toLowerCase().includes(filter.search.toLowerCase())
      && !b.id.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-800">Réservations</h1>
        <p className="text-stone-500 text-sm mt-1">{bookings.length} réservation(s) au total</p>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              placeholder="Rechercher par nom ou numéro..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Refusées</option>
          </select>
          <select value={filter.payment} onChange={e => setFilter(f => ({ ...f, payment: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="all">Paiement: tous</option>
            <option value="paid">Payées</option>
            <option value="unpaid">Non payées</option>
          </select>
          <span className="text-xs text-stone-400">{filtered.length} résultat(s)</span>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                {['ID', 'Client', 'Chambre', 'Dates', 'Total', 'Statut', 'Paiement', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-stone-400">Aucune réservation trouvée.</td></tr>
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
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={b.paymentStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelected(b)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500" title="Détails">
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      {selected && (
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Réservation ${selected.id}`} size="md">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Client', selected.guestName],
                ['Email', selected.guestEmail],
                ['Téléphone', selected.guestPhone],
                ['Chambre', selected.roomName],
                ['Arrivée', formatDate(selected.checkIn)],
                ['Départ', formatDate(selected.checkOut)],
                ['Nuits', selected.nights],
                ['Total', formatDZD(selected.totalPrice)],
                ['Créée le', formatDateTime(selected.createdAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-xs text-stone-400">{label}</div>
                  <div className="font-medium text-stone-800">{value}</div>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div className="bg-stone-50 rounded-xl p-3">
                <div className="text-xs text-stone-400 mb-1">Notes</div>
                <div className="text-sm text-stone-700">{selected.notes}</div>
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <StatusBadge status={selected.status} />
              <StatusBadge status={selected.paymentStatus} />
            </div>
            <div className="space-y-3 pt-2 border-t border-stone-100">
              {/* Status Actions */}
              <div>
                <div className="text-xs font-semibold text-stone-500 mb-2">Changer le statut</div>
                <div className="flex gap-2 flex-wrap">
                  {selected.status !== 'pending' && (
                    <Button size="sm" variant="secondary" onClick={() => { changeBookingStatus(selected.id, 'pending'); setSelected(null) }}>
                      <Clock size={14} /> En attente
                    </Button>
                  )}
                  {selected.status !== 'approved' && (
                    <Button size="sm" variant="success" onClick={() => { changeBookingStatus(selected.id, 'approved'); setSelected(null) }}>
                      <CheckCircle size={14} /> Approuver
                    </Button>
                  )}
                  {selected.status !== 'rejected' && (
                    <Button size="sm" variant="danger" onClick={() => { changeBookingStatus(selected.id, 'rejected'); setSelected(null) }}>
                      <XCircle size={14} /> Refuser
                    </Button>
                  )}
                </div>
              </div>

              {/* Payment Actions */}
              <div>
                <div className="text-xs font-semibold text-stone-500 mb-2">Paiement</div>
                <div className="flex gap-2 flex-wrap">
                  {selected.paymentStatus !== 'paid' && (
                    <Button size="sm" onClick={() => { markAsPaid(selected.id); setSelected(null) }}>
                      <DollarSign size={14} /> Marquer comme payée
                    </Button>
                  )}
                  {selected.paymentStatus !== 'unpaid' && (
                    <Button size="sm" variant="secondary" onClick={() => { markAsUnpaid(selected.id); setSelected(null) }}>
                      <RefreshCw size={14} /> Marquer comme non payée
                    </Button>
                  )}
                </div>
              </div>

              <Button size="sm" variant="secondary" onClick={() => setSelected(null)} className="w-full">Fermer</Button>
            </div>
          </div>
        </Modal>
      )}

      <div className="mt-8">
        <h2 className="font-display text-xl font-bold text-stone-800 mb-2">Demandes d'événements</h2>
        <p className="text-stone-500 text-sm mb-4">{eventReservations.length} demande(s) d'événement au total</p>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  {['ID', 'Client', 'Type', 'Dates', 'Invités', 'Contact', 'Services'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {eventReservations.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-stone-400">Aucune demande d'événement trouvée.</td></tr>
                ) : [...eventReservations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(e => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
