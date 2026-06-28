"use client"

import type React from "react"

import { FlipCard } from "@/components/flipcard"
import { Leaf, LineChart, Salad, Zap } from "lucide-react"
import { onLogin, onSignup } from "@/auth/LoginAuth"
import { useNavigate } from "react-router-dom"

const features = [
  {
    icon: Salad,
    title: "Smart meal logging",
    description: "Snap or search a meal and get instant macro breakdowns.",
  },
  {
    icon: LineChart,
    title: "Visual progress",
    description: "Track calories, protein, and habits on a clean daily grid.",
  },
  {
    icon: Zap,
    title: "Adaptive goals",
    description: "Targets that adjust automatically as your routine evolves.",
  },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
    <main className="min-h-svh bg-background">
      {/* Nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-6">
        <div className="flex items-center h-15 gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-10 w-5" />
          </div>
          <span className="text-4xl font-semibold tracking-tight">DietGrid</span>
        </div>
      
      </header>

      {/* Hero + Auth */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:py-20">
        {/* Left: copy */}
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Your nutrition, organized
          </span>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Eat smarter with a grid built for your goals
          </h1>

          <p className="max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            DietGrid turns messy food logs into a clear, daily view of your macros, calories, and progress, so healthy
            choices feel effortless.
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

        {/* Right: flipping auth card */}
        <div className="flex justify-center lg:justify-end">
          <FlipCard onLogin={(e) => onLogin(e, navigate)} onSignup={(e) => onSignup(e, navigate)} />
        </div>
      </section>
    </main>
  )
}
