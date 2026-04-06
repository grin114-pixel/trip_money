import { useMemo, useState } from 'react'
import { TripModal } from '../components/TripModal'
import { formatTripRange, getYearFromDate } from '../utils'
import type { Trip } from '../types'
import { useTrips } from '../trips/useTrips'
import { supabase } from '../supabase'

export function TripList() {
  const { trips, refresh } = useTrips()
  const [modalOpen, setModalOpen] = useState(false)

  const moveData = async () => {
    const local = localStorage.getItem('trips')
    if (!local) return alert('이사할 데이터가 없어요!')
    const parsed = JSON.parse(local)
    if (window.confirm(`${parsed.length}개의 데이터를 이사할까요?`)) {
      for (const item of parsed) {
        await supabase.from('trips').insert([{
          name: item.name, startDate: item.startDate, endDate: item.endDate, expenses: item.expenses || []
        }])
      }
      alert('이사 완료!')
      localStorage.removeItem('trips')
      refresh()
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={moveData}
        style={{ width: '100%', padding: '20px', background: 'orange', color: 'white', fontWeight: 'bold', marginBottom: '20px', borderRadius: '10px' }}
      >
        🚀 내 예전 데이터 수파베이스로 한꺼번에 보내기
      </button>

      {trips?.map((trip: Trip) => (
        <div key={trip.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}>
          <p><strong>{trip.name}</strong></p>
          <p style={{ fontSize: '12px', color: '#888' }}>{trip.startDate} ~ {trip.endDate}</p>
        </div>
      ))}

      <button onClick={() => setModalOpen(true)} style={{ position: 'fixed', bottom: '20px', right: '20px', width: '50px', height: '50px', borderRadius: '50%', background: '#007bff', color: 'white' }}>+</button>

      {modalOpen && (
        <TripModal mode="create" initialName="" initialDate="" onClose={() => setModalOpen(false)} 
          onSave={async (p) => { await supabase.from('trips').insert([{ ...p, expenses: [] }]); setModalOpen(false); refresh(); }} 
        />
      )}
    </div>
  )
}