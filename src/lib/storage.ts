import type { AppState, Word, WordCard } from "@/lib/types"
import { dateKey } from "@/lib/dates"

export const STORAGE_KEY = "gre3000.vocab.v1"
export const MIN_DAILY = 50
export const MAX_DAILY = 150
export const DEFAULT_DAILY = 100

export function defaultState(now = new Date()): AppState {
  return {
    version: 1,
    dailyTarget: DEFAULT_DAILY,
    streak: 0,
    lastActiveDate: null,
    todayDate: dateKey(now),
    todayNewIds: [],
    todayNewDone: [],
    todayCorrect: 0,
    todayWrong: 0,
    dailyCounts: {},
    introduced: [],
    cards: {},
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    if (parsed.version !== 1 || !parsed.cards) return defaultState()
    return {
      ...defaultState(),
      ...parsed,
      version: 1,
      dailyTarget: clampDaily(parsed.dailyTarget ?? DEFAULT_DAILY),
      cards: parsed.cards ?? {},
      introduced: parsed.introduced ?? [],
      todayNewIds: parsed.todayNewIds ?? [],
      todayNewDone: parsed.todayNewDone ?? [],
      todayCorrect: parsed.todayCorrect ?? 0,
      todayWrong: parsed.todayWrong ?? 0,
      dailyCounts: parsed.dailyCounts ?? {},
    }
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clampDaily(n: number): number {
  const rounded = Math.round(n / 10) * 10
  return Math.min(MAX_DAILY, Math.max(MIN_DAILY, rounded))
}

export function ensureTodayQueue(state: AppState, words: Word[]): AppState {
  const today = dateKey()
  let next: AppState = state

  if (state.todayDate !== today) {
    next = {
      ...state,
      todayDate: today,
      todayNewIds: [],
      todayNewDone: [],
      todayCorrect: 0,
      todayWrong: 0,
    }
  }

  const introduced = new Set(next.introduced)
  const queued = new Set(next.todayNewIds)
  const need = next.dailyTarget - next.todayNewIds.length
  if (need <= 0) return next

  const extra: string[] = []
  for (const word of words) {
    if (introduced.has(word.id) || queued.has(word.id)) continue
    extra.push(word.id)
    if (extra.length >= need) break
  }

  if (extra.length === 0) return next
  return { ...next, todayNewIds: [...next.todayNewIds, ...extra] }
}

export function touchStreak(state: AppState, now = new Date()): AppState {
  const today = dateKey(now)
  if (state.lastActiveDate === today) return state
  const yest = yesterdayKeyFromKey(today)
  const streak = state.lastActiveDate === yest ? state.streak + 1 : 1
  return { ...state, lastActiveDate: today, streak }
}

function yesterdayKeyFromKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number)
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1)
  dt.setDate(dt.getDate() - 1)
  return dateKey(dt)
}

export function dueCardIds(
  cards: Record<string, WordCard>,
  now = Date.now()
): string[] {
  const ids: string[] = []
  for (const [id, card] of Object.entries(cards)) {
    if (card.nextReviewAt <= now) ids.push(id)
  }
  ids.sort((a, b) => cards[a].nextReviewAt - cards[b].nextReviewAt)
  return ids
}

export function learnedCount(state: AppState): number {
  return state.introduced.length
}

export function noteActivity(
  state: AppState,
  kind: "learn" | "review",
  correct = false
): AppState {
  const today = dateKey()
  const dailyCounts = pruneCounts(state.dailyCounts ?? {}, today)
  dailyCounts[today] = (dailyCounts[today] ?? 0) + 1
  const sameDay = state.todayDate === today
  const todayCorrect =
    (sameDay ? state.todayCorrect : 0) + (kind === "review" && correct ? 1 : 0)
  const todayWrong =
    (sameDay ? state.todayWrong : 0) + (kind === "review" && !correct ? 1 : 0)
  return { ...state, dailyCounts, todayCorrect, todayWrong }
}

function pruneCounts(
  counts: Record<string, number>,
  today: string
): Record<string, number> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 21)
  const min = dateKey(cutoff)
  const next: Record<string, number> = {}
  for (const [key, value] of Object.entries(counts)) {
    if (key >= min && key <= today) next[key] = value
  }
  return next
}
