import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import { getRemainingTime } from '../../utils/statusMeta'

export default function DeadlineCountdown({ deadline, prefix, expiredText = 'Reservation expired automatically', tone = 'amber', className = '' }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!deadline) return undefined

    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [deadline])

  if (!deadline) return null

  const remaining = getRemainingTime(deadline)
  if (!remaining) return null

  if (remaining.expired) {
    return (
      <div className={`flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 ${className}`}>
        <Clock3 size={14} />
        <span>{expiredText}</span>
      </div>
    )
  }

  const toneClasses = {
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    stone: 'bg-stone-50 text-stone-700 border-stone-200',
  }

  return (
    <div className={`flex items-center gap-2 text-sm border rounded-xl px-3 py-2 ${toneClasses[tone] || toneClasses.amber} ${className}`}>
      <Clock3 size={14} />
      <span>{prefix || 'Expires in'} {remaining.text}</span>
    </div>
  )
}