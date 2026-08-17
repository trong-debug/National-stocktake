export default function BranchLoading() {
  return (
    <div className="p-6 max-w-full space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-12 bg-slate-200 rounded" />
          <div className="h-6 w-40 bg-slate-200 rounded" />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="text-right space-y-1">
                <div className="h-3 w-10 bg-slate-100 rounded ml-auto" />
                <div className="h-5 w-12 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-l pl-6">
            <div className="h-8 w-28 bg-slate-200 rounded" />
            <div className="h-8 w-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>

      {/* Dept tab strip */}
      <div className="flex gap-6 border-b pb-0">
        {[80, 40, 40, 40, 40, 80].map((w, i) => (
          <div key={i} className="h-4 bg-slate-100 rounded mb-2.5" style={{ width: w }} />
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 py-1">
        <div className="flex gap-1">
          {[1, 2, 3].map(i => <div key={i} className="h-7 w-16 bg-slate-100 rounded" />)}
        </div>
        <div className="ml-auto flex gap-1">
          <div className="h-9 w-60 bg-slate-100 rounded" />
          <div className="h-9 w-20 bg-slate-100 rounded" />
        </div>
        <div className="h-4 w-20 bg-slate-100 rounded" />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="bg-slate-50 border-b px-3 py-2.5 flex gap-4">
          {[60, 120, 90, 90, 110, 50, 60, 50, 70, 160].map((w, i) => (
            <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="px-3 py-2.5 border-b last:border-0 flex gap-4 items-center">
            {[60, 120, 90, 90, 110, 50, 60, 50, 70, 160].map((w, j) => (
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
