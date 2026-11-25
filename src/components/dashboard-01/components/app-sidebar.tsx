"use client"

import * as React from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/ui/brand-logo"
import { NavMain, type NavGroup } from "@/components/dashboard-01/components/nav-main"
import { NavUser } from "@/components/dashboard-01/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: "overview",
      },
    ],
  },
  {
    label: "Project",
    items: [
      {
        title: "Project Management",
        url: "/dashboard/projects",
        icon: "projects",
        subItems: [
          { title: "Add New Project", url: "/dashboard/projects/create" },
          { title: "Categories", url: "/dashboard/projects/categories" },
          { title: "Tags & Stack", url: "/dashboard/projects/tags" },
        ],
      },
      {
        title: "Case Study Management",
        url: "/dashboard/case-studies",
        icon: "case-studies",
        subItems: [
          { title: "Add Case Study", url: "/dashboard/case-studies/create" },
          { title: "Categories", url: "/dashboard/case-studies/categories" },
          { title: "Tags", url: "/dashboard/case-studies/tags" },
        ],
      },
    ],
  },
  {
    label: "Writing",
    items: [
      {
        title: "Blog Management",
        url: "/dashboard/blogs",
        icon: "blogs",
        subItems: [
          { title: "Add New Article", url: "/dashboard/blogs/create" },
          { title: "Categories", url: "/dashboard/blogs/categories" },
          { title: "Tags", url: "/dashboard/blogs/tags" },
        ],
      },
      {
        title: "Book Management",
        url: "/dashboard/books",
        icon: "books",
        subItems: [
          { title: "Add New Book", url: "/dashboard/books/create" },
          { title: "Featured Bundle", url: "/dashboard/books/bundle" },
          { title: "Tags & Genres", url: "/dashboard/books/tags" },
        ],
      },
    ],
  },
  {
    label: "Design",
    items: [
      {
        title: "Graphics Design",
        url: "/dashboard/designs",
        icon: "designs",
      },
    ],
  },
  {
    label: "Setup",
    items: [
      {
        title: "Media Management",
        url: "/dashboard/media",
        icon: "media",
      },
      {
        title: "Messages",
        url: "/dashboard/messages",
        icon: "messages",
      },
      {
        title: "Preference",
        url: "/dashboard/preference",
        icon: "preference",
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: "settings",
      },
    ],
  },
]

const DEFAULT_USER = {
  name: "Abdullah Al Maksud",
  email: "contact@abdullahalmaksud.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abdullah",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="px-3.5 pt-4 pb-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center w-fit rounded-md p-1 transition-opacity hover:opacity-80"
          aria-label="Abdullah Al Maksud Dashboard"
        >
          <BrandLogo variant="dark" className="h-[22px] w-auto" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="no-scrollbar px-1.5 py-2 gap-0.5">
        <NavMain groups={NAV_GROUPS} />
      </SidebarContent>

      <SidebarFooter className="px-2 pb-3 pt-1">
        <NavUser user={DEFAULT_USER} />
      </SidebarFooter>
    </Sidebar>
  )
}
