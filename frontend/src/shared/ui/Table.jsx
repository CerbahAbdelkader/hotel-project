export default function Table({ columns, data, emptyMessage = 'Aucune donnée disponible.' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-200">
            {columns.map((col, i) => (
              <th key={i} className={`px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-stone-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr key={ri} className="hover:bg-warm-50 transition-colors">
                {columns.map((col, ci) => (
                  <td key={ci} className={`px-4 py-3 text-stone-700 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
