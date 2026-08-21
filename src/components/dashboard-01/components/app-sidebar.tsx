"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import {
  IconArticle,
  IconBook,
  IconDashboard,
  IconFolder,
  IconHelp,
  IconPalette,
  IconSettings,
  IconUser,
} from "@tabler/icons-react"

import { NavMain } from "@/components/dashboard-01/components/nav-main"
import { NavSecondary } from "@/components/dashboard-01/components/nav-secondary"
import { NavUser } from "@/components/dashboard-01/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()

  const data = {
    user: {
      name: "Abdullah Al Maksud",
      email: "contact@abdullahalmaksud.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abdullah",
    },
    navMain: [
      {
        titleKey: "nav.dashboard",
        url: "/dashboard",
        icon: IconDashboard,
      },
      {
        titleKey: "nav.books",
        url: "/dashboard/books",
        icon: IconBook,
      },
      {
        titleKey: "nav.projects",
        url: "/dashboard/projects",
        icon: IconFolder,
      },
      {
        titleKey: "nav.blogs",
        url: "/dashboard/blogs",
        icon: IconArticle,
      },
      {
        titleKey: "nav.designs",
        url: "/dashboard/designs",
        icon: IconPalette,
      },
      {
        titleKey: "nav.settings",
        url: "/dashboard/settings",
        icon: IconSettings,
      },
    ],
    navSecondary: [
      {
        title: t("nav.profileSettings"),
        url: "/dashboard/settings",
        icon: IconUser,
      },
      {
        title: t("nav.helpSupport"),
        url: "#",
        icon: IconHelp,
      },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                  AM
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-sm font-bold tracking-tight">
                    Abdullah Al Maksud
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {t("nav.adminPortal")}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
