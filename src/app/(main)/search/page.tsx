import { Metadata } from 'next'
import { SearchClient } from './SearchClient'
import { searchAll } from '@/lib/actions/search'
import { getUniversities } from '@/lib/actions/user'

export const metadata: Metadata = { title: '検索' }

interface Props {
  searchParams: Promise<{ q?: string; university_id?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, university_id } = await searchParams
  const [results, universities] = await Promise.all([
    q ? searchAll(q, university_id) : Promise.resolve({ posts: [], reviews: [], users: [] }),
    getUniversities(),
  ])

  return <SearchClient query={q ?? ''} results={results} universities={universities} selectedUniversityId={university_id ?? ''} />
}
