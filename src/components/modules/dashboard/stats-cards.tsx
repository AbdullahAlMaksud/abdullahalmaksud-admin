"use client"

import React, { useEffect, useState } from "react"
import {
  IconBook,
  IconBriefcase,
  IconArticle,
  IconPalette,
  IconTrendingUp,
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

export function StatsCards() {
  const { t } = useTranslation()
  const [counts, setCounts] = useState({
    projects: 4,
    blogs: 3,
    books: 3,
    designs: 4,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        const [projRes, blogRes, bookRes, designRes] = await Promise.allSettled([
          getProjects(),
          getBlogs({ limit: 1 }),
          getBooks({ limit: 1 }),
          getDesigns(),
        ])

        const projectCount =
          projRes.status === "fulfilled" && Array.isArray(projRes.value)
            ? projRes.value.length
            : 4

        const blogCount =
          blogRes.status === "fulfilled" && blogRes.value?.pagination
            ? blogRes.value.pagination.total
            : 3

        const bookCount =
          bookRes.status === "fulfilled" && bookRes.value?.pagination
            ? bookRes.value.pagination.total
            : 3

        const designCount =
          designRes.status === "fulfilled" && Array.isArray(designRes.value)
            ? designRes.value.length
            : 4

        setCounts({
          projects: projectCount,
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

    loadStats()
  }, [])

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Books Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5 font-medium">
            <IconBook className="size-4 text-blue-500" />
            {t("dashboard.totalBooks") || "Reading Shelf"}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : counts.books}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
              <IconTrendingUp /> Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground">
            Curated reading list
          </div>
          <div className="text-muted-foreground text-xs">
            Synced with MongoDB
          </div>
        </CardFooter>
      </Card>

      {/* Projects Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5 font-medium">
            <IconBriefcase className="size-4 text-emerald-500" />
            {t("dashboard.totalProjects") || "Portfolio Projects"}
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
          <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground">
            Software showcases
          </div>
          <div className="text-muted-foreground text-xs">
            Dynamic CRUD enabled
          </div>
        </CardFooter>
      </Card>

      {/* Blogs Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5 font-medium">
            <IconArticle className="size-4 text-purple-500" />
            {t("dashboard.totalBlogs") || "Blog Articles"}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : counts.blogs}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200">
              <IconTrendingUp /> Published
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground">
            Technical tutorials & guides
          </div>
          <div className="text-muted-foreground text-xs">
            Markdown supported
          </div>
        </CardFooter>
      </Card>

      {/* Graphic Designs Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5 font-medium">
            <IconPalette className="size-4 text-rose-500" />
            {t("dashboard.totalDesigns") || "Graphic Designs"}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : counts.designs}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-200">
              <IconTrendingUp /> Showcase
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground">
            Visual & UI/UX identity
          </div>
          <div className="text-muted-foreground text-xs">
            Vercel Blob Media
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
