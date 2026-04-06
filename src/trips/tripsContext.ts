import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { Trip } from '../types'

export type TripsContextValue = {
  trips: Trip[]
  setTrips: Dispatch<SetStateAction<Trip[]>>
  updateTrip: (id: string, updater: (t: Trip) => Trip) => void
}

export const TripsContext = createContext<TripsContextValue | null>(null)
