import { AlertTriangle } from 'lucide-react'

export function SetupBanner() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4 space-y-2">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-semibold">Supabase 未設定</span>
      </div>
      <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1.5 leading-relaxed">
        <p>以下の手順で設定してください：</p>
        <ol className="list-decimal list-inside space-y-1 ml-1">
          <li>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              supabase.com
            </a>{' '}
            で無料プロジェクトを作成
          </li>
          <li>
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">supabase/schema.sql</code>{' '}
            を SQL Editor で実行
          </li>
          <li>
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">.env.local</code>{' '}
            に URL と Anon Key を設定
          </li>
          <li>サーバーを再起動（<code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">npm run dev</code>）</li>
        </ol>
      </div>
    </div>
  )
}
