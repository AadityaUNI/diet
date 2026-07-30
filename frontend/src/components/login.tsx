"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf } from "lucide-react"
import { LoginSpinner } from "./loginSpinner"

interface LoginFormProps {
  onSwitchToSignup: () => void
  /** Plug your auth handler in here. */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  disabled: boolean 
}

export function Login({ onSwitchToSignup, onSubmit, disabled }: LoginFormProps) {
  return (
    <Card className="h-full w-full border-border/60 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Leaf className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-pretty">Log in to keep your nutrition on track.</CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input id="login-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              {/* <button type="button" className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
                Forgot password?
              </button> */}
            </div>
            <Input
              id="login-password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="mt-2 flex-col gap-4">
          {disabled ? <LoginSpinner description="Logging you in..." /> : <><Button type="submit" className="w-full">
            Log in
          </Button><p className="text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Sign up
            </button>
          </p></>} 
          
        </CardFooter>
      </form>
    </Card>
  )
}
