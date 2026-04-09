export type ClipDataClient = {
  id: string
  slug?: string
  title: string
  streamerName: string
  thumbnailUrl?: string
  durationSeconds?: number
  url?: string
}

export async function saveClipClient(clip: ClipDataClient) {
  const res = await fetch('/api/saved/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clip),
  })
  return res.json()
}

export async function unsaveClipClient(id: string) {
  const res = await fetch('/api/saved/unsave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  return res.json()
}
