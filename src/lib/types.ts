export type Sense = {
  pos: string
  en: string
  zh: string
}

export type Word = {
  id: string
  word: string
  phonetic: string
  meanings: Sense[]
  meaningZh: string
  meaningEn: string
  synonyms: string[]
  exampleEn: string
  exampleZh: string
  order: number
}

export type WordBank = {
  source: string
  count: number
  words: Word[]
}

export type WordCard = {
  stage: number
  nextReviewAt: number
  ease: number
  wrongCount: number
  correctCount: number
  introducedAt: number
  known: boolean
}

export type AppState = {
  version: 1
  dailyTarget: number
  streak: number
  lastActiveDate: string | null
  todayDate: string
  todayNewIds: string[]
  todayNewDone: string[]
  todayCorrect: number
  todayWrong: number
  dailyCounts: Record<string, number>
  introduced: string[]
  cards: Record<string, WordCard>
}

export type View = "home" | "learn" | "review" | "bank"
