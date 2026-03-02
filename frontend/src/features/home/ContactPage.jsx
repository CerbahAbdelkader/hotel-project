import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react'
import Button from '../../shared/ui/Button'
import Input, { Textarea } from '../../shared/ui/Input'
import Card from '../../shared/ui/Card'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setSent(true); setLoading(false) }, 800)
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Contactez-nous</p>
          <h1 className="font-display text-4xl font-bold text-stone-800">Nous sommes là pour vous</h1>
          <p className="text-stone-500 mt-3">N'hésitez pas à nous contacter pour toute question ou demande d'information.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-stone-800 mb-5">Informations de contact</h2>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: 'Adresse', value: 'Rue des Martyrs, Saïda 20000, Algérie' },
                  { icon: Phone, label: 'Téléphone', value: '+213 (0) 48 20 00 00' },
                  { icon: Mail, label: 'Email', value: 'contact@hotel-saida.dz' },
                  { icon: Clock, label: 'Réception', value: '24h/24 — 7j/7' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <div className="text-xs text-stone-400 mb-0.5">{label}</div>
                      <div className="text-stone-700 font-medium">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-5 bg-primary-50 border-primary-100">
              <h3 className="font-semibold text-stone-800 mb-2">Réservations</h3>
              <p className="text-stone-600 text-sm">
                Pour toute demande de réservation, vous pouvez utiliser notre formulaire en ligne ou nous appeler directement. Le paiement s'effectue à votre arrivée.
              </p>
            </Card>

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden bg-stone-200 h-52 flex items-center justify-center">
              <div className="text-center text-stone-500">
                <MapPin size={32} className="mx-auto mb-2 text-stone-400" />
                <p className="text-sm font-medium">Saïda, Algérie</p>
                <p className="text-xs">Rue des Martyrs 20000</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            {sent ? (
              <Card className="p-10 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={28} className="text-green-600" />
                </div>
                <h3 className="font-display text-xl font-bold text-stone-800 mb-2">Message envoyé !</h3>
                <p className="text-stone-500">Nous vous répondrons dans les plus brefs délais.</p>
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="font-display text-xl font-semibold text-stone-800 mb-5">Envoyer un message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input label="Nom complet" placeholder="Mohammed Benali" value={form.name} onChange={set('name')} required />
                  <Input label="Email" type="email" placeholder="votre@email.com" value={form.email} onChange={set('email')} required />
                  <Input label="Sujet" placeholder="Renseignement, réservation..." value={form.subject} onChange={set('subject')} required />
                  <Textarea label="Message" rows={5} placeholder="Votre message..." value={form.message} onChange={set('message')} required />
                  <Button type="submit" className="w-full" loading={loading}>Envoyer le message</Button>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
