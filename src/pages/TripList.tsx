import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TripModal } from '../components/TripModal'
import { useTrips } from '../trips/useTrips'
import { supabase } from '../supabase'

export function TripList() {
  const { trips, refresh } = useTrips()
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div style={{ padding: '20px' }}>
      <h2>✈️ 나의 여행 목록</h2>
      <div style={{ marginTop: '20px' }}>
        {trips?.map((trip) => (
          <div 
            key={trip.id} 
            onClick={() => navigate(`/trip/${trip.id}`)}
            style={{ 
              padding: '20px', border: '1px solid #ddd', borderRadius: '10px', 
              marginBottom: '10px', cursor: 'pointer', background: '#f9f9f9' 
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{trip.name}</div>
            <div style={{ color: '#888', fontSize: '14px' }}>{trip.startDate} ~ {trip.endDate}</div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setModalOpen(true)}
        style={{ position: 'fixed', bottom: '20px', right: '20px', width: '60px', height: '60px', borderRadius: '50%', background: '#007bff', color: 'white', border: 'none', fontSize: '24px' }}
      >
        +
      </button>

      {modalOpen && (
        <TripModal 
          mode="create" initialName="" initialDate="" 
          onClose={() => setModalOpen(false)} 
          onSave={async (p) => { 
            await supabase.from('trips').insert([{ ...p, expenses: [] }]); 
            setModalOpen(false); 
            refresh(); 
          }} 
        />
      )}
    </div>
  )
}