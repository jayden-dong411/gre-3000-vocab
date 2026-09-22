import { AmbientBackground, GlassPanel } from "@/components/glass"
import { AppHeader, BottomDock } from "@/components/app-chrome"
import { HomeDashboard } from "@/components/home-dashboard"
import { InstallTip } from "@/components/install-tip"
import { LearnSession } from "@/components/learn-session"
import { ReviewSession } from "@/components/review-session"
import { WordBank } from "@/components/word-bank"
import { Button } from "@/components/ui/button"
import { useVocabEngine } from "@/hooks/use-vocab"

export function App() {
  const engine = useVocabEngine()

  return (
    <div className="relative min-h-svh text-slate-800 lg:h-svh lg:overflow-hidden">
      <AmbientBackground />
      <main className="relative mx-auto flex w-full max-w-5xl flex-col px-4 pt-4 pb-24 sm:px-6 sm:pt-5 sm:pb-28 lg:h-full lg:min-h-0 lg:px-8 lg:pt-6 lg:pb-24">
        {engine.status === "ready" ? <AppHeader engine={engine} /> : null}
        <div
          className={
            engine.view === "learn" || engine.view === "review"
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : "min-h-0 flex-1 overflow-y-auto"
          }
        >
          <div
            key={engine.view}
            className={
              engine.view === "learn"
                ? "view-rise mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col"
                : engine.view === "review"
                  ? "view-rise flex min-h-0 flex-1 flex-col overflow-y-auto"
                  : "view-rise"
            }
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
