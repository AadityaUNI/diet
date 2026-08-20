import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import {currUserDetails} from "@/auth/UserService";

interface AuthContextType
{
  user: User | null,
  loading: boolean,
  region: string,
  session_token: string | null
}

const authContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [session_token, setToken] = useState<string | null>(null)
  const [region, setRegion] = useState<string>("")

  useEffect(() => {

    async function fetchRegion() {
      const profile = await currUserDetails()
      if (profile) {
        setRegion(profile.region)
      }
    }
    fetchRegion()
  
    supabase.auth.getSession().then((data) => {
      setUser(data.data.session?.user ?? null)
      setLoading(false)
      setToken(data.data.session?.access_token ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setToken(session?.access_token ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <authContext.Provider value={{user, loading, session_token, region}}>{children}</authContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(authContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}