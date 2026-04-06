import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { Trip } from '../types'

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])

  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
    
    if (error) {
      console.error('Error fetching:', error)
    } else {
      setTrips(data || [])
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  return { trips, setTrips, refresh: fetchTrips }
}