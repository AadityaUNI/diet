import { createClient } from '@supabase/supabase-js'

const supabasePubKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const supabaseURL = import.meta.env.VITE_SUPABASE_URL

export const supabase = createClient(supabaseURL, supabasePubKey)

