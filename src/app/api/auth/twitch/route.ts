import { NextResponse } from 'next/server'

const TWITCH_OAUTH_URL = 'https://id.twitch.tv/oauth2/authorize'

function getRedirectUri() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return `${baseUrl}/api/auth/callback`
}

const SCOPES = ['user:read:follows']

function getClientId() {
  return process.env.TWITCH_CLIENT_ID || process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || ''
}

export async function GET() {
  const clientId = getClientId()
  if (!clientId) {
    return NextResponse.json(
      { error: 'Missing TWITCH_CLIENT_ID or NEXT_PUBLIC_TWITCH_CLIENT_ID' },
      { status: 500 },
    )
  }

  const state = crypto.randomUUID()
  const redirectUri = getRedirectUri()   // ← jetzt dynamisch

  const loginUrl = new URL(TWITCH_OAUTH_URL)
  loginUrl.searchParams.set('client_id', clientId)
  loginUrl.searchParams.set('redirect_uri', redirectUri)
  loginUrl.searchParams.set('response_type', 'code')
  loginUrl.searchParams.set('scope', SCOPES.join(' '))
  loginUrl.searchParams.set('state', state)

  const response = NextResponse.redirect(loginUrl.toString())

  response.cookies.set('twitch_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  })

  return response
}