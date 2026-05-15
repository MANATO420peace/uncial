export type PostCategory =
  | 'chat'
  | 'course'
  | 'test_homework'
  | 'circle'
  | 'part_time'
  | 'seminar'
  | 'job_hunting'
  | 'buy_sell'
  | 'love'
  | 'event'

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  chat: '雑談',
  course: '履修',
  test_homework: 'テスト・課題',
  circle: 'サークル',
  part_time: 'バイト',
  seminar: 'ゼミ',
  job_hunting: '就活',
  buy_sell: '販売・購入',
  love: '恋愛',
  event: 'イベント',
}

export const POST_CATEGORY_COLORS: Record<PostCategory, string> = {
  chat: 'bg-slate-500',
  course: 'bg-blue-600',
  test_homework: 'bg-red-600',
  circle: 'bg-purple-600',
  part_time: 'bg-orange-500',
  seminar: 'bg-cyan-600',
  job_hunting: 'bg-green-600',
  buy_sell: 'bg-yellow-600',
  love: 'bg-pink-500',
  event: 'bg-teal-600',
}

export interface University {
  id: string
  name: string
  created_at: string
}

export interface User {
  id: string
  nickname: string
  university_id: string | null
  faculty: string | null
  grade: string | null
  avatar_url?: string | null
  is_private?: boolean
  created_at: string
  universities?: University
}

export interface Post {
  id: string
  user_id: string
  university_id: string
  category: PostCategory
  title: string
  content: string
  tags: string[]
  images?: string[] | null
  anonymous: boolean
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  users?: User
  universities?: University
  liked?: boolean
  bookmarked?: boolean
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  content: string
  anonymous: boolean
  likes_count: number
  created_at: string
  users?: User
  liked?: boolean
  replies?: Comment[]
}

export interface Like {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export interface CourseReview {
  id: string
  user_id: string
  university_id: string
  course_name: string
  professor_name: string | null
  difficulty: number
  attendance: number
  report_amount: number
  test_difficulty: number
  recommendation: number
  review_text: string | null
  created_at: string
  users?: User
  universities?: University
}

export type SortOrder = 'new' | 'popular' | 'comments'

export interface PostFilter {
  category?: PostCategory
  university_id?: string
  tags?: string[]
  sort?: SortOrder
  offset?: number
}
