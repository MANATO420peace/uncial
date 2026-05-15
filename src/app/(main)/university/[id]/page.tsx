import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getPosts } from '@/lib/actions/posts'
import { PostList } from '@/components/posts/PostList'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: uni } = await supabase
    .from('universities')
    .select('name')
    .eq('id', id)
    .single()
  return { title: uni?.name ?? '大学' }
}

export default async function UniversityPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: uni } = await supabase
    .from('universities')
    .select('*')
    .eq('id', id)
    .single()

  if (!uni) notFound()

  const { posts } = await getPosts({ university_id: id })

  return (
    <div>
      <div className="px-4 py-4 border-b">
        <h1 className="font-bold text-lg">{uni.name}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">コミュニティ</p>
      </div>
      <PostList posts={posts} />
    </div>
  )
}
