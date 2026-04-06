import { useState } from 'react'

interface Props {
  mode: 'create' | 'edit'
  initialName?: string
  initialStartDate?: string
  initialEndDate?: string
  onClose: () => void
  onSave: (payload: { name: string; startDate: string; endDate: string }) => void
}

export function TripModal({
  mode,
  initialName = '',
  initialStartDate = '',
  initialEndDate = '',
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(initialName)
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(initialStartDate || today)
  const [endDate, setEndDate] = useState(initialEndDate || today)

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
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="예: 제주도 여행"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-600">취소</button>
          <button 
            onClick={() => onSave({ name, startDate, endDate })}
            className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-medium text-white shadow-md active:scale-95"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  )
}