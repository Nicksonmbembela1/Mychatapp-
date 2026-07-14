import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Tunatumia hii kubadilisha username -> email fake
export const formatEmail = (username: string) => `${username.toLowerCase()}@myapp.local`
