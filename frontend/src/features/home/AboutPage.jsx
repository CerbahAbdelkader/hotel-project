import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Award, Heart, Users, Star } from 'lucide-react'
import Button from '../../shared/ui/Button'
import Card from '../../shared/ui/Card'

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-3">Notre histoire</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-800 mb-5 leading-tight">
              L'hospitalité algérienne<br />au cœur de Saïda
            </h1>
            <p className="text-stone-600 leading-relaxed mb-4">
              Fondé il y a plus de dix ans, l'Hôtel Saïda est né d'une passion pour l'accueil et d'un désir profond de mettre en valeur la richesse culturelle de la région. Situé au cœur de la wilaya de Saïda, notre établissement est devenu un point de référence pour les voyageurs en quête de confort et d'authenticité.
            </p>
            <p className="text-stone-600 leading-relaxed mb-8">
              Notre philosophie est simple : offrir à chaque client une expérience personnalisée, chaleureuse et mémorable, à l'image de la générosité légendaire de nos aïeux. Chaque détail compte, chaque sourire est sincère.
            </p>
            <Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button>Nous rendre visite <ArrowRight size={16} /></Button>
            </Link>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80"
              alt="Hôtel Saïda"
              className="rounded-3xl w-full h-96 object-cover shadow-xl"
            />
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-5">
              <div className="flex items-center gap-2 mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
              </div>
              <div className="font-semibold text-stone-800 text-sm">Excellence garantie</div>
              <div className="text-xs text-stone-400">+1000 clients satisfaits</div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-stone-800">Nos valeurs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: 'Hospitalité', desc: 'Accueillir chaque client comme un membre de la famille.' },
              { icon: Award, title: 'Excellence', desc: 'Maintenir les plus hauts standards de qualité dans tout ce que nous faisons.' },
              { icon: Users, title: 'Communauté', desc: 'S\'engager envers la communauté locale de Saïda.' },
              { icon: Star, title: 'Authenticité', desc: 'Préserver et valoriser la culture et les traditions algériennes.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <Card key={i} className="p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-primary-600" />
                </div>
                <h3 className="font-display font-semibold text-stone-800 mb-2">{title}</h3>
                <p className="text-stone-500 text-sm">{desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-stone-800 rounded-3xl p-8 sm:p-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center mb-16">
          {[
            { value: '10+', label: 'Années d\'expérience' },
            { value: '50+', label: 'Chambres' },
            { value: '1000+', label: 'Clients satisfaits' },
            { value: '4.8/5', label: 'Note moyenne' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="font-display text-3xl font-bold text-primary-400 mb-1">{stat.value}</div>
              <div className="text-stone-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Team note */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-stone-800 mb-4">Notre engagement</h2>
          <p className="text-stone-500 leading-relaxed mb-6">
            Toute notre équipe se mobilise quotidiennement pour vous offrir le meilleur séjour possible. 
            Votre satisfaction est notre plus grande récompense.
          </p>
          <Link to="/book">
            <Button size="lg">Réserver votre séjour <ArrowRight size={18} /></Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
