import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function SessionHeader({
  title,
  subtitle,
  progress,
  onBack,
}: {
  title: string
  subtitle?: string
  progress: { current: number; total: number }
  onBack: () => void
}) {
  const pct =
    progress.total === 0 ? 0 : (progress.current / progress.total) * 100

  return (
    <header className="mb-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-full border border-white/70 bg-white/45 hover:bg-white/80"
          onClick={onBack}
          aria-label="返回首页"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="truncate text-[15px] font-medium tracking-tight text-slate-800">
              {title}
            </h1>
            <p className="shrink-0 font-mono text-sm tabular-nums text-slate-500">
              {progress.current}
              <span className="text-slate-300"> / </span>
              {progress.total}
            </p>
          </div>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <Progress
        value={pct}
        className="h-1.5 bg-white/60"
      />
    </header>
  )
}
