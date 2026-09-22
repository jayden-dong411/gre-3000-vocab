import { useMemo, useState } from "react"
import { GlassPanel } from "@/components/glass"
import type { VocabEngine } from "@/hooks/use-vocab"
import { isMastered } from "@/lib/srs"
import type { Word } from "@/lib/types"
import { cn } from "@/lib/utils"

type Filter = "all" | "reviewing" | "mastered" | "new"

const PAGE = 48

export function WordBank({ engine }: { engine: VocabEngine }) {
  const { words, state } = engine
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [shown, setShown] = useState(PAGE)
  const [openId, setOpenId] = useState<string | null>(null)

  const stats = useMemo(() => {
    let mastered = 0
    let reviewing = 0
    for (const id of state.introduced) {
      const card = state.cards[id]
      if (card && isMastered(card.stage)) mastered += 1
      else reviewing += 1
    }
    return {
      mastered,
      reviewing,
      fresh: Math.max(0, words.length - state.introduced.length),
    }
  }, [state.cards, state.introduced, words.length])

  const introducedSet = useMemo(
    () => new Set(state.introduced),
    [state.introduced]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return words.filter((word) => {
      const status = statusOf(word, state.cards, introducedSet)
      if (filter === "reviewing" && status !== "reviewing") return false
      if (filter === "mastered" && status !== "mastered") return false
      if (filter === "new" && status !== "new") return false
      if (!q) return true
      return (
        word.word.toLowerCase().includes(q) ||
        word.meaningZh.toLowerCase().includes(q) ||
        word.meaningEn.toLowerCase().includes(q)
      )
    })
  }, [filter, introducedSet, query, state.cards, words])

  const visible = filtered.slice(0, shown)
  const learnedPct =
    words.length === 0 ? 0 : (state.introduced.length / words.length) * 100
  const masteredPct =
    words.length === 0 ? 0 : (stats.mastered / words.length) * 100

  return (
    <div className="flex flex-col gap-4">
      <GlassPanel className="p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-800">掌握进度</p>
            <p className="mt-1 text-xs text-slate-500">
              进入 7 天复习档记为已掌握。未学的词还没进过今日新词。
            </p>
          </div>
          <p className="font-serif text-3xl text-slate-900 tabular-nums">
            {stats.mastered}
            <span className="text-base text-slate-400"> / {words.length}</span>
          </p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="flex h-full">
            <div
              className="bg-violet-500"
              style={{ width: `${masteredPct}%` }}
            />
            <div
              className="bg-amber-300"
              style={{ width: `${Math.max(0, learnedPct - masteredPct)}%` }}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          <span>已掌握 {stats.mastered}</span>
          <span>复习中 {stats.reviewing}</span>
          <span>未学 {stats.fresh}</span>
        </div>
      </GlassPanel>

      <GlassPanel className="p-3 sm:p-4">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShown(PAGE)
            setOpenId(null)
          }}
          placeholder="搜索单词或中文释义..."
          className="h-11 w-full rounded-2xl border border-white/80 bg-white/70 px-4 text-sm outline-none placeholder:text-slate-400"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["all", "全部"],
              ["reviewing", "复习中"],
              ["mastered", "已掌握"],
              ["new", "未学"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setFilter(id)
                setShown(PAGE)
                setOpenId(null)
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs",
                filter === id
                  ? "bg-slate-900 text-white"
                  : "bg-white/70 text-slate-500 ring-1 ring-white"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </GlassPanel>

      {visible.length === 0 ? (
        <GlassPanel className="px-6 py-10 text-center text-sm text-slate-500">
          没有符合条件的词。
        </GlassPanel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((word, index) => {
            const status = statusOf(word, state.cards, introducedSet)
            const open = openId === word.id
            return (
              <button
                key={word.id}
                type="button"
                aria-expanded={open}
                onClick={() =>
                  setOpenId((id) => (id === word.id ? null : word.id))
                }
                style={{ animationDelay: `${Math.min(index, 10) * 28}ms` }}
                className="word-rise rounded-[1.4rem] border border-white/80 bg-white/75 p-4 text-left shadow-[0_10px_28px_rgb(15_23_42/0.05)] transition duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-serif text-lg text-slate-900">
                      {word.word}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                      {word.phonetic || "暂无音标"}
                    </p>
                  </div>
                  <StatusBadge status={status} />
                </div>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="min-h-0 overflow-hidden" aria-hidden={!open}>
                    <p className="pt-2 text-sm leading-relaxed text-slate-700">
                      {word.meaningZh || "暂无释义"}
                    </p>
                    {word.meaningEn ? (
                      <p className="pt-1 text-xs leading-relaxed text-slate-400">
                        {word.meaningEn}
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  {open ? "点击收起" : "点击查看释义"}
                </p>
              </button>
            )
          })}
        </div>
      )}

      {shown < filtered.length ? (
        <button
          type="button"
          className="mx-auto text-sm text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
          onClick={() => setShown((n) => n + PAGE)}
        >
          再显示 {Math.min(PAGE, filtered.length - shown)} 个
        </button>
      ) : null}
    </div>
  )
}

function statusOf(
  word: Word,
  cards: VocabEngine["state"]["cards"],
  introduced: Set<string>
): "new" | "reviewing" | "mastered" {
  if (!introduced.has(word.id)) return "new"
  const card = cards[word.id]
  if (card && isMastered(card.stage)) return "mastered"
  return "reviewing"
}

function StatusBadge({ status }: { status: "new" | "reviewing" | "mastered" }) {
  const label =
    status === "mastered"
      ? "已掌握"
      : status === "reviewing"
        ? "复习中"
        : "未学"
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[11px]",
        status === "mastered" && "bg-emerald-50 text-emerald-700",
        status === "reviewing" && "bg-amber-50 text-amber-700",
        status === "new" && "bg-slate-100 text-slate-500"
      )}
    >
      {label}
    </span>
  )
}
