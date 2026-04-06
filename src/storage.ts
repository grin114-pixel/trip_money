import type { Trip } from './types'

// 여행의 총 경비를 계산하는 함수입니다.
// 데이터가 비어있거나(null) 잘못되어도 에러가 나지 않게 보호 장치를 넣었습니다.
export function sumExpenses(trip: Trip): number {
  // 만약 trip이나 expenses가 없으면 0을 반환합니다.
  if (!trip || !trip.expenses || !Array.isArray(trip.expenses)) {
    return 0
  }

  return trip.expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
}

export function loadTrips(): Trip[] {
  return []
}

export function saveTrips(_trips: Trip[]): void {}

// 이 아래는 지금은 사용하지 않지만, 에러 방지를 위해 남겨둡니다.
export const storage = {
  getTrips: (): Trip[] => [],
  saveTrips: (_trips: Trip[]) => {},
}