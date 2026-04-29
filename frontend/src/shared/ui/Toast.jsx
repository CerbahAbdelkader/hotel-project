import { useEffect } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', duration = 4000, onClose }) {
  useEffect(() => {
    if (duration <= 0) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50'
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200'
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700'
  const Icon = type === 'success' ? CheckCircle : AlertCircle

  return (
    <div className={`fixed bottom-4 right-4 flex items-start gap-3 ${bgColor} border ${borderColor} rounded-lg px-4 py-3 max-w-sm z-50 animate-fadeInUp shadow-lg`}>
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${textColor}`} />
      <p className={`text-sm ${textColor}`}>{message}</p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ml-2 ${textColor} hover:opacity-70 transition`}
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  )
}
