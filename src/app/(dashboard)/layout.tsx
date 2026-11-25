"use client"

import React, { Suspense } from "react"
import { DashboardAuthGuard } from "@/components/auth/auth-provider"
import { AppSidebar } from "@/components/dashboard-01/components/app-sidebar"
import { SiteHeader } from "@/components/dashboard-01/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardAuthGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16.5rem",
            "--header-height": "3.75rem",
          } as React.CSSProperties
        }
      >
        <Suspense fallback={<div className="w-[16.5rem] bg-black shrink-0 hidden md:block" />}>
          <AppSidebar variant="inset" />
        </Suspense>
        <SidebarInset>
          <Suspense fallback={<div className="h-[3.25rem] shrink-0 bg-white rounded-t-2xl" />}>
            <SiteHeader />
          </Suspense>
          <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardAuthGuard>
  )
}
