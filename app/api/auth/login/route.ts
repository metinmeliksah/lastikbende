import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const errorMessages: { [key: string]: string } = {
  'Invalid login credentials': 'Geçersiz giriş bilgileri',
  'Email not confirmed': 'E-posta adresi onaylanmamış',
  'Invalid email': 'Geçersiz e-posta adresi',
  'Network error': 'Ağ hatası oluştu, lütfen internet bağlantınızı kontrol edin',
  'Too many requests': 'Çok fazla deneme yaptınız, lütfen daha sonra tekrar deneyin'
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      const errorMessage = errorMessages[error.message] || 'Bir hata oluştu, lütfen daha sonra tekrar deneyin';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu, lütfen daha sonra tekrar deneyin' },
      { status: 500 }
    );
  }
} 