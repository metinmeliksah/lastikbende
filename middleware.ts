import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if expired
  const { data: { session }, error } = await supabase.auth.getSession();

  // Check if the path exactly matches '/api/siparis/create/' (with or without trailing slash)
  const isSiparisCreatePath = request.nextUrl.pathname === '/api/siparis/create' || 
                             request.nextUrl.pathname === '/api/siparis/create/';

  // If there's an error or no session on protected routes, return 401
  if ((error || !session) && (
    request.nextUrl.pathname.startsWith('/api/user/') || 
    request.nextUrl.pathname.startsWith('/api/siparis') ||
    isSiparisCreatePath
  )) {
    console.log('Middleware: Oturum bulunamadı veya hata oluştu. Yol:', request.nextUrl.pathname);
    console.log('Middleware: Oturum durumu:', !!session);
    console.log('Middleware: Hata:', error);
    
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
    '/api/siparis/:path*',
    '/api/siparis/create',
    '/api/siparis',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 