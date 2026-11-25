"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconAdjustmentsHorizontal,
  IconArticle,
  IconBook,
  IconBuildingArch,
  IconChevronDown,
  IconFolderCode,
  IconGauge,
  IconMessages,
  IconPalette,
  IconPhoto,
  IconSettings,
} from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export type NavIconKey =
  | "overview"
  | "projects"
  | "case-studies"
  | "blogs"
  | "books"
  | "designs"
  | "media"
  | "messages"
  | "preference"
  | "settings"

const NAV_ICON_MAP: Record<NavIconKey, React.ComponentType<{ className?: string }>> = {
  overview: IconGauge,
  projects: IconFolderCode,
  "case-studies": IconBuildingArch,
  blogs: IconArticle,
  books: IconBook,
  designs: IconPalette,
  media: IconPhoto,
  messages: IconMessages,
  preference: IconAdjustmentsHorizontal,
  settings: IconSettings,
}

export interface NavSubItem {
  title: string
  url: string
}

export interface NavItem {
  title: string
  url: string
  icon: NavIconKey
  subItems?: NavSubItem[]
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export function NavMain({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname()

  const isUrlMatch = (targetUrl: string): boolean => {
    if (targetUrl === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname === targetUrl
  }

  const isParentActive = (item: NavItem): boolean => {
    if (item.url === "/dashboard") {
      return pathname === "/dashboard"
    }
    if (pathname === item.url || pathname.startsWith(`${item.url}/`)) {
      return true
    }
    return Boolean(
      item.subItems?.some(
        (sub) => pathname === sub.url || pathname.startsWith(`${sub.url}/`),
      ),
    )
  }

  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const group of groups) {
      for (const item of group.items) {
        if (item.subItems && item.subItems.length > 0) {
          initial[item.title] = isParentActive(item)
        }
      }
    }
    return initial
  })

  // Keep the active route's submenu expanded on navigation
  useEffect(() => {
    setExpandedMap((prev) => {
      const next = { ...prev }
      for (const group of groups) {
        for (const item of group.items) {
          if (item.subItems && item.subItems.length > 0 && isParentActive(item)) {
            next[item.title] = true
          }
        }
      }
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const toggleItem = (title: string) => {
    setExpandedMap((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <div className="flex flex-col gap-1">
      {groups.map((group, gIdx) => (
        <SidebarGroup key={group.label || `group-${gIdx}`} className="px-1.5 py-1">
          {group.label && (
            <SidebarGroupLabel className="px-2.5 h-6 text-[10.5px] font-normal text-neutral-500">
              {group.label}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {group.items.map((item) => {
                const hasSubItems = Boolean(item.subItems && item.subItems.length > 0)
                const active = isParentActive(item)
                const isExpanded = !!expandedMap[item.title]
                const IconComp = NAV_ICON_MAP[item.icon] || IconGauge

                return (
                  <SidebarMenuItem key={item.title}>
                    {hasSubItems ? (
                      <>
                        <div
                          className={cn(
                            "flex items-center justify-between w-full rounded-lg transition-colors",
                            active
                              ? "bg-[#E8E8E8] text-[#0A0A0A] font-medium"
                              : "text-neutral-300 hover:bg-white/10 hover:text-white",
                          )}
                        >
                          <Link
                            href={item.url}
                            onClick={() => {
                              setExpandedMap((prev) => ({ ...prev, [item.title]: true }))
                            }}
                            className="flex flex-1 items-center gap-2 pl-2.5 pr-1 py-2 text-[12px] min-w-0"
                          >
                            <IconComp className="size-4 shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleItem(item.title)}
                            aria-label={`Toggle ${item.title}`}
                            className="px-2 py-2 flex items-center justify-center opacity-75 hover:opacity-100 cursor-pointer shrink-0"
                          >
                            <IconChevronDown
                              className={cn(
                                "size-3.5 transition-transform duration-200",
                                isExpanded ? "rotate-0" : "-rotate-90",
                              )}
                            />
                          </button>
                        </div>

                        {isExpanded && item.subItems && (
                          <SidebarMenuSub>
                            {item.subItems.map((sub) => {
                              const subActive = isUrlMatch(sub.url)
                              return (
                                <SidebarMenuSubItem key={sub.url}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={subActive}
                                    className={cn(
                                      "h-8 rounded-md px-3 text-[11.5px] transition-colors",
                                      subActive
                                        ? "bg-[#2C2C2C] text-white font-medium hover:bg-[#2C2C2C] hover:text-white"
                                        : "text-neutral-400 hover:bg-white/8 hover:text-white",
                                    )}
                                  >
                                    <Link href={sub.url}>
                                      <span>{sub.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        )}
                      </>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className={cn(
                          "h-9 rounded-lg px-2.5 gap-2.5 text-[12px] transition-colors",
                          active
                            ? "bg-[#E8E8E8] text-[#0A0A0A] font-medium hover:bg-[#E8E8E8] hover:text-[#0A0A0A]"
                            : "text-neutral-300 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <Link href={item.url}>
                          <IconComp className="size-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  )
}
