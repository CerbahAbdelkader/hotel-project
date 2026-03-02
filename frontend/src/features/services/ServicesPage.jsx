import { BedDouble, UtensilsCrossed, Wifi, Clock, Users, Leaf, Phone, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'

const services = [
  {
    id: 'chambres',
    icon: BedDouble,
    title: 'Chambres Spacieuses & Confortables',
    description: 'Des chambres soigneusement aménagées avec une décoration alliant modernité et touches algériennes traditionnelles. Chaque chambre dispose d\'une literie haut de gamme, d\'une climatisation efficace et d\'une salle de bain privée.',
    features: ['Literie premium', 'Climatisation', 'TV satellite', 'Salle de bain privée', 'Vue panoramique'],
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  },
  {
    id: 'cuisine',
    icon: UtensilsCrossed,
    title: 'Cuisine Algérienne Traditionnelle',
    description: 'Notre restaurant vous propose une carte variée mettant à l\'honneur la gastronomie algérienne dans toute sa richesse. Couscous, chorba, rechta, mechoui... nos chefs perpétuent les traditions culinaires de la région.',
    features: ['Petit-déjeuner inclus', 'Menu traditionnel', 'Spécialités locales', 'Service en chambre', 'Thé traditionnel'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  },
  {
    id: 'wifi',
    icon: Wifi,
    title: 'Wi-Fi Haut Débit Gratuit',
    description: 'Restez connecté avec notre connexion internet haut débit disponible dans l\'ensemble de l\'hôtel. Que ce soit pour le travail ou pour partager vos expériences, notre Wi-Fi est fiable et sans frais supplémentaires.',
    features: ['Dans toutes les chambres', 'Espaces communs', 'Débit élevé', 'Connexion sécurisée'],
    image: 'https://images.unsplash.com/photo-1496368077930-c1e31b4e5b44?w=800&q=80',
  },
  {
    id: 'reception',
    icon: Clock,
    title: 'Réception 24h/24 & 7j/7',
    description: 'Notre équipe accueillante et professionnelle est disponible à toute heure pour répondre à vos besoins. Que vous arriviez en pleine nuit ou que vous ayez besoin d\'aide en urgence, nous sommes là pour vous.',
    features: ['Accueil permanent', 'Conciergerie', 'Service bagagerie', 'Assistance tourisme', 'Appels taxi'],
    image: 'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?w=800&q=80',
  },
  {
    id: 'famille',
    icon: Users,
    title: 'Atmosphère Familiale',
    description: 'L\'Hôtel Saïda est pensé pour accueillir les familles dans les meilleures conditions. Un environnement chaleureux et sécurisé où petits et grands se sentent chez eux.',
    features: ['Chambres communicantes', 'Services enfants', 'Espace jeux', 'Menus enfants', 'Sécurité renforcée'],
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80',
  },
  {
    id: 'environnement',
    icon: Leaf,
    title: 'Environnement Paisible',
    description: 'Niché au cœur de Saïda, notre hôtel offre un véritable havre de paix loin de l\'agitation urbaine. Profitez du calme de notre jardin intérieur et d\'espaces de détente pour vous ressourcer.',
    features: ['Jardin intérieur', 'Espace détente', 'Air climatisé', 'Insonorisation', 'Parking sécurisé'],
    image: 'https://images.unsplash.com/photo-1519974719765-e6559eac2575?w=800&q=80',
  },
]

export default function ServicesPage() {
  useEffect(() => {
    // Scroll to service card if hash is present in URL, otherwise scroll to top
    if (window.location.hash) {
      const id = window.location.hash.substring(1)
      const element = document.getElementById(id)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-amber-600 text-sm font-semibold uppercase tracking-wider mb-2">Ce que nous offrons</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-800 mb-4">Our Comfort Services</h1>
          <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed">
            Découvrez une expérience exceptionnelle empreinte de la chaleur et de l'hospitalité algérienne. À l'Hôtel Saïda, chaque service est pensé pour votre confort et votre bien-être.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map(({ id, icon: Icon, title, description, features, image }, i) => (
            <div 
              key={i}
              id={id} 
              className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden scroll-mt-24"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden rounded-t-2xl">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="w-14 h-14  border border-amber-100 rounded-2xl flex items-center justify-center mb-5 -mt-12 relative z-10 shadow-md bg-white">
                  <Icon size={26} className="text-amber-600" />
                </div>
                <h3 className="font-display font-semibold text-stone-800 text-lg mb-3">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-4">{description}</p>
                <ul className="space-y-1.5">
                  {features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-stone-600">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="bg-stone-800 rounded-3xl p-8 sm:p-12 text-center text-white">
          <h2 className="font-display text-3xl font-bold mb-3">Une question sur nos services ?</h2>
          <p className="text-stone-300 mb-7 max-w-md mx-auto">
            Notre équipe est là pour vous renseigner et personnaliser votre séjour selon vos besoins.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-primary-500 hover:bg-primary-400">
                Nous contacter <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/book">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-stone-900">
                Réserver
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
