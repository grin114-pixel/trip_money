import type { Trip } from './types'
import { STORAGE_KEY } from './types'

function safeParse(raw: string | null): Trip[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data as Trip[]
  } catch {
    return []
  }
}

export function loadTrips(): Trip[] {
  return safeParse(localStorage.getItem(STORAGE_KEY))
}

export function saveTrips(trips: Trip[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

export function sumExpenses(trip: Trip): number {
  return trip.expenses.reduce((s, e) => s + (Number.isFinite(e.amount) ? e.amount : 0), 0)
}
