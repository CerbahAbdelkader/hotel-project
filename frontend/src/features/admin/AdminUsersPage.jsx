import { useState } from 'react'
import { Plus, Trash2, Search, UserPlus, RotateCw } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { formatDateTime } from '../../utils/formatters'
import Button from '../../shared/ui/Button'
import Modal from '../../shared/ui/Modal'
import Input from '../../shared/ui/Input'
import Card from '../../shared/ui/Card'

const emptyUser = { name: '', email: '', phone: '', password: '' }

export default function AdminUsersPage() {
  const { users, addUser, deleteUser, bookings, refetchUsers } = useBooking()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyUser)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState(null)

  const regularUsers = users.filter(u => u.role !== 'admin')
  const filtered = regularUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const getUserBookings = (userId) => bookings.filter(b => b.userId === userId).length

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshMessage(null)
    try {
      const result = await refetchUsers()
      if (result.success) {
        setRefreshMessage({ type: 'success', text: `✓ ${result.userCount} utilisateur(s) chargé(s)` })
      } else {
        setRefreshMessage({ type: 'error', text: `✗ Erreur: ${result.message}` })
      }
    } catch (error) {
      setRefreshMessage({ type: 'error', text: '✗ Erreur lors du rafraîchissement' })
    } finally {
      setRefreshing(false)
      setTimeout(() => setRefreshMessage(null), 3000)
    }
  }

  const handleAdd = () => {
    if (!form.name || !form.email) return
    addUser(form)
    setForm(emptyUser)
    setModalOpen(false)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-800">Utilisateurs</h1>
          <p className="text-stone-500 text-sm mt-1">{regularUsers.length} client(s) enregistré(s)</p>
        </div>
        <div className="grid grid-cols-1 sm:flex gap-3 w-full sm:w-auto">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" className="w-full sm:w-auto">
            <RotateCw size={16} className={refreshing ? 'animate-spin' : ''} /> Rafraîchir
          </Button>
          <Button onClick={() => { setForm(emptyUser); setModalOpen(true) }} className="w-full sm:w-auto">
            <UserPlus size={16} /> Créer un client
          </Button>
        </div>
      </div>

      {refreshMessage && (
        <div className={`px-4 py-2 mb-4 rounded-lg text-sm font-medium ${refreshMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {refreshMessage.text}
        </div>
      )}

      {/* Search */}
      <Card className="p-4 mb-5">
        <div className="relative w-full sm:max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      </Card>

      {/* Desktop table */}
      <Card className="overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                {['Client', 'Email', 'Téléphone', 'Réservations', 'Inscrit le', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-stone-400">Aucun utilisateur trouvé.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-warm-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary-700">{u.name[0]}</span>
                      </div>
                      <div className="font-medium text-stone-800">{u.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{u.email}</td>
                  <td className="px-4 py-3 text-stone-600">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                      {getUserBookings(u.id)} rés.
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-400">{formatDateTime(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDeleteConfirm(u.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-5 text-center text-stone-400">Aucun utilisateur trouvé.</Card>
        ) : filtered.map(u => (
          <Card key={u.id} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-700">{u.name[0]}</span>
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-stone-800 truncate">{u.name}</div>
                  <div className="text-xs text-stone-500 truncate">{u.email}</div>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirm(u.id)}
                className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-stone-500">Téléphone</div>
              <div className="text-stone-700 text-right">{u.phone || '—'}</div>
              <div className="text-stone-500">Réservations</div>
              <div className="text-stone-700 text-right">{getUserBookings(u.id)} rés.</div>
              <div className="text-stone-500">Inscrit le</div>
              <div className="text-stone-700 text-right">{formatDateTime(u.createdAt)}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Créer un client walk-in" size="sm">
        <div className="space-y-4">
          <Input label="Nom complet" placeholder="Mohammed Benali" value={form.name} onChange={set('name')} />
          <Input label="Email" type="email" placeholder="client@email.com" value={form.email} onChange={set('email')} />
          <Input label="Téléphone" placeholder="05XXXXXXXX" value={form.phone} onChange={set('phone')} />
          <Input label="Mot de passe" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button>
          <Button onClick={handleAdd}>Créer le compte</Button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Supprimer l'utilisateur" size="sm">
        <p className="text-stone-600 mb-5">Cette action supprimera définitivement le compte client.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
          <Button variant="danger" onClick={() => { deleteUser(deleteConfirm); setDeleteConfirm(null) }}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  )
}
