import { useState, useEffect } from 'react'
import { supabase } from '../supabase' // 아까 만든 설정 파일
import type { Trip } from '../types'

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])

  // 수파베이스에서 여행 목록 실시간으로 가져오기
  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('startDate', { ascending: false })
    
    if (error) console.error('Error:', error)
    else setTrips(data || [])
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  return { trips, setTrips, refresh: fetchTrips }
}