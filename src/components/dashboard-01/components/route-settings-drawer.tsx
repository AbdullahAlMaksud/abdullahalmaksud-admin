"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconAdjustmentsHorizontal,
  IconArticle,
  IconBook,
  IconBuildingArch,
  IconChevronRight,
  IconFolderCode,
  IconGauge,
  IconLanguage,
  IconMessages,
  IconPalette,
  IconPhoto,
  IconRoute,
  IconServer,
  IconSettings,
  IconUser,
  IconX,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useLocale } from "@/components/I18nProvider"
import { cn } from "@/lib/utils"

interface DrawerRouteLink {
  label: string
  href: string
  badge?: string
}

interface DrawerSection {
  id: string
  title: string
  prefix: string
  icon: React.ComponentType<{ className?: string }>
  routes: DrawerRouteLink[]
}

const ROUTE_SECTIONS: DrawerSection[] = [
  {
    id: "overview",
    title: "Dashboard Overview",
    prefix: "/dashboard",
    icon: IconGauge,
    routes: [{ label: "Overview & Live Activity", href: "/dashboard" }],
  },
  {
    id: "projects",
    title: "Project Management",
    prefix: "/dashboard/projects",
    icon: IconFolderCode,
    routes: [
      { label: "All Projects", href: "/dashboard/projects" },
      { label: "Add New Project", href: "/dashboard/projects/create", badge: "Create" },
      { label: "Categories", href: "/dashboard/projects/categories", badge: "Route" },
      { label: "Tags & Stack", href: "/dashboard/projects/tags", badge: "Route" },
    ],
  },
  {
    id: "case-studies",
    title: "Case Study Management",
    prefix: "/dashboard/case-studies",
    icon: IconBuildingArch,
    routes: [
      { label: "All Case Studies", href: "/dashboard/case-studies" },
      { label: "Add Case Study", href: "/dashboard/case-studies/create", badge: "Create" },
      { label: "Categories", href: "/dashboard/case-studies/categories", badge: "Route" },
      { label: "Tags & Stack", href: "/dashboard/case-studies/tags", badge: "Route" },
    ],
  },
  {
    id: "blogs",
    title: "Blog Management",
    prefix: "/dashboard/blogs",
    icon: IconArticle,
    routes: [
      { label: "All Articles", href: "/dashboard/blogs" },
      { label: "Add New Article", href: "/dashboard/blogs/create", badge: "Create" },
      { label: "Categories", href: "/dashboard/blogs/categories", badge: "Route" },
      { label: "Tags", href: "/dashboard/blogs/tags", badge: "Route" },
    ],
  },
  {
    id: "books",
    title: "Book Management",
    prefix: "/dashboard/books",
    icon: IconBook,
    routes: [
      { label: "Book Catalog", href: "/dashboard/books" },
      { label: "Add New Book", href: "/dashboard/books/create", badge: "Create" },
      { label: "Featured Bundle", href: "/dashboard/books/bundle", badge: "Config" },
      { label: "Tags & Genres", href: "/dashboard/books/tags", badge: "Route" },
    ],
  },
  {
    id: "designs",
    title: "Graphics Design",
    prefix: "/dashboard/designs",
    icon: IconPalette,
    routes: [
      { label: "All Designs", href: "/dashboard/designs" },
      { label: "Add New Design", href: "/dashboard/designs/create", badge: "Create" },
      { label: "Categories & Tools", href: "/dashboard/designs/categories", badge: "Route" },
    ],
  },
  {
    id: "workspace",
    title: "Media & Communication",
    prefix: "/dashboard/media",
    icon: IconPhoto,
    routes: [
      { label: "Media & GitHub Assets", href: "/dashboard/media" },
      { label: "Messages & Inquiries", href: "/dashboard/messages" },
    ],
  },
]

