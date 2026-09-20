"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { GoalsStep } from "./GoalsStep"
import { BodyStep } from "./BodyStep"
import { MacroStep } from "./MacroStep"
import { HealthStep } from "./HealthStep"
import { createSignupProfile } from "@/auth/LoginAuth"
import type {
  BodyStepFormValues,
  BodyStepValues,
  CredentialsValues,
  GoalsStepValues,
  HealthStepValues,
  MacroStepValues,
  SignupValues,
} from "@/auth/authSchemas"

const ONBOARDING_STEPS = ["GOALS", "BODY", "MACROS", "HEALTH"] as const
type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

const STEP_COPY: Record<OnboardingStep, { title: string; description: string }> = {
  GOALS: {
    title: "Your fitness goal",
    description: "We'll use this to shape calorie and macro targets.",
  },
  BODY: {
    title: "A few body stats",
    description: "Age, height, and weight keep plans realistic.",
  },
  MACROS: {
    title: "Your macro targets",
    description: "Choose a preset or customize your protein, carbs, fat, and fiber goals.",
  },
  HEALTH: {
    title: "Health and food preferences",
    description: "Optional — skip anything that doesn't apply.",
  },
}

interface OnboardingFlowProps {
  credentials: CredentialsValues
  accountId: string
  onBackToCredentials: () => void
  onComplete: (values: SignupValues) => Promise<string | null>
}

export function OnboardingFlow({
  credentials,
  accountId,
  onBackToCredentials,
  onComplete,
}: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>("GOALS")
  const [goingForward, setGoingForward] = useState(true)
  const [goals, setGoals] = useState<GoalsStepValues>({ goals: "", activity: "" })
  const [body, setBody] = useState<BodyStepFormValues>({
    age: "",
    weight: "",
    height: "",
    sex: "",
  })
  const [macros, setMacros] = useState<MacroStepValues>({
    macro_preset: "balanced",
    protein_target: 150,
    carbs_target: 200,
    fat_target: 65,
    fiber_target: 28,
  })
  const [health, setHealth] = useState<HealthStepValues>({
    health_conditions: [],
    dietary_restrictions: [],
    required_food_items: [],
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stepIndex = ONBOARDING_STEPS.indexOf(step)
  const progressValue = ((stepIndex + 1) / ONBOARDING_STEPS.length) * 100

  function goTo(next: OnboardingStep, forward: boolean) {
    setGoingForward(forward)
    setStep(next)
  }

  async function finish(healthValues: HealthStepValues) {
    setHealth(healthValues)
    setSubmitting(true)
    setError(null)
    const payload: SignupValues = {
      ...credentials,
      ...goals,
      ...(body as BodyStepValues),
      ...macros,
      ...healthValues,
    }
    try {
      await createSignupProfile(accountId, payload)
      await onComplete(payload)
    } catch (completionError) {
      setError(completionError instanceof Error ? completionError.message : "Unable to save your profile.")
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border/60 shadow-xl shadow-primary/5 overflow-hidden">
      <CardHeader className="space-y-4">
        <Progress value={progressValue} />
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Step {stepIndex + 1} of {ONBOARDING_STEPS.length}
          </p>
          <CardTitle className="text-2xl font-semibold tracking-tight">{STEP_COPY[step].title}</CardTitle>
          <CardDescription className="text-pretty">{STEP_COPY[step].description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent
        key={step}
        className={cn(
          "animate-in fade-in-0 duration-300",
          goingForward ? "slide-in-from-right-8" : "slide-in-from-left-8"
        )}
      >
        {step === "GOALS" && (
          <GoalsStep
            defaultValues={goals}
            onBack={onBackToCredentials}
            onContinue={(values) => {
              setGoals(values)
              goTo("BODY", true)
            }}
          />
        )}

        {step === "BODY" && (
          <BodyStep
            defaultValues={body}
            goal={goals.goals}
            activity={goals.activity}
            onBack={() => goTo("GOALS", false)}
            onContinue={(values) => {
              setBody(values)
              goTo("MACROS", true)
            }}
          />
        )}

        {step === "MACROS" && (
          <MacroStep
            defaultValues={macros}
            profile={{ 
              age: Number(body.age), 
              weight: Number(body.weight), 
              height: Number(body.height), 
              sex: body.sex, 
              activity_level: goals.activity, 
              fitness_goals: goals.goals 
            }}
            onBack={() => goTo("BODY", false)}
            onContinue={(values) => {
              setMacros(values)
              goTo("HEALTH", true)
            }}
          />
        )}

        {step === "HEALTH" && (
          <HealthStep
            defaultValues={health}
            submitting={submitting}
            error={error}
            onBack={() => goTo("MACROS", false)}
            onFinish={finish}
          />
        )}
      </CardContent>
    </Card>
  )
}
