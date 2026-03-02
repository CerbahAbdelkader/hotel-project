import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, BedDouble, CalendarCheck, Users,
  LogOut, Menu, X, ChevronRight, Hotel
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/admin/rooms', icon: BedDouble, label: 'Chambres' },
  { to: '/admin/bookings', icon: CalendarCheck, label: 'Réservations' },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
        <header className="bg-white border-b border-stone-200 px-4 md:px-6 h-14 flex items-center justify-between flex-shrink-0">
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
            <span className="text-sm font-medium text-stone-500">Panneau d'administration</span>
          </div>
          <Link to="/" className="text-xs text-primary-600 hover:underline">← Voir le site</Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
