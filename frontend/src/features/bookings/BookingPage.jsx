import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CalendarCheck, AlertCircle } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { useAuth } from '../../context/AuthContext'
import { formatDZD, calcNights } from '../../utils/formatters'
import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import Card from '../../shared/ui/Card'

export default function BookingPage() {
  const { rooms, createBooking } = useBooking()
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedRoomId = searchParams.get('room')

  const availableRooms = rooms.filter(r => r.available)

  const [form, setForm] = useState({
    roomId: preselectedRoomId ? Number(preselectedRoomId) : '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    guestName: user?.name || '',
    guestEmail: user?.email || '',
    guestPhone: user?.phone || '',
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (submitted) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [submitted])

  const selectedRoom = rooms.find(r => r.id === Number(form.roomId))
  const nights = form.checkIn && form.checkOut ? calcNights(form.checkIn, form.checkOut) : 0
  const total = selectedRoom && nights > 0 ? selectedRoom.price * nights : 0

  const validate = () => {
    const e = {}
    const normalizedEmail = form.guestEmail.trim().replace(/\s+/g, '')
    const normalizedPhone = form.guestPhone.trim().replace(/\s+/g, '')
    if (!form.roomId) e.roomId = 'Veuillez choisir une chambre.'
    if (!form.checkIn) e.checkIn = 'Date d\'arrivée requise.'
    if (!form.checkOut) e.checkOut = 'Date de départ requise.'
    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) e.checkOut = 'Date de départ doit être après l\'arrivée.'
    if (!Number.isInteger(Number(form.adults)) || Number(form.adults) < 1) e.adults = 'Au moins 1 adulte requis.'
    if (!Number.isInteger(Number(form.children)) || Number(form.children) < 0) e.children = 'Nombre d\'enfants invalide.'
    if (!form.guestName.trim()) e.guestName = 'Nom requis.'
    if (!form.guestPhone.trim()) e.guestPhone = 'Téléphone requis.'
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) e.guestEmail = 'Email invalide.'
    if (normalizedPhone && !/^\+?[0-9]{8,15}$/.test(normalizedPhone)) e.guestPhone = 'Numéro de téléphone invalide.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      const result = createBooking({
        userId: user?.id || 0,
        roomId: Number(form.roomId),
        adults: Number(form.adults),
        children: Number(form.children),
        guestName: form.guestName,
        guestEmail: form.guestEmail.trim().replace(/\s+/g, ''),
        guestPhone: form.guestPhone.trim().replace(/\s+/g, ''),
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        notes: form.notes,
      })
      if (result.success) setSubmitted(true)
      setLoading(false)
    }, 800)
  }

  const today = new Date().toISOString().split('T')[0]

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CalendarCheck size={28} className="text-green-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-stone-800 mb-3">Réservation soumise !</h2>
        <p className="text-stone-500 mb-2">Votre demande de réservation a bien été envoyée. L'hôtel vous contactera pour confirmer.</p>
        <p className="text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-xl mb-6">
          💡 Le paiement s'effectue à la réception lors de votre arrivée.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/rooms"><Button variant="outline">Autres chambres</Button></Link>
          <Link to="/"><Button>Accueil</Button></Link>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Réservation</p>
          <h1 className="font-display text-4xl font-bold text-stone-800">Réserver une chambre</h1>
          <p className="text-stone-500 mt-3">Remplissez le formulaire ci-dessous. Paiement à l'arrivée — aucune carte requise.</p>
        </div>

        {!isLoggedIn && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              <Link to="/login" className="font-semibold underline">Connectez-vous</Link> pour préremplir vos informations et suivre vos réservations.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="font-display font-semibold text-stone-800 mb-4">Choix de la chambre</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-1">Chambre *</label>
                  <select
                    value={form.roomId}
                    onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}
                    className={`w-full px-4 py-2.5 rounded-lg border bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary-400 ${errors.roomId ? 'border-red-400' : 'border-stone-300'}`}
                  >
                    <option value="">Sélectionner une chambre...</option>
                    {availableRooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} — {formatDZD(r.price)}/nuit</option>
                    ))}
                  </select>
                  {errors.roomId && <p className="text-xs text-red-500 mt-1">{errors.roomId}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Arrivée *" type="date" min={today} value={form.checkIn}
                    onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} error={errors.checkIn} />
                  <Input label="Départ *" type="date" min={form.checkIn || today} value={form.checkOut}
                    onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} error={errors.checkOut} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Adultes *"
                    type="number"
                    min={1}
                    value={form.adults}
                    onChange={e => setForm(f => ({ ...f, adults: e.target.value === '' ? '' : Number(e.target.value) }))}
                    error={errors.adults}
                  />
                  <Input
                    label="Enfants"
                    type="number"
                    min={0}
                    value={form.children}
                    onChange={e => setForm(f => ({ ...f, children: e.target.value === '' ? '' : Number(e.target.value) }))}
                    error={errors.children}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold text-stone-800 mb-4">Vos informations</h3>
              <div className="space-y-4">
                <Input label="Nom complet *" placeholder="Mohammed Benali" value={form.guestName}
                  onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))} error={errors.guestName} />
                <Input label="Email (optionnel)" type="email" placeholder="votre@email.com" value={form.guestEmail}
                  onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value.replace(/\s+/g, '') }))} error={errors.guestEmail} />
                <Input label="Téléphone *" placeholder="05XXXXXXXX" value={form.guestPhone}
                  onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))} error={errors.guestPhone} />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-stone-700">Notes (optionnel)</label>
                  <textarea rows={3} placeholder="Demandes spéciales, arrivée tardive..."
                    value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="p-6 sticky top-20">
              <h3 className="font-display font-semibold text-stone-800 mb-4">Récapitulatif</h3>
              {selectedRoom ? (
                <div className="space-y-3 mb-5">
                  <img src={selectedRoom.image} alt={selectedRoom.name} className="w-full h-28 object-cover rounded-xl" />
                  <div>
                    <div className="font-medium text-stone-800">{selectedRoom.name}</div>
                    <div className="text-xs text-stone-400">{selectedRoom.capacity} pers. · {selectedRoom.size} m²</div>
                  </div>
                  {nights > 0 && (
                    <>
                      <div className="border-t border-stone-100 pt-3 space-y-2 text-sm">
                        <div className="flex justify-between text-stone-500">
                          <span>{formatDZD(selectedRoom.price)} × {nights} nuit{nights > 1 ? 's' : ''}</span>
                          <span>{formatDZD(total)}</span>
                        </div>
                      </div>
                      <div className="border-t border-stone-100 pt-3 flex justify-between font-semibold text-stone-800">
                        <span>Total</span>
                        <span className="text-primary-600">{formatDZD(total)}</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-stone-400 text-sm mb-5 text-center py-4">Sélectionnez une chambre</p>
              )}

              <div className="bg-primary-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-primary-700 text-center">💳 Paiement physique à la réception lors de l'arrivée.</p>
              </div>

              <Button onClick={handleSubmit} className="w-full" loading={loading}>
                Envoyer la demande
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
