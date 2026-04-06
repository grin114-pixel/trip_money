import { TripList } from './pages/TripList'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { TripDetail } from './pages/TripDetail'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 메인 화면에 무조건 TripList가 나오도록 고정 */}
          <Route path="/" element={<TripList />} />
          <Route path="/trip/:id" element={<TripDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App