import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Filter, CalendarDays, Users, Maximize, BedDouble } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { formatDZD } from '../../utils/formatters'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import StatusBadge from '../../shared/ui/Badge'

const addDays = (dateValue, days) => {
  if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return ''

  const [year, month, day] = dateValue.split('-').map(Number)
  const nextDate = new Date(Date.UTC(year, month - 1, day + days))
  return nextDate.toISOString().split('T')[0]
}

export default function RoomsPage() {
  const { rooms, bookings } = useBooking()
  const [search, setSearch] = useState('')
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState({
    type: 'all',
    available: 'available',
    maxPrice: '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
  })

  const adultsParam = Number(searchParams.get('adults') || 1)
  const childrenParam = Number(searchParams.get('children') || 0)
  const totalGuests = adultsParam + childrenParam
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  useEffect(() => {
    setFilter({
      type: searchParams.get('type') || 'all',
      available: searchParams.get('available') || 'available',
      maxPrice: searchParams.get('maxPrice') || '',
      checkIn: searchParams.get('checkIn') || '',
      checkOut: searchParams.get('checkOut') || '',
    })
  }, [searchParams])

  useEffect(() => {
    if (!filter.checkIn) return

    setFilter((current) => {
      const minCheckOut = addDays(current.checkIn, 1)
      if (current.checkOut && current.checkOut > current.checkIn) return current
      if (current.checkOut === minCheckOut) return current
      return { ...current, checkOut: minCheckOut }
    })
  }, [filter.checkIn])

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const minCheckOut = filter.checkIn ? addDays(filter.checkIn, 1) : today
  const hasValidStay = Boolean(filter.checkIn && filter.checkOut && filter.checkOut > filter.checkIn)

  const roomHasBookingConflict = (room) => {
    if (!hasValidStay) return false

    return bookings.some((booking) => {
      if (String(booking.roomId) !== String(room.id)) return false
      if (['cancelled', 'expired', 'completed'].includes(booking.status)) return false
      if (!booking.checkIn || !booking.checkOut) return false

      return filter.checkIn < booking.checkOut && booking.checkIn < filter.checkOut
    })
  }

  const filtered = rooms.filter(room => {
    if (search && !room.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filter.type !== 'all' && room.type !== filter.type) return false
    if (filter.available === 'available' && room.status !== 'available') return false
    if (filter.available === 'unavailable' && room.status === 'available') return false
    if (filter.maxPrice && room.price > Number(filter.maxPrice)) return false
    if (roomHasBookingConflict(room)) return false
    return true
  })

  const finalFiltered = filtered.filter(room => {
    if (totalGuests > 0 && room.capacity < totalGuests) return false
    return true
  })

  const types = ['all', ...new Set(rooms.map(r => r.type))]

  const buildBookingLink = (roomId) => {
    const params = new URLSearchParams({
      room: String(roomId),
      adults: String(adultsParam),
      children: String(childrenParam),
    })

    if (filter.checkIn) params.set('checkIn', filter.checkIn)
    if (filter.checkOut) params.set('checkOut', filter.checkOut)

    return `/book?${params.toString()}`
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Hébergements</p>
          <h1 className="font-display text-4xl font-bold text-stone-800">Nos Chambres</h1>
          <p className="text-stone-500 mt-3 max-w-lg mx-auto">
            Trouvez la chambre idéale pour votre séjour à Saïda. Paiement à la réception, sans prépaiement.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-warm-100 p-5 mb-8">
          <div className="flex items-center gap-2 mb-4 text-stone-700">
            <Filter size={16} />
            <h2 className="font-semibold">Filtres de recherche</h2>
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <Input
                label="Rechercher"
                placeholder="Nom de chambre..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-40">
              <Input
                label="Arrivée"
                type="date"
                min={today}
                value={filter.checkIn}
                onChange={e => setFilter(f => ({ ...f, checkIn: e.target.value }))}
              />
            </div>
            <div className="flex-1 min-w-40">
              <Input
                label="Départ"
                type="date"
                min={minCheckOut}
                value={filter.checkOut}
                onChange={e => setFilter(f => ({ ...f, checkOut: e.target.value }))}
              />
            </div>
            <div className="flex-1 min-w-40">
              <label className="text-sm font-medium text-stone-700 block mb-1">Type</label>
              <select
                value={filter.type}
                onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {types.map(t => (
                  <option key={t} value={t}>{t === 'all' ? 'Tous les types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-40">
              <label className="text-sm font-medium text-stone-700 block mb-1">Disponibilité</label>
              <select
                value={filter.available}
                onChange={e => setFilter(f => ({ ...f, available: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="all">Toutes</option>
                <option value="available">Disponibles</option>
                <option value="unavailable">Non disponibles</option>
              </select>
            </div>
            <div className="flex-1 min-w-40">
              <Input
                label="Prix max (DZD/nuit)"
                type="number"
                placeholder="Ex: 10000"
                value={filter.maxPrice}
                onChange={e => setFilter(f => ({ ...f, maxPrice: e.target.value }))}
              />
            </div>
            <Button variant="ghost" onClick={() => { setSearch(''); setFilter({ type: 'all', available: 'available', maxPrice: '', checkIn: '', checkOut: '' }) }}>
              Réinitialiser
            </Button>
          </div>
          {hasValidStay && (
            <p className="mt-3 text-xs text-stone-500 flex items-center gap-2">
              <CalendarDays size={14} className="text-primary-500" />
              Séjour du {filter.checkIn} au {filter.checkOut}
            </p>
          )}
        </div>

        {/* Results count */}
        <p className="text-stone-500 text-sm mb-6">
           {finalFiltered.length} chambre{finalFiltered.length !== 1 ? 's' : ''} trouvée{finalFiltered.length !== 1 ? 's' : ''}
        </p>

        {/* Grid */}
          {finalFiltered.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <BedDouble size={48} className="mx-auto mb-4 opacity-30" />
            <p>Aucune chambre ne correspond à vos critères.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {finalFiltered.map(room => (
              <Card key={room.id} hover className="overflow-hidden">
                <div className="relative h-52 overflow-hidden">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={room.status} kind="room" />
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-xs font-bold text-primary-700">{formatDZD(room.price)}<span className="font-normal text-stone-500">/nuit</span></span>
                  </div>
                  {room.status === 'maintenance' && (
                    <div className="absolute inset-0 bg-stone-950/35 flex items-center justify-center">
                      <span className="bg-stone-800 text-white px-3 py-1 rounded-full text-xs font-semibold">Maintenance</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-stone-800 mb-2">{room.name}</h3>
                  <p className="text-stone-500 text-sm mb-4 line-clamp-2">{room.description}</p>
                  <div className="flex items-center gap-4 text-xs text-stone-400 mb-4">
                    <span className="flex items-center gap-1"><Users size={12} />{room.capacity} pers.</span>
                    <span className="flex items-center gap-1"><Maximize size={12} />{room.size} m²</span>
                    <span>Étage {room.floor}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/rooms/${room.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">Détails</Button>
                    </Link>
                    {room.status === 'available' && (
                        <Link to={buildBookingLink(room.id)} className="flex-1">
                        <Button className="w-full" size="sm">Réserver</Button>
                      </Link>
                    )}
                    {room.status !== 'available' && room.status === 'maintenance' && (
                      <Button className="w-full flex-1" size="sm" disabled>Maintenance</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
