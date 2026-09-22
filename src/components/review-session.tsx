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
  const [sessionIds] = useState<string[]>(dueIds)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("ask")
  const [picked, setPicked] = useState<string | null>(null)
  const [sessionSeed] = useState(() => Date.now().toString(36))
  const queue = useMemo(() => {
    const seen = new Set(sessionIds)
    const extras = dueIds.filter((id) => !seen.has(id))
    return extras.length === 0 ? sessionIds : [...sessionIds, ...extras]
  }, [dueIds, sessionIds])

  const currentId = queue[index]
  const current = currentId ? wordMap.get(currentId) : undefined
  const total = queue.length

  const choices = useMemo<Choice[]>(() => {
    if (!current) return []
    return buildChoices(current, words, sessionSeed)
  }, [current, sessionSeed, words])

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1 >= queue.length ? queue.length : i + 1))
    setPhase("ask")
    setPicked(null)
  }, [queue.length])

  const select = useCallback(
    (choice: Choice) => {
      if (phase !== "ask" || !current) return
      setPicked(choice.id)
      setPhase("feedback")
      answerReview(current.id, choice.correct)
    },
    [answerReview, current, phase]
  )

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
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hotkeys, phase, choices, select, goNext])

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
    <div className={cn(embedded && "flex h-full min-h-0 flex-col")}>
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
          subtitle="英译中四选一 · 数字键 1–4 也可作答"
          progress={{ current: index, total }}
          onBack={() => setView("home")}
        />
      )}

      <div
        className={cn(
          embedded
            ? "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
            : "lg:grid lg:grid-cols-[minmax(14rem,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-4"
        )}
      >
        <GlassPanel
          className={cn(
            "flex flex-col items-center justify-center px-5 py-8 text-center sm:px-6",
            embedded && "py-6"
          )}
        >
          <p className="text-[11px] tracking-[0.22em] text-slate-400 uppercase">
            选择正确释义
          </p>
          <h2
            className={cn(
              "mt-3 font-serif text-4xl tracking-tight text-slate-900 sm:text-5xl",
              embedded && "text-3xl sm:text-4xl"
            )}
          >
            {current.word}
          </h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <p className="font-mono text-sm text-slate-500">
              {current.phonetic}
            </p>
            <SpeakButton text={current.word} />
          </div>
        </GlassPanel>

        <div
          className={cn(
            "mt-4 grid gap-2.5",
            !embedded && "lg:mt-0 lg:grid-cols-2"
          )}
        >
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
                  "rounded-2xl border px-4 py-3.5 text-left text-[15px] leading-snug transition-all active:translate-y-px disabled:cursor-default lg:min-h-16 lg:px-5 lg:py-4 lg:text-base",
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
                <span className="mr-2 font-mono text-xs text-slate-400">
                  {i + 1}
                </span>
                {choice.label}
              </button>
            )
          })}
        </div>

        {phase === "feedback" ? (
          <GlassPanel className="mt-4 px-5 py-4 lg:col-span-2 lg:mt-0">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                  wasCorrect
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                )}
              >
                {wasCorrect ? (
                  <Check className="size-4" />
                ) : (
                  <X className="size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {wasCorrect ? "答对了" : "答错了"}
                  {nextLabel ? ` · 下次约 ${nextLabel} 后` : ""}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {current.word}：{correctChoice?.label}
                </p>
                {current.exampleEn ? (
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {current.exampleEn}
                    {current.exampleZh ? ` ${current.exampleZh}` : ""}
                  </p>
                ) : null}
              </div>
            </div>
            <Button
              className="mt-4 h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
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
