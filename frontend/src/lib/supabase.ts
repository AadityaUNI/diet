import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabasePubKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const supabaseURL = import.meta.env.VITE_SUPABASE_URL

export const supabase = createClient<Database>(supabaseURL, supabasePubKey)

