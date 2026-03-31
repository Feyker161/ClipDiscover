import 'server-only'

import { cookies } from 'next/headers'

const TWITCH_HELIX_BASE = 'https://api.twitch.tv/helix'
const FALLBACK_AVATAR =
  'https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png'

export type TwitchFeedClip = {
  id: string
  slug: string
  title: string
  streamer: {
    id: string
    name: string
    avatarUrl: string
  }
  views: number
  durationSeconds: number
}

export type TwitchAuthUser = {
  id: string
  login: string
  displayName: string
  profileImageUrl: string
}

export type TwitchFollowedChannel = {
  broadcasterId: string
  broadcasterLogin: string
  broadcasterName: string
}

function getTwitchClientId() {
  return process.env.TWITCH_CLIENT_ID || process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || ''
}

async function getAccessTokenFromCookie() {
  const cookieStore = await cookies()
  return cookieStore.get('twitch_access_token')?.value ?? null
}

async function helixFetch<T>(
  path: string,
  token: string,
  query: Record<string, string | number | Array<string | number>> = {},
): Promise<T> {
  const clientId = getTwitchClientId()
  if (!clientId) throw new Error('Missing TWITCH_CLIENT_ID or NEXT_PUBLIC_TWITCH_CLIENT_ID')

  const url = new URL(`${TWITCH_HELIX_BASE}${path}`)
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item))
    } else {
      url.searchParams.set(key, String(value))
    }
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Client-Id': clientId,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Twitch API ${path} failed with ${res.status}`)
  }

  return (await res.json()) as T
}

export async function getCurrentUserFromToken(token?: string): Promise<TwitchAuthUser> {
  const accessToken = token ?? (await getAccessTokenFromCookie())
  if (!accessToken) throw new Error('No Twitch access token')

  const json = await helixFetch<{
    data: Array<{
      id: string
      login: string
      display_name: string
      profile_image_url: string
    }>
  }>('/users', accessToken)

  const user = json.data[0]
  if (!user) throw new Error('No Twitch user found')
  return {
    id: user.id,
    login: user.login,
    displayName: user.display_name,
    profileImageUrl: user.profile_image_url,
  }
}

export async function getFollowedChannels(userId: string, token?: string): Promise<TwitchFollowedChannel[]> {
  const accessToken = token ?? (await getAccessTokenFromCookie())
  if (!accessToken) throw new Error('No Twitch access token')

  const json = await helixFetch<{
    data: Array<{
      broadcaster_id: string
      broadcaster_login: string
      broadcaster_name: string
    }>
  }>('/channels/followed', accessToken, { user_id: userId, first: 100 })

  return json.data.map((channel) => ({
    broadcasterId: channel.broadcaster_id,
    broadcasterLogin: channel.broadcaster_login,
    broadcasterName: channel.broadcaster_name,
  }))
}

export async function getClipsForBroadcaster(
  broadcasterId: string,
  limit = 20,
  token?: string,
): Promise<TwitchFeedClip[]> {
  const accessToken = token ?? (await getAccessTokenFromCookie())
  if (!accessToken) throw new Error('No Twitch access token')

  const json = await helixFetch<{
    data: Array<{
      id: string
      url: string
      title: string
      creator_id: string
      creator_name: string
      view_count: number
      duration: number
    }>
  }>('/clips', accessToken, {
    broadcaster_id: broadcasterId,
    first: Math.max(1, Math.min(limit, 100)),
  })

  return json.data.map((clip) => ({
    id: clip.id,
    slug: clip.url.split('/').pop() ?? clip.id,
    title: clip.title,
    streamer: {
      id: clip.creator_id || broadcasterId,
      name: clip.creator_name || 'unknown',
      avatarUrl: '',
    },
    views: clip.view_count,
    durationSeconds: Math.round(clip.duration),
  }))
}

async function getUsersByIds(ids: string[], token: string) {
  const uniqueIds = Array.from(new Set(ids)).slice(0, 100)
  if (!uniqueIds.length) return {}

  const json = await helixFetch<{
    data: Array<{
      id: string
      display_name: string
      profile_image_url: string
    }>
  }>('/users', token, { id: uniqueIds })

  return json.data.reduce<Record<string, { displayName: string; avatarUrl: string }>>(
    (acc, user) => {
      acc[user.id] = {
        displayName: user.display_name,
        avatarUrl: user.profile_image_url,
      }
      return acc
    },
    {},
  )
}

export async function getPersonalizedFeed() {
  const token = await getAccessTokenFromCookie()
  if (!token) return { user: null, clips: [] as TwitchFeedClip[] }

  const user = await getCurrentUserFromToken(token)
  const followed = await getFollowedChannels(user.id, token)
  const channels = followed.slice(0, 8)
  if (!channels.length) return { user, clips: [] as TwitchFeedClip[] }

  const clipBatches = await Promise.all(
    channels.map((channel) => getClipsForBroadcaster(channel.broadcasterId, 12, token)),
  )
  const profileMap = await getUsersByIds(channels.map((channel) => channel.broadcasterId), token)

  const deduped = Array.from(
    new Map(clipBatches.flat().map((clip) => [clip.id, clip])).values(),
  ).map((clip) => {
    const profile = profileMap[clip.streamer.id]
    return {
      ...clip,
      streamer: {
        id: clip.streamer.id,
        name: profile?.displayName ?? clip.streamer.name,
        avatarUrl: profile?.avatarUrl ?? clip.streamer.avatarUrl ?? FALLBACK_AVATAR,
      },
    }
  })

  deduped.sort((a, b) => b.views - a.views)
  return { user, clips: deduped }
}

