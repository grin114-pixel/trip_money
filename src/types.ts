export interface Expense {
  id: string
  date: string
  description: string
  amount: number
  memo: string
}

export interface Trip {
  id: string
  name: string
  startDate: string
  endDate: string
  expenses: Expense[]
}

export const STORAGE_KEY = 'trip_money_data'
