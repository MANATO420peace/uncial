export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4
      bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100
      dark:from-[#0a0a0f] dark:via-[#0d1117] dark:to-[#0a0a0f]">

      {/* 背景グロー（ダーク） */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full
          bg-blue-400/10 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full
          bg-purple-400/10 dark:bg-purple-500/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full
          bg-blue-300/5 dark:bg-blue-400/5 blur-3xl" />
      </div>

      {/* グリッドパターン（ダーク時のみ） */}
      <div className="pointer-events-none absolute inset-0 dark:opacity-100 opacity-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
