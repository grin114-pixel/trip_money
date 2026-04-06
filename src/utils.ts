export function createId(): string {
  return crypto.randomUUID()
}

/** 숫자만 추출해 천 단위 콤마 문자열로 표시 (입력용) */
export function formatAmountInputDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits === '') return ''
  const n = parseInt(digits, 10)
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('ko-KR')
}

export function parseAmountFromFormatted(formatted: string): number {
  const digits = formatted.replace(/\D/g, '')
  if (digits === '') return 0
  const n = parseInt(digits, 10)
  return Number.isFinite(n) ? n : 0
}

export function formatDisplayAmount(n: number): string {
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString('ko-KR')
}

/** YYYY-MM-DD → 표시용 */
export function formatTripRange(start: string, end: string): string {
  const fmt = (d: string) => {
    if (!d) return ''
    const [y, m, day] = d.split('-')
    if (!y || !m || !day) return d
    return `${y}.${m}.${day}`
  }
  if (!start && !end) return '날짜 미정'
  if (start && end && start === end) return fmt(start)
  if (start && end) return `${fmt(start)} ~ ${fmt(end)}`
  return fmt(start || end)
}

export function getYearFromDate(iso: string): number {
  if (!iso) return new Date().getFullYear()
  const y = parseInt(iso.slice(0, 4), 10)
  return Number.isFinite(y) ? y : new Date().getFullYear()
}

/** 엑셀 표시용 M/D (예: 2/22), 연도 없음 */
export function formatShortDateForCell(iso: string): string {
  if (!iso) return ''
  const parts = iso.split('-')
  if (parts.length < 3) return iso
  const m = parseInt(parts[1]!, 10)
  const d = parseInt(parts[2]!, 10)
  if (!Number.isFinite(m) || !Number.isFinite(d)) return iso
  return `${m}/${d}`
}

/** ISO 날짜를 M/D 문자열로 (표시 전용) */
export function formatIsoToMD(iso: string): string {
  return formatShortDateForCell(iso)
}

/**
 * M/D 형태 텍스트 → YYYY-MM-DD (연도는 defaultYear).
 * 빈 문자열 → '' 반환. 형식 불가 → null.
 */
export function parseMDTextToIso(
  raw: string,
  defaultYear: number,
): string | null {
  const s = raw.trim()
  if (s === '') return ''
  const m = s.match(/^(\d{1,2})\s*[./-]\s*(\d{1,2})$/)
  if (!m) return null
  const month = parseInt(m[1]!, 10)
  const day = parseInt(m[2]!, 10)
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const dt = new Date(defaultYear, month - 1, day)
  if (
    dt.getFullYear() !== defaultYear ||
    dt.getMonth() !== month - 1 ||
    dt.getDate() !== day
  ) {
    return null
  }
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${defaultYear}-${mm}-${dd}`
}
