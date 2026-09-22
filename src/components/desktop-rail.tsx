import type { ReactNode } from "react"
import { BookOpen, House, RotateCcw } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import type { VocabEngine } from "@/hooks/use-vocab"
import { greeting } from "@/lib/dates"
import { MAX_DAILY, MIN_DAILY } from "@/lib/storage"
import { cn } from "@/lib/utils"

export function DesktopRail({ engine }: { engine: VocabEngine }) {
  const {
    view,
    setView,
    state,
    words,
    dueIds,
    todayRemaining,
    todayDone,
    todayTotal,
    setDailyTarget,
    resetProgress,
  } = engine

  return (
    <aside className="hidden h-svh flex-col border-r border-white/70 bg-white/45 px-4 py-5 backdrop-blur-xl lg:flex">
      <div className="px-1">
        <p className="text-xs text-slate-500">{greeting()}</p>
        <h1 className="mt-1 font-serif text-[1.65rem] leading-none tracking-tight text-slate-900">
          GRE 镇考 3000
        </h1>
        <p className="mt-2 text-xs text-slate-500">
          {words.length.toLocaleString()} 词 · 本机进度
        </p>
      </div>

      <nav className="mt-5 grid gap-1.5">
        <RailButton
          active={view === "home"}
          icon={<House className="size-4" />}
          label="首页"
          onClick={() => setView("home")}
        />
        <RailButton
          active={view === "learn"}
          disabled={todayRemaining === 0 && view !== "learn"}
          icon={<BookOpen className="size-4" />}
          label="背新词"
          meta={
            todayTotal > 0
              ? `${todayDone}/${todayTotal}`
              : String(state.dailyTarget)
          }
          onClick={() => setView("learn")}
        />
        <RailButton
          active={view === "review"}
          disabled={dueIds.length === 0 && view !== "review"}
          icon={<RotateCcw className="size-4" />}
          label="复习"
          meta={dueIds.length > 0 ? String(dueIds.length) : "0"}
          onClick={() => setView("review")}
        />
      </nav>

      <div className="mt-5 rounded-2xl border border-white/80 bg-white/55 px-3.5 py-3">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-medium text-slate-700">每日新词</p>
          <p className="font-serif text-xl text-slate-900 tabular-nums">
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
          aria-label="每日新词目标"
        />
        <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
          <span>50</span>
          <span>150</span>
        </div>
      </div>

      <div className="mt-4 px-1">
        <p className="text-[11px] tracking-wide text-slate-400">键盘</p>
        <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
          <li className="flex justify-between gap-3">
            <span>翻转释义</span>
            <Kbd>空格</Kbd>
          </li>
          <li className="flex justify-between gap-3">
            <span>不认识 / 模糊 / 认识</span>
            <span className="shrink-0">
              <Kbd>1</Kbd> <Kbd>2</Kbd> <Kbd>3</Kbd>
            </span>
          </li>
          <li className="flex justify-between gap-3">
            <span>复习作答</span>
            <span className="shrink-0">
              <Kbd>1</Kbd>–<Kbd>4</Kbd>
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-5 px-1">
        <div className="mb-1.5 flex items-baseline justify-between text-xs text-slate-500">
          <span>词库进度</span>
          <span className="font-mono tabular-nums">
            {state.introduced.length}/{words.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/80">
          <div
            className="h-full rounded-full bg-slate-900"
            style={{
              width: `${words.length === 0 ? 0 : (state.introduced.length / words.length) * 100}%`,
            }}
          />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          今日还剩 {todayRemaining} 个新词
          {dueIds.length > 0 ? `，${dueIds.length} 个待复习` : ""}
        </p>
      </div>

      <button
        type="button"
        className="mt-auto px-1 pt-4 text-left text-[11px] text-slate-400 underline-offset-4 hover:text-slate-600 hover:underline"
        onClick={() => {
          if (window.confirm("确定清空本机学习进度？词库不会被删除。")) {
            resetProgress()
          }
        }}
      >
        重置学习进度
      </button>
    </aside>
  )
}

function RailButton({
  active,
  disabled,
  icon,
  label,
  meta,
  onClick,
}: {
  active: boolean
  disabled?: boolean
  icon: ReactNode
  label: string
  meta?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-10 items-center gap-2 rounded-xl px-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-slate-900 text-white"
          : "bg-white/50 text-slate-700 hover:bg-white/85"
      )}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {meta ? (
        <span
          className={cn(
            "font-mono text-[11px] tabular-nums",
            active ? "text-white/70" : "text-slate-400"
          )}
        >
          {meta}
        </span>
      ) : null}
    </button>
  )
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
      {children}
    </kbd>
  )
}
