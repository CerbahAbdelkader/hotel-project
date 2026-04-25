export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-stone-700">{label}</label>}
      <input
        className={`px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-stone-700">{label}</label>}
      <select
        className={`px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-stone-700">{label}</label>}
      <textarea
        className={`px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors resize-none ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
