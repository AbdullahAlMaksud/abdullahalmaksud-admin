"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslation } from "react-i18next"
import {
  IconCirclePlusFilled,
  IconMail,
  IconBook,
  IconFolder,
  IconArticle,
  IconChevronDown,
  type Icon,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    titleKey: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname()
  const { t } = useTranslation()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip={t("nav.addItem")}
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <IconCirclePlusFilled className="size-4" />
                    <span>{t("nav.addItem")}</span>
                  </div>
                  <IconChevronDown className="size-3.5 opacity-80" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {t("nav.quickCreateLabel")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/books" className="flex items-center gap-2 cursor-pointer">
                    <IconBook className="size-4 text-blue-500" />
                    <span>{t("nav.createBook")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/projects" className="flex items-center gap-2 cursor-pointer">
                    <IconFolder className="size-4 text-emerald-500" />
                    <span>{t("nav.createProject")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/blogs" className="flex items-center gap-2 cursor-pointer">
                    <IconArticle className="size-4 text-purple-500" />
                    <span>{t("nav.createBlog")}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
              asChild
            >
              <Link href="/dashboard/settings">
                <IconMail className="size-4" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url
            const title = t(item.titleKey)
            return (
              <SidebarMenuItem key={item.titleKey}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={title}
                  className={isActive ? "bg-accent text-accent-foreground font-medium" : ""}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
