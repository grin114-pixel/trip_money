import { createClient } from '@supabase/supabase-js'

// Vercel 설정창에 넣은 대문자 이름(Key)을 그대로 불러옵니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 만약 설정값이 없다면 에러를 내보내서 범인을 찾게 해줍니다.
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다!')
}

export const supabase = createClient(supabaseUrl, supabaseKey)