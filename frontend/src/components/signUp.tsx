"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"

interface SignupFormProps {
  onSwitchToLogin: () => void
  /** Plug your auth handler in here. */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
}

export function Signup({ onSwitchToLogin, onSubmit }: SignupFormProps) {
  return (
    <Card className="h-full w-full border-border/60 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">Create your account</CardTitle>
          <CardDescription className="text-pretty">Start building healthier habits today.</CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full name</Label>
            <Input id="signup-name" name="name" type="text" placeholder="Jane Doe" autoComplete="name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input id="signup-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="mt-2 flex-col gap-4">
          <Button type="submit" className="w-full">
            Create account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {"Already have an account? "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Log in
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
