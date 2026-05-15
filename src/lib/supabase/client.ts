import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  const isConfigured = url.startsWith('https://') && !url.includes('your_')
  return createBrowserClient(
    isConfigured ? url : 'https://placeholder.supabase.co',
    isConfigured ? key : 'placeholder-anon-key'
  )
}
