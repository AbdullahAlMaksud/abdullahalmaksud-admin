"use client"

import React from "react"
import Link from "next/link"
import { IconChevronLeft } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { RouteSettingsDrawer } from "@/components/dashboard-01/components/route-settings-drawer"
import { cn } from "@/lib/utils"

interface PageSubHeaderProps {
  backHref?: string
  backLabel?: string
  description?: string
  leftExtra?: React.ReactNode
  right?: React.ReactNode
  showSettingsDrawer?: boolean
  className?: string
}

export function PageSubHeader({
  backHref,
  backLabel = "Back",
  description,
  leftExtra,
  right,
  showSettingsDrawer = true,
  className,
}: PageSubHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/80 bg-white/95 px-4 lg:px-6 pt-1.5 pb-3 backdrop-blur-md dark:bg-card/95",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {backHref ? (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              className="size-7 shrink-0 border-0 shadow-none text-neutral-700 hover:bg-neutral-100 hover:text-black"
            >
              <Link href={backHref} aria-label={backLabel} title={backLabel}>
                <IconChevronLeft className="size-4" />
              </Link>
            </Button>
            {/* 1px visual spacer matching SiteHeader's separator so description aligns flush with Title/Breadcrumb */}
            <span aria-hidden="true" className="h-4 w-px shrink-0" />
          </>
        ) : (
          <div aria-hidden="true" className="hidden sm:flex items-center gap-3">
            <span className="size-7 shrink-0" />
            <span className="h-4 w-px shrink-0" />
          </div>
        )}

        {description && (
          <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {leftExtra}
      </div>

      {(right || showSettingsDrawer) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {right}
          {showSettingsDrawer && <RouteSettingsDrawer />}
        </div>
      )}
    </div>
  )
}

interface StickyActionFooterProps {
  left?: React.ReactNode
  right?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export function StickyActionFooter({
  left,
  right,
  className,
  children,
}: StickyActionFooterProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 mt-auto shrink-0 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200/80 bg-white/95 px-4 lg:px-6 py-3 backdrop-blur-md dark:bg-card/95",
        className,
      )}
    >
      {children ?? (
        <>
          <div className="flex min-w-0 items-center gap-2">{left}</div>
          {right && (
            <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
              {right}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export { PageSubHeader as StickyActionBar }
