import { useState, useEffect } from 'react'
import { Mail, Trash2, Check, AlertCircle, Search, Filter, ExternalLink } from 'lucide-react'
import { apiRequest } from '../../utils/api'
import Button from '../../shared/ui/Button'
import Card from '../../shared/ui/Card'
import Input from '../../shared/ui/Input'
import Modal from '../../shared/ui/Modal'
import Badge from '../../shared/ui/Badge'

const statusBadge = (status) => {
  const styles = {
    new: 'bg-blue-100 text-blue-700',
    read: 'bg-yellow-100 text-yellow-700',
    replied: 'bg-green-100 text-green-700',
  }
  const labels = { new: 'Nouveau', read: 'Lu', replied: 'Répondu' }
  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.new}`}>
      {labels[status] || status}
    </span>
  )
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState({ status: 'all', search: '' })
  const [actionNotice, setActionNotice] = useState(null)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const data = await apiRequest('/api/contact', { withAuth: true })
      setContacts(data.contacts || [])
    } catch (error) {
      setActionNotice({ type: 'error', message: 'Erreur lors du chargement des messages.' })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (contactId, newStatus) => {
    setUpdatingStatus(contactId)
    try {
      await apiRequest(`/api/contact/${contactId}/status`, {
        method: 'PATCH',
        withAuth: true,
        body: { status: newStatus },
      })
      setContacts(prev =>
        prev.map(c => c._id === contactId ? { ...c, status: newStatus } : c)
      )
      setActionNotice({ type: 'success', message: 'Statut mis à jour.' })
    } catch (error) {
      setActionNotice({ type: 'error', message: error.message || 'Erreur de mise à jour.' })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleDelete = async (contactId) => {
    setDeleting(contactId)
    try {
      await apiRequest(`/api/contact/${contactId}`, {
        method: 'DELETE',
        withAuth: true,
      })
      setContacts(prev => prev.filter(c => c._id !== contactId))
      setActionNotice({ type: 'success', message: 'Message supprimé.' })
    } catch (error) {
      setActionNotice({ type: 'error', message: error.message || 'Erreur lors de la suppression.' })
    } finally {
      setDeleting(null)
    }
  }

  const filtered = contacts.filter(c => {
    if (filter.status !== 'all' && c.status !== filter.status) return false
    if (filter.search && !c.name.toLowerCase().includes(filter.search.toLowerCase()) &&
      !c.email.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

  const newCount = contacts.filter(c => c.status === 'new').length
  const repliedCount = contacts.filter(c => c.status === 'replied').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-800">Messages de contact</h1>
        <p className="text-stone-500 text-sm mt-1">{contacts.length} message(s) au total</p>
      </div>

      {actionNotice && (
        <Card className={`p-3 mb-4 border ${actionNotice.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm ${actionNotice.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {actionNotice.message}
          </p>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-stone-600 mb-1.5 block">Rechercher</label>
            <Input
              placeholder="Nom ou email..."
              value={filter.search}
              onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
              icon={Search}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-600 mb-1.5 block">Statut</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="all">Tous</option>
              <option value="new">Nouveau ({newCount})</option>
              <option value="read">Lus</option>
              <option value="replied">Répondus ({repliedCount})</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter({ status: 'all', search: '' })}
              className="w-full"
            >
              <Filter size={16} />
              Réinitialiser
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <Card className="p-8 text-center">
            <div className="w-6 h-6 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <Mail size={32} className="mx-auto text-stone-300 mb-3" />
            <p className="text-stone-600">Aucun message trouvé.</p>
          </Card>
        ) : (
          <Card>
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-700">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-700">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-700">Sujet</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-700">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-700">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-stone-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => (
                  <tr key={contact._id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-stone-800">{contact.name}</td>
                    <td className="px-4 py-3 text-sm text-stone-600">
                      <a href={`mailto:${contact.email}`} className="text-primary-600 hover:underline flex items-center gap-1">
                        {contact.email}
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600 max-w-xs truncate">{contact.subject}</td>
                    <td className="px-4 py-3">
                      {statusBadge(contact.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-500">
                      {new Date(contact.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedContact(contact)
                          setShowModal(true)
                        }}
                      >
                        Voir
                      </Button>

                      {contact.status !== 'replied' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(contact._id, 'replied')}
                          loading={updatingStatus === contact._id}
                          className="flex items-center gap-1"
                        >
                          <Check size={14} />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(contact._id)}
                        loading={deleting === contact._id}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedContact && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-stone-800">{selectedContact.subject}</h2>
                  <p className="text-sm text-stone-500 mt-1">De: {selectedContact.name}</p>
                </div>
                {statusBadge(selectedContact.status)}
              </div>

              <div className="bg-stone-50 rounded-lg p-4 mb-4 space-y-2">
                <div>
                  <p className="text-xs text-stone-600 font-medium">EMAIL</p>
                  <p className="text-sm text-stone-800">
                    <a href={`mailto:${selectedContact.email}`} className="text-primary-600 hover:underline">
                      {selectedContact.email}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 font-medium">DATE</p>
                  <p className="text-sm text-stone-800">{new Date(selectedContact.createdAt).toLocaleString('fr-FR')}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-stone-600 font-medium mb-2">MESSAGE</p>
                <div className="bg-white border border-stone-200 rounded-lg p-4 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-stone-700 leading-relaxed">
                  {selectedContact.message}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {selectedContact.status !== 'replied' && (
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedContact._id, 'replied')
                      setShowModal(false)
                    }}
                    className="flex items-center gap-2"
                  >
                    <Check size={16} />
                    Marquer comme répondu
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowModal(false)}>Fermer</Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
