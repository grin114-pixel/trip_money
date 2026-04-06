import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TripList } from './pages/TripList'
// 만약 TripDetail 같은 다른 페이지도 있다면 여기서 불러오세요!

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TripList />} />
        {/* <Route path="/trip/:id" element={<TripDetail />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App