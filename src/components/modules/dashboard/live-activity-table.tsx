"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { getProjects } from "@/lib/api/projects"
import { getBlogs } from "@/lib/api/blogs"
import { getBooks } from "@/lib/api/books"
import { getDesigns } from "@/lib/api/designs"
import { getCaseStudies } from "@/lib/api/case-studies"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  IconSearch,
  IconBriefcase,
  IconArticle,
  IconBook,
  IconPalette,
  IconBuildingArch,
  IconPencil,
  IconLoader2,
  IconRefresh,
} from "@tabler/icons-react"

interface UnifiedActivityItem {
  id: string
  title: string
  subtitle?: string
  module: "project" | "case-study" | "blog" | "book" | "design"
  category: string
  status: string
  statusType: "success" | "warning" | "info" | "neutral"
  date?: string
  editUrl: string
}

export function LiveActivityTable() {
  const { t } = useTranslation()
  const [items, setItems] = useState<UnifiedActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const loadAllActivity = useCallback(async () => {
    try {
      setLoading(true)
      const [projRes, caseRes, blogRes, bookRes, designRes] =
        await Promise.allSettled([
          getProjects(),
          getCaseStudies({ limit: 15 }),
          getBlogs({ limit: 15 }),
          getBooks({ limit: 15 }),
          getDesigns(),
        ])

      const list: UnifiedActivityItem[] = []

      // Projects
      if (projRes.status === "fulfilled" && Array.isArray(projRes.value)) {
        projRes.value.slice(0, 10).forEach((p) => {
          const id = p.id || p._id || ""
          list.push({
            id: `proj-${id}`,
            title: p.title,
            subtitle: p.stack?.slice(0, 3).join(", "),
            module: "project",
            category: p.category || "Software",
            status: p.status === "live" ? "Live" : p.status,
            statusType: p.status === "live" ? "success" : "neutral",
            date: p.year ? `Year ${p.year}` : undefined,
            editUrl: "/dashboard/projects",
          })
        })
      }

      // Case Studies
      if (caseRes.status === "fulfilled" && caseRes.value?.data) {
        caseRes.value.data.slice(0, 10).forEach((cs) => {
          const id = cs.id || cs._id || ""
          list.push({
            id: `cs-${id}`,
            title: cs.title,
            subtitle: cs.client || cs.industry,
            module: "case-study",
            category: cs.category || "Architecture",
            status: cs.isPublished ? "Published" : "Draft",
            statusType: cs.isPublished ? "success" : "warning",
            date: cs.duration,
            editUrl: "/dashboard/case-studies",
          })
        })
      }

      // Blogs
      if (blogRes.status === "fulfilled" && blogRes.value?.data) {
        blogRes.value.data.slice(0, 10).forEach((b) => {
          const id = b.id || b._id || ""
          list.push({
            id: `blog-${id}`,
            title: b.title,
            subtitle: b.readingTime || "Article",
            module: "blog",
            category: b.category || "Tech Writing",
            status: b.isPublished ? "Published" : "Draft",
            statusType: b.isPublished ? "success" : "warning",
            date: b.publishedAt,
            editUrl: `/dashboard/blogs/${id}/edit`,
          })
        })
      }

      // Books
      if (bookRes.status === "fulfilled" && bookRes.value?.data) {
        bookRes.value.data.slice(0, 10).forEach((bk) => {
          const id = bk.id || bk._id || ""
          list.push({
            id: `book-${id}`,
            title: bk.title,
            subtitle: bk.author,
            module: "book",
            category: bk.genre || bk.category || "Literature",
            status: "Catalog",
            statusType: "info",
            date: bk.year ? `Year ${bk.year}` : undefined,
            editUrl: "/dashboard/books",
          })
        })
      }

      // Designs
      if (designRes.status === "fulfilled" && Array.isArray(designRes.value)) {
        designRes.value.slice(0, 10).forEach((d) => {
          const id = d.id || d._id || ""
          list.push({
            id: `design-${id}`,
            title: d.title,
            subtitle: d.subtitle,
            module: "design",
            category: d.category || "Graphic",
            status: "Showcase",
            statusType: "neutral",
            date: d.year ? `Year ${d.year}` : undefined,
            editUrl: "/dashboard/designs",
          })
        })
      }

      setItems(list)
    } catch (err: unknown) {
      console.error("Failed to load live activity:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllActivity()
  }, [loadAllActivity])

  const getModuleBadge = (mod: UnifiedActivityItem["module"]) => {
    switch (mod) {
      case "project":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 text-[11px] font-normal">
            <IconBriefcase className="size-3" />
            <span>Project</span>
          </Badge>
        )
      case "case-study":
        return (
          <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 gap-1 text-[11px] font-normal">
            <IconBuildingArch className="size-3" />
            <span>Case Study</span>
          </Badge>
        )
      case "blog":
        return (
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 gap-1 text-[11px] font-normal">
            <IconArticle className="size-3" />
            <span>Article</span>
          </Badge>
        )
      case "book":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1 text-[11px] font-normal">
            <IconBook className="size-3" />
            <span>Book</span>
          </Badge>
        )
      case "design":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 gap-1 text-[11px] font-normal">
            <IconPalette className="size-3" />
            <span>Design</span>
          </Badge>
        )
    }
  }

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q)

    const matchesTab = activeTab === "all" || item.module === activeTab

    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Header and Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            {t("dashboard.recentActivity")}
          </h3>
          <p className="text-xs text-muted-foreground">
            Live synchronized repository items directly from MongoDB database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={loadAllActivity}
            className="size-8 shrink-0"
            title="Refresh feed"
          >
            <IconRefresh className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { key: "all", label: t("dashboard.allModules") },
          { key: "project", label: t("dashboard.filterProjects") },
          { key: "case-study", label: t("dashboard.filterCaseStudies") },
          { key: "blog", label: t("dashboard.filterBlogs") },
          { key: "book", label: t("dashboard.filterBooks") },
          { key: "design", label: t("dashboard.filterDesigns") },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Unified Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[120px]">Module</TableHead>
              <TableHead>Content Title</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden sm:table-cell">Context / Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <IconLoader2 className="size-4 animate-spin text-primary" />
                    <span>{t("common.loading")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {t("common.noResults")}
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell>{getModuleBadge(item.module)}</TableCell>

                  <TableCell className="font-medium">
                    <div className="flex flex-col max-w-[280px] sm:max-w-md">
                      <span className="font-semibold text-foreground text-sm truncate">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="text-xs text-muted-foreground truncate">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {item.category}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground whitespace-nowrap">
                    {item.date || "—"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${
                        item.statusType === "success"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : item.statusType === "warning"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : item.statusType === "info"
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
                      <Link href={item.editUrl}>
                        <IconPencil className="size-3" />
                        <span>Manage</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
