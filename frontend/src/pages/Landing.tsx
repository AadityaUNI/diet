"use client"

import { useState } from "react"
import { FlipCard } from "@/components/auth/flipcard"
import { OnboardingFlow } from "@/components/auth/OnboardingFlow"
import { CalendarCheck, Leaf, Sparkles, UtensilsCrossed, Wand2 } from "lucide-react"
import { createAuthAccount, onLogin } from "@/auth/LoginAuth"
import { useNavigate } from "react-router-dom"
import { ModeToggle } from "@/components/layout/mode-toggle"
import type { CredentialsValues, LoginValues } from "@/auth/authSchemas"

const features = [
  {
    icon: Sparkles,
    title: "AI meal plans",
    description: "Generate plans from your goal, dietary restrictions, health conditions, and foods you want included.",
  },
  {
    icon: Wand2,
    title: "Improve a plan",
    description: "Have AI review a saved plan, point out what's missing, and suggest changes. You can also just ask for one.",
  },
  {
    icon: UtensilsCrossed,
    title: "Build your own",
    description: "Put plans together yourself, meal by meal. Add your own ingredients when something's missing.",
  },
  {
    icon: CalendarCheck,
    title: "Track your day",
    description: "Tick off meals as you eat them, log extras, and see calories and macros against your targets.",
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState<CredentialsValues | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)

  async function beginLogin(values: LoginValues) {
    try {
      await onLogin(values, navigate)
      return null
    } catch (error) {
      return error instanceof Error ? error.message : "Unable to sign in."
    }
  }

  async function beginSignup(values: CredentialsValues) {
    try {
      const account = await createAuthAccount(values)
      setAccountId(account.userId)
      setCredentials(values)
      return null
    } catch (error) {
      return error instanceof Error ? error.message : "Unable to create your account."
    }
  }

  return (
    <main className="min-h-svh bg-transparent">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center h-15 gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-10 w-5" />
          </div>
          <span className="text-4xl font-semibold tracking-tight">DietGrid</span>
        </div>
        <ModeToggle />
      </header>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:py-20">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Your nutrition, organized
          </span>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Meal planning that fits your goals
          </h1>

          <p className="max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            Plan meals around your macros and dietary needs, with AI when you want it and by hand when you
            don't.
          </p>

          <ul id="features" className="mt-2 grid gap-5 sm:grid-cols-1">
            {features.map((feature) => (
              <li key={feature.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold">{feature.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center lg:justify-end">
          {credentials && accountId ? (
            <OnboardingFlow
              credentials={credentials}
              accountId={accountId}
              onBackToCredentials={() => {
                setAccountId(null)
                setCredentials(null)
              }}
              onComplete={async () => {
                navigate('/after-signup')
                return null
              }}
            />
          ) : (
            <FlipCard
              onLogin={beginLogin}
              onCredentials={beginSignup}
            />
          )}
        </div>
      </section>
    </main>
  )
}
