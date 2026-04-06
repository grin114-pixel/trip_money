import { TripList } from './pages/TripList'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { TripDetail } from './pages/TripDetail'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TripList />} />
        <Route path="/trip/:id" element={<TripDetail />} />
      </Routes>
    </Router>
  )
}

export default App