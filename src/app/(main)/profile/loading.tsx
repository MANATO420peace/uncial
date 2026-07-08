export default function Loading() {
  return (
    <div className="px-4 py-6 space-y-4 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-14 w-14 rounded-full bg-muted" />
        <div className="h-8 w-20 rounded-md bg-muted" />
      </div>
      <div className="h-5 w-32 rounded bg-muted" />
      <div className="h-4 w-48 rounded bg-muted" />
      <div className="flex gap-6 mt-4">
        <div className="h-4 w-12 rounded bg-muted" />
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-4 w-16 rounded bg-muted" />
      </div>
    </div>
  )
}
