"use client"

import React from "react"
import { DashboardAuthGuard } from "@/components/auth/auth-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardAuthGuard>{children}</DashboardAuthGuard>
}
