"use client"

import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { CaseStudy } from "@/lib/api/types"
import { updateCaseStudy } from "@/lib/api/case-studies"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IconSearch,
  IconPencil,
  IconTrash,
  IconStar,
  IconBuildingArch,
  IconPlus,
} from "@tabler/icons-react"
import { toast } from "sonner"

interface CaseStudiesTableProps {
  caseStudies: CaseStudy[]
  loading?: boolean
  onEdit: (item: CaseStudy) => void
  onDelete: (item: CaseStudy) => void
  onAdd: () => void
  onUpdateSuccess: (updated: CaseStudy) => void
}

export function CaseStudiesTable({
  caseStudies,
  loading = false,
  onEdit,
  onDelete,
  onAdd,
  onUpdateSuccess,
}: CaseStudiesTableProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredItems = caseStudies.filter((item) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.slug.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.industry?.toLowerCase().includes(query) ||
      item.client?.toLowerCase().includes(query) ||
      item.stack?.some((s) => s.toLowerCase().includes(query))

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && item.isPublished) ||
      (statusFilter === "draft" && !item.isPublished)

    return matchesSearch && matchesStatus
  })

  const handleToggleFeatured = async (item: CaseStudy) => {
    const targetId = item.id || item._id
    if (!targetId) return

    try {
      const res = await updateCaseStudy(targetId, {
        featured: !item.featured,
      })
      toast.success(
        !item.featured ? "Case study featured" : "Featured status removed"
      )
      if (res.data) onUpdateSuccess(res.data)
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to update featured status"
      toast.error(errMsg)
    }
  }

  const handleTogglePublished = async (item: CaseStudy) => {
    const targetId = item.id || item._id
    if (!targetId) return

    try {
      const res = await updateCaseStudy(targetId, {
        isPublished: !item.isPublished,
      })
      toast.success(
        !item.isPublished ? "Published live" : "Moved to drafts"
      )
      if (res.data) onUpdateSuccess(res.data)
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to toggle published status"
      toast.error(errMsg)
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls: Search, Filter, Add */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t("caseStudies.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder={t("common.filter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("caseStudies.filterAll")}</SelectItem>
              <SelectItem value="published">{t("caseStudies.filterPublished")}</SelectItem>
              <SelectItem value="draft">{t("caseStudies.filterDraft")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onAdd} size="sm" className="h-9 gap-1.5 shrink-0">
          <IconPlus className="size-4" />
          <span>{t("caseStudies.addNew")}</span>
        </Button>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>{t("caseStudies.tableTitle")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("caseStudies.tableCategory")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("caseStudies.tableIndustry")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t("caseStudies.tableClient")}</TableHead>
              <TableHead>{t("caseStudies.tableStatus")}</TableHead>
              <TableHead className="text-right">{t("caseStudies.tableActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <span className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>{t("common.loading")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <IconBuildingArch className="size-8 text-muted-foreground/50 mb-1" />
                    <p className="text-sm font-medium">{t("common.noResults")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("caseStudies.subtitle")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const itemId = item.id || item._id || ""
                return (
                  <TableRow key={itemId} className="hover:bg-muted/30">
                    {/* Featured star toggle */}
                    <TableCell className="pl-3 pr-0">
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        title={item.featured ? "Featured" : "Click to feature"}
                        className={`p-1 rounded-sm transition-colors ${
                          item.featured
                            ? "text-amber-500 hover:text-amber-600"
                            : "text-muted-foreground/30 hover:text-muted-foreground"
                        }`}
                      >
                        <IconStar className="size-4 fill-current" />
                      </button>
                    </TableCell>

                    {/* Title & Slug */}
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-0.5 max-w-[280px] lg:max-w-[340px]">
                        <span className="truncate font-semibold text-foreground text-sm">
                          {item.title}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          /{item.slug}
                        </span>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[11px] font-normal">
                        {item.category || "Architecture"}
                      </Badge>
                    </TableCell>

                    {/* Industry */}
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {item.industry || "—"}
                    </TableCell>

                    {/* Client / Organization */}
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                      {item.client || "—"}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <button
                        onClick={() => handleTogglePublished(item)}
                        className="cursor-pointer"
                        title="Click to toggle publish status"
                      >
                        {item.isPublished ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                            ● {t("caseStudies.publishedBadge")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">
                            {t("caseStudies.draftBadge")}
                          </Badge>
                        )}
                      </button>
                    </TableCell>

                    {/* Action buttons */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          className="size-8 text-muted-foreground hover:text-foreground"
                          title={t("common.edit")}
                        >
                          <IconPencil className="size-4" />
                          <span className="sr-only">{t("common.edit")}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item)}
                          className="size-8 text-muted-foreground hover:text-destructive"
                          title={t("common.delete")}
                        >
                          <IconTrash className="size-4" />
                          <span className="sr-only">{t("common.delete")}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
