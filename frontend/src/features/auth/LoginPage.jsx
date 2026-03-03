import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import Card from '../../shared/ui/Card'

export default function LoginPage() {
  const { login, error, setError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const result = login(form.email, form.password)
      if (result.success) {
        navigate(result.role === 'admin' ? '/admin/dashboard' : from)
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left image */}
      <div className="hidden lg:block flex-1 relative">
        <img src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80" alt="Hôtel"
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-stone-900/40" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white text-center">
            <h2 className="font-display text-4xl font-bold mb-3">Hôtel Saïda</h2>
            <p className="text-white/80">Élégance & Confort au cœur de Saïda</p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-warm-50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-display font-bold">H</span>
              </div>
              <span className="font-display font-bold text-stone-800">Hôtel Saïda</span>
            </Link>
            <h1 className="font-display text-2xl font-bold text-stone-800">Connexion</h1>
            <p className="text-stone-500 text-sm mt-1">Accédez à votre espace personnel</p>
          </div>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="votre@email.com"
                value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value.replace(/\s+/g, '') })); setError(null) }}
                required
              />
              <div className="relative">
                <Input
                  label="Mot de passe"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(null) }}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-9 text-stone-400 hover:text-stone-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <Button type="submit" className="w-full" loading={loading}>Se connecter</Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-stone-500">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-primary-600 font-medium hover:underline">S'inscrire</Link>
              </p>
            </div>
          </Card>

          <div className="mt-5 bg-stone-100 rounded-xl p-4 text-xs text-stone-500">
            <p className="font-semibold mb-1">Comptes de démonstration :</p>
            <p>Admin: admin@hotel-saida.dz / admin123</p>
            <p>Client: mbenali@email.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
