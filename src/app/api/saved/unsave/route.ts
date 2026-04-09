import { NextResponse } from 'next/server'
import { unsaveClip } from '@/app/actions/saved'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const clipId = body?.id
    if (!clipId) return NextResponse.json({ ok: false, error: 'missing id' }, { status: 400 })
    const res = await unsaveClip(clipId)
    if (!res || (res as any).ok === false) {
      return NextResponse.json({ ok: false, error: (res as any).error || 'unsave failed' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('api/saved/unsave error', err)
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 })
  }
}
