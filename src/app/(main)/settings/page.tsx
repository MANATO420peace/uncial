import { Metadata } from 'next'
import { getCurrentUser, getUniversities } from '@/lib/actions/user'
import { SettingsForm } from './SettingsForm'

export const metadata: Metadata = { title: '設定' }

export default async function SettingsPage() {
  const [user, universities] = await Promise.all([getCurrentUser(), getUniversities()])
  if (!user) return null

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="font-bold text-lg">プロフィール設定</h1>
        <p className="text-sm text-muted-foreground">表示情報を変更できます</p>
      </div>
      <SettingsForm user={user} universities={universities} />
    </div>
  )
}
