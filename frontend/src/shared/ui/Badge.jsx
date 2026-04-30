import { getStatusClasses, getStatusMeta } from '../../utils/statusMeta'

export default function StatusBadge({ status, kind = 'booking', className = '' }) {
  const meta = getStatusMeta(status, kind)

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClasses(status, kind)} ${className}`}>
      <meta.icon size={12} />
      {meta.label}
    </span>
  )
}
