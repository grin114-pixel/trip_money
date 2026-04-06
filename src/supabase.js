import { createClient } from '@supabase/supabase-js'

// 수파베이스 대시보드에서 복사한 값들을 여기에 넣으세요!
const SUPABASE_URL = 'https://ygcltfujdnqiewkvgpze.supabase.co'
const SUPABASE_KEY = 'sb_publishable_gNpNZlootvjtyk4xKqLX-w_R8FWjGQV'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)