import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // CORS kontrolü için OPTIONS isteklerini direkt geçir
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-From-Page',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // API yollarını saptama
  const isSiparisCreatePath = request.nextUrl.pathname === '/api/siparis/create' || 
                             request.nextUrl.pathname === '/api/siparis/create/';
  const isSiparisGetPath = request.nextUrl.pathname === '/api/siparis' && 
                          request.method === 'GET';
                          
  // Onay sayfasından gelen istekleri daha güvenilir şekilde tespit et
  const fromPageHeader = request.headers.get('x-from-page');
  const referer = request.headers.get('referer');
  const searchParams = request.nextUrl.searchParams;
  
  // Onay sayfasından gelme kriterleri:
  // 1. X-From-Page header'ı 'onay' ise
  // 2. Referer /sepet/odeme/onay içeriyorsa
  // 3. URL'de siparisId parametresi varsa ve sayfa onay sayfasından erişiliyorsa
  const isOnayPage = 
    fromPageHeader === 'onay' || 
    (referer && referer.includes('/sepet/odeme/onay')) ||
    (isSiparisGetPath && searchParams.has('siparisId') && 
    (fromPageHeader === 'onay' || (referer && referer.includes('/sepet/odeme'))));

  console.log('Middleware: İstek yolu:', request.nextUrl.pathname);
  console.log('Middleware: İstek metodu:', request.method);
  console.log('Middleware: X-From-Page header:', fromPageHeader);
  console.log('Middleware: Referer:', referer);
  console.log('Middleware: Sorgu parametreleri:', request.nextUrl.searchParams.toString());
  console.log('Middleware: Onay sayfasından mı:', !!isOnayPage);

  // Sipariş detay sorgulama için özel işlem
  if (isSiparisGetPath) {
    const siparisId = request.nextUrl.searchParams.get('siparisId');
    console.log('Middleware: Sipariş detayı isteniyor. SiparisId:', siparisId);
    
    // Onay sayfasından gelen istekler için özel izin
    if (isOnayPage) {
      console.log('Middleware: Onay sayfasından gelen istek - geçiş izni veriliyor');
      
      // CORS header'larını ekle
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-From-Page');
      
      return response;
    }
  }

  // Sipariş oluşturma için token kontrolü
  if (isSiparisCreatePath) {
    // Authorization header varsa direkt geçir
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('Middleware: Geçerli Authorization header bulundu');
      
      // CORS header'larını ekle
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    }
    
    console.log('Middleware: Geçerli Authorization header bulunamadı');
  }

  // Refresh session if expired
  const { data: { session }, error } = await supabase.auth.getSession();
  
  // Özel yollar için oturum kontrolünü devre dışı bırak
  if ((isSiparisGetPath && isOnayPage)) {
    console.log('Middleware: Onay sayfası için oturum kontrolü devre dışı - istek doğrudan API\'ye yönlendiriliyor');
    
    // CORS header'larını ekle
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-From-Page');
    
    return response;
  }
  
  // Korunan yollar için oturum kontrolü
  if ((error || !session) && (
    request.nextUrl.pathname.startsWith('/api/user/') || 
    (request.nextUrl.pathname.startsWith('/api/siparis') && !isOnayPage)
  )) {
    console.log('Middleware: Oturum bulunamadı veya hata oluştu. Yol:', request.nextUrl.pathname);
    console.log('Middleware: Oturum durumu:', !!session);
    if (error) {
      console.log('Middleware: Hata detayı:', error.message);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Oturum doğrulanamadı. Lütfen giriş yapın.', 
        status: 401,
        details: error ? error.message : 'Oturum bulunamadı'
      },
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-From-Page'
        }
      }
    );
  }

  // CORS header'larını her durumda ekle
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-From-Page');
  
  return response;
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