import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if expired
  const { data: { session }, error } = await supabase.auth.getSession();

  // If there's an error or no session on protected routes, redirect to login
  if ((error || !session) && request.nextUrl.pathname.startsWith('/api/user/')) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return res;
}

export const config = {
  matcher: [
    '/api/user/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 