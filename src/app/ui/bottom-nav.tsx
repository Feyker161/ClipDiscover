'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Home, Bookmark, User, Users } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type NavItem = {
  id: 'home' | 'following' | 'discover' | 'saved' | 'profile'
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const items: NavItem[] = [
  { id: 'home', label: 'Home / For you', icon: Home },
  { id: 'following', label: 'Following', icon: Users },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'profile', label: 'Profile', icon: User },
]

const idToHref: Record<NavItem['id'], string> = {
  home: '/',
  following: '/following',
  discover: '/discover',
  saved: '/saved',
  profile: '/profile',
}

// TODO: later replace with real routing + saved state + auth (Supabase)
export function BottomNav({
  profileLabel = 'Profile',
}: {
  profileLabel?: string
}) {
  const pathname = usePathname()
  const [active, setActive] = React.useState<NavItem['id']>(() => {
    if (!pathname) return 'home'
    const found = Object.entries(idToHref).find(([, href]) => href === pathname)
    return (found?.[0] as NavItem['id']) ?? 'home'
  })

  React.useEffect(() => {
    if (!pathname) return
    const found = Object.entries(idToHref).find(([, href]) => href === pathname)
    setActive((found?.[0] as NavItem['id']) ?? 'home')
  }, [pathname])

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50',
        'border-t border-white/10 bg-black/55 backdrop-blur',
        'pb-[env(safe-area-inset-bottom)]',
      )}
      aria-label="Bottom navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-between px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.id === active
          const href = idToHref[item.id]
          return (
            <Link key={item.id} href={href} className="flex-1">
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'h-12 w-full flex-1 flex-col gap-1 rounded-xl px-1',
                  'hover:bg-white/5 active:scale-[0.98] transition',
                )}
                onClick={() => setActive(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'size-5',
                    isActive ? 'text-white' : 'text-white/70',
                  )}
                />
                <span
                  className={cn(
                    'text-[11px] font-medium',
                    isActive ? 'text-white' : 'text-white/70',
                  )}
                >
                  {item.id === 'profile' ? profileLabel : item.label}
                </span>
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

