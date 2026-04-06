import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TripModal } from '../components/TripModal'
import { IconPlus } from '../components/Icons'
import { useTrips } from '../trips/useTrips'
import { supabase } from '../supabase'

export function TripList() {
  const { trips, refresh } = useTrips()
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>✈️ 나의 여행 목록</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {trips?.map((trip) => (
          <div 
            key={trip.id} 
            onClick={() => navigate(`/trip/${trip.id}`)}
            style={{ 
              padding: '20px', 
              border: '1px solid #eee', 
              borderRadius: '12px', 
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{trip.name}</div>
            <div style={{ color: '#888', fontSize: '14px', marginTop: '5px' }}>
              {trip.startDate} ~ {trip.endDate}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setModalOpen(true)}
        style={{ 
          position: 'fixed', bottom: '30px', right: '30px', 
          width: '60px', height: '60px', borderRadius: '50%', 
          background: '#007bff', color: 'white', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
        }}
      >
        <IconPlus />
      </button>

      {modalOpen && (
        <TripModal 
          mode="create" 
          initialName="" 
          initialDate="" 
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