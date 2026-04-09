import React from 'react'
export const dynamic = 'force-dynamic'
import { getSavedClips } from '@/app/actions/saved'
import { ClipFeed } from '@/components/clip-feed'
import { BottomNav } from '@/app/ui/bottom-nav'

export default async function SavedPage() {
  const { user, clips } = await getSavedClips()

  return (
    <main className="relative h-dvh w-full bg-[#0F0F0F] text-white">
      {!user ? (
        <div className="flex h-dvh items-center justify-center p-6 text-center">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Bitte mit Twitch anmelden</h3>
            <p className="text-sm text-white/70">Nur gespeicherte Clips deines Accounts sind hier sichtbar.</p>
            <div className="mt-4">
              <a className="underline" href="/api/auth/twitch">
                Mit Twitch anmelden
              </a>
            </div>
          </div>
        </div>
      ) : clips.length === 0 ? (
        <div className="flex h-dvh items-center justify-center p-6 text-center">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Keine gespeicherten Clips</h3>
            <p className="text-sm text-white/70">Speichere Clips, um sie später hier anzusehen.</p>
          </div>
        </div>
      ) : (
        <ClipFeed clips={clips} className="pb-16" />
      )}

      <BottomNav />
    </main>
  )
}
