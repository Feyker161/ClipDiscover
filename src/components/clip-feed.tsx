'use client'

import * as React from 'react'

import type { TwitchFeedClip } from '@/lib/twitch'
import { cn } from '@/lib/utils'
import { TwitchClipPlayer } from '@/components/twitch-clip-player'

function useActiveSnapIndex(
  containerRef: React.RefObject<HTMLElement | null>,
  itemCount: number,
) {
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-clip-item="true"]'))
    if (!items.length) return

    const io = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const idx = Number((entry.target as HTMLElement).dataset.index ?? '0')
          const ratio = entry.intersectionRatio
          if (!best || ratio > best.ratio) best = { index: idx, ratio }
        }
        if (best) setActiveIndex(best.index)
      },
      {
        root: el,
        threshold: [0.35, 0.55, 0.75, 0.9],
      },
    )

    for (const item of items) io.observe(item)
    return () => io.disconnect()
  }, [containerRef, itemCount])

  return activeIndex
}

export function ClipFeed({
  clips,
  className,
  initialIndex = 0,
  topOverlay,
}: {
  clips: TwitchFeedClip[]
  className?: string
  initialIndex?: number
  topOverlay?: React.ReactNode
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [likes, setLikes] = React.useState<Record<string, boolean>>({})
  const [saves, setSaves] = React.useState<Record<string, boolean>>({})

  const activeIndex = useActiveSnapIndex(containerRef, clips.length)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const target = el.querySelector<HTMLElement>(`[data-index="${initialIndex}"]`)
    target?.scrollIntoView({ block: 'start' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!clips.length) {
    return (
      <div
        className={cn(
          'flex h-dvh w-full items-center justify-center bg-[#0F0F0F] px-6 text-center text-white/80',
          className,
        )}
      >
        No clips available right now.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'h-dvh w-full overflow-y-scroll bg-[#0F0F0F]',
        'snap-y snap-mandatory overscroll-y-contain',
        'scrollbar-none',
        className,
      )}
      style={{
        scrollSnapType: 'y mandatory',
      }}
    >
      {topOverlay && <div className="pointer-events-none fixed inset-x-0 top-3 z-40 px-3">{topOverlay}</div>}

      {clips.map((clip, index) => {
        const distance = Math.abs(index - activeIndex)
        const active = index === activeIndex
        const preload = distance === 1

        return (
          <div
            key={clip.id}
            data-clip-item="true"
            data-index={index}
            className="relative h-dvh w-full snap-start snap-always"
            style={{ scrollSnapAlign: 'start' }}
          >
            <TwitchClipPlayer
              clip={clip}
              active={active}
              preload={preload}
              onLikeChange={(liked) =>
                setLikes((prev) => (prev[clip.id] === liked ? prev : { ...prev, [clip.id]: liked }))
              }
              onSaveChange={(saved) =>
                setSaves((prev) => (prev[clip.id] === saved ? prev : { ...prev, [clip.id]: saved }))
              }
            />

            {/* tiny debug-free state keeping (later: persisted user profile) */}
            <span className="sr-only">
              {likes[clip.id] ? 'liked' : 'not-liked'} {saves[clip.id] ? 'saved' : 'not-saved'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

