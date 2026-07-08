export default function Loading() {
  return (
    <div className="space-y-0 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border-b px-4 py-4 space-y-3">
          <div className="flex gap-2">
            <div className="h-4 w-12 rounded-full bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
          </div>
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
