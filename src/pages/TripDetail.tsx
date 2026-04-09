import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import type { Trip, Expense } from '../types'
import { IconChevronLeft, IconPlus, IconTrash } from '../components/Icons'

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

  const handleEnterMoveDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()

    const el = e.currentTarget
    const col = el.dataset.col
    if (!col) return

    const rowEl = el.closest('[data-row]')
    const nextRow = rowEl?.nextElementSibling as HTMLElement | null
    if (!nextRow) return

    const nextInput = nextRow.querySelector<HTMLInputElement>(`input[data-col="${col}"]`)
    nextInput?.focus()
    nextInput?.select?.()
  }

  const makeEmptyRow = (): Expense => ({
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    category: '',
    date: '',
    content: '',
    amount: 0,
    memo: '',
  })

  const addRows = (count: number) => {
    const safeCount = Math.max(1, Math.min(20, Math.floor(count)))
    const newRows = Array.from({ length: safeCount }, () => makeEmptyRow())
    setRows((prev) => [...prev, ...newRows])
  }

  if (loading) return <div className="p-10 text-center text-slate-400">불러오는 중...</div>
  if (!trip) return null

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-2 py-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="여행 목록으로"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-700 active:bg-slate-100"
        >
          <IconChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">{trip.name}</h1>
        <div className="ml-auto text-xs text-slate-400">{saving ? '저장 중…' : '자동 저장'}</div>
      </header>

      <main className="px-2 py-0">
        <div className="excel-sheet w-full overflow-hidden">
          <div
            className="w-full border-x border-b border-slate-200"
            style={{ borderTop: '1px solid rgb(226 232 240)' }}
          >
            <div className="grid grid-cols-[56px_1fr_76px_44px_36px] bg-[#e0f2fe] text-xs font-semibold text-slate-700 sm:grid-cols-[68px_1fr_96px_56px_44px]">
              <div className="border-r border-slate-200 px-2 py-1 text-center">날짜</div>
              <div className="border-r border-slate-200 px-2 py-1 text-center">내역</div>
              <div className="border-r border-slate-200 px-2 py-1 text-center">금액</div>
              <div className="border-r border-slate-200 px-2 py-1 text-center">메모</div>
              <div className="px-2 py-1 text-center" />
            </div>

          {rows.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">행을 추가해서 입력해 주세요.</div>
          ) : (
            <div>
              {rows.map((r) => (
                <div
                  key={r.id}
                  data-row
                  className="grid grid-cols-[56px_1fr_76px_44px_36px] items-stretch border-t border-slate-200 sm:grid-cols-[68px_1fr_96px_56px_44px]"
                >
                  <div className="border-r border-slate-200">
                    <input
                      value={r.date ?? ''}
                      onChange={(e) => upsertRow(r.id, { date: e.target.value })}
                      data-col="date"
                      onKeyDown={handleEnterMoveDown}
                      className="h-8 w-full bg-transparent px-1 text-center text-sm outline-none sm:px-2"
                      inputMode="text"
                    />
                  </div>
                  <div className="border-r border-slate-200">
                    <input
                      value={r.content ?? ''}
                      onChange={(e) => upsertRow(r.id, { content: e.target.value })}
                      placeholder="내역"
                      data-col="content"
                      onKeyDown={handleEnterMoveDown}
                      className="h-8 w-full bg-transparent px-2 text-sm outline-none"
                    />
                  </div>
                  <div className="border-r border-slate-200">
                    <input
                      value={Number(r.amount) ? Number(r.amount).toLocaleString() : ''}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d]/g, '')
                        upsertRow(r.id, { amount: v === '' ? 0 : Number(v) })
                      }}
                      placeholder="0"
                      data-col="amount"
                      onKeyDown={handleEnterMoveDown}
                      className="h-8 w-full bg-transparent px-1 text-right text-sm outline-none sm:px-2"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="border-r border-slate-200">
                    <input
                      value={(r.memo ?? '').slice(0, 3)}
                      onChange={(e) => upsertRow(r.id, { memo: e.target.value.slice(0, 3) })}
                      placeholder=""
                      maxLength={3}
                      data-col="memo"
                      onKeyDown={handleEnterMoveDown}
                      className="h-8 w-full bg-transparent px-1 text-center text-sm outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteExpense(r.id)}
                    aria-label="행 삭제"
                    className="inline-flex h-8 w-full items-center justify-center text-slate-300 hover:text-slate-500 active:bg-slate-100"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-[56px_1fr_76px_44px_36px] items-stretch border-t border-slate-200 bg-[#e0f2fe] sm:grid-cols-[68px_1fr_96px_56px_44px]">
            <div className="border-r border-slate-200" />
            <div className="border-r border-slate-200 px-2 py-2 text-sm font-bold text-slate-900">총액</div>
            <div className="border-r border-slate-200 px-2 py-2 text-right text-sm font-bold text-slate-900">
              {total.toLocaleString()}
            </div>
            <div className="border-r border-slate-200" />
            <div />
          </div>
        </div>
          <div className="sticky bottom-0 z-20 mt-4 border-t border-slate-200 bg-white/80 pt-3 backdrop-blur">
            <div className="flex items-center justify-end gap-2 px-3 pb-2">
              <button
                type="button"
                onClick={() => addRows(1)}
                className="inline-flex items-center justify-center gap-1 rounded-full bg-sky-200 px-3 py-1.5 text-xs font-bold text-sky-950 shadow-sm transition hover:bg-sky-300 active:scale-[0.99]"
              >
                <IconPlus className="h-4 w-4" />
                1줄 추가
              </button>
              <button
                type="button"
                onClick={() => addRows(5)}
                className="inline-flex items-center justify-center gap-1 rounded-full bg-sky-200 px-3 py-1.5 text-xs font-bold text-sky-950 shadow-sm transition hover:bg-sky-300 active:scale-[0.99]"
              >
                <IconPlus className="h-4 w-4" />
                5줄 추가
              </button>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}