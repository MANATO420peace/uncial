'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { signUpWithEmail, signInWithGoogle } from '@/lib/actions/auth'
import type { University } from '@/types'

const GRADES = ['1年', '2年', '3年', '4年', '5年以上', 'M1', 'M2', 'D']

interface Props {
  universities: University[]
}

const TERMS = `【利用規約】

1. 本サービスは大学生・大学院生を対象としたコミュニティです。
2. 他のユーザーへの誹謗中傷・ハラスメントを禁止します。
3. 個人情報（氏名・住所・電話番号等）の無断公開を禁止します。
4. 違法コンテンツや著作権を侵害するコンテンツの投稿を禁止します。
5. 収集した個人情報は本サービスの運営目的にのみ使用します。
6. 規約違反が確認された場合、アカウントを停止することがあります。
7. 本規約は予告なく変更される場合があります。`

export function RegisterForm({ universities }: Props) {
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [universityId, setUniversityId] = useState('')
  const [grade, setGrade] = useState('')
  const [termsAgreed, setTermsAgreed] = useState(false)

  const handleUniversityChange = (v: string | null) => setUniversityId(v ?? '')
  const handleGradeChange = (v: string | null) => setGrade(v ?? '')

  const universityName = universities.find(u => u.id === universityId)?.name

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('university_id', universityId)
    formData.set('grade', grade)
    const result = await signUpWithEmail(formData)
    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else if (result?.needsConfirmation) {
      toast.success('確認メールを送信しました。メールのリンクをクリックして登録を完了してください。')
      setLoading(false)
    }
    // redirect の場合は result が返らない
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signInWithGoogle()
    setGoogleLoading(false)
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
        disabled={googleLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {googleLoading ? '処理中...' : 'Googleで登録'}
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">または</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="nickname">ニックネーム</Label>
          <Input id="nickname" name="nickname" placeholder="表示名" required maxLength={20} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" name="email" type="email" placeholder="student@university.ac.jp" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">パスワード</Label>
          <Input id="password" name="password" type="password" placeholder="6文字以上" required minLength={6} />
        </div>
        <div className="space-y-1.5">
          <Label>大学</Label>
          <Select value={universityId} onValueChange={handleUniversityChange}>
            <SelectTrigger>
              <SelectValue placeholder="大学を選択">{universityName ?? ''}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {universities.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="faculty">学部</Label>
            <Input id="faculty" name="faculty" placeholder="工学部" />
          </div>
          <div className="space-y-1.5">
            <Label>学年</Label>
            <Select value={grade} onValueChange={handleGradeChange}>
              <SelectTrigger>
                <SelectValue placeholder="学年" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="rounded-lg border p-3 space-y-2">
          <p className="text-xs font-semibold">利用規約</p>
          <div className="bg-muted rounded p-2.5 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
            {TERMS}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="terms" className="cursor-pointer font-normal text-sm">
              利用規約に同意する
            </Label>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading || !termsAgreed}>
          {loading ? '登録中...' : 'アカウント作成'}
        </Button>
      </form>
    </div>
  )
}
