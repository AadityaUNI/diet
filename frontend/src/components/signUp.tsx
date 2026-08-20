"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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
import { credentialsSchema, type CredentialsValues } from "../auth/authSchemas.ts"

interface SignupFormProps {
  onSwitchToLogin: () => void
  onSubmit?: (values: CredentialsValues) => void
  disabled: boolean
}

export function Signup({ onSwitchToLogin, onSubmit, disabled }: SignupFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      region: "",
    },
  })

  return (
    <Card className="h-full w-full border-border/60 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">Create your account</CardTitle>
          <CardDescription className="text-pretty">Just an email and password to get started.</CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit((values) => onSubmit?.(values))}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full name</Label>
            <Input id="signup-name" type="text" placeholder="Jane Doe" autoComplete="name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input id="signup-email" type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-region">Region</Label>
            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" id="signup-region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.region && <p className="text-xs text-destructive">{errors.region.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
        </CardContent>
      
        <CardFooter className="mt-2 flex-col gap-4">
          <Button type="submit" className="w-full" disabled={disabled}>
            Continue
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {"Already have an account? "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Login
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
