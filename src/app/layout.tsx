import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/layout/ThemeProvider'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.uni-can.jp'

export const metadata: Metadata = {
  title: {
    default: 'ユニキャン - 大学コミュニティ',
    template: '%s | ユニキャン',
  },
  description: '大学生のための匿名コミュニティ。楽単情報・テスト情報・サークル・売買・雑談など',
  keywords: ['大学', '楽単', 'テスト', 'サークル', '大学生', 'コミュニティ'],
  metadataBase: new URL(baseUrl),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'ユニキャン - 大学コミュニティ',
    description: '大学生のための匿名コミュニティ。楽単情報・テスト情報・サークル・売買・雑談など',
    url: baseUrl,
    siteName: 'ユニキャン',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'ユニキャン' }],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ユニキャン - 大学コミュニティ',
    description: '大学生のための匿名コミュニティ。楽単情報・テスト情報・サークル・売買・雑談など',
    images: ['/api/og'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ユニキャン',
    startupImage: '/icon-512.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-background antialiased">
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
