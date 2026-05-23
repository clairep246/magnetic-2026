import { createClient as createSupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.106.1'

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ?? 'https://xwilnuzwetnucuajcwys.supabase.co'
const supabaseKey =
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env?.VITE_SUPABASE_ANON_KEY ??
  'sb_publishable_JeMFW9rwAR5mrD4zYqSIZg_Szsnt4Lm'

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local and Vercel.',
    )
  }

  return createSupabaseClient(supabaseUrl, supabaseKey)
}
