import { Metadata } from 'next'
import { DeleteAccountForm } from './DeleteAccountForm'

export const metadata: Metadata = { title: 'アカウントを削除' }

export default function DeleteAccountPage() {
  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <h1 className="font-bold text-lg text-destructive mb-1">アカウントの削除</h1>
      <p className="text-sm text-muted-foreground mb-6">この操作は取り消せません</p>
      <DeleteAccountForm />
    </div>
  )
}
