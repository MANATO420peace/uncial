import { Metadata } from 'next'
import { SearchClient } from './SearchClient'
import { searchAll } from '@/lib/actions/search'

export const metadata: Metadata = { title: '検索' }

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const results = q ? await searchAll(q) : { posts: [], reviews: [], users: [] }

  return <SearchClient query={q ?? ''} results={results} />
}
