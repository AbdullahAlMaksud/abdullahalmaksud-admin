"use client"

import React, { useEffect, useState } from "react"
import {
  IconBook,
  IconBriefcase,
  IconArticle,
  IconPalette,
  IconBuildingArch,
  IconTrendingUp,
  IconServer,
  IconRefresh,
} from "@tabler/icons-react"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getProjects } from "@/lib/api/projects"
import { getBlogs } from "@/lib/api/blogs"
import { getBooks } from "@/lib/api/books"
import { getDesigns } from "@/lib/api/designs"
import { getCaseStudies } from "@/lib/api/case-studies"
import { getHealthStatus } from "@/lib/api/dashboard"

export function StatsCards() {
  const { t } = useTranslation()
  const [counts, setCounts] = useState({
    projects: 0,
    caseStudies: 0,
    blogs: 0,
    books: 0,
    designs: 0,
  })
  const [health, setHealth] = useState<{
    status: string
    uptimeFormatted?: string
    isConnected: boolean
  }>({
    status: "ok",
    uptimeFormatted: "Active",
    isConnected: true,
  })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      setLoading(true)
      const [projRes, caseRes, blogRes, bookRes, designRes, healthRes] =
        await Promise.allSettled([
          getProjects(),
          getCaseStudies({ limit: 1 }),
          getBlogs({ limit: 1 }),
          getBooks({ limit: 1 }),
          getDesigns(),
          getHealthStatus(),
        ])

      const projectCount =
        projRes.status === "fulfilled" && Array.isArray(projRes.value)
          ? projRes.value.length
          : 0

      const caseCount =
        caseRes.status === "fulfilled" && caseRes.value?.pagination
          ? caseRes.value.pagination.total
          : 0

      const blogCount =
        blogRes.status === "fulfilled" && blogRes.value?.pagination
          ? blogRes.value.pagination.total
          : 0

      const bookCount =
        bookRes.status === "fulfilled" && bookRes.value?.pagination
          ? bookRes.value.pagination.total
          : 0

      const designCount =
        designRes.status === "fulfilled" && Array.isArray(designRes.value)
          ? designRes.value.length
          : 0

      if (healthRes.status === "fulfilled" && healthRes.value?.data) {
        const d = healthRes.value.data
        setHealth({
          status: d.status || "ok",
          uptimeFormatted: d.uptimeFormatted || "Active",
          isConnected: d.database?.isConnected !== false,
        })
      }

      setCounts({
        projects: projectCount,
        caseStudies: caseCount,
        blogs: blogCount,
        books: bookCount,
        designs: designCount,
      })
    } catch (err: unknown) {
      console.error("Failed to load dashboard counts:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Live Server & DB Health Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border bg-muted/30 text-sm">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg ${
              health.isConnected
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600"
            }`}
          >
            <IconServer className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground">
              {t("dashboard.serverHealth")}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span
                className={`size-2 rounded-full ${
                  health.isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`}
              />
              {health.isConnected
                ? t("dashboard.serverOnline")
                : t("dashboard.serverOffline")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Uptime: <strong className="text-foreground">{health.uptimeFormatted}</strong></span>
          <button
            onClick={loadStats}
            title="Refresh statistics"
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconRefresh className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Primary Module Metric Cards */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-5 dark:*:data-[slot=card]:bg-card">
        {/* Projects Card */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5 font-medium">
              <IconBriefcase className="size-4 text-emerald-500" />
              {t("dashboard.totalProjects")}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {loading ? "..." : counts.projects}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                <IconTrendingUp /> Live
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground text-xs">
              {t("dashboard.projectsCompleted")}
            </div>
          </CardFooter>
        </Card>

        {/* Case Studies Card */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5 font-medium">
              <IconBuildingArch className="size-4 text-cyan-500" />
              {t("dashboard.totalCaseStudies")}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {loading ? "..." : counts.caseStudies}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-600 border-cyan-200">
                <IconTrendingUp /> Systems
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground text-xs">
              Enterprise Benchmarks
            </div>
          </CardFooter>
        </Card>

        {/* Blogs Card */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5 font-medium">
              <IconArticle className="size-4 text-purple-500" />
              {t("dashboard.totalBlogs")}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {loading ? "..." : counts.blogs}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200">
                <IconTrendingUp /> Articles
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground text-xs">
              {t("dashboard.blogCategories")}
            </div>
          </CardFooter>
        </Card>

        {/* Books Card */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5 font-medium">
              <IconBook className="size-4 text-blue-500" />
              {t("dashboard.totalBooks")}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {loading ? "..." : counts.books}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                <IconTrendingUp /> Curated
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground text-xs">
              {t("dashboard.booksSubtitle")}
            </div>
          </CardFooter>
        </Card>

        {/* Graphic Designs Card */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5 font-medium">
              <IconPalette className="size-4 text-rose-500" />
              {t("dashboard.totalDesigns")}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {loading ? "..." : counts.designs}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-200">
                <IconTrendingUp /> Visuals
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground text-xs">
              UI/UX & Branding Assets
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
