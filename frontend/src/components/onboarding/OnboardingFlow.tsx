"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { GoalsStep } from "./GoalsStep"
import { BodyStep } from "./BodyStep"
import { HealthStep } from "./HealthStep"
import type {
  BodyStepFormValues,
  BodyStepValues,
  CredentialsValues,
  GoalsStepValues,
  HealthStepValues,
  SignupValues,
} from "@/auth/authSchemas"

const ONBOARDING_STEPS = ["GOALS", "BODY", "HEALTH"] as const
type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

const STEP_COPY: Record<OnboardingStep, { title: string; description: string }> = {
  GOALS: {
    title: "Your fitness goal",
    description: "We’ll use this to shape calorie and macro targets.",
  },
  BODY: {
    title: "A few body stats",
    description: "Age, height, and weight keep plans realistic.",
  },
  HEALTH: {
    title: "Health and food preferences",
    description: "Optional — skip anything that doesn’t apply.",
  },
}

interface OnboardingFlowProps {
  credentials: CredentialsValues
  onBackToCredentials: () => void
  onComplete: (values: SignupValues) => Promise<string | null>
}

export function OnboardingFlow({
  credentials,
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
      ...healthValues,
    }
    const message = await onComplete(payload)
    if (message) {
      setError(message)
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
              goTo("HEALTH", true)
            }}
          />
        )}

        {step === "HEALTH" && (
          <HealthStep
            defaultValues={health}
            submitting={submitting}
            error={error}
            onBack={() => goTo("BODY", false)}
            onFinish={finish}
          />
        )}
      </CardContent>
    </Card>
  )
}
