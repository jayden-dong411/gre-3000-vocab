import { BookOpen, RotateCcw } from "lucide-react"
import { GlassPanel } from "@/components/glass"
import type { VocabEngine } from "@/hooks/use-vocab"
import { dateKey, recentDates } from "@/lib/dates"
import { isMastered, SRS_LABELS } from "@/lib/srs"
import { cn } from "@/lib/utils"

export function HomeDashboard({ engine }: { engine: VocabEngine }) {
  const { state, todayDone, todayTotal, todayRemaining, dueIds, setView } =
    engine
  const goal = todayTotal || state.dailyTarget
  const donePct = goal === 0 ? 0 : todayDone / goal
  const mastered = state.introduced.filter((id) => {
    const card = state.cards[id]
    return card ? isMastered(card.stage) : false
  }).length
  const answered = state.todayCorrect + state.todayWrong
  const accuracy =
    answered === 0 ? null : Math.round((state.todayCorrect / answered) * 100)
  const days = recentDates(7)
  const today = dateKey()

  return (
    <div className="flex flex-col gap-4">
      <GlassPanel className="p-5 sm:p-6">
        <div className="flex items-center gap-5">
          <ProgressRing value={donePct} done={todayDone} goal={goal} />
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-2xl tracking-tight text-slate-900 sm:text-3xl">
              {todayRemaining > 0
                ? `再学 ${todayRemaining} 个新词`
                : "今日新词已完成"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {dueIds.length > 0
                ? `有 ${dueIds.length} 个词到期复习，趁热打铁。`
                : "今天还没有到期的复习。"}
              {state.streak > 0 ? ` 连续打卡 ${state.streak} 天。` : ""}
            </p>
            <div className="mt-4 flex gap-6">
              <Stat value={String(state.introduced.length)} label="已学" />
              <Stat value={String(mastered)} label="已掌握" />
              <Stat
                value={accuracy === null ? "—" : `${accuracy}%`}
                label="今日正确率"
              />
            </div>
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassPanel className="p-4 sm:p-5">
          <p className="text-xs text-violet-500">学习</p>
          <p className="mt-1 text-sm font-medium text-slate-800">今日新词</p>
          <p className="mt-3 text-sm text-slate-500">
            {todayRemaining > 0
              ? `${todayRemaining} 个待学习`
              : "今天的新词已经看完"}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{ width: `${donePct * 100}%` }}
            />
          </div>
          <button
            type="button"
            disabled={todayRemaining === 0}
            onClick={() => setView("learn")}
            className="mt-4 h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition duration-200 hover:-translate-y-0.5 active:translate-y-px disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <BookOpen className="mr-1 inline size-4" />
            {todayDone > 0 && todayRemaining > 0 ? "继续学习" : "开始学习"}
          </button>
        </GlassPanel>

        <GlassPanel className="p-4 sm:p-5">
          <p className="text-xs text-amber-600">复习</p>
          <p className="mt-1 text-sm font-medium text-slate-800">到期复习</p>
          <p className="mt-3 text-sm text-slate-500">
            {dueIds.length > 0 ? `${dueIds.length} 个词到期` : "暂无到期卡片"}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-300"
              style={{ width: dueIds.length > 0 ? "100%" : "0%" }}
            />
          </div>
          <button
            type="button"
            disabled={dueIds.length === 0}
            onClick={() => setView("review")}
            className="mt-4 h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition duration-200 hover:-translate-y-0.5 active:translate-y-px disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <RotateCcw className="mr-1 inline size-4" />
            开始复习
          </button>
        </GlassPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <GlassPanel className="p-4 sm:p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-sm font-medium text-slate-800">最近七天</p>
            <p className="text-xs text-slate-400">连续学习 {state.streak} 天</p>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const key = dateKey(day)
              const count = state.dailyCounts?.[key] ?? 0
              const isToday = key === today
              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-2xl px-1 py-2 text-center",
                    isToday ? "bg-white ring-2 ring-violet-400" : "bg-white/50"
                  )}
                >
                  <p className="text-[10px] text-slate-400">
                    {day.getMonth() + 1}/{day.getDate()}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-700">
                    {count} 次
                  </p>
                  <span
                    className={cn(
                      "mx-auto mt-1 block size-1.5 rounded-full",
                      count > 0 ? "bg-violet-500" : "bg-slate-200"
                    )}
                  />
                </div>
              )
            })}
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 sm:p-5">
          <p className="text-sm font-medium text-slate-800">艾宾浩斯复习节奏</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            每个新词学完后，按下列节点自动安排复习；答错的词重新开始这个循环。
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SRS_LABELS.map((label) => (
              <span
                key={label}
                className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-white"
              >
                {label}
              </span>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-xl text-slate-900 tabular-nums">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  )
}

function ProgressRing({
  value,
  done,
  goal,
}: {
  value: number
  done: number
  goal: number
}) {
  const radius = 36
  const circ = 2 * Math.PI * radius
  const offset = circ * (1 - Math.min(1, Math.max(0, value)))
  return (
    <div className="relative size-28 shrink-0">
      <svg viewBox="0 0 88 88" className="size-full -rotate-90">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="7"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="7"
          strokeLinecap="round"
          className="ring-draw"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-serif text-2xl leading-none text-slate-900 tabular-nums">
          {done}
        </p>
        <p className="text-[11px] text-slate-400">/{goal}</p>
        <p className="text-[10px] text-slate-400">今日新词</p>
      </div>
    </div>
  )
}
