import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CSSProperties } from 'react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { IconChevronLeft, IconGrip, IconTrash } from '../components/Icons'
import type { Expense } from '../types'
import { sumExpenses } from '../storage'
import { useTrips } from '../trips/useTrips'
import {
  createId,
  formatAmountInputDigits,
  formatDisplayAmount,
  formatIsoToMD,
  getYearFromDate,
  parseAmountFromFormatted,
  parseMDTextToIso,
} from '../utils'

const EXCEL_BORDER = 'border border-[#b0b0b0]'
const HEADER_BG = 'bg-[#FFF9E1]'
const TOTAL_BG = 'bg-[#FFFF00]'
const ACTION_CELL = 'border-0 bg-white p-0 align-middle'

type ExpenseField = 'date' | 'description' | 'amount' | 'memo'

function focusExpenseField(rowIndex: number, field: ExpenseField) {
  document
    .querySelector<HTMLElement>(
      `[data-expense-row="${rowIndex}"][data-expense-field="${field}"]`,
    )
    ?.focus()
}

/** 날짜: 로컬 텍스트만 즉시 반영, blur 시에만 상위 저장 */
const ExpenseDateTextInput = memo(function ExpenseDateTextInput({
  expenseId,
  index,
  isoValue,
  tripYear,
  onCommitIso,
  onEnterNextRow,
}: {
  expenseId: string
  index: number
  isoValue: string
  tripYear: number
  onCommitIso: (id: string, iso: string) => void
  onEnterNextRow: () => void
}) {
  const [text, setText] = useState(() => formatIsoToMD(isoValue))

  useEffect(() => {
    setText(formatIsoToMD(isoValue))
  }, [isoValue, expenseId])

  const commit = () => {
    const parsed = parseMDTextToIso(text, tripYear)
    if (parsed === null) {
      setText(formatIsoToMD(isoValue))
      return
    }
    onCommitIso(expenseId, parsed)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      data-expense-row={index}
      data-expense-field="date"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
        e.preventDefault()
        ;(e.target as HTMLInputElement).blur()
        window.setTimeout(onEnterNextRow, 0)
      }}
      placeholder=""
      autoComplete="off"
      aria-label="날짜 (월/일)"
      enterKeyHint="next"
      className="box-border w-full min-w-0 border-0 bg-transparent px-0.5 py-px text-center text-[12px] tabular-nums leading-snug text-black outline-none ring-0 focus:ring-0"
    />
  )
})

type SortableExpenseRowProps = {
  expense: Expense
  index: number
  tripYear: number
  onCommit: (id: string, patch: Partial<Expense>) => void
  onDelete: (id: string) => void
}

