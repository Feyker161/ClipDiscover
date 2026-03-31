import axios from 'axios'

const TWITCH_OAUTH_BASE = 'https://id.twitch.tv/oauth2'
const TWITCH_HELIX_BASE = 'https://api.twitch.tv/helix'

export const TWITCH_TOKEN_STORAGE_KEY = 'twitch_user_access_token'

export type TwitchUser = {
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

export type TwitchUserProfile = {
  id: string
  displayName: string
  profileImageUrl: string
}

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

type TwitchApiHeaders = {
  Authorization: string
  'Client-Id': string
}

export function buildTwitchLoginUrl(args: {
  clientId: string
  redirectUri: string
  scopes?: string[]
}) {
  const url = new URL(`${TWITCH_OAUTH_BASE}/authorize`)
  url.searchParams.set('client_id', args.clientId)
  url.searchParams.set('redirect_uri', args.redirectUri)
  url.searchParams.set('response_type', 'token')
  url.searchParams.set('scope', (args.scopes ?? ['user:read:follows']).join(' '))
  return url.toString()
}

export function parseTwitchAccessTokenFromHash(hash: string) {
  if (!hash.startsWith('#')) return null
  const params = new URLSearchParams(hash.slice(1))
  const token = params.get('access_token')
  return token || null
}

function createHelixHeaders(accessToken: string, clientId: string): TwitchApiHeaders {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Client-Id': clientId,
  }
}

export async function getCurrentUser(accessToken: string, clientId: string): Promise<TwitchUser> {
  const res = await axios.get<{ data: Array<{ id: string; login: string; display_name: string; profile_image_url: string }> }>(
    `${TWITCH_HELIX_BASE}/users`,
    {
      headers: createHelixHeaders(accessToken, clientId),
    },
  )
  const user = res.data.data[0]
  if (!user) throw new Error('No Twitch user returned')
  return {
    id: user.id,
    login: user.login,
    displayName: user.display_name,
    profileImageUrl: user.profile_image_url,
  }
}

export async function getFollowedChannels(
  userId: string,
  accessToken: string,
  clientId: string,
): Promise<TwitchFollowedChannel[]> {
  const res = await axios.get<{
    data: Array<{
      broadcaster_id: string
      broadcaster_login: string
      broadcaster_name: string
    }>
  }>(`${TWITCH_HELIX_BASE}/channels/followed`, {
    params: {
      user_id: userId,
      first: 100,
    },
    headers: createHelixHeaders(accessToken, clientId),
  })

  return res.data.data.map((item) => ({
    broadcasterId: item.broadcaster_id,
    broadcasterLogin: item.broadcaster_login,
    broadcasterName: item.broadcaster_name,
  }))
}

export async function getClipsForBroadcaster(
  broadcasterId: string,
  accessToken: string,
  clientId: string,
  limit = 20,
): Promise<TwitchFeedClip[]> {
  const res = await axios.get<{
    data: Array<{
      id: string
      url: string
      title: string
      creator_id: string
      creator_name: string
      thumbnail_url: string
      view_count: number
      duration: number
    }>
  }>(`${TWITCH_HELIX_BASE}/clips`, {
    params: {
      broadcaster_id: broadcasterId,
      first: Math.max(1, Math.min(limit, 100)),
    },
    headers: createHelixHeaders(accessToken, clientId),
  })

  return res.data.data.map((clip) => {
    const slug = clip.url.split('/').pop() ?? clip.id
    return {
      id: clip.id,
      slug,
      title: clip.title,
      streamer: {
        id: clip.creator_id || broadcasterId,
        name: clip.creator_name || 'unknown',
        avatarUrl: '',
      },
      views: clip.view_count,
      durationSeconds: Math.round(clip.duration),
    }
  })
}

export async function getUsersByIds(
  ids: string[],
  accessToken: string,
  clientId: string,
): Promise<Record<string, TwitchUserProfile>> {
  if (!ids.length) return {}
  const unique = Array.from(new Set(ids)).slice(0, 100)
  const res = await axios.get<{
    data: Array<{
      id: string
      display_name: string
      profile_image_url: string
    }>
  }>(`${TWITCH_HELIX_BASE}/users`, {
    params: {
      id: unique,
    },
    headers: createHelixHeaders(accessToken, clientId),
  })

  return res.data.data.reduce<Record<string, TwitchUserProfile>>((acc, item) => {
    acc[item.id] = {
      id: item.id,
      displayName: item.display_name,
      profileImageUrl: item.profile_image_url,
    }
    return acc
  }, {})
}

export async function getClientCredentialsAccessToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const res = await axios.post<{ access_token: string }>(
    `${TWITCH_OAUTH_BASE}/token`,
    undefined,
    {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      },
    },
  )
  return res.data.access_token
}

