import { useEffect, useRef, useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, BedDouble, CalendarCheck, Users, Mail,
  LogOut, Menu, ChevronRight, Hotel, Search, Loader2, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../utils/api'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/admin/rooms', icon: BedDouble, label: 'Chambres' },
  { to: '/admin/bookings', icon: CalendarCheck, label: 'Réservations' },
  { to: '/admin/contacts', icon: Mail, label: 'Messages' },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState({ bookings: [], rooms: [], users: [] })
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const searchRef = useRef(null)

  useEffect(() => {
    const term = searchTerm.trim()

    if (term.length < 2) {
      setSearchResults({ bookings: [], rooms: [], users: [] })
      setSearchLoading(false)
      setSearchOpen(false)
      return undefined
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const data = await apiRequest(`/api/admin/search?q=${encodeURIComponent(term)}`, { withAuth: true })
        setSearchResults({
          bookings: data?.bookings || [],
          rooms: data?.rooms || [],
          users: data?.users || [],
        })
        setSearchOpen(true)
      } catch {
        setSearchResults({ bookings: [], rooms: [], users: [] })
      } finally {
        setSearchLoading(false)
      }
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const totalSearchResults = searchResults.bookings.length + searchResults.rooms.length + searchResults.users.length

  const goToSearchTarget = (path) => {
    setSearchOpen(false)
    setSearchTerm('')
    navigate(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-stone-700">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Hotel size={18} className="text-white" />
          </div>
          {(sidebarOpen || mobileSidebarOpen) && (
            <div>
              <div className="font-display font-bold text-white text-sm">Hôtel Saïda</div>
              <div className="text-xs text-primary-400">Administration</div>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-stone-400 hover:bg-stone-700 hover:text-white'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {(sidebarOpen || mobileSidebarOpen) && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-stone-700">
        {(sidebarOpen || mobileSidebarOpen) && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-stone-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-white font-medium">{user?.name?.[0]}</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name}</div>
              <div className="text-xs text-stone-400">Administrateur</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:bg-stone-700 hover:text-red-400 transition-all"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {(sidebarOpen || mobileSidebarOpen) && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-stone-100 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col bg-stone-800 transition-all duration-300 flex-shrink-0 ${sidebarOpen ? 'w-60' : 'w-16'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative z-10 w-64 bg-stone-800 flex flex-col h-full animate-slide-up">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-stone-200 px-4 md:px-6 h-14 flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
            >
              <ChevronRight size={18} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
            >
              <Menu size={18} />
            </button>
            <span className="text-xs sm:text-sm font-medium text-stone-500 truncate">Panneau d'administration</span>
          </div>

          <div ref={searchRef} className="relative flex-1 max-w-xl min-w-0">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => searchTerm.trim().length >= 2 && setSearchOpen(true)}
                placeholder="Rechercher réservations, chambres, utilisateurs..."
                className="w-full pl-9 pr-10 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setSearchResults({ bookings: [], rooms: [], users: [] })
                    setSearchOpen(false)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {searchOpen && searchTerm.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-stone-800">Résultats de recherche</div>
                    <div className="text-xs text-stone-400">{searchLoading ? 'Recherche en cours...' : `${totalSearchResults} résultat(s)`}</div>
                  </div>
                  {searchLoading && <Loader2 size={16} className="animate-spin text-primary-500" />}
                </div>

                {!searchLoading && totalSearchResults === 0 && (
                  <div className="px-4 py-6 text-sm text-stone-400 text-center">Aucun résultat trouvé.</div>
                )}

                {!searchLoading && totalSearchResults > 0 && (
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.bookings.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">Réservations</div>
                        {searchResults.bookings.map((booking) => (
                          <button
                            key={String(booking.id)}
                            type="button"
                            onClick={() => goToSearchTarget('/admin/bookings')}
                            className="w-full text-left px-4 py-3 hover:bg-stone-50 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-stone-800 truncate">{booking.guestName}</div>
                              <div className="text-xs text-stone-500 truncate">{booking.guestPhone || booking.guestEmail || booking.roomName}</div>
                            </div>
                            <div className="text-xs text-stone-400 whitespace-nowrap">{booking.status}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.rooms.length > 0 && (
                      <div className="py-2 border-t border-stone-100">
                        <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">Chambres</div>
                        {searchResults.rooms.map((room) => (
                          <button
                            key={String(room.id)}
                            type="button"
                            onClick={() => goToSearchTarget('/admin/rooms')}
                            className="w-full text-left px-4 py-3 hover:bg-stone-50 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-stone-800 truncate">{room.name}</div>
                              <div className="text-xs text-stone-500 truncate">{room.roomNumber ? `Chambre ${room.roomNumber}` : room.type}</div>
                            </div>
                            <div className="text-xs text-stone-400 whitespace-nowrap">{room.available ? 'Disponible' : 'Occupée'}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.users.length > 0 && (
                      <div className="py-2 border-t border-stone-100">
                        <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">Utilisateurs</div>
                        {searchResults.users.map((searchedUser) => (
                          <button
                            key={String(searchedUser.id)}
                            type="button"
                            onClick={() => goToSearchTarget('/admin/users')}
                            className="w-full text-left px-4 py-3 hover:bg-stone-50 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-stone-800 truncate">{searchedUser.name}</div>
                              <div className="text-xs text-stone-500 truncate">{searchedUser.email || searchedUser.phone}</div>
                            </div>
                            <div className="text-xs text-stone-400 whitespace-nowrap">{searchedUser.role}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <Link to="/" className="text-[11px] sm:text-xs text-primary-600 hover:underline whitespace-nowrap">← Voir le site</Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
