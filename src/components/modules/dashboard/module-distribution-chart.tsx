"use client"

import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts"
import { getProjects } from "@/lib/api/projects"
import { getBlogs } from "@/lib/api/blogs"
import { getBooks } from "@/lib/api/books"
import { getDesigns } from "@/lib/api/designs"
import { getCaseStudies } from "@/lib/api/case-studies"
import { IconChartBar, IconLoader2 } from "@tabler/icons-react"

interface ChartDataItem {
  name: string
  count: number
  color: string
}

export function ModuleDistributionChart() {
  const { t } = useTranslation()
  const [data, setData] = useState<ChartDataItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      try {
        setLoading(true)
        const [projRes, caseRes, blogRes, bookRes, designRes] =
          await Promise.allSettled([
            getProjects(),
            getCaseStudies({ limit: 1 }),
            getBlogs({ limit: 1 }),
            getBooks({ limit: 1 }),
            getDesigns(),
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

        setData([
          { name: "Projects", count: projectCount, color: "#10b981" },
          { name: "Case Studies", count: caseCount, color: "#06b6d4" },
          { name: "Blogs", count: blogCount, color: "#a855f7" },
          { name: "Books", count: bookCount, color: "#3b82f6" },
          { name: "Designs", count: designCount, color: "#f43f5e" },
        ])
      } catch (err: unknown) {
        console.error("Failed to load chart data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [])

  const totalContentCount = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="rounded-xl shadow-xs overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-2">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <IconChartBar className="size-4 text-primary" />
            <span>Portfolio Content Distribution</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Live resource counts indexed across the 5 primary backend modules
          </CardDescription>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
          Total published items: <strong className="text-foreground">{totalContentCount}</strong>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground gap-2">
            <IconLoader2 className="size-5 animate-spin text-primary" />
            <span className="text-xs">{t("common.loading")}</span>
          </div>
        ) : (
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as ChartDataItem
                      return (
                        <div className="rounded-lg border bg-background p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-foreground">
                            {item.name}
                          </p>
                          <p className="text-muted-foreground mt-0.5">
                            Total Records: <span className="font-bold text-foreground">{item.count}</span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
