import { useContext } from 'react'
import { TripsContext, type TripsContextValue } from './tripsContext'

export function useTrips(): TripsContextValue {
  const ctx = useContext(TripsContext)
  if (!ctx) throw new Error('useTrips must be used within TripsProvider')
  return ctx
}
