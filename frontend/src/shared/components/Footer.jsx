import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold">H</span>
              </div>
              <div>
                <div className="font-display font-bold text-white">Hôtel Saïda</div>
                <div className="text-xs text-primary-400">Élégance & Confort</div>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Votre havre de paix au cœur de Saïda, Algérie. Une expérience hôtelière unique alliant confort moderne et hospitalité algérienne authentique.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 rounded-lg bg-stone-800 hover:bg-primary-600 transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-stone-800 hover:bg-primary-600 transition-colors">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 font-display">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Accueil'], ['/rooms', 'Chambres'], ['/services', 'Services'], ['/about', 'À propos'], ['/contact', 'Contact']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-stone-400 hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4 font-display">Services</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>Réception 24h/24</li>
              <li>Cuisine Algérienne</li>
              <li>Wi-Fi Gratuit</li>
              <li>Climatisation</li>
              <li>Parking Sécurisé</li>
              <li>Service de Chambre</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 font-display">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-stone-400">
                <MapPin size={15} className="mt-0.5 flex-shrink-0 text-primary-400" />
                <span>Rue des Martyrs, Saïda 20000, Algérie</span>
              </li>
              <li className="flex items-center gap-2 text-stone-400">
                <Phone size={15} className="flex-shrink-0 text-primary-400" />
                <a href="tel:+213482000000" className="hover:text-primary-400">+213 (0) 48 20 00 00</a>
              </li>
              <li className="flex items-center gap-2 text-stone-400">
                <Mail size={15} className="flex-shrink-0 text-primary-400" />
                <a href="mailto:contact@hotel-saida.dz" className="hover:text-primary-400">contact@hotel-saida.dz</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Hôtel Saïda. Tous droits réservés.</p>
          <p>Conçu avec ❤️ pour Saïda, Algérie</p>
        </div>
      </div>
    </footer>
  )
}
