import type { ReactNode } from "react"
import { BookOpen, Flame, RotateCcw, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { GlassPanel } from "@/components/glass"
import { greeting } from "@/lib/dates"
import { MAX_DAILY, MIN_DAILY } from "@/lib/storage"
import { SRS_LABELS } from "@/lib/srs"
import type { VocabEngine } from "@/hooks/use-vocab"
import { cn } from "@/lib/utils"

export function HomeDashboard({ engine }: { engine: VocabEngine }) {
  const {
    state,
    words,
    todayDone,
    todayTotal,
    todayRemaining,
    dueIds,
    setView,
    setDailyTarget,
    resetProgress,
  } = engine

  const newPct = todayTotal === 0 ? 0 : (todayDone / todayTotal) * 100
  const finishedBank =
    state.introduced.length >= words.length && words.length > 0

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-4 pt-1">
        <div>
          <p className="text-sm text-slate-500 lg:hidden">{greeting()}</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight text-slate-900 sm:text-4xl lg:mt-0 lg:text-2xl">
            <span className="lg:hidden">GRE 镇考 3000</span>
            <span className="hidden lg:inline">今天的进度</span>
          </h1>
          <p className="mt-1.5 max-w-[20rem] text-sm leading-relaxed text-slate-500 lg:hidden">
            乱序词表 · 艾宾浩斯复习 · 今天也往前走一点
          </p>
        </div>
        <Badge
          variant="outline"
          className="mt-1 rounded-full border-white/80 bg-white/50 px-3 py-1 text-[11px] tracking-wide text-slate-600"
        >
          {words.length.toLocaleString()} 词
        </Badge>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="今日新词"
          value={`${todayDone}/${todayTotal || state.dailyTarget}`}
          hint={todayRemaining > 0 ? `还剩 ${todayRemaining} 个` : "今日已完成"}
        />
        <StatCard
          label="待复习"
          value={String(dueIds.length)}
          hint={dueIds.length > 0 ? "现在就可以开始" : "暂无到期卡片"}
        />
        <StatCard
          label="连续打卡"
          value={`${state.streak} 天`}
          hint={
            state.lastActiveDate
              ? `上次 ${state.lastActiveDate}`
              : "今天开始第一天"
          }
          icon={<Flame className="size-3.5 text-orange-400" />}
        />
        <StatCard
          label="已学单词"
          value={String(state.introduced.length)}
          hint={`词库 ${words.length}`}
        />
      </div>

      <div className="grid items-start gap-4">
        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-800">今日进度</p>
              <p className="mt-0.5 text-xs text-slate-500">
                新词目标 {state.dailyTarget} · 识别后进入间隔复习
              </p>
            </div>
            <span className="font-mono text-sm text-slate-500 tabular-nums">
              {Math.round(newPct)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400/90 to-violet-400/90 transition-all duration-500"
              style={{ width: `${newPct}%` }}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Button
              type="button"
              size="lg"
              disabled={todayRemaining === 0}
              onClick={() => setView("learn")}
              className="h-12 rounded-2xl bg-slate-900 text-base text-white shadow-lg shadow-slate-900/15 hover:bg-slate-800 active:translate-y-px"
            >
              <BookOpen className="size-4" />
              开始背新词
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              disabled={dueIds.length === 0}
              onClick={() => setView("review")}
              className="h-12 rounded-2xl border-white/80 bg-white/50 text-base text-slate-800 hover:bg-white/80 active:translate-y-px lg:hidden"
            >
              <RotateCcw className="size-4" />
              开始复习
              {dueIds.length > 0 ? (
                <span className="ml-1 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-white">
                  {dueIds.length}
                </span>
              ) : null}
            </Button>
          </div>

          {finishedBank ? (
            <p className="mt-4 text-center text-sm text-slate-500">
              词库已经全部学过一遍，后续以复习为主。
            </p>
          ) : null}
        </GlassPanel>

        <div className="flex flex-col gap-5 lg:hidden">
          <GlassPanel className="p-5 sm:p-6 lg:hidden">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  每日新词目标
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  50–150，默认 100，可随时调整
                </p>
              </div>
              <p className="font-serif text-2xl text-slate-900 tabular-nums">
                {state.dailyTarget}
              </p>
            </div>
            <Slider
              min={MIN_DAILY}
              max={MAX_DAILY}
              step={10}
              value={[state.dailyTarget]}
              onValueChange={(v) => {
                const n = v[0]
                if (typeof n === "number") setDailyTarget(n)
              }}
              className="py-2"
              aria-label="每日新词目标"
            />
            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
              <span>50</span>
              <span>100</span>
              <span>150</span>
            </div>
          </GlassPanel>

          <GlassPanel className="p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-violet-400" />
              <p className="text-sm font-medium text-slate-800">间隔复习节奏</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SRS_LABELS.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/70 bg-white/40 px-2.5 py-1 text-[11px] text-slate-600"
                >
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              新词可标不认识、模糊或认识：不认识马上复习，模糊约 30 分钟，认识约
              1 天。复习答对进入下一档，答错回退一档。进度保存在本机。
            </p>
          </GlassPanel>
        </div>
      </div>

      <button
        type="button"
        className="self-center text-xs text-slate-400 underline-offset-4 transition hover:text-slate-600 hover:underline lg:hidden"
        onClick={() => {
          if (window.confirm("确定清空本机学习进度？词库不会被删除。")) {
            resetProgress()
          }
        }}
      >
        重置学习进度
      </button>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: string
  hint: string
  icon?: ReactNode
}) {
  return (
    <GlassPanel hover className="flex flex-col gap-1 p-3.5 sm:p-4">
      <p className="flex items-center gap-1 text-[11px] tracking-wide text-slate-500">
        {icon}
        {label}
      </p>
      <p
        className={cn(
          "font-serif text-2xl tracking-tight text-slate-900 sm:text-[1.7rem]"
        )}
      >
        {value}
      </p>
      <p className="text-[11px] leading-snug text-slate-400">{hint}</p>
    </GlassPanel>
  )
}
