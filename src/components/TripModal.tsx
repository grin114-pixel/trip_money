import { useRef, useState } from 'react'

interface Props {
  mode: 'create' | 'edit'
  initialName?: string
  initialTripDate?: string
  onClose: () => void
  onSave: (payload: { name: string; startDate: string; endDate: string }) => void
}

export function TripModal({
  mode,
  initialName = '',
  initialTripDate = '',
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(initialName)
  const [tripDate, setTripDate] = useState(initialTripDate)
  const dateRef = useRef<HTMLInputElement | null>(null)

  const trySubmit = () => {
    onSave({ name, startDate: tripDate, endDate: '' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-slate-800">
          {mode === 'create' ? '새 여행 등록' : '여행 수정'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500">여행지 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                e.preventDefault()
                dateRef.current?.focus()
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="예: 제주도 여행"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-500">여행 날짜</label>
            <input
              type="text"
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                e.preventDefault()
                trySubmit()
              }}
              ref={dateRef}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="예: 2026.04.06 / 4/6~4/8 / 4월 첫째주"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-600">취소</button>
          <button 
            onClick={trySubmit}
            className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-medium text-white shadow-md active:scale-95"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  )
}