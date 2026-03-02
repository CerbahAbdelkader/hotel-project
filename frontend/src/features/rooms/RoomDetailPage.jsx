import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowLeft, Users, Maximize, Wifi, Check, BedDouble } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { formatDZD } from '../../utils/formatters'
import Button from '../../shared/ui/Button'
import Card from '../../shared/ui/Card'

export default function RoomDetailPage() {
  const { id } = useParams()
  const { rooms } = useBooking()
  const navigate = useNavigate()
  const room = rooms.find(r => r.id === Number(id))

  // Scroll to top when page loads or room changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  if (!room) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <BedDouble size={48} className="mx-auto text-stone-300 mb-4" />
        <p className="text-stone-500">Chambre introuvable.</p>
        <Link to="/rooms" className="mt-4 inline-block text-primary-600 hover:underline">← Retour aux chambres</Link>
      </div>
    </div>
  )

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 text-sm">
          <ArrowLeft size={16} /> Retour aux chambres
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden h-80 mb-6">
              <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${room.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {room.available ? '✓ Disponible' : '✗ Non disponible'}
                </span>
              </div>
            </div>

            <h1 className="font-display text-3xl font-bold text-stone-800 mb-3">{room.name}</h1>
            <p className="text-stone-600 leading-relaxed mb-6">{room.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="p-4 text-center">
                <Users size={20} className="mx-auto text-primary-500 mb-2" />
                <div className="font-semibold text-stone-800">{room.capacity}</div>
                <div className="text-xs text-stone-400">Personnes</div>
              </Card>
              <Card className="p-4 text-center">
                <Maximize size={20} className="mx-auto text-primary-500 mb-2" />
                <div className="font-semibold text-stone-800">{room.size} m²</div>
                <div className="text-xs text-stone-400">Superficie</div>
              </Card>
              <Card className="p-4 text-center">
                <BedDouble size={20} className="mx-auto text-primary-500 mb-2" />
                <div className="font-semibold text-stone-800">Étage {room.floor}</div>
                <div className="text-xs text-stone-400">Niveau</div>
              </Card>
            </div>

            <div>
              <h3 className="font-display font-semibold text-stone-800 mb-3">Équipements inclus</h3>
              <div className="grid grid-cols-2 gap-2">
                {room.amenities.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-stone-600">
                    <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-primary-600" />
                    </div>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking card */}
          <div>
            <Card className="p-6 sticky top-20">
              <div className="text-center mb-5">
                <div className="font-display text-2xl font-bold text-primary-600">{formatDZD(room.price)}</div>
                <div className="text-stone-400 text-sm">par nuit</div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
                <p className="text-xs text-amber-700 text-center">
                  💡 Paiement à l'arrivée à la réception. Aucun prépaiement requis.
                </p>
              </div>

              {room.available ? (
                <Link to={`/book?room=${room.id}`}>
                  <Button className="w-full" size="lg">Réserver cette chambre</Button>
                </Link>
              ) : (
                <Button className="w-full" disabled size="lg">Chambre non disponible</Button>
              )}

              <div className="mt-4 text-center">
                <Link to="/contact" className="text-xs text-stone-400 hover:text-primary-600 transition-colors">
                  Des questions ? Contactez-nous
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
