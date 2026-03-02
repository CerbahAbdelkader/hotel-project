import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import Card from '../../shared/ui/Card'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nom requis.'
    if (!form.email.trim()) e.email = 'Email requis.'
    if (!form.phone.trim()) e.phone = 'Téléphone requis.'
    if (form.password.length < 6) e.password = 'Mot de passe: minimum 6 caractères.'
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      // In real app: call API to create user
      navigate('/login', { state: { message: 'Compte créé ! Connectez-vous.' } })
    }, 800)
  }

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-warm-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-display font-bold">H</span>
            </div>
            <span className="font-display font-bold text-stone-800">Hôtel Saïda</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-stone-800">Créer un compte</h1>
          <p className="text-stone-500 text-sm mt-1">Rejoignez-nous pour gérer vos réservations</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nom complet" placeholder="Mohammed Benali" value={form.name} onChange={set('name')} error={errors.name} />
            <Input label="Email" type="email" placeholder="votre@email.com" value={form.email} onChange={set('email')} error={errors.email} />
            <Input label="Téléphone" placeholder="05XXXXXXXX" value={form.phone} onChange={set('phone')} error={errors.phone} />
            <div className="relative">
              <Input label="Mot de passe" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={set('password')} error={errors.password} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9 text-stone-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Input label="Confirmer le mot de passe" type="password" placeholder="••••••••"
              value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
            <Button type="submit" className="w-full" loading={loading}>Créer mon compte</Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-stone-500">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:underline">Se connecter</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
