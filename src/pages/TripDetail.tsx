import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import type { Trip, Expense } from '../types'
import { IconChevronLeft, IconPlus, IconTrash } from '../components/Icons'

export function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<Expense[]>([])
  const [, setSaving] = useState(false)
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

  const colClass =
    'grid grid-cols-[52px_minmax(0,1fr)_72px_40px_32px] items-center sm:grid-cols-[64px_minmax(0,1fr)_88px_48px_36px]'
  const colLine = 'border-r border-slate-200/35'

  return (
    <div className="min-h-screen bg-[#e0f2fe] pb-24">
      <header className="relative sticky top-0 z-30 flex items-center justify-center bg-[#e0f2fe] px-4 py-3">
        <Link
          to="/"
          aria-label="홈으로"
          className="absolute left-3 top-1/2 inline-flex -translate-y-1/2 shrink-0"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <img
            src="/header-icon.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-[11px] object-cover"
          />
        </Link>
        <h1 className="min-w-0 max-w-[70%] truncate text-center text-lg font-extrabold text-[#1e40af]">
          {trip.name}
        </h1>
      </header>

      <main className="px-3 py-1 sm:px-4">
        <div className="expense-sheet overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-[0_8px_24px_rgba(14,165,233,0.08)]">
          <div className={`${colClass} border-b border-sky-100 bg-gradient-to-b from-sky-50 to-sky-100/70 px-1 py-2.5 text-[11px] font-bold tracking-wide text-sky-800 sm:px-2 sm:text-xs`}>
            <div className={`${colLine} text-center`}>날짜</div>
            <div className={`${colLine} text-center`}>내역</div>
            <div className={`${colLine} text-center`}>금액</div>
            <div className={`${colLine} text-center`}>메모</div>
            <div />
          </div>

          {rows.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              행을 추가해서 입력해 주세요.
            </div>
          ) : (
            <div className="divide-y divide-sky-50">
              {rows.map((r) => (
                <div
                  key={r.id}
                  data-row
                  className={`${colClass} px-1 py-1.5 transition-colors hover:bg-sky-50/60 sm:px-2`}
                >
                  <div className={colLine}>
                    <input
                      value={r.date ?? ''}
                      onChange={(e) => upsertRow(r.id, { date: e.target.value })}
                      data-col="date"
                      onKeyDown={handleEnterMoveDown}
                      className="h-9 w-full rounded-lg bg-transparent px-1 text-center text-sm text-slate-700 outline-none focus:bg-sky-50 focus:ring-2 focus:ring-sky-200 sm:px-1.5"
                      inputMode="text"
                    />
                  </div>
                  <div className={`${colLine} min-w-0`}>
                    <input
                      value={r.content ?? ''}
                      onChange={(e) => upsertRow(r.id, { content: e.target.value })}
                      data-col="content"
                      onKeyDown={handleEnterMoveDown}
                      className="h-9 w-full min-w-0 rounded-lg bg-transparent px-1 text-center text-sm text-slate-800 outline-none focus:bg-sky-50 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                  <div className={colLine}>
                    <input
                      value={Number(r.amount) ? Number(r.amount).toLocaleString() : ''}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d]/g, '')
                        upsertRow(r.id, { amount: v === '' ? 0 : Number(v) })
                      }}
                      data-col="amount"
                      onKeyDown={handleEnterMoveDown}
                      className="h-9 w-full rounded-lg bg-transparent px-1 text-center text-sm font-semibold tabular-nums text-slate-800 outline-none focus:bg-sky-50 focus:ring-2 focus:ring-sky-200 sm:px-1.5"
                      inputMode="numeric"
                    />
                  </div>
                  <div className={colLine}>
                    <input
                      value={(r.memo ?? '').slice(0, 3)}
                      onChange={(e) => upsertRow(r.id, { memo: e.target.value.slice(0, 3) })}
                      maxLength={3}
                      data-col="memo"
                      onKeyDown={handleEnterMoveDown}
                      className="h-9 w-full rounded-lg bg-transparent px-0.5 text-center text-sm text-slate-600 outline-none focus:bg-sky-50 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteExpense(r.id)}
                    aria-label="행 삭제"
                    className="inline-flex h-9 w-full items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-400 active:bg-rose-100"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={`${colClass} border-t border-sky-100 bg-sky-50/90 px-1 py-3 sm:px-2`}>
            <div className={colLine} />
            <div className={`${colLine} text-center text-sm font-extrabold text-sky-900`}>총액</div>
            <div className={`${colLine} text-center text-sm font-extrabold tabular-nums text-sky-900`}>
              {total.toLocaleString()}
            </div>
            <div className={colLine} />
            <div />
          </div>
        </div>

        <div className="sticky bottom-0 z-20 mt-3 bg-[#e0f2fe]/90 pt-2 backdrop-blur">
          <div className="flex items-center justify-between gap-2 px-1 pb-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="여행 목록으로"
              className="inline-flex items-center justify-center gap-1 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm active:bg-slate-50"
            >
              <IconChevronLeft className="h-4 w-4" />
              뒤로가기
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => addRows(1)}
                className="inline-flex items-center justify-center gap-1 rounded-full bg-sky-200 px-3 py-1.5 text-xs font-bold text-indigo-950 shadow-sm transition hover:bg-sky-300 active:scale-[0.99]"
              >
                <IconPlus className="h-4 w-4" />
                1줄 추가
              </button>
              <button
                type="button"
                onClick={() => addRows(5)}
                className="inline-flex items-center justify-center gap-1 rounded-full bg-sky-200 px-3 py-1.5 text-xs font-bold text-indigo-950 shadow-sm transition hover:bg-sky-300 active:scale-[0.99]"
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