function SortableExpenseRowInner({
  expense,
  index,
  tripYear,
  onCommit,
  onDelete,
}: SortableExpenseRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: expense.id })

  const [description, setDescription] = useState(expense.description)
  const [memo, setMemo] = useState(expense.memo)
  const [amountStr, setAmountStr] = useState(() =>
    expense.amount ? formatAmountInputDigits(String(expense.amount)) : '',
  )

  useEffect(() => {
    setDescription(expense.description)
    setMemo(expense.memo)
    setAmountStr(
      expense.amount ? formatAmountInputDigits(String(expense.amount)) : '',
    )
  }, [expense.id, expense.description, expense.memo, expense.amount])

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.92 : 1,
    background: isDragging ? '#f8fafc' : 'white',
  }

  const commitDescription = () => {
    if (description !== expense.description) {
      onCommit(expense.id, { description })
    }
  }

  const commitMemo = () => {
    if (memo !== expense.memo) {
      onCommit(expense.id, { memo })
    }
  }

  const commitAmount = () => {
    const n = parseAmountFromFormatted(amountStr)
    if (n !== expense.amount) {
      onCommit(expense.id, { amount: n })
    }
  }

  const onEnterDown =
    (field: ExpenseField) => (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
      e.preventDefault()
      ;(e.target as HTMLInputElement).blur()
      window.setTimeout(() => focusExpenseField(index + 1, field), 0)
    }

  return (
    <tr ref={setNodeRef} style={style} className="bg-white">
      <td
        className={`${EXCEL_BORDER} max-w-0 p-0 align-middle text-center text-[12px]`}
      >
        <ExpenseDateTextInput
          expenseId={expense.id}
          index={index}
          isoValue={expense.date}
          tripYear={tripYear}
          onCommitIso={(id, iso) => onCommit(id, { date: iso })}
          onEnterNextRow={() => focusExpenseField(index + 1, 'date')}
        />
      </td>
      <td className={`${EXCEL_BORDER} max-w-0 p-0 align-top`}>
        <div className="flex min-h-[1.35rem] items-start gap-0.5 px-0.5 py-px">
          <button
            type="button"
            className="touch-none shrink-0 pt-px text-[#a8a8a8] active:text-[#666]"
            aria-label="순서 변경"
            {...attributes}
            {...listeners}
          >
            <IconGrip className="h-3 w-3" />
          </button>
          <input
            type="text"
            data-expense-row={index}
            data-expense-field="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={commitDescription}
            onKeyDown={onEnterDown('description')}
            placeholder=""
            className="min-w-0 flex-1 border-0 bg-transparent py-px text-[12px] leading-snug text-black outline-none ring-0 focus:ring-0"
            enterKeyHint="next"
            autoComplete="off"
          />
        </div>
      </td>
      <td className={`${EXCEL_BORDER} max-w-0 p-0 align-middle`}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9,\uFF0C]*"
          data-expense-row={index}
          data-expense-field="amount"
          value={amountStr}
          onChange={(e) =>
            setAmountStr(formatAmountInputDigits(e.target.value))
          }
          onBlur={commitAmount}
          onKeyDown={onEnterDown('amount')}
          placeholder=""
          className="box-border w-full min-w-0 border-0 bg-transparent px-0.5 py-px text-right text-[12px] tabular-nums leading-snug text-black outline-none ring-0 focus:ring-0"
          enterKeyHint="next"
          autoComplete="off"
        />
      </td>
      <td className={`${EXCEL_BORDER} max-w-0 p-0 align-top`}>
        <textarea
          data-expense-row={index}
          data-expense-field="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onBlur={commitMemo}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.shiftKey) return
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault()
              ;(e.target as HTMLTextAreaElement).blur()
              window.setTimeout(() => focusExpenseField(index + 1, 'memo'), 0)
            }
          }}
          placeholder=""
          rows={1}
          className="box-border w-full min-w-0 resize-none border-0 bg-transparent px-0.5 py-px text-center text-[12px] leading-snug text-black outline-none ring-0 focus:ring-0"
          enterKeyHint="next"
          autoComplete="off"
        />
      </td>
      <td className={`${ACTION_CELL} w-7 min-w-[1.75rem] max-w-[1.75rem]`}>
        <div className="flex h-full min-h-[1.35rem] items-center justify-center py-0.5 pl-0.5">
          <button
            type="button"
            onClick={() => {
              if (confirm('이 내역을 삭제할까요?')) onDelete(expense.id)
            }}
            className="p-0.5 text-[#888] active:text-red-600"
            aria-label="내역 삭제"
          >
            <IconTrash className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  )
}

const SortableExpenseRow = memo(
  SortableExpenseRowInner,
  (prev, next) =>
    prev.expense.id === next.expense.id &&
    prev.expense.date === next.expense.date &&
    prev.expense.description === next.expense.description &&
    prev.expense.amount === next.expense.amount &&
    prev.expense.memo === next.expense.memo &&
    prev.index === next.index &&
    prev.tripYear === next.tripYear &&
    prev.onCommit === next.onCommit &&
    prev.onDelete === next.onDelete,
)

