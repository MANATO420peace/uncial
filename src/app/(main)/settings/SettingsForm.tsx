'use client'

import { useState, useRef } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Camera, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateProfile } from '@/lib/actions/user'
import { signOut } from '@/lib/actions/auth'
import { uploadAvatar } from '@/lib/uploadAvatar'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import type { User, University } from '@/types'

const STUDENT_GRADES = ['1年', '2年', '3年', '4年', '5年以上', 'M1', 'M2', 'D']
const MAX_AVATAR_SIZE = 5 * 1024 * 1024

interface Props {
  user: User
  universities: University[]
  email: string
}

export function SettingsForm({ user, universities, email }: Props) {
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [universityId, setUniversityId] = useState(user.university_id ?? '')
  const [grade, setGrade] = useState(user.grade === 'OB・OG' ? '' : (user.grade ?? ''))
  const [isPrivate, setIsPrivate] = useState(user.is_private ?? false)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url ?? '')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isUniversityEmail = email.toLowerCase().endsWith('.ac.jp')
  const effectiveGrade = isUniversityEmail ? grade : 'OB・OG'
  const universityName = universities.find(u => u.id === universityId)?.name

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('アイコン画像は5MB以下にしてください')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('画像ファイルを選択してください')
      return
    }
    setAvatarUploading(true)
    const url = await uploadAvatar(file)
    setAvatarUploading(false)
    if (url) {
      setAvatarUrl(url)
    } else {
      toast.error('画像のアップロードに失敗しました')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!universityId) { toast.error('大学を選択してください'); return }
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('university_id', universityId)
    formData.set('grade', effectiveGrade)
    formData.set('is_private', String(isPrivate))
    if (avatarUrl) formData.set('avatar_url', avatarUrl)
    const result = await updateProfile(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('プロフィールを更新しました')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="h-20 w-20">
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {user.nickname[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 bg-foreground text-background rounded-full p-1.5 shadow"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          {avatarUploading && <p className="text-xs text-muted-foreground">アップロード中...</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nickname">ニックネーム</Label>
          <Input id="nickname" name="nickname" defaultValue={user.nickname} maxLength={20} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">プロフィール文</Label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={user.bio ?? ''}
            maxLength={160}
            rows={3}
            placeholder="自己紹介を入力（160文字以内）"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <Label>大学 *</Label>
          <Select value={universityId} onValueChange={setUniversityId}>
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="faculty">学部</Label>
            <Input id="faculty" name="faculty" defaultValue={user.faculty ?? ''} placeholder="工学部" />
          </div>
          <div className="space-y-1.5">
            <Label>学年</Label>
            {isUniversityEmail ? (
              <Select value={grade} onValueChange={setGrade}>
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
              <div className="h-10 rounded-md border bg-muted/50 px-3 flex items-center text-sm text-muted-foreground">
                OB・OG
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border rounded-lg px-3">
          <div>
            <p className="text-sm font-medium">非公開アカウント</p>
            <p className="text-xs text-muted-foreground">フォロワー以外にプロフィールと投稿を非表示</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPrivate(v => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPrivate ? 'bg-primary' : 'bg-muted-foreground/30'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <Button type="submit" className="w-full" disabled={loading || avatarUploading}>
          {loading ? '保存中...' : '変更を保存'}
        </Button>
      </form>

      <Separator />

      <div className="space-y-3">
        <h2 className="font-semibold text-sm">表示</h2>
        <div className="flex items-center justify-between py-2 border rounded-lg px-3">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <p className="text-sm font-medium">ダークモード</p>
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground/30'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h2 className="font-semibold text-sm">サポート</h2>
        <Link href="/contact" className="block w-full text-center text-sm py-2 border rounded-lg hover:bg-muted/50 transition-colors">
          お問い合わせ
        </Link>
      </div>

      <Separator />

      <div>
        <h2 className="font-semibold text-sm mb-3">アカウント</h2>
        <Button variant="destructive" className="w-full" onClick={() => signOut()}>
          ログアウト
        </Button>
      </div>
    </div>
  )
}
