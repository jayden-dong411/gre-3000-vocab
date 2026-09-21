import { useState } from "react"
import { Share, X } from "lucide-react"
import { GlassPanel } from "@/components/glass"

const TIP_KEY = "gre3000.pwa-tip.v1"

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  if (window.matchMedia("(display-mode: standalone)").matches) return true
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true
}

function isPhoneLike(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false
  }
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return true
  return window.matchMedia("(max-width: 768px)").matches
}

function shouldShowTip(): boolean {
  if (typeof window === "undefined") return false
  if (isStandalone()) return false
  if (localStorage.getItem(TIP_KEY) === "1") return false
  return isPhoneLike()
}

export function InstallTip() {
  const [visible, setVisible] = useState(shouldShowTip)

  if (!visible) return null

  return (
    <GlassPanel className="mb-4 flex items-start gap-3 px-3.5 py-3 sm:px-4">
      <Share className="mt-0.5 size-4 shrink-0 text-slate-500" />
      <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-slate-600">
        装到主屏幕当 App 用：Safari / Chrome 点
        <span className="font-medium text-slate-800"> 分享 </span>
        →「添加到主屏幕」。装好后可离线背词。
      </p>
      <button
        type="button"
        className="shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-white/80 hover:text-slate-700"
        aria-label="关闭安装提示"
        onClick={() => {
          localStorage.setItem(TIP_KEY, "1")
          setVisible(false)
        }}
      >
        <X className="size-4" />
      </button>
    </GlassPanel>
  )
}
