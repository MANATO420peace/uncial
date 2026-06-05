import { Metadata } from 'next'
import { getReviews } from '@/lib/actions/reviews'
import { getCurrentUser } from '@/lib/actions/user'
import { ReviewsClient } from './ReviewsClient'

export const metadata: Metadata = { title: '楽単レビュー' }

export default async function ReviewsPage() {
  const user = await getCurrentUser()
  const { reviews } = await getReviews(user?.university_id ?? undefined)

  return (
    <ReviewsClient
      initialReviews={reviews}
      universityName={user?.universities?.name}
      currentUserId={user?.id}
    />
  )
}
