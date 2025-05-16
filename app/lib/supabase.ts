import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createHash } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClientComponentClient();

// SHA-256 hash function
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// Bayi giriş fonksiyonu
export async function signInSeller(email: string, password: string) {
  const supabase = createClientComponentClient();
  const hashedPassword = hashPassword(password);

  try {
    // seller_managers tablosundan kullanıcıyı kontrol et
    const { data: managerData, error: managerError } = await supabase
      .from('seller_managers')
      .select('*')
      .eq('email', email)
      .eq('password', hashedPassword)
      .single();

    if (managerError) {
      throw new Error('Giriş bilgileri hatalı');
    }

    if (!managerData) {
      throw new Error('Kullanıcı bulunamadı');
    }

    if (!managerData.durum) {
      throw new Error('Hesabınız askıya alınmıştır');
    }

    // Bayi bilgilerini çek
    const { data: sellerData, error: sellerError } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', managerData.bayi_id)
      .single();

    if (sellerError) {
      throw new Error('Bayi bilgileri alınamadı');
    }

    // Session verilerini hazırla
    const sessionData = {
      id: managerData.id,
      email: managerData.email,
      ad: managerData.ad,
      soyad: managerData.soyad,
      bayi_id: managerData.bayi_id,
      bayi: sellerData
    };

    // Session verilerini localStorage'a kaydet
    localStorage.setItem('sellerData', JSON.stringify(sessionData));

    return { success: true, data: sessionData };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Giriş yapılırken bir hata oluştu' 
    };
  }
}

export async function signInManager(email: string, password: string) {
  try {
    // Hash the password
    const hashedPassword = hashPassword(password);

    // Query managers table with exact column names
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('email', email)
      .eq('password', hashedPassword)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: "E-posta adresi veya şifre hatalı." };
      }
      throw error;
    }

    // Check durum field
    if (!data.durum) {
      return { data: null, error: "Hesabınız askıya alınmıştır." };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Login error:', error);
    return { data: null, error: "Giriş yapılırken bir hata oluştu." };
  }
}

export async function getManagerData(email: string) {
  try {
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;

    // Check durum field
    if (!data.durum) {
      return { data: null, error: "Hesabınız askıya alınmıştır." };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Manager data error:', error);
    return { data: null, error: "Yönetici bilgileri alınamadı." };
  }
} 