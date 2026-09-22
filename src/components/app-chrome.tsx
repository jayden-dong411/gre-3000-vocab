import { useState } from "react"
import {
  BookOpen,
  CalendarDays,
  Library,
  RotateCcw,
  Settings2,
} from "lucide-react"
import { GreMark } from "@/components/gre-mark"
import { Slider } from "@/components/ui/slider"
import type { VocabEngine } from "@/hooks/use-vocab"
import { formatDayLabel } from "@/lib/dates"
import { MAX_DAILY, MIN_DAILY } from "@/lib/storage"
import type { View } from "@/lib/types"
import { cn } from "@/lib/utils"

export function AppHeader({ engine }: { engine: VocabEngine }) {
  const { state, dueIds, setView, setDailyTarget, resetProgress } = engine
  const [settings, setSettings] = useState(false)

  return (
    <header className="relative mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <GreMark />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">
            镇考 3000 词
          </p>
          <p className="text-xs text-slate-400">{formatDayLabel()}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setView("review")}
          className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-100"
        >
          复习 {dueIds.length}
        </button>
        <button
          type="button"
          aria-label="设置"
          aria-expanded={settings}
          onClick={() => setSettings((open) => !open)}
          className="flex size-9 items-center justify-center rounded-full bg-white/70 text-slate-500 ring-1 ring-white"
        >
          <Settings2 className="size-4" />
        </button>
      </div>
      {settings ? (
        <div className="absolute top-12 right-0 z-30 w-64 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl">
          <p className="text-sm font-medium text-slate-800">每日新词</p>
          <p className="mt-1 font-serif text-2xl text-slate-900 tabular-nums">
            {state.dailyTarget}
          </p>
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
            className="mt-2"
          />
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>50</span>
            <span>150</span>
          </div>
          <button
            type="button"
            className="mt-3 text-xs text-slate-400 underline-offset-4 hover:text-slate-600 hover:underline"
            onClick={() => {
              if (window.confirm("确定清空本机学习进度？词库不会被删除。")) {
                resetProgress()
                setSettings(false)
              }
            }}
          >
            重置学习进度
          </button>
        </div>
      ) : null}
    </header>
  )
}

const TABS: { id: View; label: string; icon: typeof CalendarDays }[] = [
  { id: "home", label: "今日", icon: CalendarDays },
  { id: "learn", label: "学习", icon: BookOpen },
  { id: "review", label: "复习", icon: RotateCcw },
  { id: "bank", label: "词库", icon: Library },
]

export function BottomDock({ engine }: { engine: VocabEngine }) {
  const { view, setView } = engine
  return (
    <nav className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-end gap-1 rounded-[1.6rem] border border-white/80 bg-white/80 p-1.5 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const active = view === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setView(tab.id)}
            className={cn(
              "flex w-[4.5rem] flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[11px]",
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
