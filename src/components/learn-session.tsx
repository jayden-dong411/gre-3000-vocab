import { useEffect, useMemo, useState } from "react"
import { Check, RotateCcw, X } from "lucide-react"
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
    [state.todayNewDone, state.todayNewIds, wordMap],
  )
  const current = queue[0]
  const [flipWordId, setFlipWordId] = useState<string | null>(null)
  const flipped = Boolean(current && flipWordId === current.id)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        if (!current) return
        setFlipWordId((id) => (id === current.id ? null : current.id))
        return
      }
      if (!current) return
      if (e.key === "1" || e.key.toLowerCase() === "x") {
        markNewWord(current.id, false)
      }
      if (e.key === "2" || e.key.toLowerCase() === "k") {
        markNewWord(current.id, true)
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
            不认识的词会在几分钟后进入复习队列。
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
    <div>
      <SessionHeader
        title="今日新词"
        subtitle="点卡片翻转 · 空格翻转 · 1 不认识 / 2 认识"
        progress={{ current: todayDone, total: todayTotal }}
        onBack={() => setView("home")}
      />

      <div className="flip-scene mx-auto h-[min(440px,62dvh)] w-full">
        <div
          role="button"
          tabIndex={0}
          className={cn("flip-card", flipped && "is-flipped")}
          onClick={() => {
            if (!current) return
            setFlipWordId((id) => (id === current.id ? null : current.id))
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && current) {
              setFlipWordId((id) => (id === current.id ? null : current.id))
            }
          }}
          aria-label={flipped ? "显示单词" : "显示释义"}
        >
          <div className="flip-face">
            <GlassPanel className="flex h-full flex-col items-center justify-center px-6 py-8 text-center">
              <p className="text-[11px] tracking-[0.22em] text-slate-400 uppercase">
                New word
              </p>
              <h2 className="mt-3 font-serif text-4xl tracking-tight text-slate-900 sm:text-5xl">
                {current.word}
              </h2>
              <p className="mt-3 font-mono text-sm text-slate-500 sm:text-base">
                {current.phonetic || "暂无音标"}
              </p>
              <div className="mt-5">
                <SpeakButton text={current.word} />
              </div>
              <p className="mt-8 text-xs text-slate-400">点击卡片查看释义与例句</p>
            </GlassPanel>
          </div>
          <div className="flip-face flip-back">
            <GlassPanel className="flex h-full flex-col overflow-y-auto px-5 py-6 sm:px-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-slate-900">{current.word}</h2>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {current.phonetic}
                  </p>
                </div>
                <SpeakButton text={current.word} />
              </div>
              <p className="mt-4 text-lg leading-snug font-medium text-slate-900">
                {current.meaningZh}
              </p>
              {current.meaningEn ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {current.meaningEn}
                </p>
              ) : null}
              {current.exampleEn ? (
                <figure className="mt-5 rounded-2xl border border-white/70 bg-white/40 px-4 py-3 text-left">
                  <blockquote className="text-sm leading-relaxed text-slate-700">
                    {current.exampleEn}
                  </blockquote>
                  {current.exampleZh ? (
                    <figcaption className="mt-2 text-xs leading-relaxed text-slate-500">
                      {current.exampleZh}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}
            </GlassPanel>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-2xl border-rose-200/80 bg-rose-50/50 text-base text-rose-700 hover:bg-rose-50 active:translate-y-px"
          onClick={() => markNewWord(current.id, false)}
        >
          <X className="size-4" />
          不认识
        </Button>
        <Button
          type="button"
          className="h-12 rounded-2xl bg-emerald-600 text-base text-white shadow-lg shadow-emerald-700/15 hover:bg-emerald-500 active:translate-y-px"
          onClick={() => markNewWord(current.id, true)}
        >
          <Check className="size-4" />
          认识
        </Button>
      </div>
      <button
        type="button"
        className="mx-auto mt-4 flex items-center gap-1 text-xs text-slate-400"
        onClick={() => {
          if (!current) return
          setFlipWordId((id) => (id === current.id ? null : current.id))
        }}
      >
        <RotateCcw className="size-3" />
        {flipped ? "回到单词" : "翻转看释义"}
      </button>
    </div>
  )
}
