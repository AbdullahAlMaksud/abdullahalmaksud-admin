"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, signOut } from "@/lib/api/auth"
import { User, Session } from "@/lib/api/types"
import { IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  logout: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getCurrentUser()
      const raw = res as unknown as {
        user?: User;
        session?: Session;
        data?: { user?: User; session?: Session };
      }
      const userData = raw?.data?.user || raw?.user || null
      const sessionData = raw?.data?.session || raw?.session || null
      if (userData) {
        setUser(userData)
        setSession(sessionData)
      } else {
        setUser(null)
        setSession(null)
      }
    } catch {
      setUser(null)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const logout = async () => {
    try {
      await signOut()
      setUser(null)
      setSession(null)
      toast.success("Logged out successfully")
      router.push("/login")
    } catch {
      setUser(null)
      setSession(null)
      router.push("/login")
    }
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated,
        isAdmin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

/**
 * Route protection wrapper for Dashboard pages.
 * Enforces authentication and strict admin role verification.
 * Redirects non-admin or unauthenticated users to /login immediately.
 */
export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login")
      } else if (!isAdmin) {
        toast.error("Access denied. Only administrators are authorized to access this portal.")
        logout()
      }
    }
  }, [user, loading, isAdmin, router, logout])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <IconLoader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">
            Verifying admin session...
          </p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return <>{children}</>
}
