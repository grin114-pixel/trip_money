import { createClient } from '@supabase/supabase-js'

// 1. 여기에 지연님의 진짜 주소를 넣으세요 (따옴표 안에!)
const supabaseUrl = 'https://ygcltfujdnqiewkvgpze.supabase.co'

// 2. 여기에 지연님의 진짜 키를 넣으세요 (따옴표 안에!)
const supabaseKey = 'sb_publishable_gNpNZlootvjtyk4xKqLX-w_R8FWjGQV'

export const supabase = createClient(supabaseUrl, supabaseKey)