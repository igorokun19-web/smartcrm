import { createClient } from "@supabase/supabase-js";

// anon/public key is safe to hardcode — it has no elevated privileges
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "https://scbukcbotjjovbmgdwhw.supabase.co";
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_C6pXhyLeO2MG0vanVzmizg_D-w3innv";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
