'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Users, CheckSquare, Square, Trash2, BookOpen, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  upsertTimetableEntry, deleteTimetableEntry, findUsersWithSameCourse,
  addCourseTask, toggleCourseTask, deleteCourseTask,
} from '@/lib/actions/timetable'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const DAYS = ['月', '火', '水', '木', '金', '土']
const PERIODS = [1, 2, 3, 4, 5, 6]
// 一般的な大学の時間割
const PERIOD_TIMES = ['8:50', '10:30', '13:00', '14:40', '16:20', '18:00']

interface Entry {
  id: string
  day_of_week: number
  period: number
  course_name: string
  professor_name: string | null
  room: string | null
}

interface Task {
  id: string
  timetable_entry_id: string
  content: string
  is_completed: boolean
  created_at: string
}

interface Props {
  entries: Entry[]
  tasks: Task[]
  isOwn: boolean
}

export function TimetableGrid({ entries, tasks: initialTasks, isOwn }: Props) {
  const [selected, setSelected] = useState<{ day: number; period: number } | null>(null)
  const [focusedEntryId, setFocusedEntryId] = useState<string | null>(null)
  const [matchUsers, setMatchUsers] = useState<{ id: string; nickname: string; avatar_url?: string | null; universities?: { name: string } | null }[] | null>(null)
  const [matchCourse, setMatchCourse] = useState('')
  const [isPending, startTransition] = useTransition()
  const [newTaskText, setNewTaskText] = useState('')
  const [tasks, setTasks] = useState(initialTasks)

  const entryMap = new Map(entries.map(e => [`${e.day_of_week}-${e.period}`, e]))
  const focusedEntry = focusedEntryId ? entries.find(e => e.id === focusedEntryId) ?? null : null
  const focusedTasks = tasks.filter(t => t.timetable_entry_id === focusedEntryId)

  // ① 土曜に授業がなければ列を非表示
  const hasSaturday = entries.some(e => e.day_of_week === 6)
  const displayedDays = hasSaturday ? DAYS : DAYS.slice(0, 5)

  function handleCellClick(day: number, period: number) {
    if (!isOwn) return
    const entry = entryMap.get(`${day}-${period}`)
    if (entry) {
      setFocusedEntryId(prev => prev === entry.id ? null : entry.id)
    } else {
      setSelected({ day, period })
    }
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTimetableEntry(id)
      if (focusedEntryId === id) setFocusedEntryId(null)
      toast.success('削除しました')
    })
  }

  function handleFindUsers(courseName: string) {
    setMatchCourse(courseName)
    startTransition(async () => {
      const users = await findUsersWithSameCourse(courseName)
      setMatchUsers(users as never)
    })
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    if (!focusedEntryId || !newTaskText.trim()) return
    const text = newTaskText.trim()
    setNewTaskText('')
    startTransition(async () => {
      const tempId = crypto.randomUUID()
      setTasks(prev => [...prev, { id: tempId, timetable_entry_id: focusedEntryId, content: text, is_completed: false, created_at: new Date().toISOString() }])
      const result = await addCourseTask(focusedEntryId, text)
      if (result?.error) toast.error(result.error)
    })
  }

  async function handleToggleTask(task: Task) {
    startTransition(async () => {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_completed: !t.is_completed } : t))
      await toggleCourseTask(task.id, !task.is_completed)
    })
  }

  async function handleDeleteTask(taskId: string) {
    startTransition(async () => {
      setTasks(prev => prev.filter(t => t.id !== taskId))
      await deleteCourseTask(taskId)
    })
  }

  const selectedEntry = selected ? entryMap.get(`${selected.day}-${selected.period}`) : null
  const allPendingTasks = tasks.filter(t => !t.is_completed)
  const entryById = new Map(entries.map(e => [e.id, e]))

  return (
    <>
      {/* ── グリッド ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {/* ② 時限列ヘッダー */}
              <th className="w-12 border bg-muted/50 py-1.5" />
              {displayedDays.map(d => (
                <th key={d} className="border bg-muted/50 py-2 font-bold text-center text-xs tracking-wide">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period, pIdx) => (
              <tr key={period}>
                {/* ④ 時限番号 + 開始時間 */}
                <td className="border bg-muted/30 text-center py-2 w-12 select-none">
                  <div className="text-xs font-bold text-foreground leading-none">{period}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{PERIOD_TIMES[pIdx]}</div>
                </td>

                {displayedDays.map((_, dayIdx) => {
                  const day = dayIdx + 1
                  const entry = entryMap.get(`${day}-${period}`)
                  const isFocused = !!(entry && focusedEntryId === entry.id)
                  // ⑥ タスク数バッジ
                  const taskCount = entry
                    ? tasks.filter(t => t.timetable_entry_id === entry.id && !t.is_completed).length
                    : 0

                  return (
                    <td
                      key={day}
                      className={[
                        'border min-w-[56px] h-20 relative transition-colors',
                        isOwn ? 'cursor-pointer' : '',
                        isFocused ? 'ring-2 ring-inset ring-primary' : '',
                        !entry && isOwn ? 'hover:bg-muted/30' : '',
                      ].join(' ')}
                      onClick={() => handleCellClick(day, period)}
                    >
                      {entry ? (
                        // ③ 授業セル：左ボーダーアクセント + 少し濃い背景
                        <div className={[
                          'p-1.5 h-full relative border-l-[3px] flex flex-col',
                          isFocused
                            ? 'bg-primary/20 border-primary'
                            : 'bg-primary/10 border-primary/50',
                        ].join(' ')}>
                          {/* 授業名 */}
                          <p className="font-semibold text-[11px] leading-tight line-clamp-2">
                            {entry.course_name}
                          </p>
                          {/* ① 教授名をセルに表示 */}
                          {entry.professor_name && (
                            <p className="text-[9px] text-muted-foreground mt-0.5 truncate">
                              {entry.professor_name}
                            </p>
                          )}
                          {/* 教室 */}
                          {entry.room && (
                            <p className="text-[9px] text-muted-foreground truncate">
                              {entry.room}
                            </p>
                          )}
                          {/* ⑥ タスク数バッジ（数字付き） */}
                          {taskCount > 0 && (
                            <span className="absolute bottom-1 right-1 min-w-[15px] h-[15px] rounded-full bg-destructive text-white text-[8px] font-bold flex items-center justify-center px-1 leading-none">
                              {taskCount}
                            </span>
                          )}
                        </div>
                      ) : isOwn ? (
                        <div className="flex items-center justify-center h-full opacity-0 hover:opacity-50 transition-opacity">
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ) : null}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── タスクパネル ── */}
      {isOwn && (
        <div className="mt-4 space-y-4 px-1">
          {!focusedEntry && allPendingTasks.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">
              授業セルをタップするとタスク・メモを追加できます
            </p>
          )}

          {focusedEntry ? (
            <div className="border rounded-xl p-4 space-y-3">
              {/* ヘッダー：授業名 + ⑤ アクションボタン（常時表示でスマホ対応） */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <h2 className="font-semibold text-sm leading-tight">{focusedEntry.course_name}</h2>
                    {focusedEntry.professor_name && (
                      <p className="text-xs text-muted-foreground">{focusedEntry.professor_name}</p>
                    )}
                    {focusedEntry.room && (
                      <p className="text-xs text-muted-foreground">{focusedEntry.room}</p>
                    )}
                  </div>
                </div>

                {/* ⑤ 常時表示のアクションボタン（スマホでも操作可能） */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleFindUsers(focusedEntry.course_name)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors py-1 px-1.5 rounded-lg hover:bg-primary/10"
                    title="同じ授業の人を探す"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">同じ授業</span>
                  </button>
                  <button
                    onClick={() => setSelected({ day: focusedEntry.day_of_week, period: focusedEntry.period })}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-1.5 rounded-lg hover:bg-muted"
                    title="授業を編集"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">編集</span>
                  </button>
                  <button
                    onClick={() => handleDelete(focusedEntry.id)}
                    className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors py-1 px-1.5 rounded-lg hover:bg-destructive/10"
                    title="授業を削除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">削除</span>
                  </button>
                </div>
              </div>

              {/* タスク一覧 */}
              <ul className="space-y-1.5">
                {focusedTasks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">タスクはありません</p>
                )}
                {focusedTasks.map(task => (
                  <li key={task.id} className="flex items-center gap-2 group">
                    <button onClick={() => handleToggleTask(task)} className="flex-shrink-0 text-primary">
                      {task.is_completed
                        ? <CheckSquare className="h-4 w-4" />
                        : <Square className="h-4 w-4 text-muted-foreground" />
                      }
                    </button>
                    <span className={`flex-1 text-sm ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.content}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors opacity-50 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>

              {/* タスク追加フォーム */}
              <form onSubmit={handleAddTask} className="flex gap-2">
                <Input
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  placeholder="タスク・メモを追加..."
                  className="text-sm h-9"
                />
                <Button type="submit" size="sm" className="h-9 px-3 shrink-0" disabled={!newTaskText.trim() || isPending}>
                  追加
                </Button>
              </form>
            </div>
          ) : (
            allPendingTasks.length > 0 && (
              <div className="border rounded-xl p-4 space-y-3">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  未完了のタスク
                  <span className="ml-auto text-xs font-normal text-muted-foreground">{allPendingTasks.length}件</span>
                </h2>
                <ul className="space-y-2">
                  {allPendingTasks.map(task => {
                    const entry = entryById.get(task.timetable_entry_id)
                    return (
                      <li key={task.id} className="flex items-center gap-2 group">
                        <button onClick={() => handleToggleTask(task)} className="flex-shrink-0">
                          <Square className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{task.content}</p>
                          {entry && <p className="text-[10px] text-muted-foreground">{entry.course_name}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          )}
        </div>
      )}

      {/* ── 授業追加 / 編集ダイアログ ── */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selected && `${DAYS[selected.day - 1]}曜 ${selected.period}限`}
              {selectedEntry ? ' を編集' : ' に授業を追加'}
            </DialogTitle>
          </DialogHeader>
          <form
            action={async (formData) => {
              if (!selected) return
              formData.set('day_of_week', String(selected.day))
              formData.set('period', String(selected.period))
              const result = await upsertTimetableEntry(formData)
              if (result.error) {
                toast.error(result.error)
              } else {
                toast.success('保存しました')
                setSelected(null)
              }
            }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="course_name">授業名 *</Label>
              <Input id="course_name" name="course_name" defaultValue={selectedEntry?.course_name ?? ''} required placeholder="例：線形代数学" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="professor_name">教授名</Label>
              <Input id="professor_name" name="professor_name" defaultValue={selectedEntry?.professor_name ?? ''} placeholder="例：山田教授" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="room">教室</Label>
              <Input id="room" name="room" defaultValue={selectedEntry?.room ?? ''} placeholder="例：A棟201" />
            </div>
            <Button type="submit" className="w-full">保存</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── 授業マッチングダイアログ ── */}
      <Dialog open={matchUsers !== null} onOpenChange={() => setMatchUsers(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>「{matchCourse}」を受けている人</DialogTitle>
          </DialogHeader>
          {isPending ? (
            <p className="text-center text-sm text-muted-foreground py-4">検索中...</p>
          ) : matchUsers && matchUsers.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">他にこの授業を登録しているユーザーはいません</p>
          ) : (
            <ul className="divide-y">
              {matchUsers?.map(u => (
                <li key={u.id}>
                  <Link
                    href={`/user/${u.id}`}
                    className="flex items-center gap-3 py-3 hover:bg-muted/50 transition-colors rounded-lg px-2"
                    onClick={() => setMatchUsers(null)}
                  >
                    <Avatar className="h-9 w-9">
                      {u.avatar_url && <AvatarImage src={u.avatar_url} />}
                      <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                        {u.nickname[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{u.nickname}</p>
                      {u.universities?.name && <p className="text-xs text-muted-foreground">{u.universities.name}</p>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
