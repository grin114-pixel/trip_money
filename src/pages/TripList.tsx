import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TripModal } from '../components/TripModal'
import { IconPencil, IconPlus, IconTrash } from '../components/Icons'
import { createId } from '../utils'
import { formatTripRange, getYearFromDate } from '../utils'
import type { Trip } from '../types'
import { sumExpenses } from '../storage'
import { useTrips } from '../trips/useTrips'

function sortTripsDesc(trips: Trip[]): Trip[] {
  return [...trips].sort((a, b) => {
    if (a.startDate === b.startDate) return a.name.localeCompare(b.name, 'ko')
    return a.startDate < b.startDate ? 1 : -1
  })
}

export function TripList() {
  const { trips, setTrips } = useTrips()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const sorted = useMemo(() => sortTripsDesc(trips), [trips])

  const byYear = useMemo(() => {
    const map = new Map<number, Trip[]>()
    for (const t of sorted) {
      const y = getYearFromDate(t.startDate)
      if (!map.has(y)) map.set(y, [])
      map.get(y)!.push(t)
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0])
  }, [sorted])

  const editingTrip = editingId ? trips.find((t) => t.id === editingId) : undefined

  const openCreate = () => {
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (id: string) => {
    setEditingId(id)
    setModalOpen(true)
  }

  const handleSaveTrip = (payload: {
    name: string
    startDate: string
    endDate: string
  }) => {
    if (editingId) {
      setTrips((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, name: payload.name, startDate: payload.startDate, endDate: payload.endDate }
            : t,
        ),
      )
    } else {
      const trip: Trip = {
        id: createId(),
        name: payload.name,
        startDate: payload.startDate,
        endDate: payload.endDate,
        expenses: [],
      }
      setTrips((prev) => [...prev, trip])
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`「${name}」 여행을 삭제할까요? 내역도 모두 지워집니다.`)) return
    setTrips((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="relative min-h-[100dvh] bg-white pb-28">
      <main className="px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4">
        {byYear.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            등록된 여행이 없습니다.
            <br />
            우측 하단 + 버튼으로 여행을 추가해 보세요.
          </p>
        ) : (
          <div className="space-y-8">
            {byYear.map(([year, list]) => (
              <section key={year}>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tabular-nums tracking-tight text-brand-600 sm:text-3xl">
                    {year}
                  </h2>
                  <div className="h-[2px] flex-1 rounded-full bg-brand-500" />
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
                  {list.map((trip) => (
                    <li key={trip.id} className="min-w-0">
                      <div className="relative overflow-hidden rounded-[12px] border border-slate-100/90 bg-white shadow-sm">
                        <Link
                          to={`/trip/${trip.id}`}
                          className="absolute inset-0 z-0 active:bg-slate-50/80"
                          aria-label={`${trip.name} 경비 내역`}
                        />
                        <div className="relative z-10 flex flex-col gap-0 p-4 pointer-events-none">
                          <div className="flex items-center gap-2">
                            <p className="min-w-0 flex-1 truncate text-sm font-bold leading-tight text-lime-600">
                              {trip.name}
                            </p>
                            <div className="flex shrink-0 items-center gap-0.5 pointer-events-auto">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openEdit(trip.id)
                                }}
                                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600"
                                aria-label="여행 수정"
                              >
                                <IconPencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleDelete(trip.id, trip.name)
                                }}
                                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                aria-label="여행 삭제"
                              >
                                <IconTrash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 flex items-baseline justify-between gap-2">
                            <p className="min-w-0 flex-1 truncate text-[10px] leading-snug text-slate-500">
                              {formatTripRange(trip.startDate, trip.endDate)}
                            </p>
                            <p className="shrink-0 text-xs font-semibold tabular-nums leading-none text-slate-500">
                              {sumExpenses(trip).toLocaleString('ko-KR')}원
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>

      <button
        type="button"
        onClick={openCreate}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 active:scale-95"
        aria-label="여행 추가"
      >
        <IconPlus className="h-7 w-7" />
      </button>

      {modalOpen ? (
        <TripModal
          key={editingId ?? 'new-trip'}
          mode={editingId ? 'edit' : 'create'}
          initialName={editingTrip?.name ?? ''}
          initialDate={editingTrip?.startDate ?? ''}
          onClose={() => {
            setModalOpen(false)
            setEditingId(null)
          }}
          onSave={handleSaveTrip}
        />
      ) : null}
    </div>
  )
}
