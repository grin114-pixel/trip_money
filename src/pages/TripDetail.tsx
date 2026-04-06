import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import type { Trip, Expense } from '../types'
import { IconArrowLeft, IconPlus, IconTrash } from '../components/Icons'

export function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  // 수파베이스에서 해당 여행 데이터 가져오기
  const fetchTrip = async () => {
    if (!id) return
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error:', error)
      navigate('/')
    } else {
      setTrip(data)
    }
    setLoading(false)
  }

  useEffect(() => { fetchTrip() }, [id])

  // 경비 삭제 함수
  const handleDeleteExpense = async (expenseId: string) => {
    if (!trip || !confirm('이 경비를 삭제할까요?')) return
    const newExpenses = trip.expenses.filter((e) => e.id !== expenseId)
    await supabase.from('trips').update({ expenses: newExpenses }).eq('id', trip.id)
    fetchTrip()
  }

  if (loading) return <div className="p-10 text-center text-slate-400">불러오는 중...</div>
  if (!trip) return null

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => navigate('/')} className="p-1 text-slate-500"><IconArrowLeft /></button>
        <h1 className="text-lg font-bold text-slate-800">{trip.name}</h1>
      </header>

      <main className="p-4">
        {(!trip.expenses || trip.expenses.length === 0) ? (
          <div className="py-20 text-center text-slate-400">등록된 경비가 없습니다.</div>
        ) : (
          <ul className="space-y-3">
            {trip.expenses.map((ex: Expense) => (
              <li key={ex.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                <div>
                  <p className="text-xs text-slate-400">{ex.category}</p>
                  <p className="font-medium text-slate-800">{ex.content}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-brand-600">{Number(ex.amount).toLocaleString()}원</p>
                  <button onClick={() => handleDeleteExpense(ex.id)} className="text-slate-300"><IconTrash className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* 경비 추가 버튼 (나중에 기능을 연결할 예정입니다) */}
      <button className="fixed bottom-8 right-5 h-14 w-14 rounded-full bg-brand-600 text-white shadow-lg flex items-center justify-center">
        <IconPlus className="h-7 w-7" />
      </button>
    </div>
  )
}