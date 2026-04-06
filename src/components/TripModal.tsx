import { useState } from 'react'

export type TripModalMode = 'create' | 'edit'

type Props = {
  mode: TripModalMode
  initialName?: string
  initialDate?: string
  onClose: () => void
  onSave: (payload: { name: string; startDate: string; endDate: string }) => void
}

export function TripModal({
  mode,
  initialName = '',
  initialDate = '',
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(initialName)
  const [tripDate, setTripDate] = useState(initialDate)

  const title = mode === 'create' ? '여행 추가' : '여행 수정'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    if (!n) {
      alert('여행지 이름을 입력해 주세요.')
      return
    }
    if (!tripDate) {
      alert('여행 날짜를 선택해 주세요.')
      return
    }
    onSave({ name: n, startDate: tripDate, endDate: tripDate })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trip-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="trip-modal-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">여행지</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-brand-600 focus:ring-2"
              placeholder="예: 제주도"
              autoComplete="off"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">여행 날짜</span>
            <input
              type="date"
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-brand-600 focus:ring-2"
            />
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 active:bg-slate-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white active:bg-brand-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
