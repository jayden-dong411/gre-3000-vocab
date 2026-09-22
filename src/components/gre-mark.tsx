import { cn } from "@/lib/utils"

export function GreMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-serif text-[1.85rem] leading-none tracking-tight text-slate-900",
        className,
      )}
    >
      gre
      <span className="text-violet-500">.</span>
    </span>
  )
}
