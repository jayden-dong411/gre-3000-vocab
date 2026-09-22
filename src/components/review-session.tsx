import { useCallback, useEffect, useMemo, useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassPanel } from "@/components/glass"
import { SessionHeader } from "@/components/session-header"
import { SpeakButton } from "@/components/speak-button"
import type { VocabEngine } from "@/hooks/use-vocab"
import { SRS_LABELS } from "@/lib/srs"
import { buildChoices, type Choice } from "@/lib/words"
import { cn } from "@/lib/utils"

type Phase = "ask" | "feedback"

export function ReviewSession({
  engine,
  embedded = false,
  hotkeys = true,
}: {
  engine: VocabEngine
  embedded?: boolean
  hotkeys?: boolean
}) {
  const { dueIds, wordMap, words, answerReview, setView, state } = engine
  const [queue, setQueue] = useState<string[]>(() => dueIds)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("ask")
  const [picked, setPicked] = useState<string | null>(null)
  const [lockedId, setLockedId] = useState<string | null>(null)
  const [nextReady, setNextReady] = useState(false)
  const [sessionSeed] = useState(() => Date.now().toString(36))

  const extras = dueIds.filter((id) => !queue.includes(id))
  if (extras.length > 0) {
    setQueue([...queue, ...extras])
  }
  const liveQueue = extras.length > 0 ? [...queue, ...extras] : queue

  const currentId =
    phase === "feedback" && lockedId ? lockedId : liveQueue[index]
  const current = currentId ? wordMap.get(currentId) : undefined
  const total = liveQueue.length

  const choices = useMemo<Choice[]>(() => {
    if (!current) return []
    return buildChoices(current, words, sessionSeed)
  }, [current, sessionSeed, words])

  const goNext = useCallback(() => {
    if (!nextReady) return
    setIndex((i) => (i + 1 >= liveQueue.length ? liveQueue.length : i + 1))
    setPhase("ask")
    setPicked(null)
    setLockedId(null)
    setNextReady(false)
  }, [liveQueue.length, nextReady])

  const select = useCallback(
    (choice: Choice) => {
      if (phase !== "ask" || !current) return
      setPicked(choice.id)
      setLockedId(current.id)
      setPhase("feedback")
      setNextReady(false)
      answerReview(current.id, choice.correct)
    },
    [answerReview, current, phase]
  )

  useEffect(() => {
    if (phase !== "feedback") return
    const timer = window.setTimeout(() => setNextReady(true), 320)
    return () => window.clearTimeout(timer)
  }, [phase, lockedId])

  useEffect(() => {
    if (!hotkeys) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (phase === "ask") {
        const n = Number(e.key)
        if (n >= 1 && n <= 4) {
          const choice = choices[n - 1]
          if (choice) select(choice)
        }
      } else if (nextReady && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hotkeys, phase, choices, select, goNext, nextReady])

  if (total === 0 || index >= total) {
    return (
      <div className={cn(embedded && "flex h-full min-h-0 flex-col")}>
        {embedded ? null : (
          <SessionHeader
            title="间隔复习"
            progress={{ current: total, total: total }}
            onBack={() => setView("home")}
          />
        )}
        <GlassPanel
          className={cn(
            "px-6 py-12 text-center",
            embedded && "flex flex-1 flex-col items-center justify-center py-8"
          )}
        >
          <p className="text-sm font-medium text-slate-500">复习</p>
          <p className="mt-2 font-serif text-2xl text-slate-900">
            {total === 0 ? "暂时没有到期复习" : "本轮复习完成"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            新学的词会按 8 分钟 → 15 天的节奏回来。
          </p>
          {embedded ? null : (
            <Button
              className="mt-6 h-10 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              onClick={() => setView("home")}
            >
              返回首页
            </Button>
          )}
        </GlassPanel>
      </div>
    )
  }

  if (!current) {
    return (
      <div>
        <SessionHeader
          title="间隔复习"
          progress={{ current: index, total }}
          onBack={() => setView("home")}
        />
        <GlassPanel className="px-6 py-10 text-center text-sm text-slate-500">
          找不到这张卡片，已跳过。
          <div className="mt-4">
            <Button onClick={goNext}>下一题</Button>
          </div>
        </GlassPanel>
      </div>
    )
  }

  const pickedChoice = choices.find((c) => c.id === picked)
  const correctChoice = choices.find((c) => c.correct)
  const wasCorrect = Boolean(pickedChoice?.correct)
  const card = state.cards[current.id]
  const nextLabel = card ? SRS_LABELS[card.stage] : ""

  return (
    <div className={cn("min-h-0", embedded ? "flex h-full flex-col" : "flex min-h-0 flex-1 flex-col")}>
      {embedded ? (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-slate-800">复习</p>
          <p className="font-mono text-xs text-slate-400 tabular-nums">
            {index + 1} / {total}
            {hotkeys ? " · 1–4 作答" : ""}
          </p>
        </div>
      ) : (
        <SessionHeader
          title="间隔复习"
          subtitle="英译中四选一 · 1–4 作答，看完对错再下一题"
          progress={{ current: index, total }}
          onBack={() => setView("home")}
        />
      )}

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto sm:gap-3",
          !embedded && "pb-1"
        )}
      >
        <GlassPanel
          className={cn(
            "flex flex-col items-center justify-center px-4 py-5 text-center sm:px-6 sm:py-8",
            embedded ? "min-h-36 flex-1 sm:min-h-48" : "min-h-0"
          )}
        >
          <p className="text-[10px] tracking-[0.18em] text-slate-400 uppercase sm:text-[11px] sm:tracking-[0.22em]">
            选择正确释义
          </p>
          <h2 className="mt-2 max-w-full font-serif text-3xl tracking-tight text-slate-900 sm:mt-3 sm:text-5xl md:text-6xl">
            {current.word}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2 sm:mt-3">
            <p className="font-mono text-xs text-slate-500 sm:text-sm">
              {current.phonetic}
            </p>
            <SpeakButton text={current.word} />
          </div>
        </GlassPanel>

        <div className="grid grid-cols-1 gap-1.5 sm:gap-2.5">
          {choices.map((choice, i) => {
            const selected = picked === choice.id
            const show = phase === "feedback"
            const isRight = choice.correct
            return (
              <button
                key={choice.id}
                type="button"
                disabled={phase === "feedback"}
                onClick={() => select(choice)}
                className={cn(
                  "min-h-11 rounded-xl border px-3.5 py-2.5 text-left text-sm leading-snug transition-all active:translate-y-px disabled:cursor-default sm:min-h-16 sm:rounded-2xl sm:px-5 sm:py-4 sm:text-base",
                  "border-white/70 bg-white/50 backdrop-blur-xl hover:bg-white/80",
                  show &&
                    isRight &&
                    "border-emerald-300 bg-emerald-50/80 text-emerald-900",
                  show &&
                    selected &&
                    !isRight &&
                    "border-rose-300 bg-rose-50/80 text-rose-800"
                )}
              >
                <span className="mr-2 font-mono text-[10px] text-slate-400 sm:text-xs">
                  {i + 1}
                </span>
                {choice.label}
              </button>
            )
          })}
        </div>

        {phase === "feedback" ? (
          <GlassPanel className="sticky bottom-0 z-10 px-4 py-3 sm:static sm:px-5 sm:py-4">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full sm:size-8",
                  wasCorrect
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                )}
              >
                {wasCorrect ? (
                  <Check className="size-3.5 sm:size-4" />
                ) : (
                  <X className="size-3.5 sm:size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {wasCorrect ? "答对了" : "答错了"}
                  {nextLabel ? ` · 下次约 ${nextLabel} 后` : ""}
                </p>
                <p className="mt-0.5 text-sm text-slate-600 sm:mt-1">
                  {current.word}：{correctChoice?.label}
                </p>
                {current.exampleEn ? (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:mt-2 sm:line-clamp-none">
                    {current.exampleEn}
                    {current.exampleZh ? ` ${current.exampleZh}` : ""}
                  </p>
                ) : null}
              </div>
            </div>
            <Button
              className="mt-3 h-10 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 sm:mt-4 sm:h-11"
              disabled={!nextReady}
              onClick={goNext}
            >
              下一题
            </Button>
          </GlassPanel>
        ) : null}
      </div>
    </div>
  )
}
