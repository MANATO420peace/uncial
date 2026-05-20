/**
 * セッション内でいいね状態を保持するクライアント側ストア
 * モジュールレベルのMapなので、ページ遷移しても値が消えない
 */

const likedMap = new Map<string, boolean>()
const countMap = new Map<string, number>()

/** サーバーから取得した初期値とストアをマージして返す */
export function getLikeState(postId: string, serverLiked: boolean, serverCount: number) {
  return {
    liked: likedMap.has(postId) ? likedMap.get(postId)! : serverLiked,
    count: countMap.has(postId) ? countMap.get(postId)! : serverCount,
  }
}

/** いいね操作後に呼び出してストアを更新する */
export function setLikeState(postId: string, liked: boolean, count: number) {
  likedMap.set(postId, liked)
  countMap.set(postId, count)
}
