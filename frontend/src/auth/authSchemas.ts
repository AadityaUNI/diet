import { z } from "zod"

const positiveNumber = z.coerce.number().positive("Must be greater than 0")

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

export const credentialsSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  region: z.string().min(1, "Select a region"),
})

export const goalsStepSchema = z.object({
  goals: z.string().min(1, "Select a goal"),
  activity: z.string().min(1, "Select activity level"),
})

export const bodyStepSchema = z.object({
  age: positiveNumber,
  weight: positiveNumber,
  height: positiveNumber,
  sex: z.string().min(1, "Select sex"),
})

export const healthStepSchema = z.object({
  health_conditions: z.array(z.string()),
  dietary_restrictions: z.array(z.string()),
  required_food_items: z.array(z.string()),
})

export const macroStepSchema = z.object({
  macro_preset: z.string().min(1, "Select a macro preset"),
  protein_target: z.coerce.number().positive("Must be greater than 0"),
  carbs_target: z.coerce.number().positive("Must be greater than 0"),
  fat_target: z.coerce.number().positive("Must be greater than 0"),
  fiber_target: z.coerce.number().positive("Must be greater than 0"),
})

export const signupSchema = z.object({
  ...credentialsSchema.shape,
  ...goalsStepSchema.shape,
  ...bodyStepSchema.shape,
  ...healthStepSchema.shape,
  ...macroStepSchema.shape,
})

export type LoginValues = z.infer<typeof loginSchema>
export type CredentialsValues = z.infer<typeof credentialsSchema>
export type GoalsStepValues = z.infer<typeof goalsStepSchema>
export type BodyStepValues = z.infer<typeof bodyStepSchema>
export type HealthStepValues = z.infer<typeof healthStepSchema>
export type MacroStepValues = z.infer<typeof macroStepSchema>
export type SignupValues = z.infer<typeof signupSchema>
export type BodyStepFormValues = z.input<typeof bodyStepSchema>
