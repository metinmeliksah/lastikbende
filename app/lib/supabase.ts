import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SHA-256 hash function
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
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