import { ArrowRight, Calculator, Leaf } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AppHeader } from "@/components/header"
import { Button } from "@/components/ui/button"

export default function AfterSignupPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <AppHeader />

      <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-lg items-center justify-center px-4 py-12">
        <section className="w-full rounded-3xl border border-border/60 bg-card p-8 text-center shadow-xl shadow-primary/5 sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Leaf className="h-7 w-7" />
          </div>

          <p className="mt-6 text-sm font-medium uppercase tracking-wide text-primary">You’re all set</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Count your current calories</h1>
          <p className="mx-auto mt-3 max-w-sm text-pretty leading-relaxed text-muted-foreground">
            Build a custom plan from what you already eat. Add your meals and ingredients to see how many calories
            you’re currently taking in each day.
          </p>

          <div className="mt-8 grid gap-3">
            <Button size="lg" className="w-full" onClick={() => navigate("/plans/new")}>
              <Calculator data-icon="inline-start" />
              Count my calories
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>
              Skip for now
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}