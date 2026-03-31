import { NextResponse } from 'next/server'

import { getPersonalizedFeed } from '@/lib/twitch-api'

export async function GET() {
  try {
    const result = await getPersonalizedFeed()
    if (!result.user) {
      return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    }
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'unknown_error' },
      { status: 500 },
    )
  }
}

