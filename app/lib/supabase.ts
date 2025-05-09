import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInManager(email: string, password: string) {
  try {
    const { data, error } = await supabase
      .from('managers')
      .select('id, email, ad, soyad, role, durum')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error) throw error;
    
    // Durum kontrolü yap
    if (data && data.durum === false) {
      return { data: null, error: "Hesabınız askıya alınmıştır. Erişiminiz kısıtlandı." };
    }
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getManagerData(email: string) {
  try {
    const { data, error } = await supabase
      .from('managers')
      .select('id, email, ad, soyad, role')
      .eq('email', email)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
} 