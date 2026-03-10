import { Link } from 'react-router-dom'
import { ArrowRight, Star, BedDouble, UtensilsCrossed, Wifi, Clock, Users, Leaf, MapPin, ChevronRight } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { formatDZD } from '../../utils/formatters'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'

const serviceIcons = { BedDouble, UtensilsCrossed, Wifi, Clock, Users, Leaf }

export default function HomePage() {
  const { rooms } = useBooking()
  const featured = rooms.filter(r => r.featured).slice(0, 3)

  return (
    <div>
        <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80"
          alt="Hôtel Saïda"
          className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/50 to-transparent" />
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="ambient-orb ambient-orb--amber animate-ambient-drift" />
                <div className="ambient-orb ambient-orb--soft animate-ambient-drift-delayed" />
              </div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={14} className="text-primary-400" />
            <span className="text-primary-300 text-sm font-medium tracking-wider uppercase">Saïda, Algérie</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Bienvenue à<br />
            <span className="text-primary-400">Hôtel Saïda</span>
          </h1>
          <p className="text-stone-300 text-lg leading-relaxed mb-8 max-w-lg">
            Découvrez une expérience unique alliant luxe, confort et l'hospitalité chaleureuse du terroir algérien au cœur de Saïda.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/rooms">
              <Button size="lg" className="group">
            Découvrir nos chambres
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button size="lg" variant="outline" className="!border-white !bg-transparent !text-white hover:!bg-white hover:!text-stone-800 transition-all duration-200">
            Nous contacter
              </Button>
            </Link>
          </div>
            </div>
          </div>

          {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-white/95 backdrop-blur-md rounded-t-2xl shadow-xl grid grid-cols-3 divide-x divide-stone-200">
              {[
                { value: '50+', label: 'Chambres' },
                { value: '10+', label: 'Années d\'expérience' },
                { value: '4.8', label: 'Note clients', icon: <Star size={12} className="fill-amber-400 text-amber-400" /> },
              ].map((stat, i) => (
                <div key={i} className="py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {stat.icon}
                    <span className="font-display text-xl font-bold text-stone-800">{stat.value}</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Nos prestations</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800">Services de qualité</h2>
            <p className="text-stone-500 mt-3 max-w-lg mx-auto">Nous mettons tout en œuvre pour garantir votre confort et satisfaction durant votre séjour.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'chambres', icon: BedDouble, title: 'Chambres Spacieuses', desc: 'Décoration alliant modernité et touches algériennes, pour un confort absolu.' },
              { id: 'cuisine', icon: UtensilsCrossed, title: 'Cuisine Algérienne', desc: 'Savourez les meilleurs plats traditionnels préparés par nos chefs.' },
              { id: 'wifi', icon: Wifi, title: 'Wi-Fi Gratuit', desc: 'Connexion haut débit disponible dans toutes les chambres et espaces communs.' },
              { id: 'reception', icon: Clock, title: 'Réception 24h/24', desc: 'Notre équipe est disponible à toute heure pour vos besoins.' },
              { id: 'famille', icon: Users, title: 'Atmosphère Familiale', desc: 'Environnement sécurisé et chaleureux adapté aux familles.' },
              { id: 'environnement', icon: Leaf, title: 'Havre de Paix', desc: 'Un environnement paisible pour vous ressourcer et vous détendre.' },
            ].map(({ id, icon: Icon, title, desc }, i) => (
              <Link key={i} to={`/services#${id}`}>
                <Card className="p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-primary-600" />
                </div>
                <h3 className="font-display font-semibold text-stone-800 mb-2">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/services" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline">Voir tous les services <ChevronRight size={16} /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Nos hébergements</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800">Chambres à la une</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map(room => (
              <Card key={room.id} hover className="overflow-hidden">
                <div className="relative h-52 overflow-hidden">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-xs font-semibold text-primary-700 shadow">
                    {formatDZD(room.price)}/nuit
                  </div>
                  {!room.available && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">Non disponible</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-stone-800 mb-1">{room.name}</h3>
                  <p className="text-stone-500 text-sm mb-4 line-clamp-2">{room.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-stone-400">
                      <span>{room.capacity} pers.</span>
                      <span>·</span>
                      <span>{room.size} m²</span>
                    </div>
                    <Link to={`/rooms/${room.id}`}>
                      <Button size="sm">Voir détails</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/rooms">
              <Button size="lg">
                Toutes nos chambres <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%)' }} />
        </div>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="cta-glow animate-ambient-pan" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt pour votre séjour à Saïda ?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Réservez dès maintenant et vivez une expérience inoubliable. Paiement à l'arrivée, aucun prépaiement requis.
          </p>
          <Link to="/book">
            <Button size="lg" className="!bg-white !text-stone-900 hover:!bg-amber-50 hover:!text-amber-700 hover:scale-105 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              Réserver maintenant <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
