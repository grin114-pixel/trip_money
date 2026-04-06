import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { TripList } from './pages/TripList'
import { TripDetail } from './pages/TripDetail'
import { TripsProvider } from './trips/TripsProvider'

export default function App() {
  return (
    <TripsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TripList />} />
          <Route path="/trip/:id" element={<TripDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TripsProvider>
  )
}
