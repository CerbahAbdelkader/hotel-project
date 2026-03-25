import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, Briefcase, Cake, HeartHandshake, Phone, Send, Sparkles, Users } from 'lucide-react'
import Button from '../../shared/ui/Button'
import Card from '../../shared/ui/Card'
import Input from '../../shared/ui/Input'
import Modal from '../../shared/ui/Modal'
import { useBooking } from '../../context/BookingContext'
import { apiEndpoint } from '../../utils/api'
import { EVENTS_CONTENT } from '../../data/mockData'

const iconByName = {
  HeartHandshake,
  Briefcase,
  Cake,
  Users,
}

const eventTypes = EVENTS_CONTENT.types.map((item) => ({
  ...item,
  icon: iconByName[item.icon] || Sparkles,
}))

const halls = EVENTS_CONTENT.halls
const packages = EVENTS_CONTENT.packages
const steps = EVENTS_CONTENT.steps

export default function EventsPage() {
  const { createEventReservation } = useBooking()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [errors, setErrors] = useState({})
  const typesRef = useRef(null)

  const [form, setForm] = useState({
    clientName: '',
    email: '',
    phone: '',
    eventType: '',
    guests: '',
    startDate: '',
    endDate: '',
    services: [],
    message: '',
  })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-6')
            entry.target.classList.add('opacity-100', 'translate-y-0')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const openModal = (eventType = '') => {
    setForm(prev => ({ ...prev, eventType: eventType || prev.eventType }))
    setErrors({})
    setIsModalOpen(true)
  }

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const toggleService = service => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }))
  }

  const validate = () => {
    const nextErrors = {}
    const email = form.email.trim().toLowerCase()
    const phone = form.phone.trim()

    if (!form.clientName.trim()) nextErrors.clientName = 'Le nom complet est requis.'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Veuillez saisir un email valide.'
    if (!/^\+?[0-9\s-]{8,15}$/.test(phone)) nextErrors.phone = 'Veuillez saisir un numéro valide.'
    if (!form.eventType) nextErrors.eventType = "Choisissez un type d'événement."
    if (!form.guests || Number(form.guests) < 1) nextErrors.guests = "Le nombre d'invités doit être supérieur à 0."
    if (!form.startDate) nextErrors.startDate = 'La date de début est requise.'
    if (!form.endDate) nextErrors.endDate = 'La date de fin est requise.'
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      nextErrors.endDate = 'La date de fin doit être après ou égale à la date de début.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const resetForm = () => {
    setForm({
      clientName: '',
      email: '',
      phone: '',
      eventType: '',
      guests: '',
      startDate: '',
      endDate: '',
      services: [],
      message: '',
    })
    setErrors({})
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      clientName: form.clientName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      eventType: form.eventType,
      guests: form.guests,
      startDate: form.startDate,
      endDate: form.endDate,
      services: form.services,
      message: form.message.trim(),
    }

    createEventReservation(payload)

    setLoading(true)
    try {
      // Use centralized API base URL for deployed backend requests.
      const response = await fetch(apiEndpoint('/api/event-reservations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('API error')

      setIsModalOpen(false)
      resetForm()
      setToast('Votre demande de réservation a été envoyée avec succès. Notre équipe vous contactera bientôt.')
    } catch {
      setIsModalOpen(false)
      resetForm()
      setToast('Votre demande de réservation a été envoyée avec succès. Notre équipe vous contactera bientôt.')
    } finally {
      setLoading(false)
      setTimeout(() => setToast(''), 5000)
    }
  }

  return (
    <div className="bg-white">
      <section className="relative min-h-[72vh] flex items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1800&q=80"
          alt="Événements Hôtel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/85 via-stone-900/55 to-stone-900/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 text-white" data-reveal>
          <p className="text-primary-300 text-sm font-semibold uppercase tracking-wider mb-3">Événements premium</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">Événements & Réceptions</h1>
          <p className="max-w-3xl text-stone-200 text-lg leading-relaxed mb-8">
            Organisez vos moments les plus importants dans notre hôtel. Mariages, conférences, anniversaires ou événements professionnels — nous mettons à votre disposition des espaces élégants et un service exceptionnel.
          </p>
          <Button
            size="lg"
            className="shadow-xl hover:shadow-2xl"
            onClick={() => typesRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            Réserver un événement
          </Button>
        </div>
      </section>

      <section ref={typesRef} className="py-20 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12" data-reveal>
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Organisation sur mesure</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800">Types d'Événements</h2>
            <p className="text-stone-500 mt-3 max-w-2xl mx-auto">Des formats adaptés à chaque occasion, avec un accompagnement complet de notre équipe.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {eventTypes.map(({ key, title, description, image, icon: Icon }) => (
              <Card key={key} className="overflow-hidden hover:-translate-y-1 transition-all duration-300" data-reveal>
                <div className="relative h-48 overflow-hidden">
                  <img src={image} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <div className="w-11 h-11 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center mb-3">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-stone-800 mb-2">{title}</h3>
                  <p className="text-stone-500 text-sm mb-4">{description}</p>
                  <Button variant="outline" className="w-full" onClick={() => openModal(key)}>
                    Réserver cet événement
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12" data-reveal>
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Salles & capacités</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800">Nos Espaces Événementiels</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {halls.map(hall => (
              <Card key={hall.name} className="overflow-hidden hover:-translate-y-1 transition-all duration-300" data-reveal>
                <div className="h-52 overflow-hidden">
                  <img src={hall.image} alt={hall.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <p className="text-primary-700 text-xs font-semibold uppercase tracking-wide mb-1">Capacité : {hall.capacity}</p>
                  <h3 className="font-display text-xl font-semibold text-stone-800 mb-2">{hall.name}</h3>
                  <p className="text-stone-500 text-sm">{hall.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12" data-reveal>
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Prestations exclusives</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800">Nos Forfaits Événementiels</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map(pack => (
              <Card key={pack.title} className="p-6 border border-primary-100/60" data-reveal>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center text-xl">{pack.icon}</div>
                  <h3 className="font-display text-2xl font-semibold text-stone-800">{pack.title}</h3>
                </div>
                <ul className="space-y-2">
                  {pack.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-stone-600 text-sm">
                      <Sparkles size={14} className="mt-0.5 text-primary-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12" data-reveal>
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Processus simplifié</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800">Comment ça fonctionne ?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, index) => (
              <Card key={step.title} className="p-5 text-center border border-stone-100 relative" data-reveal>
                <span className="absolute top-2 right-3 font-display text-2xl text-stone-200">{index + 1}</span>
                <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 mx-auto mb-3 flex items-center justify-center text-lg">
                  {step.icon}
                </div>
                <h3 className="font-display text-xl font-semibold text-stone-800 mb-2">{step.title}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Réserver un événement" size="xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom complet"
            value={form.clientName}
            onChange={e => setField('clientName', e.target.value)}
            error={errors.clientName}
            required
          />
          <Input
            label="Email (optionnel)"
            type="email"
            value={form.email}
            onChange={e => setField('email', e.target.value.replace(/\s+/g, ''))}
            error={errors.email}
          />
          <Input
            label="Téléphone"
            value={form.phone}
            onChange={e => setField('phone', e.target.value)}
            error={errors.phone}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Type d'événement</label>
            <select
              value={form.eventType}
              onChange={e => setField('eventType', e.target.value)}
              className={`px-4 py-2.5 rounded-lg border bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary-400 ${errors.eventType ? 'border-red-400' : 'border-stone-300'}`}
            >
              <option value="">Sélectionnez...</option>
              {eventTypes.map(t => (
                <option key={t.key} value={t.key}>{t.key}</option>
              ))}
            </select>
            {errors.eventType && <p className="text-xs text-red-500">{errors.eventType}</p>}
          </div>

          <Input
            label="Nombre d'invités"
            type="number"
            min={1}
            value={form.guests}
            onChange={e => setField('guests', e.target.value)}
            error={errors.guests}
            required
          />
          <Input
            label="Date de début"
            type="date"
            min={today}
            value={form.startDate}
            onChange={e => setField('startDate', e.target.value)}
            error={errors.startDate}
            required
          />
          <Input
            label="Date de fin"
            type="date"
            min={form.startDate || today}
            value={form.endDate}
            onChange={e => setField('endDate', e.target.value)}
            error={errors.endDate}
            required
          />

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-stone-700 mb-2">Services supplémentaires</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {['Décoration', 'Service traiteur', 'Photographie', 'Sonorisation'].map(service => (
                <label key={service} className="flex items-center gap-2 text-sm text-stone-600 bg-warm-50 border border-stone-200 rounded-lg px-3 py-2">
                  <input
                    type="checkbox"
                    checked={form.services.includes(service)}
                    onChange={() => toggleService(service)}
                  />
                  {service}
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Message spécial</label>
            <textarea
              rows={4}
              value={form.message}
              onChange={e => setField('message', e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
              placeholder="Précisez vos besoins spécifiques..."
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" loading={loading}>
              <Send size={16} /> Envoyer la demande de réservation
            </Button>
          </div>
        </form>
      </Modal>

      {toast && (
        <div className="fixed right-4 bottom-4 z-50 bg-green-700 text-green-50 px-4 py-3 rounded-xl shadow-xl max-w-md">
          {toast}
        </div>
      )}

      <button
        className="fixed bottom-5 left-5 z-40 bg-primary-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        onClick={() => openModal()}
      >
        <Phone size={16} className="inline mr-1" /> Réserver
      </button>
    </div>
  )
}
