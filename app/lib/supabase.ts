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
    
    console.log('Attempting login for email:', email); // Debug için

    // Query managers table with exact column names
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('email', email)
      .eq('password', hashedPassword)
      .single();

    if (error) {
      console.error('Database error:', error); // Debug için
      if (error.code === 'PGRST116') {
        return { data: null, error: "E-posta adresi veya şifre hatalı." };
      }
      return { data: null, error: "Veritabanı hatası: " + error.message };
    }

    if (!data) {
      return { data: null, error: "Kullanıcı bulunamadı." };
    }

    // Check durum field
    if (!data.durum) {
      return { data: null, error: "Hesabınız askıya alınmıştır." };
    }

    console.log('Login successful for:', data.email); // Debug için
    console.log('Manager data:', data); // Debug için tüm data'yı göster

    return { 
      data: {
        id: data.id,
        email: data.email,
        // Önce first_name/last_name'i kontrol et, yoksa ad/soyad'ı kullan
        first_name: data.first_name || data.ad || '',
        last_name: data.last_name || data.soyad || '',
        ad: data.ad || data.first_name || '',
        soyad: data.soyad || data.last_name || '',
        durum: data.durum,
        position: data.position || 'Yönetici',
        created_at: data.created_at,
        updated_at: data.updated_at
      }, 
      error: null 
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { 
      data: null, 
      error: "Giriş yapılırken bir hata oluştu: " + (error.message || 'Bilinmeyen hata')
    };
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