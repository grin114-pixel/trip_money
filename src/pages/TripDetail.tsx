import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import type { Trip, Expense } from '../types'
import { IconPlus, IconTrash } from '../components/Icons'

export function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<Expense[]>([])
  const [saving, setSaving] = useState(false)
  const saveTimer = useRef<number | null>(null)
  const lastSavedJson = useRef<string>('')

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
      setRows((data?.expenses || []).map((e: Expense) => ({ ...e, memo: e.memo ?? '' })))
      lastSavedJson.current = JSON.stringify(data?.expenses || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchTrip() }, [id])

  // 경비 삭제 함수
  const handleDeleteExpense = async (expenseId: string) => {
    if (!trip || !confirm('이 경비를 삭제할까요?')) return
    setRows((prev) => prev.filter((e) => e.id !== expenseId))
  }

  const total = useMemo(
    () => rows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0),
    [rows],
  )

  const scheduleSave = (nextRows: Expense[]) => {
    if (!trip) return
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(async () => {
      const payload = nextRows.map((r) => ({
        ...r,
        memo: (r.memo ?? '').slice(0, 3),
      }))
      const nextJson = JSON.stringify(payload)
      if (nextJson === lastSavedJson.current) return

      setSaving(true)
      const { error } = await supabase
        .from('trips')
        .update({ expenses: payload })
        .eq('id', trip.id)
      setSaving(false)

      if (error) {
        console.error('Error saving expenses:', error)
        alert('저장에 실패했어요. 네트워크 상태를 확인하고 다시 시도해 주세요.')
        return
      }
      lastSavedJson.current = nextJson
    }, 600)
  }

  useEffect(() => {
    scheduleSave(rows)
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, trip?.id])

  const upsertRow = (id: string, patch: Partial<Expense>) => {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
      return next
    })
  }

  const addRow = () => {
    const newRow: Expense = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      category: '',
      date: '',
      content: '',
      amount: 0,
      memo: '',
    }
    setRows((prev) => [...prev, newRow])
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
        <div className="ml-auto text-xs text-slate-400">{saving ? '저장 중…' : '자동 저장'}</div>
      </header>

      <main className="p-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[92px_1fr_120px_56px_44px] gap-0 border-b border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-600">
            <div className="px-1">날짜</div>
            <div className="px-1">내역</div>
            <div className="px-1 text-right">금액</div>
            <div className="px-1 text-center">메모</div>
            <div className="px-1 text-center"> </div>
          </div>

          {rows.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">행을 추가해서 입력해 주세요.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-[92px_1fr_120px_56px_44px] items-center gap-0 px-2 py-2"
                >
                  <input
                    value={r.date ?? ''}
                    onChange={(e) => upsertRow(r.id, { date: e.target.value })}
                    placeholder="2/22"
                    className="mx-1 h-9 rounded-md border border-slate-200 px-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    inputMode="text"
                  />
                  <input
                    value={r.content ?? ''}
                    onChange={(e) => upsertRow(r.id, { content: e.target.value })}
                    placeholder="내역"
                    className="mx-1 h-9 w-full rounded-md border border-slate-200 px-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <input
                    value={String(r.amount ?? '')}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, '')
                      upsertRow(r.id, { amount: v === '' ? 0 : Number(v) })
                    }}
                    placeholder="0"
                    className="mx-1 h-9 rounded-md border border-slate-200 px-2 text-right text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    inputMode="numeric"
                  />
                  <input
                    value={(r.memo ?? '').slice(0, 3)}
                    onChange={(e) => upsertRow(r.id, { memo: e.target.value.slice(0, 3) })}
                    placeholder=""
                    maxLength={3}
                    className="mx-1 h-9 rounded-md border border-slate-200 px-2 text-center text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteExpense(r.id)}
                    aria-label="행 삭제"
                    className="mx-auto inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-300 hover:text-slate-500 active:bg-slate-100"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-[92px_1fr_120px_56px_44px] items-center gap-0 border-t border-slate-200 px-2 py-2">
            <div className="px-1 text-xs text-slate-400" />
            <div className="px-1 text-xs text-slate-400" />
            <div className="mx-1 rounded-md bg-yellow-200 px-2 py-2 text-right text-sm font-bold text-slate-900">
              {total.toLocaleString()}
            </div>
            <div />
            <div />
          </div>
        </div>
      </main>

      <button
        type="button"
        onClick={addRow}
        className="fixed bottom-8 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg"
      >
        <IconPlus className="h-7 w-7" />
      </button>
    </div>
  )
}