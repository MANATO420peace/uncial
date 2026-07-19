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
  test_homework: 'bg-rose-600',
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
  domain?: string | null
  created_at: string
  university_domains?: { domain: string }[]
}

export interface User {
  id: string
  nickname: string
  university_id: string | null
  faculty: string | null
  grade: string | null
  avatar_url?: string | null
  is_private?: boolean
  bio?: string | null
  instagram_url?: string | null
  x_url?: string | null
  tiktok_url?: string | null
  created_at: string
  universities?: University
}

export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor'

export const ITEM_CONDITION_LABELS: Record<ItemCondition, string> = {
  new: '未使用・新品',
  like_new: 'ほぼ未使用',
  good: '良好',
  fair: 'やや傷あり',
  poor: '傷・汚れあり',
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
  location?: string | null
  anonymous: boolean
  likes_count: number
  comments_count: number
  // 販売・購入専用
  price?: number | null
  item_condition?: ItemCondition | null
  item_category?: string | null
  price_negotiable?: boolean | null
  delivery_method?: string | null
  sold_at?: string | null
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
