import { AmbientBackground, GlassPanel } from "@/components/glass"
import { HomeDashboard } from "@/components/home-dashboard"
import { InstallTip } from "@/components/install-tip"
import { LearnSession } from "@/components/learn-session"
import { ReviewSession } from "@/components/review-session"
import { Button } from "@/components/ui/button"
import { useVocabEngine } from "@/hooks/use-vocab"

export function App() {
  const engine = useVocabEngine()

  return (
    <div className="relative min-h-svh text-slate-800">
      <AmbientBackground />
      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
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
      </main>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-40 animate-pulse rounded-full bg-white/50" />
      <div className="h-10 w-64 animate-pulse rounded-2xl bg-white/60" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <GlassPanel key={i} className="h-24 animate-pulse" />
        ))}
      </div>
      <GlassPanel className="h-48 animate-pulse" />
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
