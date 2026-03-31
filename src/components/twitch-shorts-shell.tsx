'use client'

import * as React from 'react'
import { AlertCircle, Loader2, LogIn, LogOut } from 'lucide-react'

import { ClipFeed } from '@/components/clip-feed'
import { mockClips } from '@/lib/mock-clips'
import type { TwitchAuthUser, TwitchFeedClip } from '@/lib/twitch-api'
import { BottomNav } from '@/app/ui/bottom-nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
type TwitchShortsShellProps = {
  initialUser: TwitchAuthUser | null
  initialClips: TwitchFeedClip[]
  initialError?: string | null
}

export function TwitchShortsShell({
  initialUser,
  initialClips,
  initialError = null,
}: TwitchShortsShellProps) {
  const [user, setUser] = React.useState<TwitchAuthUser | null>(initialUser)
  const [clips, setClips] = React.useState<TwitchFeedClip[]>(initialClips)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(initialError)
  const isAuthenticated = !!user

  React.useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false

    async function refreshFeed() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/twitch/feed', { cache: 'no-store' })
        if (!res.ok) throw new Error('Feed refresh failed')
        const data = (await res.json()) as { user: TwitchAuthUser; clips: TwitchFeedClip[] }
        if (cancelled) return
        setUser(data.user)
        setClips(data.clips)
      } catch {
        if (cancelled) return
        setError('Twitch Feed konnte nicht aktualisiert werden.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void refreshFeed()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const loginBanner = !isAuthenticated ? (
    <Card className="pointer-events-auto border-white/15 bg-black/70 p-3 text-white shadow-xl backdrop-blur">
      <p className="text-sm font-semibold">Melde dich an, um deine persönlichen Clips zu sehen</p>
      <p className="mt-1 text-xs text-white/70">
        Wir zeigen dir danach die besten Clips deiner gefolgten Twitch Channels.
      </p>
      <Button asChild className="mt-3 w-full">
        <a href="/api/auth/twitch">
          <LogIn className="mr-2 size-4" />
          Mit Twitch anmelden
        </a>
      </Button>
    </Card>
  ) : null

  return (
    <main className="relative h-dvh w-full bg-[#0F0F0F] text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-end p-3">
        {!isAuthenticated ? (
          <Button asChild className="pointer-events-auto">
            <a href="/api/auth/twitch">
              <LogIn className="mr-2 size-4" />
              Mit Twitch anmelden
            </a>
          </Button>
        ) : (
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-2 py-1 backdrop-blur">
            <Avatar className="size-7">
              <AvatarImage src={user?.profileImageUrl} alt={user?.displayName ?? 'User'} />
              <AvatarFallback>{(user?.displayName ?? 'U').slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="max-w-24 truncate text-xs font-semibold">{user?.displayName ?? 'Twitch'}</span>
            <Button asChild size="icon-sm" variant="ghost" aria-label="Logout">
              <a href="/api/auth/logout">
                <LogOut className="size-4" />
              </a>
            </Button>
          </div>
        )}
      </div>

      {loading && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <Card className="flex items-center gap-2 border-white/20 bg-black/75 px-4 py-3 text-white">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Lade Twitch Clips...</span>
          </Card>
        </div>
      )}

      {error && (
        <div className="pointer-events-none fixed left-3 right-3 top-16 z-50">
          <Card className="flex items-start gap-2 border-red-400/40 bg-red-950/80 p-3 text-red-100">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p className="text-xs">{error}</p>
          </Card>
        </div>
      )}

      <ClipFeed clips={clips.length ? clips : mockClips} className="pb-16" topOverlay={loginBanner} />
      <BottomNav profileLabel={user?.displayName ? 'Me' : 'Profile'} />
    </main>
  )
}

