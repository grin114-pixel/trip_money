import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Trip } from '../types'
import { loadTrips, saveTrips } from '../storage'
import { TripsContext } from './tripsContext'

export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips())

  useEffect(() => {
    saveTrips(trips)
  }, [trips])

  const updateTrip = useCallback((id: string, updater: (t: Trip) => Trip) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? updater(t) : t)))
  }, [])

  const value = useMemo(
    () => ({ trips, setTrips, updateTrip }),
    [trips, updateTrip],
  )

  return (
    <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
  )
}
