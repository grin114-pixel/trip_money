import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TripModal } from '../components/TripModal'
import { IconPencil, IconPlus, IconTrash } from '../components/Icons'
import { formatTripRange, getYearFromDate } from '../utils'
import type { Trip } from '../types'
import { sumExpenses } from '../storage'
import { useTrips } from '../trips/useTrips'
import { supabase } from '../supabase' // 이 줄이 꼭 있어야 합니다!

function sortTripsDesc(trips: Trip[]): Trip[] {
  return [...trips].sort((a, b) => {
    if (a.startDate === b.startDate) return a.name.localeCompare(b.name, 'ko')
    return a.startDate < b.startDate ? 1 : -1
  })
}

export function TripList() {
  const { trips, refresh } = useTrips()
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

  const handleSaveTrip = async (payload: { name: string, startDate: string, endDate: string }) => {
    if (editingId) {
      await supabase.from('trips').update({ name: payload.name, startDate: payload.startDate, endDate: payload.endDate }).eq('id', editingId)
    } else {
      await supabase.from('trips').insert([{ name: payload.name, startDate: payload.startDate, endDate: payload.endDate, expenses: [] }])
    }
    setModalOpen(false)
    refresh()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」 여행을 삭제할까요?`)) return
    await supabase.from('trips').delete().eq('id', id)
    refresh()
  }

  return (
    <div className="relative min-h-[100dvh] bg-white pb-28">
      <main className="px-3 pt-4 sm:px-4">
        {byYear.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">등록된 여행이 없습니다.</p>
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
                    <li key={trip.id} className="min-w-0">
                      <div className="relative overflow-hidden rounded-[12px] border border-slate-100 bg-white shadow-sm p-4">
                        <Link to={`/trip/${trip.id}`} className="absolute inset-0 z-0 active:bg-slate-50" />
                        <div className="relative z-10 flex flex-col">
                          <div className="flex items-center justify-between">
                            <p className="truncate text-sm font-bold text-lime-600">{trip.name}</p>
                            <div className="flex gap-1 pointer-events-auto">
                              <button onClick={(e) => { e.preventDefault(); openEdit(trip.id); }} className="p-1 text-slate-400"><IconPencil className="h-3.5 w-3.5" /></button>
                              <button onClick={(e) => { e.preventDefault(); handleDelete(trip.id, trip.name); }} className="p-1 text-slate-400"><IconTrash className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                          <div className="mt-2 flex justify-between items-baseline">
                            <p className="text-[10px] text-slate-500">{formatTripRange(trip.startDate, trip.endDate)}</p>
                            <p className="text-xs font-semibold text-slate-500">{sumExpenses(trip).toLocaleString()}원</p>
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
      <button onClick={openCreate} className="fixed bottom-10 right-5 z-20 h-14 w-14 rounded-full bg-brand-600 text-white shadow-lg flex items-center justify-center">
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