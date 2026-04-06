import { useMemo, useState } from 'react'
import { TripModal } from '../components/TripModal'
import { IconPencil, IconPlus, IconTrash } from '../components/Icons'
import { formatTripRange, getYearFromDate } from '../utils'
import type { Trip } from '../types'
import { useTrips } from '../trips/useTrips'
import { supabase } from '../supabase'

function safeSum(trip: Trip): number {
  if (!trip.expenses || !Array.isArray(trip.expenses)) return 0
  return trip.expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
}

function sortTripsDesc(trips: Trip[]): Trip[] {
  return [...trips].sort((a, b) => {
    if (a.startDate === b.startDate) return a.name.localeCompare(b.name, 'ko')
    return a.startDate < b.startDate ? 1 : -1
  })
}

export function TripList() {
  const { trips, refresh } = useTrips()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<any>(null)

  const sorted = useMemo(() => sortTripsDesc(trips || []), [trips])

  const byYear = useMemo(() => {
    const map = new Map<number, Trip[]>()
    for (const t of sorted) {
      const y = getYearFromDate(t.startDate)
      if (!map.has(y)) map.set(y, [])
      map.get(y)!.push(t)
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0])
  }, [sorted])

  const editingTrip = editingId ? trips.find((t) => String(t.id) === String(editingId)) : undefined

  const handleSaveTrip = async (payload: { name: string, startDate: string, endDate: string }) => {
    if (editingId) {
      await supabase.from('trips').update({ name: payload.name, startDate: payload.startDate, endDate: payload.endDate }).eq('id', editingId)
    } else {
      await supabase.from('trips').insert([{ name: payload.name, startDate: payload.startDate, endDate: payload.endDate, expenses: [] }])
    }
    setModalOpen(false)
    setEditingId(null)
    refresh()
  }

  const handleDelete = async (id: any, name: string) => {
    if (!confirm(`「${name}」 여행을 삭제할까요?`)) return
    await supabase.from('trips').delete().eq('id', id)
    refresh()
  }

  return (
    <div className="relative min-h-[100dvh] bg-white pb-28">
      <main className="px-3 pt-4 sm:px-4">
        {byYear.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">등록된 여행이 없습니다.</div>
        ) : (
          <div className="space-y-8">
            {byYear.map(([year, list]) => (
              <section key={year}>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-brand-600">{year}</h2>
                  <div className="h-[2px] flex-1 rounded-full bg-brand-500" />
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
                  {list.map((trip) => (
                    <li key={String(trip.id)} className="relative">
                      {/* [강력 해결책] 단순 div 클릭 + window.location 조합 */}
                      <div 
                        onClick={() => { window.location.href = `/trip/${trip.id}`; }}
                        className="flex h-24 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm active:bg-slate-100 cursor-pointer"
                      >
                        <p className="truncate text-sm font-bold text-slate-800 pr-10">{trip.name}</p>
                        <div className="flex justify-between items-baseline">
                          <p className="text-[10px] text-slate-400">{formatTripRange(trip.startDate, trip.endDate)}</p>
                          <p className="text-xs font-semibold text-brand-600">{safeSum(trip).toLocaleString()}원</p>
                        </div>
                      </div>
                      
                      {/* 버튼들을 더 명확하게 분리 */}
                      <div className="absolute right-1 top-1 z-50 flex gap-0.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingId(trip.id); setModalOpen(true); }} 
                          className="p-2 text-slate-300 active:text-brand-500"
                        >
                          <IconPencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(trip.id, trip.name); }} 
                          className="p-2 text-slate-300 active:text-red-400"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
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
        onClick={() => { setEditingId(null); setModalOpen(true); }} 
        className="fixed bottom-10 right-5 z-50 h-14 w-14 rounded-full bg-brand-600 text-white shadow-lg flex items-center justify-center active:scale-90"
      >
        <IconPlus className="h-7 w-7" />
      </button>

      {modalOpen && (
        <TripModal
          mode={editingId ? 'edit' : 'create'}
          initialName={editingTrip?.name ?? ''}
          initialDate={editingTrip?.startDate ?? ''}
          onClose={() => { setModalOpen(false); setEditingId(null); }}
          onSave={handleSaveTrip}
        />
      )}
    </div>
  )
}