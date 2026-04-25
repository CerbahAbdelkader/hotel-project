import { Link } from 'react-router-dom'
import { BedDouble, Users, CalendarCheck, Clock, DollarSign, TrendingUp, CheckCircle, ArrowRight, PartyPopper } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { formatDZD, formatDateTime } from '../../utils/formatters'
import Card from '../../shared/ui/Card'
import StatusBadge from '../../shared/ui/Badge'

function StatCard({ icon: Icon, label, value, sub, color = 'primary', href }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    stone: 'bg-stone-100 text-stone-600',
  }
  const Wrapper = href ? Link : 'div'
  return (
    <Wrapper to={href} className={`block ${href ? 'hover:-translate-y-0.5 transition-transform' : ''}`}>
      <Card className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon size={20} />
          </div>
          {href && <ArrowRight size={16} className="text-stone-300" />}
        </div>
        <div className="font-display text-2xl font-bold text-stone-800">{value}</div>
        <div className="text-sm font-medium text-stone-600 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-stone-400 mt-1">{sub}</div>}
      </Card>
    </Wrapper>
  )
}

export default function AdminDashboard() {
  const { stats, bookings } = useBooking()

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-800">Tableau de bord</h1>
        <p className="text-stone-500 text-sm mt-1">Bienvenue dans l'espace d'administration de l'Hôtel Saïda.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4 mb-8">
        <StatCard icon={BedDouble} label="Chambres totales" value={stats.totalRooms}
          sub={`${stats.availableRooms} disponibles`} color="blue" href="/admin/rooms" />
        <StatCard icon={Users} label="Clients" value={stats.totalUsers}
          color="stone" href="/admin/users" />
        <StatCard icon={Clock} label="En attente" value={stats.pendingBookings}
          color="amber" href="/admin/bookings" />
        <StatCard icon={CalendarCheck} label="Approuvées" value={stats.approvedBookings}
          color="green" href="/admin/bookings" />
        <StatCard icon={CheckCircle} label="Payées" value={stats.paidBookings}
          color="primary" href="/admin/bookings" />
        <StatCard icon={TrendingUp} label="Revenus" value={formatDZD(stats.totalRevenue)}
          sub="Total encaissé" color="green" />
        <StatCard icon={PartyPopper} label="Événements" value={stats.totalEventReservations}
          sub={`${stats.pendingEventReservations} en attente`} color="amber" href="/admin/bookings" />
      </div>

      {/* Recent bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h2 className="font-display font-semibold text-stone-800">Dernières réservations</h2>
              <Link to="/admin/bookings" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                Voir tout <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-stone-50">
              {stats.recentBookings.map(b => (
                <div key={b.id} className="px-4 sm:px-5 py-3.5 flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-700">{b.guestName[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-800 truncate">{b.guestName}</div>
                    <div className="text-xs text-stone-400 truncate">{b.roomName} · {b.checkIn} → {b.checkOut}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={b.status} />
                    <span className="text-xs font-semibold text-stone-600">{formatDZD(b.totalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="mt-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h2 className="font-display font-semibold text-stone-800">Dernières demandes d'événements</h2>
              <Link to="/admin/bookings" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                Voir tout <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-stone-50">
              {stats.recentEventReservations.length === 0 ? (
                <div className="px-5 py-6 text-sm text-stone-400">Aucune demande d'événement pour le moment.</div>
              ) : stats.recentEventReservations.map(e => (
                <div key={e.id} className="px-4 sm:px-5 py-3.5 flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PartyPopper size={14} className="text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-800 truncate">{e.clientName}</div>
                    <div className="text-xs text-stone-400 truncate">{e.eventType} · {e.startDate} → {e.endDate}</div>
                  </div>
                  <div className="text-xs font-semibold text-stone-600">{e.guests} invités</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Revenue breakdown */}
        <div>
          <Card className="p-5 h-full">
            <h2 className="font-display font-semibold text-stone-800 mb-4">Aperçu financier</h2>
            <div className="space-y-3">
              {[
                { label: 'Revenu total encaissé', value: stats.totalRevenue, color: 'bg-green-500' },
                { label: 'Revenu en attente', value: bookings.filter(b => b.status === 'approved' && b.paymentStatus === 'unpaid').reduce((s, b) => s + b.totalPrice, 0), color: 'bg-amber-400' },
                { label: 'Réservations en cours', value: bookings.filter(b => b.status === 'pending').reduce((s, b) => s + b.totalPrice, 0), color: 'bg-blue-400' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">{label}</span>
                    <span className="font-semibold text-stone-800">{formatDZD(value)}</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(100, (value / (stats.totalRevenue || 1)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-stone-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-700">Total DZD</span>
                <span className="font-display font-bold text-lg text-primary-600">{formatDZD(stats.totalRevenue)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
