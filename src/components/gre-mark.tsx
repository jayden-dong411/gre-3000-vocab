import { cn } from "@/lib/utils"

export function GreMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-slate-900",
        className
      )}
    >
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16 1.2 18.4 11.1 28.2 8.6 21.2 16l7 7.4-9.8-2.5L16 30.8l-2.4-9.9L3.8 23.4 10.8 16 3.8 8.6l9.8 2.5L16 1.2Z"
        />
      </svg>
      <span className="font-serif text-[1.85rem] leading-none tracking-tight">
        gre
        <span className="text-violet-500">.</span>
      </span>
    </span>
  )
}
