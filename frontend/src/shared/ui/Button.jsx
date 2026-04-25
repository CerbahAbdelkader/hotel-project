const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg',
  secondary: 'bg-warm-100 hover:bg-warm-200 text-warm-800 border border-warm-300',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white',
  ghost: 'text-stone-600 hover:bg-stone-100',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
}
const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled, loading, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      )}
      {children}
    </button>
  )
}
