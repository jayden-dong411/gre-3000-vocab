import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Check, CircleDashed, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassPanel } from "@/components/glass"
import { SessionHeader } from "@/components/session-header"
import { SpeakButton } from "@/components/speak-button"
import type { VocabEngine } from "@/hooks/use-vocab"
import type { Word } from "@/lib/types"
import { cn } from "@/lib/utils"

export function LearnSession({ engine }: { engine: VocabEngine }) {
  const { state, wordMap, markNewWord, setView, todayDone, todayTotal } = engine
  const queue = useMemo(
    () =>
      state.todayNewIds
        .filter((id) => !state.todayNewDone.includes(id))
        .map((id) => wordMap.get(id))
        .filter((w): w is Word => Boolean(w)),
    [state.todayNewDone, state.todayNewIds, wordMap]
  )
  const current = queue[0]
  const [revealedId, setRevealedId] = useState<string | null>(null)
  const revealed = Boolean(current && revealedId === current.id)

  function toggleReveal() {
    if (!current) return
    setRevealedId((id) => (id === current.id ? null : current.id))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (!current) return
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        setRevealedId((id) => (id === current.id ? null : current.id))
        return
      }
      if (e.key === "1" || e.key.toLowerCase() === "x") {
        markNewWord(current.id, "unknown")
      }
      if (e.key === "2") {
        markNewWord(current.id, "fuzzy")
      }
      if (e.key === "3" || e.key.toLowerCase() === "k") {
        markNewWord(current.id, "known")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [current, markNewWord])

  if (!current) {
    return (
      <div>
        <SessionHeader
          title="今日新词"
          progress={{ current: todayDone, total: todayTotal }}
          onBack={() => setView("home")}
        />
        <GlassPanel className="px-5 py-10 text-center sm:px-6 sm:py-12">
          <p className="font-serif text-xl text-slate-900 sm:text-2xl">
            今日新词已完成
          </p>
          <p className="mt-2 text-sm text-slate-500">
            不认识的词可以马上复习；标成模糊的词大约 30 分钟后再出现。
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              className="h-10 rounded-xl"
              variant="outline"
              onClick={() => setView("home")}
            >
              返回首页
            </Button>
            <Button
              className="h-10 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              onClick={() => setView("review")}
            >
              去复习
            </Button>
          </div>
        </GlassPanel>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SessionHeader
        title="今日新词"
        subtitle="空格展开释义 · 1 不认识 · 2 模糊 · 3 认识"
        progress={{ current: todayDone, total: todayTotal }}
        onBack={() => setView("home")}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pb-2 sm:gap-3">
        <div
          key={current.id}
          className="word-rise flex flex-col items-center justify-center rounded-2xl border border-white/80 bg-white/94 px-4 py-5 text-center shadow-[0_10px_28px_rgb(15_23_42/0.06)] sm:rounded-3xl sm:px-6 sm:py-8"
        >
          <p className="text-[10px] tracking-[0.18em] text-slate-400 uppercase sm:text-[11px] sm:tracking-[0.22em]">
            New word
          </p>
          <h2 className="mt-2 max-w-full font-serif text-3xl tracking-tight text-slate-900 sm:mt-3 sm:text-5xl md:text-6xl">
            {current.word}
          </h2>
          <p className="mt-2 font-mono text-sm text-slate-500 sm:mt-3 sm:text-base">
            {current.phonetic || "暂无音标"}
          </p>
          <div className="mt-3 sm:mt-4">
            <SpeakButton text={current.word} />
          </div>
        </div>

        <button
          type="button"
          className="w-full rounded-2xl border border-white/80 bg-white/94 px-4 py-3.5 text-center shadow-[0_10px_28px_rgb(15_23_42/0.06)] sm:rounded-3xl sm:px-6 sm:py-5"
          onClick={toggleReveal}
          aria-expanded={revealed}
          aria-label={revealed ? "收起释义" : "展开释义"}
        >
          <p className="text-[10px] tracking-[0.16em] text-slate-400 uppercase sm:text-[11px] sm:tracking-[0.18em]">
            释义
          </p>
          <div className={cn("gloss-fold", revealed && "is-open")}>
            <div className="min-h-0 overflow-hidden">
              <div className={cn("gloss-body", revealed && "is-open")}>
                <p className="text-lg leading-snug font-medium text-slate-900 sm:text-2xl md:text-3xl">
                  {current.meaningZh || "暂无释义"}
                </p>
                {current.meaningEn ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500 sm:mt-2 sm:text-base">
                    {current.meaningEn}
                  </p>
                ) : null}
                {current.exampleEn ? (
                  <figure className="mt-3 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 sm:mt-4 sm:rounded-2xl sm:px-4 sm:py-4">
                    <blockquote className="text-sm leading-relaxed text-slate-800 sm:text-lg">
                      {current.exampleEn}
                    </blockquote>
                    {current.exampleZh ? (
                      <figcaption className="mt-1.5 text-sm leading-relaxed text-slate-500 sm:mt-2 sm:text-base">
                        {current.exampleZh}
                      </figcaption>
                    ) : null}
                  </figure>
                ) : null}
              </div>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-slate-500 sm:mt-2 sm:text-sm">
            {revealed ? "点击收起" : "点击或按空格展开"}
          </p>
        </button>
      </div>

      <div className="-mx-1 mt-2 grid shrink-0 grid-cols-3 gap-1.5 pt-1 pb-1 sm:mx-0 sm:mt-3 sm:gap-3 sm:pt-0 sm:pb-0">
        <RatingButton
          tone="unknown"
          label="不认识"
          hint="马上复习"
          icon={<X className="size-4 sm:size-5" />}
          onClick={() => markNewWord(current.id, "unknown")}
        />
        <RatingButton
          tone="fuzzy"
          label="模糊"
          hint="约 30 分钟"
          icon={<CircleDashed className="size-4 sm:size-5" />}
          onClick={() => markNewWord(current.id, "fuzzy")}
        />
        <RatingButton
          tone="known"
          label="认识"
          hint="约 1 天后"
          icon={<Check className="size-4 sm:size-5" />}
          onClick={() => markNewWord(current.id, "known")}
        />
      </div>
    </div>
  )
}

function RatingButton({
  tone,
  label,
  hint,
  icon,
  onClick,
}: {
  tone: "unknown" | "fuzzy" | "known"
  label: string
  hint: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "h-14 flex-col gap-0 rounded-xl px-1.5 text-sm shadow-none transition duration-200 hover:-translate-y-0.5 active:translate-y-px sm:h-20 sm:gap-0.5 sm:rounded-2xl sm:px-2 sm:text-base",
        tone === "unknown" &&
          "border-rose-200/80 bg-rose-50/80 text-rose-700 hover:bg-rose-50",
        tone === "fuzzy" &&
          "border-amber-200/90 bg-amber-50/90 text-amber-800 hover:bg-amber-50",
        tone === "known" &&
          "border-emerald-200/80 bg-emerald-600 text-white hover:bg-emerald-500"
      )}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1 sm:gap-1.5">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "text-[10px] font-normal sm:text-xs",
          tone === "known" ? "text-emerald-50" : "opacity-70"
        )}
      >
        {hint}
      </span>
    </Button>
  )
}
