"use client"

import { useAuth } from "@/hooks/use-auth"
import { ReactNode } from "react"

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (isAuthenticated === false) {
    return null
  }

  return <>{children}</>
}
