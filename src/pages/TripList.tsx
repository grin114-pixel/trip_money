import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TripModal } from '../components/TripModal'
import { IconPencil, IconTrash } from '../components/Icons'
import { useTrips } from '../trips/useTrips'
import { supabase } from '../supabase'
import type { Trip } from '../types'

export function TripList() {
  const { trips, refresh } = useTrips()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const navigate = useNavigate()

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {trips?.map((trip) => (
          <button
            key={trip.id}
            type="button"
            onPointerUp={() => navigate(`/trip/${trip.id}`)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '10px',
              cursor: 'pointer',
              background: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: 'inherit',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              WebkitUserSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{trip.name}</div>
                <div style={{ color: '#888' }}>
                  {trip.endDate ? `${trip.startDate} ~ ${trip.endDate}` : trip.startDate}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  type="button"
                  aria-label="여행 수정"
                  onPointerUp={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openEdit(trip)
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    border: '1px solid #eee',
                    background: '#fff',
                    color: '#666',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    touchAction: 'manipulation',
                  }}
                >
                  <IconPencil width={18} height={18} />
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
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    border: '1px solid #eee',
                    background: '#fff',
                    color: '#d33',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    touchAction: 'manipulation',
                  }}
                >
                  <IconTrash width={18} height={18} />
                </button>
              </div>
            </div>
          </button>
        ))}
      </div>

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