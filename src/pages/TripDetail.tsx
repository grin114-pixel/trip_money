import { useParams, Link } from 'react-router-dom'
import { useTrips } from '../trips/useTrips'

export default function TripDetail() {
  const { id } = useParams()
  const { trips } = useTrips()
  const trip = trips.find(t => String(t.id) === id)

  if (!trip) return <div className="p-10 text-center">여행을 찾을 수 없습니다. <Link to="/" className="text-blue-500">홈으로</Link></div>

  return (
    <div className="p-4">
      <Link to="/" className="text-sm text-slate-500 mb-4 block">← 목록으로</Link>
      <h1 className="text-2xl font-bold">{trip.name}</h1>
      <p className="text-slate-500">{trip.startDate} ~ {trip.endDate}</p>
      <hr className="my-4" />
      <p className="text-center py-10 text-slate-400">경비 내역 기능은 곧 업데이트됩니다!</p>
    </div>
  )
}