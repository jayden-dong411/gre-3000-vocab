import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function GlassPanel({
  className,
  hover = false,
  ...props
}: ComponentProps<"div"> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/70 bg-white/55 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl",
        hover &&
          "transition-transform duration-300 will-change-transform hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(15,23,42,0.09)]",
        className,
      )}
      {...props}
    />
  )
}

export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f7f9fc_0%,#eef2f7_48%,#f4f0ea_100%)]" />
      <div className="absolute -top-24 -left-16 size-[28rem] rounded-full bg-sky-200/50 blur-3xl" />
      <div className="absolute top-[18%] -right-20 size-[32rem] rounded-full bg-violet-200/40 blur-3xl" />
      <div className="absolute right-1/4 bottom-[-8%] size-[26rem] rounded-full bg-amber-100/60 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#94a3b8_0.6px,transparent_0.6px)] [background-size:18px_18px]" />
    </div>
  )
}
