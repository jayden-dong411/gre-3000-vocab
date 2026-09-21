import { useCallback, useEffect, useMemo, useState } from "react"
import type { AppState, View, Word, WordCard } from "@/lib/types"
import { dateKey } from "@/lib/dates"
import {
  DEFAULT_EASE,
  easeAfterCorrect,
  easeAfterWrong,
  scheduleAt,
  stageAfterCorrect,
  stageAfterLearn,
  stageAfterWrong,
} from "@/lib/srs"
import {
  clampDaily,
  defaultState,
  dueCardIds,
  ensureTodayQueue,
  loadState,
  saveState,
  touchStreak,
} from "@/lib/storage"
import { loadWords } from "@/lib/words"

export function useVocabEngine() {
  const [words, setWords] = useState<Word[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<AppState>(() =>
    typeof window === "undefined" ? defaultState() : loadState(),
  )
  const [view, setView] = useState<View>("home")
  const [now, setNow] = useState(() => Date.now())

  const persist = useCallback((next: AppState) => {
    saveState(next)
    setState(next)
  }, [])

  useEffect(() => {
    let cancelled = false
    loadWords()
      .then((list) => {
        if (cancelled) return
        setWords(list)
        persist(ensureTodayQueue(loadState(), list))
        setStatus("ready")
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "词库加载失败")
        setStatus("error")
      })
    return () => {
      cancelled = true
    }
  }, [persist])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const wordMap = useMemo(() => {
    const map = new Map<string, Word>()
    for (const w of words) map.set(w.id, w)
    return map
  }, [words])

  const dueIds = useMemo(
    () => dueCardIds(state.cards, now),
    [state.cards, now],
  )

  const todayRemaining = state.todayNewIds.filter(
    (id) => !state.todayNewDone.includes(id),
  ).length
  const todayTotal = state.todayNewIds.length
  const todayDone = state.todayNewDone.length

  const setDailyTarget = useCallback(
    (n: number) => {
      const dailyTarget = clampDaily(n)
      persist(ensureTodayQueue({ ...state, dailyTarget }, words))
    },
    [persist, state, words],
  )

  const markNewWord = useCallback(
    (id: string, known: boolean) => {
      const t = Date.now()
      const stage = stageAfterLearn(known)
      const card: WordCard = {
        stage,
        nextReviewAt: known ? scheduleAt(stage, DEFAULT_EASE, t) : t,
        ease: DEFAULT_EASE,
        wrongCount: 0,
        correctCount: 0,
        introducedAt: t,
        known,
      }
      const introduced = state.introduced.includes(id)
        ? state.introduced
        : [...state.introduced, id]
      const todayNewDone = state.todayNewDone.includes(id)
        ? state.todayNewDone
        : [...state.todayNewDone, id]
      persist(
        touchStreak({
          ...state,
          introduced,
          todayNewDone,
          cards: { ...state.cards, [id]: card },
        }),
      )
    },
    [persist, state],
  )

  const answerReview = useCallback(
    (id: string, correct: boolean) => {
      const existing = state.cards[id]
      if (!existing) return
      const t = Date.now()
      const stage = correct
        ? stageAfterCorrect(existing.stage)
        : stageAfterWrong(existing.stage)
      const ease = correct
        ? easeAfterCorrect(existing.ease)
        : easeAfterWrong(existing.ease)
      const card: WordCard = {
        ...existing,
        stage,
        ease,
        nextReviewAt: scheduleAt(stage, ease, t),
        correctCount: existing.correctCount + (correct ? 1 : 0),
        wrongCount: existing.wrongCount + (correct ? 0 : 1),
        known: correct ? existing.known : false,
      }
      persist(
        touchStreak({
          ...state,
          cards: { ...state.cards, [id]: card },
        }),
      )
    },
    [persist, state],
  )

  const resetProgress = useCallback(() => {
    const fresh = ensureTodayQueue(defaultState(), words)
    persist(fresh)
    setView("home")
  }, [persist, words])

  return {
    words,
    wordMap,
    status,
    error,
    state,
    view,
    setView,
    now,
    dueIds,
    todayRemaining,
    todayTotal,
    todayDone,
    todayKey: dateKey(),
    setDailyTarget,
    markNewWord,
    answerReview,
    resetProgress,
  }
}

export type VocabEngine = ReturnType<typeof useVocabEngine>
