export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4
      bg-white dark:bg-black">

      <div className="relative w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
