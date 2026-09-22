import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export function SessionHeader({
  title,
  subtitle,
  progress,
  onBack,
  className,
}: {
  title: string
  subtitle?: string
  progress: { current: number; total: number }
  onBack: () => void
  className?: string
}) {
  const pct =
    progress.total === 0 ? 0 : (progress.current / progress.total) * 100

  return (
    <header className={cn("mb-3 flex flex-col gap-2 sm:mb-5 sm:gap-3 lg:mb-3", className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-full border border-white/70 bg-white/45 hover:bg-white/80 sm:size-9"
          onClick={onBack}
          aria-label="返回首页"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="truncate text-sm font-medium tracking-tight text-slate-800 sm:text-[15px]">
              {title}
            </h1>
            <p className="shrink-0 font-mono text-xs text-slate-500 tabular-nums sm:text-sm">
              {progress.current}
              <span className="text-slate-300"> / </span>
              {progress.total}
            </p>
          </div>
          {subtitle ? (
            <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <Progress value={pct} className="h-1 bg-white/60 sm:h-1.5" />
    </header>
  )
}
