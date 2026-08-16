export default function BranchLoading() {
  return (
    <div className="p-6 max-w-full space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-12 bg-slate-200 rounded" />
            <div className="h-6 w-40 bg-slate-200 rounded" />
          </div>
          <div className="h-4 w-24 bg-slate-100 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-28 bg-slate-200 rounded" />
          <div className="h-8 w-24 bg-slate-200 rounded" />
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2">
        <div className="h-9 w-48 bg-slate-100 rounded" />
        <div className="h-9 w-36 bg-slate-100 rounded" />
        <div className="h-9 w-36 bg-slate-100 rounded" />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="bg-slate-50 border-b px-4 py-3 flex gap-4">
          {[100, 120, 80, 100, 90, 140, 80].map((w, i) => (
            <div key={i} className={`h-4 bg-slate-200 rounded`} style={{ width: w }} />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b last:border-0 flex gap-4 items-center">
            {[100, 120, 80, 100, 90, 140, 80].map((w, j) => (
              <div
                key={j}
                className="h-4 bg-slate-100 rounded"
                style={{ width: w, opacity: 1 - i * 0.06 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
