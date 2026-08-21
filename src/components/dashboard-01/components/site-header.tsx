"use client"

import { usePathname } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { IconExternalLink, IconSparkles, IconLanguage } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/components/I18nProvider"

const routeKeys: Record<string, string> = {
  "/dashboard": "header.dashboard",
  "/dashboard/books": "header.books",
  "/dashboard/projects": "header.projects",
  "/dashboard/blogs": "header.blogs",
  "/dashboard/designs": "header.designs",
  "/dashboard/settings": "header.settings",
}

export function SiteHeader() {
  const { t } = useTranslation()
  const { locale, changeLocale } = useLocale()
  const pathname = usePathname()
  const titleKey = routeKeys[pathname] ?? "common.appName"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-foreground">{t(titleKey)}</h1>
          <Badge variant="outline" className="hidden sm:inline-flex text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <IconSparkles className="size-3 mr-1" /> {t("common.livePortal")}
          </Badge>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border text-xs">
            <IconLanguage className="size-3.5 text-muted-foreground ml-1" />
            <button
              onClick={() => changeLocale("bn")}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                locale === "bn"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              BN
            </button>
            <button
              onClick={() => changeLocale("en")}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                locale === "en"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
          </div>

          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://abdullahalmaksud.com"
              rel="noopener noreferrer"
              target="_blank"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <span>{t("common.visitWebsite")}</span>
              <IconExternalLink className="size-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
