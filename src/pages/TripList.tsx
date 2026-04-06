import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TripModal } from '../components/TripModal'
import { IconPencil, IconPlus, IconTrash } from '../components/Icons'
import { formatTripRange, getYearFromDate } from '../utils'
import type { Trip } from '../types'
import { useTrips } from '../trips/useTrips'
import { supabase } from '../supabase'

// 경비 합계를 안전하게 계산하는 함수
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
  const [editingId, setEditingId] = useState<string | null>(null)

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

  const editingTrip = editingId ? trips.find((t) => t.id === editingId) : undefined

  const handleSaveTrip = async (payload: { name: string, startDate: string, endDate: string }) => {
    if (editingId) {
      await supabase.from('trips').update({ name: payload.name, startDate: payload.startDate, endDate: payload.endDate }).eq('id', editingId)
    } else {
      // 새 여행 등록 시 id는 수파베이스가 자동으로 만듭니다.
      await supabase.from('trips').insert([{ name: payload.name, startDate: payload.startDate, endDate: payload.endDate, expenses: [] }])
    }
    setModalOpen(false)
    setEditingId(null)
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
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
            <p className="text-sm text-slate-500">등록된 여행이 없습니다.</p>
            <p className="mt-1 text-xs text-slate-400">우측 하단 [+] 버튼을 눌러 새 여행을 시작하세요!</p>
          </div>
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
                    <li key={trip.id} className="relative min-w-0 h-24">
                      {/* 클릭 영역을 가장 위로 올렸습니다 (z-20) */}
                      <Link 
                        to={`/trip/${trip.id}`} 
                        className="absolute inset-0 z-20 flex flex-col justify-between rounded-[12px] border border-slate-100 bg-white p-4 shadow-sm active:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-bold text-brand-700">{trip.name}</p>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <p className="text-[10px] text-slate-500">{formatTripRange(trip.startDate, trip.endDate)}</p>
                          <p className="text-xs font-semibold text-slate-600">{safeSum(trip).toLocaleString()}원</p>
                        </div>
                      </Link>
                      
                      {/* 수정/삭제 버튼은 클릭 영역 위에 별도로 배치 (z-30) */}
                      <div className="absolute right-2 top-2 z-30 flex gap-1">
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingId(trip.id); setModalOpen(true); }} 
                          className="p-1 text-slate-300 hover:text-brand-500"
                        >
                          <IconPencil className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(trip.id, trip.name); }} 
                          className="p-1 text-slate-300 hover:text-red-400"
                        >
                          <IconTrash className="h-3.5 w-3.5" />
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
        className="fixed bottom-10 right-5 z-40 h-14 w-14 rounded-full bg-brand-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
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