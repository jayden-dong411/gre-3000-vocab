import { useEffect, useState } from "react"
import { AmbientBackground, GlassPanel } from "@/components/glass"
import { AppHeader, BottomDock } from "@/components/app-chrome"
import { HomeDashboard } from "@/components/home-dashboard"
import { InstallTip } from "@/components/install-tip"
import { LearnSession } from "@/components/learn-session"
import { ReviewSession } from "@/components/review-session"
import { WordBank } from "@/components/word-bank"
import { Button } from "@/components/ui/button"
import { useVocabEngine } from "@/hooks/use-vocab"

function useWideScreen() {
  const [wide, setWide] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : false
  )
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const onChange = () => setWide(media.matches)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])
  return wide
}

export function App() {
  const engine = useVocabEngine()
  const wide = useWideScreen()
  const learnWithReview =
    wide && engine.status === "ready" && engine.view === "learn"

  return (
    <div className="relative min-h-svh text-slate-800 lg:h-svh lg:overflow-hidden">
      <AmbientBackground />
      <main className="relative mx-auto flex w-full max-w-5xl flex-col px-4 pt-5 pb-28 sm:px-6 lg:h-full lg:min-h-0 lg:px-8 lg:pt-6 lg:pb-24">
        {engine.status === "ready" ? <AppHeader engine={engine} /> : null}
        <div
          className={
            learnWithReview
              ? "grid min-h-0 flex-1 grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.78fr)] gap-4"
              : "min-h-0 flex-1 overflow-y-auto"
          }
        >
          <div
            className={learnWithReview ? "flex min-h-0 flex-col" : undefined}
          >
            {engine.status === "ready" && engine.view === "home" ? (
              <InstallTip />
            ) : null}
            {engine.status === "loading" ? <LoadingState /> : null}
            {engine.status === "error" ? (
              <ErrorState message={engine.error ?? "词库加载失败"} />
            ) : null}
            {engine.status === "ready" && engine.view === "home" ? (
              <HomeDashboard engine={engine} />
            ) : null}
            {engine.status === "ready" && engine.view === "learn" ? (
              <LearnSession engine={engine} />
            ) : null}
            {engine.status === "ready" && engine.view === "review" ? (
              <ReviewSession engine={engine} />
            ) : null}
            {engine.status === "ready" && engine.view === "bank" ? (
              <WordBank engine={engine} />
            ) : null}
          </div>
          {learnWithReview ? (
            <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/30 p-4">
              <ReviewSession engine={engine} embedded hotkeys={false} />
            </section>
          ) : null}
        </div>
      </main>
      {engine.status === "ready" ? <BottomDock engine={engine} /> : null}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-40 animate-pulse rounded-full bg-white/50" />
      <div className="h-28 animate-pulse rounded-3xl bg-white/60" />
      <div className="grid gap-3 sm:grid-cols-2">
        <GlassPanel className="h-36 animate-pulse" />
        <GlassPanel className="h-36 animate-pulse" />
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <GlassPanel className="px-6 py-12 text-center">
      <p className="font-serif text-2xl text-slate-900">词库没有加载出来</p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      <Button
        className="mt-6 h-10 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
        onClick={() => window.location.reload()}
      >
        重新加载
      </Button>
    </GlassPanel>
  )
}

export default App
