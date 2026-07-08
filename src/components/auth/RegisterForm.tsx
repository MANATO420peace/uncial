'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { signUpWithEmail, signInWithGoogle } from '@/lib/actions/auth'
import type { University } from '@/types'

const STUDENT_GRADES = ['1年', '2年', '3年', '4年', '5年以上', 'M1', 'M2', 'D', 'その他']

interface Props {
  universities: University[]
}


/** メールアドレスのドメインから大学を検索する */
function detectUniversity(email: string, universities: University[]): University | null {
  const domain = email.toLowerCase().split('@')[1]
  if (!domain) return null
  for (const u of universities) {
    // primaryドメインチェック
    if (u.domain && domain === u.domain) return u
    // university_domainsテーブルのドメインチェック
    if (u.university_domains?.some(d => d.domain === domain)) return u
  }
  return null
}

export function RegisterForm({ universities }: Props) {
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [universityId, setUniversityId] = useState('')
  const [grade, setGrade] = useState('')
  const [termsAgreed, setTermsAgreed] = useState(false)

  const isUniversityEmail = email.toLowerCase().endsWith('.ac.jp')
  const emailDomain = email.includes('@') ? email.toLowerCase().split('@')[1] : ''
  const detectedUniversity = email.includes('@') ? detectUniversity(email, universities) : null
  // 検出された大学があればそれを使い、なければ手動選択
  const effectiveUniversityId = detectedUniversity ? detectedUniversity.id : universityId
  const universityName = universities.find(u => u.id === effectiveUniversityId)?.name
  // 対応大学のドメインかどうか
  const isAllowedDomain = !email.includes('@') || !isUniversityEmail || !!detectedUniversity

  const effectiveGrade = grade

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isUniversityEmail && !detectedUniversity) {
      toast.error('現在は関西学院大学・関西大学・同志社大学・立命館大学・神戸大学のみ登録できます')
      return
    }
    if (!effectiveUniversityId) { toast.error('大学を選択してください'); return }
    if (isUniversityEmail && !grade) { toast.error('学年を選択してください'); return }
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('university_id', effectiveUniversityId)
    formData.set('grade', effectiveGrade)
    const result = await signUpWithEmail(formData)
    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else if (result?.needsConfirmation) {
      toast.success('確認メールを送信しました。メールのリンクをクリックして登録を完了してください。')
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signInWithGoogle()
    setGoogleLoading(false)
  }

  return (
    <div className="space-y-4">
      <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={googleLoading}>
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {googleLoading ? '処理中...' : '大学Googleアカウントで登録'}
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
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="student@university.ac.jp"
            required
            value={email}
            onChange={e => {
              setEmail(e.target.value)
              if (!e.target.value.toLowerCase().endsWith('.ac.jp')) setGrade('')
              // メール変更時は手動選択をリセット
              setUniversityId('')
            }}
          />
          {email && email.includes('@') ? (
            !isUniversityEmail ? (
              <p className="text-xs text-destructive">❌ 大学のメールアドレス（〜@〜.ac.jp）が必要です</p>
            ) : detectedUniversity ? (
              <p className="text-xs text-green-600">✅ {detectedUniversity.name}のメールアドレスが確認されました</p>
            ) : (
              <p className="text-xs text-destructive">❌ 現在は関西学院大学・関西大学・同志社大学・立命館大学・神戸大学のみ対応しています</p>
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              対応大学の学生メール（〜.ac.jp）のみ登録できます
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">パスワード</Label>
          <Input id="password" name="password" type="password" placeholder="6文字以上" required minLength={6} />
        </div>
        <div className="space-y-1.5">
          <Label>大学 *</Label>
          {detectedUniversity ? (
            // メールドメインから自動判定済み → ロック表示
            <div className="h-10 rounded-md border bg-muted/50 px-3 flex items-center text-sm">
              {detectedUniversity.name}
              <span className="ml-2 text-xs text-muted-foreground">（自動検出）</span>
            </div>
          ) : (
            <Select value={universityId} onValueChange={v => setUniversityId(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="大学を選択">{universityName ?? ''}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {universities.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="faculty">学部</Label>
            <Input id="faculty" name="faculty" placeholder="工学部" />
          </div>
          <div className="space-y-1.5">
            <Label>学年</Label>
            {isUniversityEmail ? (
              <Select value={grade} onValueChange={v => setGrade(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="学年を選択" />
                </SelectTrigger>
                <SelectContent>
                  {STUDENT_GRADES.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={grade} onValueChange={v => setGrade(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="学年を選択" />
                </SelectTrigger>
                <SelectContent>
                  {STUDENT_GRADES.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="terms" checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} className="h-4 w-4 rounded border-input" />
            <Label htmlFor="terms" className="cursor-pointer font-normal text-sm">
              <Link href="/legal/terms" target="_blank" className="underline hover:text-foreground">利用規約</Link>
              ・
              <Link href="/legal/privacy" target="_blank" className="underline hover:text-foreground">プライバシーポリシー</Link>
              に同意する
            </Label>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading || !termsAgreed || (isUniversityEmail && !detectedUniversity)}>
          {loading ? '登録中...' : 'アカウント作成'}
        </Button>
      </form>
    </div>
  )
}
