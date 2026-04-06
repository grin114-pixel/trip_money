import { useMemo, useState, useEffect } from 'react'
import { TripModal } from '../components/TripModal'
import { IconPencil, IconPlus, IconTrash } from '../components/Icons'
import { formatTripRange, getYearFromDate } from '../utils'
import type { Trip } from '../types'
import { useTrips } from '../trips/useTrips'
import { supabase } from '../supabase'

export function TripList() {
  const { trips, refresh } = useTrips()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<any>(null)

  // [중요] 로컬 데이터를 수파베이스로 옮기는 함수
  const moveLocalToSupabase = async () => {
    const localData = localStorage.getItem('trips')
    if (!localData) {
      alert('옮길 로컬 데이터가 없습니다.')
      return
    }

    try {
      const parsed = JSON.parse(localData)
      if (confirm(`총 ${parsed.length}개의 데이터를 수파베이스로 옮길까요?`)) {
        for (const item of parsed) {
          // id는 수파베이스가 새로 만들도록 제외하고 넣습니다.
          await supabase.from('trips').insert([{
            name: item.name,
            startDate: item.startDate,
            endDate: item.endDate,
            expenses: item.expenses || []
          }])
        }
        alert('데이터 이동 완료! 이제 로컬 데이터를 삭제합니다.')
        localStorage.removeItem('trips') // 중복 방지를 위해 삭제
        refresh()
      }
    } catch (e) {
      alert('데이터 이동 중 에러 발생!')
    }
  }

  const sorted = useMemo(() => [...(trips || [])].sort((a, b) => b.startDate.localeCompare(a.startDate)), [trips])
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

  return (
    <div className="relative min-h-[100dvh] bg-white pb-28">
      {/* 데이터 이동 버튼 (임시) */}
      <div className="p-4 bg-amber-50 border-b border-amber-100">
        <button 
          onClick={moveLocalToSupabase}
          className="w-full py-2 bg-amber-500 text-white rounded-lg text-sm font-bold shadow-sm"
        >
          🚀 내 예전 데이터 수파베이스로 한꺼번에 보내기
        </button>
      </div>

      <main className="px-3 pt-4 sm:px-4">
        {byYear.length === 0 ? (
          <div className="py-20 text-center text-slate-400">여행 목록이 비어있습니다.</div>
        ) : (
          <div className="space-y-8">
            {byYear.map(([year, list]) => (
              <section key={year}>
                <h2 className="text-2xl font-bold text-brand-600 mb-3">{year}</h2>
                <ul className="grid grid-cols-2 gap-3">
                  {list.map((trip) => (
                    <li key={String(trip.id)} className="relative h-24 rounded-xl border border-slate-200 p-4">
                      {/* 클릭 대신 강제 이동 버튼으로 바꿨습니다 */}
                      <button 
                        onClick={() => { window.location.href = `/trip/${trip.id}` }}
                        className="absolute inset-0 z-10 w-full h-full text-left p-4"
                      >
                        <p className="truncate text-sm font-bold text-slate-800">{trip.name}</p>
                        <p className="mt-4 text-[10px] text-slate-400">{formatTripRange(trip.startDate, trip.endDate)}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>

      <button onClick={() => { setEditingId(null); setModalOpen(true); }} className="fixed bottom-10 right-5 z-50 h-14 w-14 rounded-full bg-brand-600 text-white shadow-lg flex items-center justify-center">
        <IconPlus className="h-7 w-7" />
      </button>

      {modalOpen && (
        <TripModal
          mode={editingId ? 'edit' : 'create'}
          initialName={editingTrip?.name ?? ''}
          initialDate={editingTrip?.startDate ?? ''}
          onClose={() => { setModalOpen(false); setEditingId(null); }}
          onSave={async (payload) => {
            if (editingId) {
              await supabase.from('trips').update(payload).eq('id', editingId)
            } else {
              await supabase.from('trips').insert([{ ...payload, expenses: [] }])
            }
            setModalOpen(false)
            refresh()
          }}
        />
      )}
    </div>
  )
}