
import { createClient } from '@supabase/supabase-js';

// En Vercel/Vite, las variables de entorno se acceden vía process.env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validamos que existan antes de crear el cliente para evitar errores fatales en el navegador
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Configuración incompleta: Faltan las llaves de Supabase. " +
    "Asegúrate de agregar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
