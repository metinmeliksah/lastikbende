import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInManager(email: string, password: string) {
  try {
    const { data, error } = await supabase
      .from('managers')
      .select('id, email, first_name, last_name, position')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getManagerData(email: string) {
  try {
    const { data, error } = await supabase
      .from('managers')
      .select('id, email, first_name, last_name, position')
      .eq('email', email)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
} 