export function TripDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { trips, updateTrip } = useTrips()

  const trip = useMemo(() => trips.find((t) => t.id === id), [trips, id])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const commitExpense = useCallback(
    (expenseId: string, patch: Partial<Expense>) => {
      if (!trip) return
      updateTrip(trip.id, (t) => ({
        ...t,
        expenses: t.expenses.map((e) =>
          e.id === expenseId ? { ...e, ...patch } : e,
        ),
      }))
    },
    [trip, updateTrip],
  )

  const deleteExpense = useCallback(
    (expenseId: string) => {
      if (!trip) return
      updateTrip(trip.id, (t) => ({
        ...t,
        expenses: t.expenses.filter((e) => e.id !== expenseId),
      }))
    },
    [trip, updateTrip],
  )

  if (!id || !trip) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-slate-600">여행을 찾을 수 없습니다.</p>
        <Link
          to="/"
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          목록으로
        </Link>
      </div>
    )
  }

  const total = sumExpenses(trip)

  const tripStartIso = trip.startDate || trip.endDate || ''
  const tripYear = getYearFromDate(tripStartIso)

  const appendEmptyRows = (count: number) => {
    if (count < 1) return
    const startIndex = trip.expenses.length
    const newRows: Expense[] = Array.from({ length: count }, () => ({
      id: createId(),
      date: '',
      description: '',
      amount: 0,
      memo: '',
    }))
    updateTrip(trip.id, (t) => ({
      ...t,
      expenses: [...t.expenses, ...newRows],
    }))
    window.setTimeout(() => {
      focusExpenseField(startIndex, 'date')
    }, 50)
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = trip.expenses.findIndex((e) => e.id === active.id)
    const newIndex = trip.expenses.findIndex((e) => e.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(trip.expenses, oldIndex, newIndex)
    updateTrip(trip.id, (t) => ({ ...t, expenses: next }))
  }

  const ids = trip.expenses.map((e) => e.id)

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-10 flex items-center gap-1 border-b border-slate-100/90 bg-white/90 px-1 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200/90"
          aria-label="뒤로가기"
        >
          <IconChevronLeft className="h-6 w-6" strokeWidth={2.25} />
        </button>
        <h1 className="min-w-0 flex-1 truncate px-1 text-center text-base font-bold tracking-tight text-slate-900">
          {trip.name}
        </h1>
        <span className="h-10 w-10 shrink-0" aria-hidden />
      </header>

      <div className="flex flex-1 flex-col px-2 pt-2">
        <div className="w-full min-w-0 overflow-x-hidden">
          <table className="excel-sheet w-full table-fixed border-collapse border border-[#b0b0b0] text-[12px] leading-snug text-black">
            <colgroup>
              <col style={{ width: '2.75rem' }} />
              <col style={{ width: '56%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '1.75rem' }} />
            </colgroup>
            <thead>
              <tr className={HEADER_BG}>
                <th
                  className={`${EXCEL_BORDER} px-0.5 py-1 text-center text-[12px] font-semibold text-black`}
                >
                  날짜
                </th>
                <th
                  className={`${EXCEL_BORDER} px-0.5 py-1 text-center text-[12px] font-semibold text-black`}
                >
                  내역
                </th>
                <th
                  className={`${EXCEL_BORDER} px-0.5 py-1 text-center text-[12px] font-semibold text-black`}
                >
                  금액
                </th>
                <th
                  className={`${EXCEL_BORDER} px-0.5 py-1 text-center text-[12px] font-semibold text-black`}
                >
                  메모
                </th>
                <th className={`${ACTION_CELL} w-7 min-w-[1.75rem]`} aria-hidden />
              </tr>
            </thead>
            <tbody>
              {trip.expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className={`${EXCEL_BORDER} px-2 py-6 text-center text-[12px] text-slate-500`}
                  >
                    내역이 없습니다. 아래 「1줄 추가」 또는 「5줄 추가」를 눌러 입력하세요.
                  </td>
                </tr>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                    {trip.expenses.map((e, index) => (
                      <SortableExpenseRow
                        key={e.id}
                        expense={e}
                        index={index}
                        tripYear={tripYear}
                        onCommit={commitExpense}
                        onDelete={deleteExpense}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td className={`${EXCEL_BORDER} bg-white`} aria-hidden />
                <td className={`${EXCEL_BORDER} bg-white`} aria-hidden />
                <td
                  className={`${EXCEL_BORDER} ${TOTAL_BG} px-0.5 py-0.5 text-right text-[12px] font-semibold tabular-nums text-black`}
                >
                  {formatDisplayAmount(total)}
                </td>
                <td className={`${EXCEL_BORDER} bg-white`} aria-hidden />
                <td className={ACTION_CELL} aria-hidden />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap justify-end gap-2 pb-1">
          <button
            type="button"
            onClick={() => appendEmptyRows(1)}
            className="rounded-lg border border-brand-600 bg-white px-3 py-2 text-[12px] font-semibold text-brand-600 active:bg-brand-50"
          >
            1줄 추가
          </button>
          <button
            type="button"
            onClick={() => appendEmptyRows(5)}
            className="rounded-lg bg-brand-600 px-3 py-2 text-[12px] font-semibold text-white active:bg-brand-700"
          >
            5줄 추가
          </button>
        </div>
      </div>
    </div>
  )
}
