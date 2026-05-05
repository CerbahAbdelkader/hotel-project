import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/rooms', label: 'Chambres' },
  { to: '/services', label: 'Services' },
  { to: '/events', label: 'Événements' },
  { to: '/about', label: 'À propos' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">H</span>
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-stone-800 text-sm">Hôtel Saïda</div>
              <div className="text-xs text-primary-600 -mt-0.5">Élégance & Confort</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={14} className="text-primary-700" />
                  </div>
                  <span>{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-stone-100 py-1 animate-fade-in">
                    <Link
                      to="/my-bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-warm-50"
                    >
                      <User size={14} /> Mon compte
                    </Link>
                    {isAdmin && (
                      <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-warm-50">
                        Dashboard Admin
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut size={14} /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/book"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                >
                  Réserver
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-stone-100 text-stone-600">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-1 animate-fade-in">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}
              onClick={() => { setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-primary-600 bg-primary-50' : 'text-stone-600'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  to="/my-bookings"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600"
                >
                  Mon compte
                </Link>
                {isAdmin && (
                  <Link to="/admin/dashboard" onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600">
                    Dashboard Admin
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setOpen(false) }}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => { setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="block px-3 py-2.5 text-sm font-medium text-stone-600"
                >
                  Connexion
                </Link>
                <Link
                  to="/book"
                  onClick={() => { setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="block px-3 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg text-center"
                >
                  Réserver
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
