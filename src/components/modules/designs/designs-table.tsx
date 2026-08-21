"use client"

import React, { useState, useMemo } from "react"
import { Design } from "@/lib/api/types"
import { updateDesign } from "@/lib/api/designs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconSearch,
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconStar,
  IconStarFilled,
  IconPhoto,
  IconExternalLink,
} from "@tabler/icons-react"
import { toast } from "sonner"

interface DesignsTableProps {
  designs: Design[]
  loading: boolean
  onAdd: () => void
  onEdit: (design: Design) => void
  onDelete: (design: Design) => void
  onUpdateSuccess: (design: Design) => void
}

export function DesignsTable({
  designs,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onUpdateSuccess,
}: DesignsTableProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const categories = useMemo(() => {
    const set = new Set<string>()
    designs.forEach((d) => {
      if (d.category) set.add(d.category)
    })
    return Array.from(set)
  }, [designs])

  const filteredDesigns = useMemo(() => {
    return designs.filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        (d.subtitle && d.subtitle.toLowerCase().includes(search.toLowerCase())) ||
        (d.category && d.category.toLowerCase().includes(search.toLowerCase())) ||
        (d.tools && d.tools.some((t) => t.toLowerCase().includes(search.toLowerCase())))

      const matchCategory =
        categoryFilter === "all" || d.category === categoryFilter

      return matchSearch && matchCategory
    })
  }, [designs, search, categoryFilter])

  const toggleFeatured = async (design: Design) => {
    const targetId = design.id || design._id
    if (!targetId) return

    const currentFeatured = !!(design.isFeatured ?? design.featured)
    const newFeatured = !currentFeatured

    try {
      const res = await updateDesign(targetId, {
        isFeatured: newFeatured,
        featured: newFeatured,
      })
      toast.success(
        newFeatured ? "Marked as featured design" : "Removed from featured designs"
      )
      if (res.data) onUpdateSuccess(res.data)
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to toggle featured status"
      toast.error(errMsg)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <IconSearch className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search designs by title, category, or tool..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter designs by category"
              className="h-9 rounded-md border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        <Button onClick={onAdd} size="sm" className="gap-1.5 h-9 text-xs">
          <IconPlus className="size-4" />
          <span>Add Design</span>
        </Button>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-16">Preview</TableHead>
              <TableHead>Design & Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tools</TableHead>
              <TableHead className="w-20 text-center">Year</TableHead>
              <TableHead className="w-24 text-center">Featured</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell>
                    <div className="size-10 rounded-md bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-36 bg-muted rounded mb-1.5" />
                    <div className="h-3 w-24 bg-muted/60 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-20 bg-muted rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-28 bg-muted rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-10 bg-muted rounded mx-auto" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-12 bg-muted rounded mx-auto" />
                  </TableCell>
                  <TableCell>
                    <div className="size-8 bg-muted rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredDesigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-1.5">
                    <IconPhoto className="size-8 stroke-1 text-muted-foreground/50" />
                    <p className="text-sm font-medium">No graphic design items found</p>
                    <p className="text-xs">
                      {search
                        ? "Try changing your search query"
                        : "Click 'Add Design' to showcase your creative work."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDesigns.map((design) => {
                const targetId = design.id || design._id || ""
                const isFeatured = !!(design.isFeatured ?? design.featured)

                return (
                  <TableRow key={targetId} className="group">
                    {/* Thumbnail */}
                    <TableCell>
                      <div className="relative size-12 rounded-md overflow-hidden bg-muted border shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={design.coverImage}
                          alt={design.title}
                          className="size-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none"
                          }}
                        />
                      </div>
                    </TableCell>

                    {/* Title & Subtitle */}
                    <TableCell>
                      <div className="font-semibold text-sm leading-tight text-foreground">
                        {design.title}
                      </div>
                      {design.subtitle && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                          {design.subtitle}
                        </div>
                      )}
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Badge variant="secondary" className="text-xs font-normal">
                        {design.category || "Design"}
                      </Badge>
                    </TableCell>

                    {/* Tools */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {design.tools?.slice(0, 3).map((tool) => (
                          <span
                            key={tool}
                            className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            {tool}
                          </span>
                        ))}
                        {design.tools && design.tools.length > 3 && (
                          <span className="text-[10px] text-muted-foreground self-center">
                            +{design.tools.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Year */}
                    <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
                      {design.year || "—"}
                    </TableCell>

                    {/* Featured Toggle */}
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(design)}
                        className={`size-7 inline-flex items-center justify-center rounded-md transition-colors ${
                          isFeatured
                            ? "text-amber-500 hover:bg-amber-500/10"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                        title={
                          isFeatured
                            ? "Featured on Homepage"
                            : "Click to set as featured"
                        }
                      >
                        {isFeatured ? (
                          <IconStarFilled className="size-4" />
                        ) : (
                          <IconStar className="size-4" />
                        )}
                      </button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-8 p-0"
                          >
                            <IconDotsVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {design.behanceUrl && (
                            <DropdownMenuItem
                              onClick={() => window.open(design.behanceUrl, "_blank")}
                            >
                              <IconExternalLink className="size-4 mr-2" />
                              View Behance
                            </DropdownMenuItem>
                          )}
                          {design.dribbbleUrl && (
                            <DropdownMenuItem
                              onClick={() => window.open(design.dribbbleUrl, "_blank")}
                            >
                              <IconExternalLink className="size-4 mr-2" />
                              View Dribbble
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onEdit(design)}>
                            <IconEdit className="size-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(design)}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <IconTrash className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
