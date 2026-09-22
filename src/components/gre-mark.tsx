import { cn } from "@/lib/utils"

export function GreMark({ className }: { className?: string }) {
  return (
    <img
      src="/gre-logo.png"
      alt="GRE"
      className={cn("h-8 w-auto sm:h-9", className)}
    />
  )
}
