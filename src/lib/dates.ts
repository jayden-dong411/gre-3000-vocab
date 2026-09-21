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

export function greeting(d = new Date()): string {
  const h = d.getHours()
  if (h < 5) return "夜深了，还在坚持"
  if (h < 11) return "早上好"
  if (h < 14) return "中午好"
  if (h < 18) return "下午好"
  return "晚上好"
}
