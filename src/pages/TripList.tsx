import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TripModal } from '../components/TripModal'
import { IconPencil, IconTrash } from '../components/Icons'
import { useTrips } from '../trips/useTrips'
import { supabase } from '../supabase'
import type { Trip } from '../types'

function sumTripAmount(trip: Trip) {
  const ex = trip.expenses || []
  return ex.reduce((acc, e) => acc + (Number(e.amount) || 0), 0)
}

function parseDateKey(text?: string): number {
  if (!text) return Number.NEGATIVE_INFINITY

  // 2026-04-06 / 2026.04.06 / 2026/4/6
  const ymd = text.match(/(19|20)\d{2}\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{1,2})/)
  if (ymd) {
    const y = Number(ymd[0].match(/(19|20)\d{2}/)![0])
    const parts = ymd[0].match(/(19|20)\d{2}\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{1,2})/)!
    const m = Number(parts[2])
    const d = Number(parts[3])
    const t = new Date(y, m - 1, d).getTime()
    return Number.isFinite(t) ? t : Number.NEGATIVE_INFINITY
  }

  // 2/22 같은 형태는 연도 없이 들어오므로 정렬 우선순위에서 뒤로 보냄
  return Number.NEGATIVE_INFINITY
}

function parseYear(text?: string): string {
  if (!text) return '기타'
  const m = text.match(/(19|20)\d{2}/)
  return m?.[0] ?? '기타'
}

export function TripList() {
  const { trips, refresh } = useTrips()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const navigate = useNavigate()

  const grouped = useMemo(() => {
    const sorted = [...(trips || [])].sort((a, b) => parseDateKey(b.startDate) - parseDateKey(a.startDate))
    const map = new Map<string, Trip[]>()
    for (const t of sorted) {
      const y = parseYear(t.startDate)
      const arr = map.get(y)
      if (arr) arr.push(t)
      else map.set(y, [t])
    }
    // 년도 내림차순, '기타'는 마지막
    const keys = Array.from(map.keys()).sort((a, b) => {
      if (a === '기타') return 1
      if (b === '기타') return -1
      return Number(b) - Number(a)
    })
    return keys.map((k) => ({ year: k, trips: map.get(k)! }))
  }, [trips])

  const closeModal = () => {
    setModalOpen(false)
    setEditingTrip(null)
  }

  const openCreate = () => {
    setEditingTrip(null)
    setModalOpen(true)
  }

  const openEdit = (trip: Trip) => {
    setEditingTrip(trip)
    setModalOpen(true)
  }

  const handleDeleteTrip = async (trip: Trip) => {
    if (!confirm(`"${trip.name}" 여행을 삭제할까요?`)) return
    const { error } = await supabase.from('trips').delete().eq('id', trip.id)
    if (error) {
      console.error('Error deleting trip:', error)
      alert('삭제에 실패했어요. 다시 시도해 주세요.')
      return
    }
    refresh()
  }

  return (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      <h2 style={{ marginBottom: '20px' }}>✈️ 나의 여행 목록</h2>
      {grouped.map((group) => (
        <React.Fragment key={group.year}>
        <div style={{ marginBottom: '26px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
              color: '#666',
              fontWeight: 700,
            }}
          >
            <span style={{ fontSize: '18px', color: '#2563eb' }}>{group.year}</span>
            <div style={{ height: '1px', background: '#e5e7eb', flex: 1 }} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '10px',
            }}
          >
            {group.trips.map((trip) => {
              const total = sumTripAmount(trip)
              return (
                <button
                  key={trip.id}
                  type="button"
                  onPointerUp={() => navigate(`/trip/${trip.id}`)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: '#fff',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                    color: 'inherit',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    WebkitUserSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: '15px',
                          color: '#111827',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.2,
                        }}
                      >
                        {trip.name}
                      </div>
                      <div style={{ color: '#888', fontSize: '12px', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {trip.endDate ? `${trip.startDate} ~ ${trip.endDate}` : trip.startDate}
                      </div>
                    </div>

                  </div>

                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 800 }}>
                      {total.toLocaleString()}원
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        aria-label="여행 수정"
                        onPointerUp={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          openEdit(trip)
                        }}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '9px',
                          border: '1px solid #eee',
                          background: '#fff',
                          color: '#666',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          touchAction: 'manipulation',
                        }}
                      >
                        <IconPencil width={13} height={13} />
                      </button>

                      <button
                        type="button"
                        aria-label="여행 삭제"
                        onPointerUp={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          void handleDeleteTrip(trip)
                        }}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '9px',
                          border: '1px solid #eee',
                          background: '#fff',
                          color: '#d33',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          touchAction: 'manipulation',
                        }}
                      >
                        <IconTrash width={13} height={13} />
                      </button>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        </React.Fragment>
      ))}

      <button
        type="button"
        onClick={openCreate}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 40,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#007bff',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
        }}
      >
        +
      </button>

      {modalOpen && (
        <TripModal 
          mode={editingTrip ? 'edit' : 'create'}
          initialName={editingTrip?.name ?? ''}
          initialTripDate={
            editingTrip?.endDate
              ? `${editingTrip.startDate} ~ ${editingTrip.endDate}`
              : (editingTrip?.startDate ?? '')
          }
          onClose={closeModal}
          onSave={async (p) => { 
            if (editingTrip) {
              const { error } = await supabase
                .from('trips')
                .update({ name: p.name, startDate: p.startDate, endDate: p.endDate })
                .eq('id', editingTrip.id)
              if (error) {
                console.error('Error updating trip:', error)
                alert('수정에 실패했어요. 다시 시도해 주세요.')
                return
              }
            } else {
              const { error } = await supabase.from('trips').insert([{ ...p, expenses: [] }])
              if (error) {
                console.error('Error creating trip:', error)
                alert('저장에 실패했어요. 다시 시도해 주세요.')
                return
              }
            }
            closeModal()
            refresh(); 
          }} 
        />
      )}
    </div>
  )
}