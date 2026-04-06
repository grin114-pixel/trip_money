import { createClient } from '@supabase/supabase-js'

// 1. 주소와 키를 변수에 담습니다 (따옴표 필수!)
const supabaseUrl = 'https://github.com/grin114-pixel/trip_money.git'
const supabaseKey = 'git@github.com:grin114-pixel/trip_money.git
'

// 2. 위에서 만든 변수를 사용해서 금고를 엽니다
export const supabase = createClient(supabaseUrl, supabaseKey)