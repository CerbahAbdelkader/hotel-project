export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-warm-100 ${hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
