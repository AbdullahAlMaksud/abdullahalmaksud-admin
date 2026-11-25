"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslation } from "react-i18next"
import { IconChevronRight } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useLocale } from "@/components/I18nProvider"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface RouteMeta {
  title: string
  breadcrumbs: BreadcrumbItem[]
}

const routeMetaMap: Record<string, RouteMeta> = {
  "/dashboard": {
    title: "Overview",
    breadcrumbs: [{ label: "Dashboard" }, { label: "Overview" }],
  },
  "/dashboard/projects": {
    title: "Project Management",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Project Management" }],
  },
  "/dashboard/projects/create": {
    title: "Add New Project",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Project Management", href: "/dashboard/projects" },
      { label: "Add New Project" },
    ],
  },
  "/dashboard/projects/categories": {
    title: "Project Categories",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Project Management", href: "/dashboard/projects" },
      { label: "Categories" },
    ],
  },
  "/dashboard/projects/tags": {
    title: "Project Tags & Stack",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Project Management", href: "/dashboard/projects" },
      { label: "Tags & Stack" },
    ],
  },
  "/dashboard/case-studies": {
    title: "Case Study Management",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Case Study Management" }],
  },
  "/dashboard/case-studies/create": {
    title: "Add Case Study",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Case Study Management", href: "/dashboard/case-studies" },
      { label: "Add Case Study" },
    ],
  },
  "/dashboard/case-studies/categories": {
    title: "Case Study Categories",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Case Study Management", href: "/dashboard/case-studies" },
      { label: "Categories" },
    ],
  },
  "/dashboard/case-studies/tags": {
    title: "Case Study Tags",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Case Study Management", href: "/dashboard/case-studies" },
      { label: "Tags & Stack" },
    ],
  },
  "/dashboard/blogs": {
    title: "Blog Management",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Blog Management" }],
  },
  "/dashboard/blogs/create": {
    title: "Add New Article",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Blog Management", href: "/dashboard/blogs" },
      { label: "Add New Article" },
    ],
  },
  "/dashboard/blogs/categories": {
    title: "Blog Categories",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Blog Management", href: "/dashboard/blogs" },
      { label: "Categories" },
    ],
  },
  "/dashboard/blogs/tags": {
    title: "Blog Tags",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Blog Management", href: "/dashboard/blogs" },
      { label: "Tags" },
    ],
  },
  "/dashboard/books": {
    title: "Book Management",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Book Management" }],
  },
  "/dashboard/books/create": {
    title: "Add New Book",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Book Management", href: "/dashboard/books" },
      { label: "Add New Book" },
    ],
  },
  "/dashboard/books/bundle": {
    title: "Featured Book Bundle",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Book Management", href: "/dashboard/books" },
      { label: "Featured Bundle" },
    ],
  },
  "/dashboard/books/tags": {
    title: "Book Tags & Genres",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Book Management", href: "/dashboard/books" },
      { label: "Tags & Genres" },
    ],
  },
  "/dashboard/designs": {
    title: "Graphics Design",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Graphics Design" }],
  },
  "/dashboard/designs/create": {
    title: "Add New Design",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Graphics Design", href: "/dashboard/designs" },
      { label: "Add New Design" },
    ],
  },
  "/dashboard/designs/categories": {
    title: "Design Categories",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Graphics Design", href: "/dashboard/designs" },
      { label: "Categories" },
    ],
  },
  "/dashboard/media": {
    title: "Media Management",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Media Management" }],
  },
  "/dashboard/messages": {
    title: "Messages & Inquiries",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Messages" }],
  },
  "/dashboard/preference": {
    title: "Site Preferences",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Site Preferences" }],
  },
  "/dashboard/settings": {
    title: "Settings",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }],
  },
}

