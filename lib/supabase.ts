
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Faltan las credenciales de Supabase. Asegúrate de configurar las variables de entorno en Render/Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
