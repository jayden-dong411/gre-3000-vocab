import type { Word, WordBank } from "@/lib/types"

let cached: Word[] | null = null
let inflight: Promise<Word[]> | null = null

export async function loadWords(): Promise<Word[]> {
  if (cached) return cached
  if (inflight) return inflight
  inflight = (async () => {
    const res = await fetch("/data/words.json")
    if (!res.ok) {
      throw new Error(`词库加载失败（${res.status}）`)
    }
    const data = (await res.json()) as WordBank
    cached = data.words ?? []
    return cached
  })()
  try {
    return await inflight
  } finally {
    inflight = null
  }
}

export function byId(words: Word[]): Map<string, Word> {
  const map = new Map<string, Word>()
  for (const w of words) map.set(w.id, w)
  return map
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffleInPlace<T>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export type Choice = {
  id: string
  label: string
  correct: boolean
}

export function buildChoices(
  word: Word,
  pool: Word[],
  seedKey: string,
): Choice[] {
  const correct = word.meaningZh || word.meaningEn || word.word
  const others: Choice[] = []
  const used = new Set<string>([correct, word.id])

  const seed = hashString(`${word.id}:${seedKey}`)
  const rand = mulberry32(seed)
  const candidates = pool.filter((w) => w.id !== word.id && w.meaningZh)
  // pick 3 unique Chinese glosses
  let guard = 0
  while (others.length < 3 && guard < 80 && candidates.length > 0) {
    guard++
    const pick = candidates[Math.floor(rand() * candidates.length)]
    if (!pick || used.has(pick.id) || used.has(pick.meaningZh)) continue
    used.add(pick.id)
    used.add(pick.meaningZh)
    others.push({ id: pick.id, label: pick.meaningZh, correct: false })
  }

  const choices: Choice[] = [
    { id: word.id, label: correct, correct: true },
    ...others,
  ]
  return shuffleInPlace(choices, seed ^ 0x9e3779b9)
}
