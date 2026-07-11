"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Login } from "./login"
import { Signup } from "./signUp"

const COOLDOWN_MS = 3000

interface AuthFlipCardProps {
  className?: string
  onLogin?: (e: React.FormEvent<HTMLFormElement>) => void
  onSignup?: (e: React.FormEvent<HTMLFormElement>) => void
}

export function FlipCard({ className, onLogin, onSignup }: AuthFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const cooldownRef = useRef(false)

  const withCooldown = useCallback(
    (handler?: (e: React.FormEvent<HTMLFormElement>) => void) =>
      (e: React.FormEvent<HTMLFormElement>) => {
        if (cooldownRef.current) return   // drop duplicate firings
        cooldownRef.current = true
        setIsSubmitting(true)
        handler?.(e)
        setTimeout(() => {
          cooldownRef.current = false
          setIsSubmitting(false)
        }, COOLDOWN_MS)
      },
    []
  )

  return (
    <div className={cn("w-full max-w-md", className)} style={{ perspective: "2000px" }}>
      <div
        className="relative w-full transition-transform duration-700 ease-[cubic-bezier(0.4,0.2,0.2,1)]"
        style={{
          transformStyle: "preserve-3d",
          height: isFlipped ? "63rem" : "36rem",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front: Login */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <Login
            onSwitchToSignup={() => setIsFlipped(true)}
            onSubmit={withCooldown(onLogin)}
            disabled={isSubmitting}
          />
        </div>

        {/* Back: Signup */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Signup
            onSwitchToLogin={() => setIsFlipped(false)}
            onSubmit={withCooldown(onSignup)}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}