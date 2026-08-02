"use client"

import { IconBook, IconBriefcase, IconArticle, IconEye, IconTrendingUp } from "@tabler/icons-react"
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
import { initialBooks, initialProjects, initialBlogs } from "@/lib/admin-data"

export function SectionCards() {
  const { t } = useTranslation()

  const totalBooks = initialBooks.length
  const totalProjects = initialProjects.length
  const totalBlogs = initialBlogs.length
  const totalViews = initialBlogs.reduce((acc, blog) => acc + blog.views, 0) + 2440

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5 font-medium">
            <IconBook className="size-4 text-blue-500" />
            {t("dashboard.totalBooks")}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalBooks}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
              <IconTrendingUp /> Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground">
            {t("dashboard.booksSubtitle")}
          </div>
          <div className="text-muted-foreground">
            {t("dashboard.booksDownloads")}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5 font-medium">
            <IconBriefcase className="size-4 text-emerald-500" />
            {t("dashboard.totalProjects")}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalProjects}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
              <IconTrendingUp /> +1
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground">
            {t("dashboard.projectsCompleted")}
          </div>
          <div className="text-muted-foreground">
            {t("dashboard.projectsShowcase")}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5 font-medium">
            <IconArticle className="size-4 text-purple-500" />
            {t("dashboard.totalBlogs")}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalBlogs}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200">
              <IconTrendingUp /> +15.4%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground">
            {t("dashboard.blogCategories")}
          </div>
          <div className="text-muted-foreground">{t("dashboard.blogDraftCount")}</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5 font-medium">
            <IconEye className="size-4 text-amber-500" />
            {t("dashboard.totalViews")}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalViews.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
              <IconTrendingUp /> +24%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground">
            {t("dashboard.avgReadTime")}
          </div>
          <div className="text-muted-foreground">{t("dashboard.organicTraffic")}</div>
        </CardFooter>
      </Card>
    </div>
  )
}
