'use client'

import { useState, useTransition } from 'react'
import { runNotificationDiagnostics } from '@/lib/actions/debug'
import { Button } from '@/components/ui/button'

export function NotificationDebug() {
  const [results, setResults] = useState<{ label: string; ok: boolean; detail: string }[] | null>(null)
  const [isPending, start] = useTransition()

  function run() {
    start(async () => {
      const res = await runNotificationDiagnostics()
      if ('steps' in res) setResults(res.steps)
    })
  }

  return (
    <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">🔧 通知システム診断</p>
          <p className="text-xs text-muted-foreground">何が失敗しているか確認できます</p>
        </div>
        <Button size="sm" variant="outline" onClick={run} disabled={isPending}>
          {isPending ? '診断中...' : '診断開始'}
        </Button>
      </div>

      {results && (
        <ul className="space-y-1.5 text-xs">
          {results.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className={r.ok ? 'text-green-500' : 'text-red-500'}>
                {r.ok ? '✓' : '✗'}
              </span>
              <div>
                <span className="font-medium">{r.label}</span>
                <span className="text-muted-foreground ml-1">— {r.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
