import { NextResponse } from 'next/server'
import { saveClip } from '@/app/actions/saved'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await saveClip(body)
    if (!res || (res as any).ok === false) {
      return NextResponse.json({ ok: false, error: (res as any).error || 'save failed' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('api/saved/save error', err)
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 })
  }
}
