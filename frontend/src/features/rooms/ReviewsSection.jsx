import { useState, useEffect } from 'react'
import { Star, AlertCircle, Send } from 'lucide-react'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import Input, { Textarea } from '../../shared/ui/Input'
import Toast from '../../shared/ui/Toast'
import { apiRequest } from '../../utils/api'

const StarRating = ({ value, onChange, readOnly = false }) => {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type={readOnly ? 'button' : 'button'}
          onClick={() => !readOnly && onChange?.(star)}
          className={`transition ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          disabled={readOnly}
        >
          <Star
            size={24}
            className={value >= star ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}
          />
        </button>
      ))}
    </div>
  )
}

export default function ReviewsSection({ roomId, roomName }) {
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({ name: '', rating: 0, comment: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchReviews()
  }, [roomId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await apiRequest(`/api/reviews/room/${roomId}`)
      setReviews(data.reviews || [])
      setAverageRating(data.averageRating || 0)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      setReviews([])
      setAverageRating(0)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Nom requis.'
    if (form.rating === 0) newErrors.rating = 'Évaluation requise.'
    if (!form.comment.trim()) newErrors.comment = 'Commentaire requis.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      await apiRequest('/api/reviews', {
        method: 'POST',
        body: {
          roomId,
          name: form.name.trim(),
          rating: form.rating,
          comment: form.comment.trim(),
        },
      })
      setToast({ type: 'success', message: 'Avis publié avec succès !' })
      setForm({ name: '', rating: 0, comment: '' })
      setErrors({})
      await fetchReviews()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Erreur lors de la publication.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-12 pt-12 border-t">
      <h2 className="font-display text-2xl font-bold text-stone-800 mb-6">Avis et Évaluations</h2>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="font-display text-4xl font-bold text-amber-500">{averageRating}</div>
            <Star size={28} className="fill-amber-400 text-amber-400" />
          </div>
          <p className="text-sm text-stone-600">Évaluation moyenne</p>
          <p className="text-xs text-stone-500 mt-1">Basée sur {reviews.length} avis</p>
        </Card>

        {/* Rating Distribution */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = reviews.filter(r => r.rating === rating).length
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-12 text-sm text-stone-600">
                  <span>{rating}</span>
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-8 text-right text-sm text-stone-500">{count}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review Form */}
      <Card className="p-6 mb-10 bg-amber-50 border-amber-100">
        <h3 className="font-display font-semibold text-stone-800 mb-4">Partager votre avis</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Votre nom"
              placeholder="Mohammed Benali"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              error={errors.name}
            />
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Évaluation *</label>
              <StarRating value={form.rating} onChange={(rating) => setForm(f => ({ ...f, rating }))} />
              {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating}</p>}
            </div>
          </div>

          <Textarea
            label="Votre commentaire"
            rows={4}
            placeholder="Partagez votre expérience avec cette chambre..."
            value={form.comment}
            onChange={(e) => setForm(f => ({ ...f, comment: e.target.value }))}
            error={errors.comment}
          />

          <div className="flex justify-end">
            <Button type="submit" loading={submitting} className="flex items-center gap-2">
              <Send size={16} />
              Publier l'avis
            </Button>
          </div>
        </form>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <AlertCircle size={32} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-600">Aucun avis pour le moment. Soyez le premier à partager votre expérience !</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <Card key={review._id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-stone-800">{review.name}</h4>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={14}
                        className={review.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-stone-500">
                  {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">{review.comment}</p>
            </Card>
          ))}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </div>
  )
}