const PAGE_SETTINGS_LINKS: Array<{
  label: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  {
    label: "Site Preferences & Localization",
    description: "EN / BN copy, hero text, navigation & metadata",
    href: "/dashboard/preference",
    icon: IconAdjustmentsHorizontal,
  },
  {
    label: "Profile & Account",
    description: "Avatar, bio, contact links & profile details",
    href: "/dashboard/settings?tab=profile",
    icon: IconUser,
  },
  {
    label: "About Page Content",
    description: "Bilingual CV, pillars, and core principles",
    href: "/dashboard/settings?tab=about",
    icon: IconMessages,
  },
  {
    label: "Cache & API Diagnostics",
    description: "On-demand revalidation & MongoDB health",
    href: "/dashboard/settings?tab=cache",
    icon: IconServer,
  },
]

export function RouteSettingsDrawer() {
  const pathname = usePathname()
  const { locale, changeLocale } = useLocale()
  const [open, setOpen] = useState(false)

  const currentSection = ROUTE_SECTIONS.find(
    (s) => s.prefix !== "/dashboard" && pathname.startsWith(s.prefix),
  )

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
          title="Page settings and quick routes"
        >
          <IconSettings className="size-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="sm:max-w-md flex flex-col h-full">
        <DrawerHeader className="border-b px-5 py-4 flex-row items-center justify-between space-y-0">
          <div className="min-w-0">
            <DrawerTitle className="text-sm font-semibold flex items-center gap-2">
              <IconRoute className="size-4 text-primary shrink-0" />
              <span>Page Settings & Routes</span>
            </DrawerTitle>
            <DrawerDescription className="text-xs mt-0.5 truncate">
              Switch sub-routes, taxonomy pages, or site settings quickly.
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon-sm" className="shrink-0" aria-label="Close drawer">
              <IconX className="size-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Active Language Setting */}
          <div className="rounded-xl border bg-muted/30 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <IconLanguage className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold">Interface Language & Font</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {locale === "bn" ? "বাংলা (Purno Font)" : "English (Geist Default)"}
                </p>
              </div>
            </div>
            <div className="inline-flex h-7 items-center rounded-md bg-neutral-200/90 p-0.5 shrink-0">
              {(["bn", "en"] as const).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => changeLocale(lng)}
                  className={cn(
                    "h-full px-2 rounded-[5px] text-[11px] uppercase transition-colors cursor-pointer",
                    locale === lng
                      ? "bg-neutral-950 text-white font-semibold"
                      : "text-neutral-700 hover:text-black font-medium",
                  )}
                >
                  {lng}
                </button>
              ))}
            </div>
          </div>

          {/* Current Page Section Routes */}
          {currentSection && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Current Section — {currentSection.title}
              </p>
              <div className="rounded-xl border divide-y bg-card">
                {currentSection.routes.map((route) => {
                  const isActive = pathname === route.href
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-muted/50",
                        isActive && "bg-muted font-semibold text-foreground",
                      )}
                    >
                      <span className="truncate">{route.label}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {route.badge && (
                          <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 font-normal">
                            {route.badge}
                          </Badge>
                        )}
                        <IconChevronRight className="size-3.5 text-muted-foreground" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Page Settings Destinations */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Page & Site Settings
            </p>
            <div className="grid grid-cols-1 gap-2">
              {PAGE_SETTINGS_LINKS.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Icon className="size-4 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <IconChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* All Dedicated Routes */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              All Module Routes
            </p>
            <div className="space-y-2.5">
              {ROUTE_SECTIONS.map((section) => {
                const SectionIcon = section.icon
                return (
                  <div key={section.id} className="rounded-xl border bg-card p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <SectionIcon className="size-3.5 text-primary shrink-0" />
                      <span>{section.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {section.routes.map((route) => {
                        const isActive = pathname === route.href
                        return (
                          <Link
                            key={route.href}
                            href={route.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "inline-flex items-center rounded-md border px-2 py-1 text-[11px] transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground border-primary font-medium"
                                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            {route.label}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t px-5 py-3 flex-row justify-between items-center">
          <span className="text-[11px] text-muted-foreground font-mono truncate">{pathname}</span>
          <DrawerClose asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
