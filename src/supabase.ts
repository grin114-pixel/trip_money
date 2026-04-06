import { createClient } from '@supabase/supabase-js'

// ⚠️ 아래 '작은따옴표' 안에 지연님의 진짜 정보를 넣으세요!
const supabaseUrl = 'https://ygcltfujdnqiewkvgpze.supabase.co'
const supabaseKey = 'sb_publishable_gNpNZlootvjtyk4xKqLX-w_R8FWjGQV'

export const supabase = createClient(supabaseUrl, supabaseKey)