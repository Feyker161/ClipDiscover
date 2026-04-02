'use client'

import * as React from 'react'
import { Heart, Volume2, VolumeX, Bookmark } from 'lucide-react'

import type { TwitchFeedClip } from '@/lib/twitch-api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type TwitchClipPlayerProps = {
  clip: TwitchFeedClip
  active: boolean
  preload?: boolean
  onLikeChange?: (liked: boolean) => void
  onSaveChange?: (saved: boolean) => void
}

function formatViews(views: number) {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000) return `${Math.round(views / 1_000)}K`
  return `${views}`
}

export function TwitchClipPlayer({
  clip,
  active,
  preload = false,
  onLikeChange,
  onSaveChange,
}: TwitchClipPlayerProps) {
  const [muted, setMuted] = React.useState(true)
  const [liked, setLiked] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [heartBurstAt, setHeartBurstAt] = React.useState<number | null>(null)
  const lastTapRef = React.useRef<number | null>(null)
  const didInitLikeRef = React.useRef(false)
  const didInitSaveRef = React.useRef(false)
  const onLikeChangeRef = React.useRef<TwitchClipPlayerProps['onLikeChange']>(undefined)
  const onSaveChangeRef = React.useRef<TwitchClipPlayerProps['onSaveChange']>(undefined)

  React.useEffect(() => {
    onLikeChangeRef.current = onLikeChange
    onSaveChangeRef.current = onSaveChange
  }, [onLikeChange, onSaveChange])

  const parent = React.useMemo(() => {
    if (typeof window === 'undefined') return 'localhost'
    return window.location.hostname || 'localhost'
  }, [])

  const iframeSrc = React.useMemo(() => {
    const url = new URL('https://clips.twitch.tv/embed')
    url.searchParams.set('clip', clip.slug)
    url.searchParams.set('parent', parent)
    url.searchParams.set('autoplay', 'true') // Videos sollen immer automatisch abspielen, wenn sie "active" sind
    url.searchParams.set('muted', muted ? 'true' : 'false')
    url.searchParams.set('preload', preload ? 'true' : 'false') // Preload basierend auf Prop
    return url.toString()
  }, [clip.slug, parent, muted, preload]) // 'active' wird hier entfernt, da autoplay immer true ist.

  // `showEmbed` wird nun immer true sein, wenn der Clip aktiv ist oder vorgeladen wird.
  // Dadurch wird der `iframe` immer gerendert, aber nur wenn `active` oder `preload` true ist.
  const showEmbed = active || preload

  React.useEffect(() => {
    // Wenn der Clip aktiv wird, soll er ungemutet abgespielt werden (falls nicht bereits gemutet)
    if (active) {
      setMuted(false)
    }
  }, [active]) // Auf Änderungen von `active` reagieren
  React.useEffect(() => {
    if (!didInitLikeRef.current) {
      didInitLikeRef.current = true
      return
    }
    onLikeChangeRef.current?.(liked)
  }, [liked])

  React.useEffect(() => {
    if (!didInitSaveRef.current) {
      didInitSaveRef.current = true
      return
    }
    onSaveChangeRef.current?.(saved)
  }, [saved])

  const toggleLike = React.useCallback(() => {
    setLiked((prev) => {
      const next = !prev
      if (next) setHeartBurstAt(Date.now())
      return next
    })
  }, [])

  const toggleSave = React.useCallback(() => {
    setSaved((prev) => !prev)
  }, [])

  const onTap = React.useCallback(() => {
    const now = Date.now()
    const last = lastTapRef.current
    lastTapRef.current = now
    if (last && now - last < 260) {
      if (!liked) toggleLike()
      setHeartBurstAt(now) // Herz-Burst auch beim Doppeltippen auslösen
    } else {
      setMuted((m) => !m)
    }
  }, [liked, toggleLike])

  return (
    <section
      className={cn(
        'relative h-dvh w-full overflow-hidden bg-[#0F0F0F] text-white',
        'select-none touch-manipulation',
      )}
      onPointerUp={onTap}
      aria-label={`Twitch clip ${clip.title}`}
    >
      <div className="absolute inset-0">
        {showEmbed && ( // Iframe nur rendern, wenn showEmbed true ist
          <iframe
            key={`${clip.slug}:${parent}`} // Key nur ändern, wenn sich Clip oder Parent ändern
            src={iframeSrc}
            className="h-full w-full"
            allow="autoplay; fullscreen"
            title={clip.title}
          />
        )}
        {!showEmbed && ( // Placeholder, wenn iframe nicht gerendert wird
          <div className="h-full w-full bg-gradient-to-b from-[#141414] to-[#0F0F0F]" />
        )}
      </div>

      {/* subtle top scrim */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
      {/* subtle bottom scrim */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/70 to-transparent" />

      {/* right-side actions */}
      <aside className="absolute bottom-28 right-3 flex flex-col items-center gap-3">
        <Button
          type="button"
          size="icon-lg"
          variant="ghost"
          className={cn(
            'h-12 w-12 rounded-full bg-black/30 backdrop-blur',
            'hover:bg-black/40 active:scale-95 transition-transform',
          )}
          onClick={(e) => {
            e.stopPropagation()
            toggleLike()
          }}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Heart
            className={cn(
              'size-6 transition-transform',
              liked ? 'fill-[#ff2d55] text-[#ff2d55] scale-110' : 'text-white',
            )}
          />
        </Button>

        <Button
          type="button"
          size="icon-lg"
          variant="ghost"
          className={cn(
            'h-12 w-12 rounded-full bg-black/30 backdrop-blur',
            'hover:bg-black/40 active:scale-95 transition-transform',
          )}
          onClick={(e) => {
            e.stopPropagation()
            toggleSave()
          }}
          aria-pressed={saved}
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <Bookmark
            className={cn(
              'size-6 transition-transform',
              saved ? 'fill-white text-white scale-110' : 'text-white',
            )}
          />
        </Button>

        <Button
          type="button"
          size="icon-lg"
          variant="ghost"
          className={cn(
            'h-12 w-12 rounded-full bg-black/30 backdrop-blur',
            'hover:bg-black/40 active:scale-95 transition-transform',
          )}
          onClick={(e) => {
            e.stopPropagation()
            setMuted((m) => !m)
          }}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX className="size-6" /> : <Volume2 className="size-6" />}
        </Button>
      </aside>

      {/* bottom info overlay */}
      <footer className="absolute bottom-16 left-0 right-0 px-4 pb-4">
        <div className="flex items-end gap-3">
          <Avatar className="size-10 ring-2 ring-white/20">
            <AvatarImage src={clip.streamer.avatarUrl} alt={clip.streamer.name} />
            <AvatarFallback>{clip.streamer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-base font-semibold">@{clip.streamer.name}</p>
              <span className="text-xs text-white/70">
                {formatViews(clip.views)} views • {clip.durationSeconds}s
              </span>
            </div>
            <h2 className="mt-1 line-clamp-2 text-lg font-bold leading-snug tracking-tight">
              {clip.title}
            </h2>
            <p className="mt-1 text-xs text-white/60">
              Tap to {muted ? 'unmute' : 'mute'} • Double-tap to like
            </p>
          </div>
        </div>
      </footer>

      {/* double-tap heart burst */}\
      {heartBurstAt && (
        <div
          key={heartBurstAt}
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'animate-[heart-pop_520ms_ease-out_forwards]',
          )}
        >
          <Heart className="size-24 fill-[#ff2d55] text-[#ff2d55] drop-shadow-[0_10px_30px_rgba(0,0,0,0.55)]" />
        </div>
      )}

      <style jsx>{`
        @keyframes heart-pop {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.55);
          }
          12% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -58%) scale(1.25);
          }
        }
      `}</style>
    </section>
  )
}

