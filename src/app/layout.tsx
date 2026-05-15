import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: {
    default: 'ユニキャン - 大学コミュニティ',
    template: '%s | ユニキャン',
  },
  description: '大学生のための匿名コミュニティ。楽単情報・テスト情報・サークル・売買・雑談など',
  keywords: ['大学', '楽単', 'テスト', 'サークル', '大学生', 'コミュニティ'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-background antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
