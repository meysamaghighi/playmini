import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  // Match random.playmini.fun or random.localhost:3000
  if (hostname.startsWith('random.')) {
    const url = request.nextUrl.clone();
    // Only rewrite if not already on /random-game
    if (!url.pathname.startsWith('/random-game')) {
      url.pathname = '/random-game' + url.pathname;
      return NextResponse.rewrite(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|manifest|api).*)'],
};
