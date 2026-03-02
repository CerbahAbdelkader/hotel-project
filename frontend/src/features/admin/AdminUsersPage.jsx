import { useState } from 'react'
import { Plus, Trash2, Search, UserPlus } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { formatDateTime } from '../../utils/formatters'
import Button from '../../shared/ui/Button'
import Modal from '../../shared/ui/Modal'
import Input from '../../shared/ui/Input'
import Card from '../../shared/ui/Card'

const emptyUser = { name: '', email: '', phone: '', password: '' }

export default function AdminUsersPage() {
  const { users, addUser, deleteUser, bookings } = useBooking()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyUser)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')

  const regularUsers = users.filter(u => u.role !== 'admin')
  const filtered = regularUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const getUserBookings = (userId) => bookings.filter(b => b.userId === userId).length

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleAdd = () => {
    if (!form.name || !form.email) return
    addUser(form)
    setForm(emptyUser)
    setModalOpen(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-800">Utilisateurs</h1>
          <p className="text-stone-500 text-sm mt-1">{regularUsers.length} client(s) enregistré(s)</p>
        </div>
        <Button onClick={() => { setForm(emptyUser); setModalOpen(true) }}>
          <UserPlus size={16} /> Créer un client
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 mb-5">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