const editRoutePrefixes: Array<{ prefix: string; title: string; parentLabel: string; parentHref: string }> = [
  { prefix: "/dashboard/projects/", title: "Edit Project", parentLabel: "Project Management", parentHref: "/dashboard/projects" },
  { prefix: "/dashboard/case-studies/", title: "Edit Case Study", parentLabel: "Case Study Management", parentHref: "/dashboard/case-studies" },
  { prefix: "/dashboard/blogs/", title: "Edit Article", parentLabel: "Blog Management", parentHref: "/dashboard/blogs" },
  { prefix: "/dashboard/books/", title: "Edit Book", parentLabel: "Book Management", parentHref: "/dashboard/books" },
  { prefix: "/dashboard/designs/", title: "Edit Design", parentLabel: "Graphics Design", parentHref: "/dashboard/designs" },
]

function getRouteMeta(pathname: string): RouteMeta {
  if (routeMetaMap[pathname]) return routeMetaMap[pathname]
  if (pathname.endsWith("/edit")) {
    const match = editRoutePrefixes.find((entry) => pathname.startsWith(entry.prefix))
    if (match) {
      return {
        title: match.title,
        breadcrumbs: [
          { label: "Dashboard", href: "/dashboard" },
          { label: match.parentLabel, href: match.parentHref },
          { label: match.title },
        ],
      }
    }
  }
  const matchedPrefix = Object.keys(routeMetaMap).find(
    (route) => route !== "/dashboard" && pathname.startsWith(route),
  )
  return matchedPrefix ? routeMetaMap[matchedPrefix] : routeMetaMap["/dashboard"]
}

export function SiteHeader() {
  const { t } = useTranslation()
  const { locale, changeLocale } = useLocale()
  const pathname = usePathname()

  const { title, breadcrumbs } = getRouteMeta(pathname)

  return (
    <header className="flex w-full min-w-0 shrink-0 items-center bg-white pt-3 pb-1.5 rounded-t-2xl">
      <div className="flex w-full min-w-0 items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SidebarTrigger className="size-7 shrink-0 text-neutral-700 hover:bg-neutral-100 hover:text-black" />
          <Separator
            orientation="vertical"
            className="h-5 w-px shrink-0 bg-neutral-200"
          />

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <h1 className="truncate text-sm font-semibold leading-none tracking-tight text-neutral-900">
              {title}
            </h1>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-[11px] leading-none text-neutral-500">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1
                return (
                  <React.Fragment key={`${crumb.label}-${idx}`}>
                    {idx > 0 && <IconChevronRight className="size-3 shrink-0 text-neutral-400" />}
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="truncate transition-colors hover:text-neutral-900"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={isLast ? "truncate font-medium text-neutral-700" : "truncate"}>
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* BN / EN Segmented Control (h-8 matches Visit Website height) */}
          <div
            role="group"
            aria-label="Language Switcher"
            className="inline-flex h-8 items-center rounded-md bg-neutral-200/90 p-0.5"
          >
            <button
              type="button"
              onClick={() => changeLocale("bn")}
              className={`h-full cursor-pointer rounded-[5px] px-2.5 text-[11px] leading-none transition-colors flex items-center ${
                locale === "bn"
                  ? "bg-neutral-950 font-semibold text-white"
                  : "font-medium text-neutral-700 hover:text-black"
              }`}
            >
              BN
            </button>
            <button
              type="button"
              onClick={() => changeLocale("en")}
              className={`h-full cursor-pointer rounded-[5px] px-2.5 text-[11px] leading-none transition-colors flex items-center ${
                locale === "en"
                  ? "bg-neutral-950 font-semibold text-white"
                  : "font-medium text-neutral-700 hover:text-black"
              }`}
            >
              EN
            </button>
          </div>

          <Button
            asChild
            size="sm"
            className="h-8 rounded-md bg-neutral-950 px-3.5 text-xs font-medium text-white hover:bg-neutral-800"
          >
            <a
              href={process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost") ? "http://localhost:3000" : "https://abdullahalmaksud.com"}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("common.visitWebsite")}
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
