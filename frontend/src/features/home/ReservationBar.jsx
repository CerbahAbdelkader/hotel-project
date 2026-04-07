import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Users, Search } from 'lucide-react'

export default function ReservationBar() {
  const navigate = useNavigate()
  const checkInInputRef = useRef(null)
  const checkOutInputRef = useRef(null)
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const defaultCheckOut = useMemo(() => {
    const nextDay = new Date(Date.now() + 86400000)
    return nextDay.toISOString().split('T')[0]
  }, [])

  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(defaultCheckOut)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)

  const minCheckOut = useMemo(() => {
    if (!checkIn) return today
    return new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
  }, [checkIn, today])

  useEffect(() => {
    if (!checkOut || new Date(checkOut) <= new Date(checkIn)) {
      setCheckOut(minCheckOut)
    }
  }, [checkIn, checkOut, minCheckOut])

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      alert('Veuillez sélectionner les dates d\'arrivée et de départ')
      return
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      alert('La date de départ doit être après la date d\'arrivée')
      return
    }

    // Navigate to rooms page with filters
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      adults,
      children,
    })

    navigate(`/rooms?${params.toString()}`)
  }

  const totalGuests = adults + children
  const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))

  const formatDateLabel = (value, fallback) => {
    if (!value) return fallback
    return new Date(value).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const openDatePicker = (inputRef) => {
    const input = inputRef.current
    if (!input) return

    if (typeof input.showPicker === 'function') {
      input.showPicker()
      return
    }

    input.focus()
    input.click()
  }

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-[0_24px_55px_-28px_rgba(15,23,42,0.48)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-stone-800">Rechercher des chambres</h2>
        <p className="hidden sm:block text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Réservation rapide</p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_1.2fr_auto]">
        <div
          className="relative cursor-pointer rounded-xl border border-stone-200 bg-stone-50/40 px-4 py-3 transition-shadow duration-200 focus-within:shadow-md focus-within:ring-2 focus-within:ring-[#f2d891]/35"
          onClick={() => openDatePicker(checkInInputRef)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openDatePicker(checkInInputRef)
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Choisir la date d'arrivée"
        >
          <CalendarDays size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f2d891]" />
          <label htmlFor="checkin" className="block pl-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Arrivée
          </label>
          <p className="pl-7 pr-7 text-[15px] font-semibold text-stone-800">{formatDateLabel(checkIn, 'Choisir une date')}</p>
          <input
            ref={checkInInputRef}
            id="checkin"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            onKeyDown={handleKeyDown}
            min={today}
            className="absolute inset-0 h-full w-full cursor-pointer rounded-xl opacity-0"
          />
        </div>

        <div
          className="relative cursor-pointer rounded-xl border border-stone-200 bg-stone-50/40 px-4 py-3 transition-shadow duration-200 focus-within:shadow-md focus-within:ring-2 focus-within:ring-[#f2d891]/35"
          onClick={() => openDatePicker(checkOutInputRef)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openDatePicker(checkOutInputRef)
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Choisir la date de départ"
        >
          <CalendarDays size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f2d891]" />
          <label htmlFor="checkout" className="block pl-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Départ
          </label>
          <p className="pl-7 pr-7 text-[15px] font-semibold text-stone-800">{formatDateLabel(checkOut, 'Choisir une date')}</p>
          <input
            ref={checkOutInputRef}
            id="checkout"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            onKeyDown={handleKeyDown}
            min={minCheckOut}
            className="absolute inset-0 h-full w-full cursor-pointer rounded-xl opacity-0"
          />
        </div>

        <div className="rounded-xl border border-stone-200 bg-stone-50/40 px-4 py-3 transition-shadow duration-200 focus-within:shadow-md focus-within:ring-2 focus-within:ring-[#f2d891]/35">
          <div className="mb-1 flex items-center gap-2">
            <Users size={18} className="text-[#f2d891]" />
            <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Invités</label>
          </div>
          <p className="mb-2 text-sm font-semibold text-stone-800">
            {adults} adulte{adults > 1 ? 's' : ''}, {children} enfant{children > 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <select
              id="adults"
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="h-9 rounded-lg border border-stone-200 px-2 text-sm font-medium text-stone-700 outline-none transition focus:border-[#f2d891]"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} adulte{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <select
              id="children"
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="h-9 rounded-lg border border-stone-200 px-2 text-sm font-medium text-stone-700 outline-none transition focus:border-[#f2d891]"
            >
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} enfant{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="h-full min-h-[72px] rounded-xl bg-[#f2d891] px-5 text-white shadow-[0_16px_28px_-18px_rgba(146,107,22,0.85)] transition duration-200 hover:-translate-y-0.5 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#f2d891]/70"
          aria-label="Rechercher"
        >
          <span className="flex items-center justify-center gap-2 font-semibold">
            <Search size={20} />
            <span className="lg:hidden">Rechercher</span>
          </span>
        </button>
      </div>

      {(checkIn || checkOut || totalGuests > 1) && (
        <div className="mt-3 border-t border-stone-200 pt-3 text-xs text-stone-500 sm:text-sm">
          <span className="font-semibold text-stone-700">Résumé:</span>{' '}
          {totalGuests} invité{totalGuests > 1 ? 's' : ''}
          {checkIn && checkOut && (
            <>
              {' '}• {nights} nuit{nights > 1 ? 's' : ''}
            </>
          )}
        </div>
      )}
    </div>
  )
}
