export function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

export function dateKey(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function yesterdayKey(from = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() - 1)
  return dateKey(d)
}

const WEEKDAYS = [
  "星期日",
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
]

export function formatDayLabel(d = new Date()): string {
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[d.getDay()]}`
}

export function recentDates(count = 7, from = new Date()): Date[] {
  const days: Date[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(from)
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

export function greeting(d = new Date()): string {
  const h = d.getHours()
  if (h < 5) return "夜深了，还在坚持"
  if (h < 11) return "早上好"
  if (h < 14) return "中午好"
  if (h < 18) return "下午好"
  return "晚上好"
}
