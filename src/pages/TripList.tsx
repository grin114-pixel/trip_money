import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TripModal } from '../components/TripModal'
import { useTrips } from '../trips/useTrips'
import { supabase } from '../supabase'

export function TripList() {
  const { trips, refresh } = useTrips()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      <h2 style={{ marginBottom: '20px' }}>✈️ 나의 여행 목록</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {trips?.map((trip) => (
          <Link
            key={trip.id}
            to={`/trip/${trip.id}`}
            style={{
              display: 'block',
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '10px',
              cursor: 'pointer',
              background: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: 'inherit',
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{trip.name}</div>
            <div style={{ color: '#888' }}>{trip.startDate} ~ {trip.endDate}</div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
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