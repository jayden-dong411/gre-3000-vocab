import { Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { speakEnglish } from "@/lib/speak"
import { cn } from "@/lib/utils"

export function SpeakButton({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "size-9 rounded-full border border-white/70 bg-white/50 text-slate-600 hover:bg-white/80",
        className,
      )}
      aria-label="朗读单词"
      onClick={(e) => {
        e.stopPropagation()
        speakEnglish(text)
      }}
    >
      <Volume2 className="size-4" />
    </Button>
  )
}
