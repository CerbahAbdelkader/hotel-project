import { useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, BedDouble, Upload, Link as LinkIcon, Wrench } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { formatDZD } from '../../utils/formatters'
import Button from '../../shared/ui/Button'
import Modal from '../../shared/ui/Modal'
import Input, { Select, Textarea } from '../../shared/ui/Input'
import Card from '../../shared/ui/Card'
import StatusBadge from '../../shared/ui/Badge'

const emptyRoom = { name: '', type: 'classic', price: '', capacity: 2, size: '', floor: 1, description: '', image: '', status: 'available', maintenanceNote: '' }

export default function AdminRoomsPage() {
  const { rooms, addRoom, updateRoom, deleteRoom, toggleRoomAvailability } = useBooking()
  const [modalOpen, setModalOpen] = useState(false)
  const [editRoom, setEditRoom] = useState(null)
  const [form, setForm] = useState(emptyRoom)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [imageMethod, setImageMethod] = useState('url') // 'url' or 'upload'
  const [uploadedImage, setUploadedImage] = useState(null)

  const openAdd = () => { 
    setForm(emptyRoom); 
    setEditRoom(null); 
    setModalOpen(true);
    setImageMethod('url');
    setUploadedImage(null);
  }
  
  const openEdit = (room) => { 
    setForm({ ...room, status: room.status || (room.available ? 'available' : 'reserved'), maintenanceNote: room.maintenanceNote || '' }); 
    setEditRoom(room); 
    setModalOpen(true);
    setImageMethod('url');
    setUploadedImage(null);
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result)
        setForm(f => ({ ...f, image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    const data = { 
      ...form, 
      price: Number(form.price), 
      capacity: Number(form.capacity), 
      size: Number(form.size), 
      floor: Number(form.floor),
      status: form.status,
      maintenanceNote: form.status === 'maintenance' ? form.maintenanceNote : '',
      image: imageMethod === 'upload' ? uploadedImage : form.image
    }
    if (editRoom) updateRoom(editRoom.id, data)
    else addRoom(data)
    setModalOpen(false)
    setUploadedImage(null)
  }

  const handleDelete = (id) => {
    deleteRoom(id)
    setDeleteConfirm(null)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-800">Gestion des chambres</h1>
          <p className="text-stone-500 text-sm mt-1">{rooms.length} chambres au total</p>
        </div>
        <Button onClick={openAdd} className="w-full sm:w-auto"><Plus size={16} /> Ajouter une chambre</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {rooms.map(room => (
          <Card key={room.id} className="overflow-hidden">
            <div className="relative h-40">
              {room.image ? (
                <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                  <BedDouble size={32} className="text-stone-300" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <StatusBadge status={room.status} kind="room" />
              </div>
              {room.status === 'maintenance' && (
                <div className="absolute inset-0 bg-stone-950/30 flex items-center justify-center">
                  <span className="bg-stone-800 text-white px-3 py-1 rounded-full text-xs font-semibold">Maintenance</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-display font-semibold text-stone-800">{room.name}</h3>
                <span className="text-sm font-bold text-primary-600">{formatDZD(room.price)}</span>
              </div>
              <p className="text-xs text-stone-400 mb-3">{room.capacity} pers. · {room.size} m² · Étage {room.floor}</p>
              {room.status === 'maintenance' && room.maintenanceNote && (
                <div className="mb-3 text-xs text-stone-600 bg-stone-50 rounded-xl p-2 flex items-start gap-2">
                  <Wrench size={12} className="mt-0.5 text-stone-500" />
                  <span>{room.maintenanceNote}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="flex-1" onClick={() => openEdit(room)}>
                  <Pencil size={14} /> Modifier
                </Button>
                <Button size="sm" variant="ghost" className="flex-1"
                  onClick={() => toggleRoomAvailability(room.id)}>
                  {room.status === 'available' ? <ToggleRight size={14} className="text-green-600" /> : <ToggleLeft size={14} />}
                  {room.status === 'available' ? 'Réserver' : 'Libérer'}
                </Button>
                <button onClick={() => setDeleteConfirm(room.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editRoom ? 'Modifier la chambre' : 'Ajouter une chambre'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nom de la chambre" placeholder="Chambre Classique" value={form.name} onChange={set('name')} className="col-span-2" />
          <Select label="Type" value={form.type} onChange={set('type')}>
            {['classic','superior','deluxe','family','suite','single'].map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </Select>
          <Input label="Prix (DZD/nuit)" type="number" placeholder="5000" value={form.price} onChange={set('price')} />
          <Input label="Capacité (personnes)" type="number" min="1" max="10" value={form.capacity} onChange={set('capacity')} />
          <Input label="Superficie (m²)" type="number" value={form.size} onChange={set('size')} />
          <Input label="Étage" type="number" min="0" value={form.floor} onChange={set('floor')} />
          <Select label="Statut" value={form.status || 'available'} onChange={set('status')}>
            <option value="available">Disponible</option>
            <option value="reserved">Réservée</option>
            <option value="occupied">Occupée</option>
            <option value="maintenance">Maintenance</option>
          </Select>
          
          {/* Image upload section */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-stone-700 block mb-2">Image de la chambre</label>
            
            {/* Method selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setImageMethod('url')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  imageMethod === 'url' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <LinkIcon size={16} />
                <span className="text-sm font-medium">URL Image</span>
              </button>
              <button
                type="button"
                onClick={() => setImageMethod('upload')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  imageMethod === 'upload' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <Upload size={16} />
                <span className="text-sm font-medium">Télécharger Fichier</span>
              </button>
            </div>

            {/* URL Input */}
            {imageMethod === 'url' && (
              <Input 
                placeholder="https://example.com/image.jpg" 
                value={form.image} 
                onChange={set('image')}
              />
            )}

            {/* File Upload */}
            {imageMethod === 'upload' && (
              <div>
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center hover:border-primary-400 hover:bg-primary-50/50 transition-all">
                    {uploadedImage ? (
                      <div className="space-y-2">
                        <img src={uploadedImage} alt="Preview" className="w-full h-40 object-cover rounded-lg mb-2" />
                        <p className="text-sm text-green-600 font-medium">✓ Image téléchargée</p>
                        <p className="text-xs text-stone-500">Cliquez pour changer</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload size={32} className="mx-auto text-stone-400" />
                        <p className="text-sm text-stone-600 font-medium">Cliquez pour télécharger une image</p>
                        <p className="text-xs text-stone-400">PNG, JPG, WEBP jusqu'à 10MB</p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Image Preview for URL */}
            {imageMethod === 'url' && form.image && (
              <div className="mt-3">
                <img src={form.image} alt="Preview" className="w-full h-40 object-cover rounded-lg" 
                  onError={(e) => { e.target.style.display = 'none' }} />
              </div>
            )}
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium text-stone-700 block mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={set('description')}
              className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none text-sm" />
          </div>
          {form.status === 'maintenance' && (
            <Textarea
              label="Note de maintenance"
              value={form.maintenanceNote || ''}
              onChange={set('maintenanceNote')}
              placeholder="Ex: Air conditioning repair"
              className="col-span-2"
              rows={3}
            />
          )}
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-5 sm:justify-end">
          <Button variant="secondary" onClick={() => setModalOpen(false)} className="w-full sm:w-auto">Annuler</Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">{editRoom ? 'Enregistrer' : 'Ajouter'}</Button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmer la suppression" size="sm">
        <p className="text-stone-600 mb-5">Êtes-vous sûr de vouloir supprimer cette chambre ? Cette action est irréversible.</p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="w-full sm:w-auto">Annuler</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteConfirm)} className="w-full sm:w-auto">Supprimer</Button>
        </div>
      </Modal>
    </div>
  )
}
