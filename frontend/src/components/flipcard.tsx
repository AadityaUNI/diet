"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Login } from "./login"
import { Signup } from "./signUp"

interface AuthFlipCardProps {
  className?: string
  /** Plug your login submit handler in here. */
  onLogin?: (e: React.FormEvent<HTMLFormElement>) => void
  /** Plug your signup submit handler in here. */
  onSignup?: (e: React.FormEvent<HTMLFormElement>) => void
}

export function FlipCard({ className, onLogin, onSignup }: AuthFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className={cn("w-full max-w-md", className)} style={{ perspective: "2000px" }}>
      <div
        className="relative h-[34rem] w-full transition-transform duration-700 ease-[cubic-bezier(0.4,0.2,0.2,1)]"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front: Login */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          <Login onSwitchToSignup={() => setIsFlipped(true)} onSubmit={onLogin} />
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
          <Signup onSwitchToLogin={() => setIsFlipped(false)} onSubmit={onSignup} />
        </div>
      </div>
    </div>
  )
}
