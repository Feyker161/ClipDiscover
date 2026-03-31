import { NextRequest, NextResponse } from 'next/server'

const REDIRECT_URI = 'http://localhost:3000/api/auth/callback'
const TOKEN_URL = 'https://id.twitch.tv/oauth2/token'

function getClientId() {
  return process.env.TWITCH_CLIENT_ID || process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || ''
}

export async function GET(request: NextRequest) {
  const clientId = getClientId()
  const clientSecret = process.env.TWITCH_CLIENT_SECRET || ''
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/?error=missing_twitch_env', request.url))
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  if (error) return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}`, request.url))
  if (!code || !state) return NextResponse.redirect(new URL('/?error=missing_code', request.url))

  const cookieState = request.cookies.get('twitch_oauth_state')?.value

  if (!cookieState || cookieState !== state) {
    return NextResponse.redirect(new URL('/?error=invalid_state', request.url))
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
  })

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    body: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    cache: 'no-store',
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url))
  }

  const json = (await tokenRes.json()) as {
    access_token: string
    refresh_token?: string
    expires_in: number
  }

  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.set('twitch_access_token', json.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: json.expires_in,
  })
  if (json.refresh_token) {
    response.cookies.set('twitch_refresh_token', json.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  }
  response.cookies.delete('twitch_oauth_state')
  return response
}

