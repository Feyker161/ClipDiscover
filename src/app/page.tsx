import { TwitchShortsShell } from '@/components/twitch-shorts-shell'
import { mockClips } from '@/lib/mock-clips'
import { getPersonalizedFeed } from '@/lib/twitch-api'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  let initialUser = null
  let initialClips = mockClips
  let initialError: string | null = error ? `OAuth error: ${error}` : null

  try {
    const feed = await getPersonalizedFeed()
    if (feed.user) {
      initialUser = feed.user
      initialClips = feed.clips.length ? feed.clips : mockClips
    }
  } catch {
    initialError = initialError ?? 'Twitch Daten konnten nicht geladen werden.'
  }

  return (
    <TwitchShortsShell
      initialUser={initialUser}
      initialClips={initialClips}
      initialError={initialError}
    />
  )
}
