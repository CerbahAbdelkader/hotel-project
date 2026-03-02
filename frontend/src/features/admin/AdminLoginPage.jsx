import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import Card from '../../shared/ui/Card'

export default function AdminLoginPage() {
  const { login, error, setError } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const result = login(form.email, form.password)
      if (result.success && result.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (result.success) {
        setError('Accès réservé aux administrateurs.')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-stone-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={26} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Administration</h1>
          <p className="text-stone-400 text-sm mt-1">Hôtel Saïda — Espace réservé</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email administrateur" type="email" placeholder="admin@hotel-saida.dz"
              value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError(null) }} required />
            <Input label="Mot de passe" type="password" placeholder="••••••••"
              value={form.password} onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(null) }} required />
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full" loading={loading}>Accéder au panneau</Button>
          </form>
        </Card>

        <p className="text-center text-stone-500 text-xs mt-4">admin@hotel-saida.dz / admin123</p>
      </div>
    </div>
  )
}
