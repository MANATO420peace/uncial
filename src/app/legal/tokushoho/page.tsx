import type { Metadata } from 'next'

export const metadata: Metadata = { title: '特定商取引法に基づく表記' }

export default function TokushohoPage() {
  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <h1>特定商取引法に基づく表記</h1>
      <p className="text-muted-foreground text-sm">最終更新日：2026年6月7日</p>

      <table>
        <tbody>
          <tr>
            <th>サービス名</th>
            <td>ユニキャン</td>
          </tr>
          <tr>
            <th>運営者</th>
            <td>個人運営</td>
          </tr>
          <tr>
            <th>所在地</th>
            <td>請求があった場合に遅滞なく開示します</td>
          </tr>
          <tr>
            <th>連絡先</th>
            <td>
              <a href="/contact">お問い合わせフォーム</a>よりご連絡ください
            </td>
          </tr>
          <tr>
            <th>サービスの内容</th>
            <td>大学生向けコミュニティサービス（掲示板・フリマ・時間割等）</td>
          </tr>
          <tr>
            <th>利用料金</th>
            <td>無料（フリマ機能の取引は当事者間で決定）</td>
          </tr>
          <tr>
            <th>支払方法</th>
            <td>フリマ機能の決済方法は出品者・購入者間で合意の上決定</td>
          </tr>
          <tr>
            <th>商品の引き渡し時期</th>
            <td>出品者・購入者間で合意の上決定</td>
          </tr>
          <tr>
            <th>返品・キャンセル</th>
            <td>
              フリマ取引は原則として出品者・購入者間の合意により対応します。
              商品に重大な瑕疵がある場合を除き、返品・返金は当事者間で協議してください。
            </td>
          </tr>
          <tr>
            <th>動作環境</th>
            <td>最新バージョンのChrome・Safari・Edge（スマートフォン・PC対応）</td>
          </tr>
        </tbody>
      </table>

      <p className="text-muted-foreground text-sm mt-6">
        ※ 本サービスのフリマ機能はユーザー間の個人間取引のプラットフォームです。本サービス運営者は取引の当事者ではなく、取引内容・品質・安全性について保証しません。
      </p>
    </article>
  )
}
