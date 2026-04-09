import 'server-only'

import { getServerClient } from '@/lib/supabase'
import { getCurrentUserFromToken } from '@/lib/twitch-api'
import { cookies } from 'next/headers'

type ClipData = {
  id: string
  slug?: string
  title: string
  streamerName: string
  thumbnailUrl?: string
  durationSeconds?: number
  url?: string
}

export async function saveClip(clip: ClipData) {
  'use server'
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('twitch_access_token')?.value
    if (!token) throw new Error('Not authenticated')

    const user = await getCurrentUserFromToken(token)
    const supabase = getServerClient() as any

    // upsert clip into clips table
    const upsertResult = await supabase.from('clips').upsert(
      {
        twitch_clip_id: clip.id,
        slug: clip.slug ?? clip.id,
        title: clip.title,
        broadcaster_name: clip.streamerName,
        thumbnail_url: clip.thumbnailUrl ?? null,
        url: clip.url ?? null,
        duration: clip.durationSeconds ?? null,
      },
      // using any to avoid typing mismatches across supabase versions
      { onConflict: 'twitch_clip_id' },
    )

    const clipRow = upsertResult.data
    const upsertError = upsertResult.error

    if (upsertError) throw upsertError
    const inserted: any = Array.isArray(clipRow) ? clipRow[0] : clipRow
    if (!inserted) throw new Error('Failed to upsert clip')

    // insert saved_clips for this user
    const { error: saveErr } = await supabase.from('saved_clips').insert({
      user_id: user.id,
      clip_id: inserted.id,
      saved_at: new Date().toISOString(),
    })

    if (saveErr) {
      // if constraint violation (already saved), ignore
      if (saveErr.code === '23505' || /duplicate/i.test(saveErr.message || '')) {
        return { ok: true }
      }
      throw saveErr
    }

    return { ok: true }
  } catch (err) {
    console.error('saveClip error', err)
    return { ok: false, error: (err as Error).message }
  }
}

export async function unsaveClip(twitchClipId: string) {
  'use server'
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('twitch_access_token')?.value
    if (!token) throw new Error('Not authenticated')

    const user = await getCurrentUserFromToken(token)
    const supabase = getServerClient()

    // find clip id
    const { data: existingClips, error: findErr } = await supabase
      .from('clips')
      .select('id')
      .eq('twitch_clip_id', twitchClipId)
      .limit(1)

    if (findErr) throw findErr
    if (!existingClips || !existingClips.length) return { ok: true }

    const clipId = existingClips[0].id

    const { error: delErr } = await supabase
      .from('saved_clips')
      .delete()
      .match({ user_id: user.id, clip_id: clipId })

    if (delErr) throw delErr
    return { ok: true }
  } catch (err) {
    console.error('unsaveClip error', err)
    return { ok: false, error: (err as Error).message }
  }
}

export async function getSavedClips() {
  'use server'
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('twitch_access_token')?.value
    if (!token) return { user: null, clips: [] }

    const user = await getCurrentUserFromToken(token)
    const supabase = getServerClient()

    const { data, error } = await supabase
      .from('saved_clips')
      .select('saved_at, clips(*)')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false })

    if (error) throw error

    const clips = (data ?? []).map((row: any) => {
      const c = row.clips
      return {
        id: c.twitch_clip_id,
        slug: c.slug ?? c.twitch_clip_id,
        title: c.title,
        streamer: { id: c.broadcaster_name, name: c.broadcaster_name, avatarUrl: c.thumbnail_url ?? '' },
        views: c.views ?? 0,
        durationSeconds: c.duration ?? 0,
        savedAt: row.saved_at,
      }
    })

    return { user, clips }
  } catch (err) {
    console.error('getSavedClips error', err)
    return { user: null, clips: [], error: (err as Error).message }
  }
}
