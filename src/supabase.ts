import { createClient } from '@supabase/supabase-js'

// Vercel 설정 믿지 말고 직접 적어버리기!
const supabaseUrl = 'https://ygcltfujdnqiewkvgpze.supabase.co'
const supabaseKey = 'sb_publishable_gNpNZlootvjtyk4xKqLX-w_R8FWjGQV'

export const supabase = createClient(supabaseUrl, supabaseKey)