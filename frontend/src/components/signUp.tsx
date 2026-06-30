"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoginSpinner } from "./loginSpinner"

interface SignupFormProps {
  onSwitchToLogin: () => void
  /** Plug your auth handler in here. */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void,
  disabled: boolean 
}

export function Signup({ onSwitchToLogin, onSubmit, disabled  }: SignupFormProps) {
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
            <Label htmlFor="signup-region">Region</Label>
            <Select name="region" id="signup-region" required>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-goals">Fitness Goals</Label>
            <Select name="goals" id="signup-goals" required>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Goal"/>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="cut">Cut</SelectItem>
                <SelectItem value="bulk">Bulk</SelectItem>
                <SelectItem value="maintain">Maintain</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-age">Age</Label>
            <Input id="signup-age" name="age" type="numeric" placeholder="67" autoComplete="67" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-weight">Weight (kgs)</Label>
            <Input id="signup-weight" name="weight" type="numeric" placeholder="67" autoComplete="67" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-height">Height (cms)</Label>
            <Input id="signup-height" name="height" type="numeric" placeholder="67" autoComplete="67" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-sex">Sex</Label>
            <Input id="signup-sex" name="sex" type="text" placeholder="Attack Helicopter" autoComplete="Attack Helicopter" required />
          </div>

            <div className="space-y-2">

          <Label htmlFor="signup-activity">Activity Level</Label>
          <Select name="activity" id="signup-activity" required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Activity Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[
                  { value: "sedentary",    label: "Sedentary",         desc: "Little or no exercise, desk job" },
                  { value: "light",        label: "Lightly Active",    desc: "Light exercise or housework 1–3 days/week" },
                  { value: "moderate",     label: "Moderately Active", desc: "Moderate exercise 3–5 days/week" },
                  { value: "very_active",  label: "Very Active",       desc: "Hard exercise 6–7 days/week" },
                  { value: "extra_active", label: "Extra Active",      desc: "Very hard exercise + physical job" },
                ].map(({ value, label, desc }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex flex-col">
                      <span>{label}</span>
                      <span className="text-xs text-muted-foreground">{desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
          {disabled ? 
          <LoginSpinner description="Logging you in..." /> : <><Button type="submit" className="w-full">
            Sign up
          </Button><p className="text-center text-sm text-muted-foreground">
            {"Already have an account? "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Login
            </button>
          </p></>} 
        </CardFooter>
      </form>
    </Card>
  )
}
