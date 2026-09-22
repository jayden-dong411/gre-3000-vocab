/** Ebbinghaus-inspired spaced repetition intervals (milliseconds). */
export const SRS_INTERVALS_MS = [
  8 * 60 * 1000, // 0: 8 minutes (5–10 min band)
  30 * 60 * 1000, // 1: 30 minutes
  12 * 60 * 60 * 1000, // 2: 12 hours
  1 * 24 * 60 * 60 * 1000, // 3: 1 day
  2 * 24 * 60 * 60 * 1000, // 4: 2 days
  4 * 24 * 60 * 60 * 1000, // 5: 4 days
  7 * 24 * 60 * 60 * 1000, // 6: 7 days
  15 * 24 * 60 * 60 * 1000, // 7: 15 days
] as const

export const SRS_LABELS = [
  "8 分钟",
  "30 分钟",
  "12 小时",
  "1 天",
  "2 天",
  "4 天",
  "7 天",
  "15 天",
] as const

export const MAX_STAGE = SRS_INTERVALS_MS.length - 1
/** Reaching the 7-day band counts as mastered. */
export const MASTERED_STAGE = 6

export function isMastered(stage: number): boolean {
  return stage >= MASTERED_STAGE
}
export const DEFAULT_EASE = 2.5

export function clampStage(stage: number): number {
  return Math.max(0, Math.min(MAX_STAGE, stage))
}

export function scheduleAt(
  stage: number,
  ease: number,
  now = Date.now()
): number {
  const base = SRS_INTERVALS_MS[clampStage(stage)]
  const factor = Math.max(1.3, ease) / DEFAULT_EASE
  return now + Math.round(base * factor)
}

/** Self-rating while learning a new word. */
export type LearnRating = "unknown" | "fuzzy" | "known"

/**
 * Where a new word enters the curve:
 * 不认识 → stage 0 (due immediately), 模糊 → stage 1 (~30 min), 认识 → stage 3 (~1 day).
 */
export function stageAfterLearn(rating: LearnRating): number {
  if (rating === "known") return 3
  if (rating === "fuzzy") return 1
  return 0
}

/** Correct multiple-choice: advance one stage. */
export function stageAfterCorrect(stage: number): number {
  return clampStage(stage + 1)
}

/** Wrong multiple-choice: drop one stage (floor at 0) and review sooner. */
export function stageAfterWrong(stage: number): number {
  return clampStage(stage - 1)
}

export function easeAfterCorrect(ease: number): number {
  return Math.min(3.2, ease + 0.1)
}

export function easeAfterWrong(ease: number): number {
  return Math.max(1.3, ease - 0.2)
}
