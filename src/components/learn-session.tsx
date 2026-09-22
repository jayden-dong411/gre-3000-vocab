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
        <GlassPanel className="px-6 py-12 text-center">
          <p className="font-serif text-2xl text-slate-900">今日新词已完成</p>
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
    <div className="lg:flex lg:h-full lg:min-h-0 lg:flex-1 lg:flex-col">
      <SessionHeader
        title="今日新词"
        subtitle="空格查看释义 · 1 不认识 · 2 模糊 · 3 认识"
        progress={{ current: todayDone, total: todayTotal }}
        onBack={() => setView("home")}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div
          key={current.id}
          className="word-rise flex min-h-40 flex-1 flex-col items-center justify-center rounded-3xl border border-white/80 bg-white/94 px-6 py-8 text-center shadow-[0_10px_28px_rgb(15_23_42/0.06)]"
        >
          <p className="text-[11px] tracking-[0.22em] text-slate-400 uppercase">
            New word
          </p>
          <h2 className="mt-3 max-w-full font-serif text-5xl tracking-tight text-slate-900 sm:text-6xl">
            {current.word}
          </h2>
          <p className="mt-3 font-mono text-base text-slate-500">
            {current.phonetic || "暂无音标"}
          </p>
          <div className="mt-4">
            <SpeakButton text={current.word} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <RatingButton
            tone="unknown"
            label="不认识"
            hint="马上复习"
            icon={<X className="size-5" />}
            onClick={() => markNewWord(current.id, "unknown")}
          />
          <RatingButton
            tone="fuzzy"
            label="模糊"
            hint="约 30 分钟"
            icon={<CircleDashed className="size-5" />}
            onClick={() => markNewWord(current.id, "fuzzy")}
          />
          <RatingButton
            tone="known"
            label="认识"
            hint="约 1 天后"
            icon={<Check className="size-5" />}
            onClick={() => markNewWord(current.id, "known")}
          />
        </div>

        <div className="flip-scene min-h-40 flex-1">
          <div
            role="button"
            tabIndex={0}
            className={cn("flip-card", revealed && "is-flipped")}
            onClick={toggleReveal}
            onKeyDown={(e) => {
              if (e.key === "Enter") toggleReveal()
            }}
            aria-label={revealed ? "隐藏释义" : "显示释义"}
          >
            <div className="flip-face">
              <div className="flip-sheet items-center justify-center px-6 text-center">
                <p className="font-serif text-2xl text-slate-800">释义先藏着</p>
                <p className="hint-float mt-2 text-sm text-slate-500">
                  点击这里，或按空格翻开
                </p>
              </div>
            </div>
            <div className="flip-face flip-back">
              <div className="flip-sheet items-center justify-center overflow-auto px-6 py-6 text-center">
                <p className="text-[11px] tracking-[0.18em] text-slate-400 uppercase">
                  释义
                </p>
                <p className="mt-3 text-2xl leading-snug font-medium text-slate-900 sm:text-3xl">
                  {current.meaningZh || "暂无释义"}
                </p>
                {current.meaningEn ? (
                  <p className="mt-2 max-w-xl text-base leading-relaxed text-slate-500">
                    {current.meaningEn}
                  </p>
                ) : null}
                {current.exampleEn ? (
                  <figure className="mt-5 w-full max-w-xl rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4">
                    <blockquote className="text-lg leading-relaxed text-slate-800">
                      {current.exampleEn}
                    </blockquote>
                    {current.exampleZh ? (
                      <figcaption className="mt-2 text-base leading-relaxed text-slate-500">
                        {current.exampleZh}
                      </figcaption>
                    ) : null}
                  </figure>
                ) : null}
              </div>
            </div>
          </div>
        </div>
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
        "h-16 flex-col gap-0.5 rounded-2xl px-2 text-base shadow-none transition duration-200 hover:-translate-y-0.5 active:translate-y-px sm:h-20",
        tone === "unknown" &&
          "border-rose-200/80 bg-rose-50/80 text-rose-700 hover:bg-rose-50",
        tone === "fuzzy" &&
          "border-amber-200/90 bg-amber-50/90 text-amber-800 hover:bg-amber-50",
        tone === "known" &&
          "border-emerald-200/80 bg-emerald-600 text-white hover:bg-emerald-500"
      )}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "text-xs font-normal",
          tone === "known" ? "text-emerald-50" : "opacity-70"
        )}
      >
        {hint}
      </span>
    </Button>
  )
}
