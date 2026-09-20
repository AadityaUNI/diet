"use client"

import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Login } from "./login"
import { Signup } from "./signUp"
import type { LoginValues, CredentialsValues } from "../auth/authSchemas.ts"

const COOLDOWN_MS = 3000

interface AuthFlipCardProps {
  className?: string
  onLogin?: (values: LoginValues) => void
  onCredentials?: (values: CredentialsValues) => void | Promise<string | null>
}

export function FlipCard({ className, onLogin, onCredentials }: AuthFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)
  const cooldownRef = useRef(false)

  const withCooldown = useCallback(
    <T,>(handler?: (values: T) => void) =>
      (values: T) => {
        if (cooldownRef.current) return
        cooldownRef.current = true
        setIsSubmitting(true)
        handler?.(values)
        setTimeout(() => {
          cooldownRef.current = false
          setIsSubmitting(false)
        }, COOLDOWN_MS)
      },
    []
  )

  async function submitCredentials(values: CredentialsValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSignupError(null);
    try {
      const error = await onCredentials?.(values);
      if (error) setSignupError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("w-full max-w-md", className)} style={{ perspective: "2000px" }}>
      <div
        className="relative w-full transition-transform duration-700 ease-[cubic-bezier(0.4,0.2,0.2,1)]"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className={cn(!isFlipped ? "relative" : "absolute inset-0")}
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <Login
            onSwitchToSignup={() => setIsFlipped(true)}
            onSubmit={withCooldown(onLogin)}
            disabled={isSubmitting}
          />
        </div>

        <div
          className={cn(isFlipped ? "relative" : "absolute inset-0")}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Signup
            onSwitchToLogin={() => setIsFlipped(false)}
            onSubmit={submitCredentials}
            disabled={isSubmitting}
            error={signupError}
          />
        </div>
      </div>
    </div>
  )
}
