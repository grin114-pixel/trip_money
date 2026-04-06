import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import type { Trip, Expense } from '../types'
import { IconPlus, IconTrash } from '../components/Icons'

export function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [category, setCategory] = useState('식비')
  const [content, setContent] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

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

  const handleAddExpense = async () => {
    if (!trip) return
    if (!content.trim()) {
      alert('내용을 입력해 주세요.')
      return
    }
    if (!amount || Number(amount) <= 0) {
      alert('금액을 1원 이상 입력해 주세요.')
      return
    }

    const newExpense: Expense = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      category,
      content: content.trim(),
      amount: Number(amount),
      date,
    }

    const nextExpenses = [...(trip.expenses || []), newExpense]
    const { error } = await supabase
      .from('trips')
      .update({ expenses: nextExpenses })
      .eq('id', trip.id)

    if (error) {
      console.error('Error adding expense:', error)
      alert('경비 저장에 실패했어요. 다시 시도해 주세요.')
      return
    }

    setAddOpen(false)
    setCategory('식비')
    setContent('')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    fetchTrip()
  }

  if (loading) return <div className="p-10 text-center text-slate-400">불러오는 중...</div>
  if (!trip) return null

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="여행 목록으로"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 active:bg-slate-100"
        >
          <span>앞으로 가기</span>
          <span aria-hidden="true" className="text-slate-400">
            &gt;
          </span>
        </button>
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

      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="fixed bottom-8 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg"
      >
        <IconPlus className="h-7 w-7" />
      </button>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-800">경비 추가</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500">카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                >
                  <option value="식비">식비</option>
                  <option value="교통">교통</option>
                  <option value="숙박">숙박</option>
                  <option value="관광">관광</option>
                  <option value="쇼핑">쇼핑</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">내용</label>
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="예: 저녁 식사"
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500">금액</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">날짜</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="flex-1 rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-600"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddExpense}
                className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-medium text-white"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}