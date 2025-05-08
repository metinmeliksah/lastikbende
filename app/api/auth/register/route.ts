import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const errorMessages: { [key: string]: string } = {
  'User already registered': 'Bu e-posta adresi zaten kayıtlı',
  'Password should be at least 6 characters': 'Şifre en az 6 karakter olmalıdır',
  'Invalid email': 'Geçersiz e-posta adresi',
  'Email not confirmed': 'E-posta adresi onaylanmamış',
  'Invalid login credentials': 'Geçersiz giriş bilgileri',
  'Email rate limit exceeded': 'E-posta gönderim limiti aşıldı, lütfen daha sonra tekrar deneyin',
  'Network error': 'Ağ hatası oluştu, lütfen internet bağlantınızı kontrol edin'
};

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone, marketingAccepted } = await request.json();
    
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          phone,
          marketingAccepted
        }
      }
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