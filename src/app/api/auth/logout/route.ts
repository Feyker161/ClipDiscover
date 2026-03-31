import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.delete('twitch_access_token')
  response.cookies.delete('twitch_refresh_token')
  response.cookies.delete('twitch_oauth_state')
  return response
}

