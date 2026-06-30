"use client"

import { useState, useRef, useCallback } from "react"
import { LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { logoutUser } from "@/auth/UserService"
const COOLDOWN_MS = 2000

export function Logout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const cooldownRef = useRef(false)

  const handleLogout = useCallback(async () => {
    if (cooldownRef.current) return
    cooldownRef.current = true
    setIsLoggingOut(true)

    try {
      await logoutUser?.()
    } finally {
      setTimeout(() => {
        cooldownRef.current = false
        setIsLoggingOut(false)
      }, COOLDOWN_MS)
    }
  }, [])

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`group relative flex items-center gap-2 px-4 py-2 overflow-hidden",
        "text-muted-foreground border border-transparent",
        "transition-all duration-200 ease-in-out",
        "hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20",
        "disabled:pointer-events-none disabled:opacity-40`}
    >
      {/* Subtle left-edge accent that slides in on hover */}
      <span
        className={cn(
          "absolute left-0 top-0 h-full w-[2px] bg-red-400",
          "translate-x-[-2px] transition-transform duration-200",
          "group-hover:translate-x-0"
        )}
        aria-hidden
      />

      {isLoggingOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            "group-hover:translate-x-0.5"
          )}
        />
      )}

      <span className="text-sm font-medium">
        {isLoggingOut ? "Signing out…" : "Sign out"}
      </span>
    </Button>
  )
}