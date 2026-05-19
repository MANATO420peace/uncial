import { Metadata } from 'next'
import { SearchClient } from './SearchClient'
import { searchAll, getPopularTags } from '@/lib/actions/search'
import { getUniversities } from '@/lib/actions/user'

export const metadata: Metadata = { title: '検索' }

interface Props {
  searchParams: Promise<{ q?: string; university_id?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, university_id } = await searchParams
  const [results, universities, popularTags] = await Promise.all([
    q ? searchAll(q, university_id) : Promise.resolve({ posts: [], reviews: [], users: [] }),
    getUniversities(),
    getPopularTags(),
  ])

  return <SearchClient query={q ?? ''} results={results} universities={universities} selectedUniversityId={university_id ?? ''} popularTags={popularTags} />
}
