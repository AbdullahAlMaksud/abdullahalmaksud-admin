"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { getProjects, updateProject } from "@/lib/api/projects"
import { getCaseStudies, updateCaseStudy } from "@/lib/api/case-studies"
import { getBlogs, updateBlog } from "@/lib/api/blogs"
import { getAllBooks, updateBook } from "@/lib/api/books"
import { getDesigns, updateDesign } from "@/lib/api/designs"
import { resolveAssetUrl } from "@/lib/asset-url"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageSubHeader, StickyActionFooter } from "@/components/dashboard-01/components/sticky-action-bar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  IconCategory,
  IconEdit,
  IconExternalLink,
  IconLoader2,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTags,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"

export type TaxonomyModule = "project" | "case-study" | "blog" | "book" | "design"
export type TaxonomyKind = "categories" | "tags"

interface NormalizedItem {
  id: string
  title: string
  subtitle: string
  coverImage?: string
  categories: string[]
  tags: string[]
  editUrl: string
  rawCategories?: string[]
  rawCategory?: string
  rawTags?: string[]
  rawStack?: string[]
  rawTag?: string
  rawTools?: string[]
}

interface ModuleConfig {
  label: string
  singularLabel: string
  listHref: string
  createHref: string
  categoriesHref?: string
  tagsHref?: string
  categoryFieldLabel: string
  tagFieldLabel: string
}

const MODULE_CONFIGS: Record<TaxonomyModule, ModuleConfig> = {
  project: {
    label: "Projects",
    singularLabel: "Project",
    listHref: "/dashboard/projects",
    createHref: "/dashboard/projects/create",
    categoriesHref: "/dashboard/projects/categories",
    tagsHref: "/dashboard/projects/tags",
    categoryFieldLabel: "Project Categories",
    tagFieldLabel: "Tech Stack & Tagline",
  },
  "case-study": {
    label: "Case Studies",
    singularLabel: "Case Study",
    listHref: "/dashboard/case-studies",
    createHref: "/dashboard/case-studies/create",
    categoriesHref: "/dashboard/case-studies/categories",
    tagsHref: "/dashboard/case-studies/tags",
    categoryFieldLabel: "Case Study Categories",
    tagFieldLabel: "Architecture Tags & Stack",
  },
  blog: {
    label: "Blog Articles",
    singularLabel: "Article",
    listHref: "/dashboard/blogs",
    createHref: "/dashboard/blogs/create",
    categoriesHref: "/dashboard/blogs/categories",
    tagsHref: "/dashboard/blogs/tags",
    categoryFieldLabel: "Article Categories",
    tagFieldLabel: "Article Tags",
  },
  book: {
    label: "Books",
    singularLabel: "Book",
    listHref: "/dashboard/books",
    createHref: "/dashboard/books/create",
    categoriesHref: "/dashboard/books/tags",
    tagsHref: "/dashboard/books/tags",
    categoryFieldLabel: "Genres / Categories",
    tagFieldLabel: "Book Tags",
  },
  design: {
    label: "Graphic Designs",
    singularLabel: "Design",
    listHref: "/dashboard/designs",
    createHref: "/dashboard/designs/create",
    categoriesHref: "/dashboard/designs/categories",
    categoryFieldLabel: "Design Categories",
    tagFieldLabel: "Design Tools",
  },
}

interface TaxonomyBucket {
  name: string
  items: NormalizedItem[]
}

export function TaxonomyManager({
  module,
  defaultTab = "tags",
}: {
  module: TaxonomyModule
  defaultTab?: TaxonomyKind
}) {
  const cfg = MODULE_CONFIGS[module]
  const [activeKind, setActiveKind] = useState<TaxonomyKind>(defaultTab)
  const [items, setItems] = useState<NormalizedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)

  const [renameTarget, setRenameTarget] = useState<{ oldName: string; newName: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isMutating, setIsMutating] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const normalized: NormalizedItem[] = []

      if (module === "project") {
        const list = await getProjects()
        for (const p of list) {
          const id = p.id || p._id || ""
          const cats = Array.from(
            new Set([...(p.categories || []), ...(p.category ? [p.category] : [])].map((v) => v.trim()).filter(Boolean))
          )
          const tgs = Array.from(
            new Set([...(p.stack || []), ...(p.tag ? [p.tag] : [])].map((v) => v.trim()).filter(Boolean))
          )
          normalized.push({
            id,
            title: p.title,
            subtitle: `/${p.slug}`,
            coverImage: p.coverImage || p.image || p.logo,
            categories: cats,
            tags: tgs,
            editUrl: `/dashboard/projects/${id}/edit`,
            rawCategories: p.categories || [],
            rawCategory: p.category || "",
            rawStack: p.stack || [],
            rawTag: p.tag || "",
          })
        }
      } else if (module === "case-study") {
        const res = await getCaseStudies({ limit: 200 })
        for (const cs of res.data || []) {
          const id = cs.id || cs._id || ""
          const cats = cs.category ? [cs.category.trim()].filter(Boolean) : []
          const tgs = Array.from(
            new Set([...(cs.tags || []), ...(cs.stack || [])].map((v) => v.trim()).filter(Boolean))
          )
          normalized.push({
            id,
            title: cs.title,
            subtitle: cs.client || `/${cs.slug}`,
            coverImage: cs.coverImage,
            categories: cats,
            tags: tgs,
            editUrl: `/dashboard/case-studies/${id}/edit`,
            rawCategory: cs.category || "",
            rawTags: cs.tags || [],
            rawStack: cs.stack || [],
          })
        }
      } else if (module === "blog") {
        const res = await getBlogs({ limit: 200 })
        for (const b of res.data || []) {
          const id = b.id || b._id || ""
          const cats = b.category ? [b.category.trim()].filter(Boolean) : []
          const tgs = (b.tags || []).map((t) => t.trim()).filter(Boolean)
          normalized.push({
            id,
            title: b.title,
            subtitle: `/${b.slug}`,
            coverImage: b.coverImage || b.cover,
            categories: cats,
            tags: tgs,
            editUrl: `/dashboard/blogs/${id}/edit`,
            rawCategory: b.category || "",
            rawTags: b.tags || [],
          })
        }
      } else if (module === "book") {
        const list = await getAllBooks()
        for (const bk of list) {
          const id = bk.id || bk._id || ""
          const cats = Array.from(
            new Set([bk.genre, bk.category].map((v) => v?.trim() || "").filter(Boolean))
          )
          const tgs = (bk.tags || []).map((t) => t.trim()).filter(Boolean)
          normalized.push({
            id,
            title: bk.title,
            subtitle: bk.author,
            coverImage: bk.coverImage,
            categories: cats,
            tags: tgs,
            editUrl: `/dashboard/books/${id}/edit`,
            rawCategory: bk.genre || bk.category || "",
            rawTags: bk.tags || [],
          })
        }
      } else if (module === "design") {
        const list = await getDesigns()
        for (const d of list) {
          const id = d.id || d._id || ""
          const cats = d.category ? [d.category.trim()].filter(Boolean) : []
          const tgs = (d.tools || []).map((t) => t.trim()).filter(Boolean)
          normalized.push({
            id,
            title: d.title,
            subtitle: d.subtitle || String(d.year || ""),
            coverImage: d.coverImage,
            categories: cats,
            tags: tgs,
            editUrl: `/dashboard/designs/${id}/edit`,
            rawCategory: d.category || "",
            rawTools: d.tools || [],
          })
        }
      }

      setItems(normalized)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load taxonomy items")
    } finally {
      setLoading(false)
    }
  }, [module])

  useEffect(() => {
    loadData()
  }, [loadData])

  const buckets = useMemo<TaxonomyBucket[]>(() => {
    const map = new Map<string, NormalizedItem[]>()
    for (const item of items) {
      const terms = activeKind === "categories" ? item.categories : item.tags
      for (const term of terms) {
        if (!term) continue
        const existing = map.get(term)
        if (existing) {
          existing.push(item)
        } else {
          map.set(term, [item])
        }
      }
    }
    const q = searchQuery.trim().toLowerCase()
    return Array.from(map.entries())
      .map(([name, bucketItems]) => ({ name, items: bucketItems }))
      .filter((b) => !q || b.name.toLowerCase().includes(q))
      .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name))
  }, [items, activeKind, searchQuery])

  const activeBucket = useMemo(() => {
    if (selectedTerm) {
      const found = buckets.find((b) => b.name === selectedTerm)
      if (found) return found
    }
    return buckets[0] || null
  }, [buckets, selectedTerm])

  const applyTermMutation = async (oldName: string, replacementName: string | null) => {
    const affected = items.filter((item) => {
      const list = activeKind === "categories" ? item.categories : item.tags
      return list.includes(oldName)
    })
    if (affected.length === 0) return

    const trimmedNew = replacementName?.trim() || ""
    if (replacementName !== null && !trimmedNew) {
      toast.error("New name cannot be empty")
      return
    }

    setIsMutating(true)
    try {
      for (const item of affected) {
        if (module === "project") {
          if (activeKind === "categories") {
            const nextCats = Array.from(
              new Set(
                (item.rawCategories || [])
                  .map((c) => (c.trim() === oldName ? trimmedNew : c.trim()))
                  .filter(Boolean)
              )
            )
            await updateProject(item.id, {
              categories: nextCats,
              category: nextCats[0] || "",
            })
          } else {
            const nextStack = Array.from(
              new Set(
                (item.rawStack || [])
                  .map((t) => (t.trim() === oldName ? trimmedNew : t.trim()))
                  .filter(Boolean)
              )
            )
            const nextTag = item.rawTag?.trim() === oldName ? trimmedNew : item.rawTag || ""
            await updateProject(item.id, { stack: nextStack, tag: nextTag })
          }
        } else if (module === "case-study") {
          if (activeKind === "categories") {
            await updateCaseStudy(item.id, {
              category: trimmedNew || "General",
            })
          } else {
            const nextTags = Array.from(
              new Set(
                (item.rawTags || [])
                  .map((t) => (t.trim() === oldName ? trimmedNew : t.trim()))
                  .filter(Boolean)
              )
            )
            const nextStack = Array.from(
              new Set(
                (item.rawStack || [])
                  .map((t) => (t.trim() === oldName ? trimmedNew : t.trim()))
                  .filter(Boolean)
              )
            )
            await updateCaseStudy(item.id, { tags: nextTags, stack: nextStack })
          }
        } else if (module === "blog") {
          if (activeKind === "categories") {
            await updateBlog(item.id, {
              category: trimmedNew || "Uncategorized",
            })
          } else {
            const nextTags = Array.from(
              new Set(
                (item.rawTags || [])
                  .map((t) => (t.trim() === oldName ? trimmedNew : t.trim()))
                  .filter(Boolean)
              )
            )
            await updateBlog(item.id, { tags: nextTags })
          }
        } else if (module === "book") {
          if (activeKind === "categories") {
            await updateBook(item.id, {
              genre: trimmedNew || "General",
              category: trimmedNew || "General",
            })
          } else {
            const nextTags = Array.from(
              new Set(
                (item.rawTags || [])
                  .map((t) => (t.trim() === oldName ? trimmedNew : t.trim()))
                  .filter(Boolean)
              )
            )
            await updateBook(item.id, { tags: nextTags })
          }
        } else if (module === "design") {
          if (activeKind === "categories") {
            await updateDesign(item.id, {
              category: trimmedNew || "Brand Identity",
            })
          } else {
            const nextTools = Array.from(
              new Set(
                (item.rawTools || [])
                  .map((t) => (t.trim() === oldName ? trimmedNew : t.trim()))
                  .filter(Boolean)
              )
            )
            await updateDesign(item.id, { tools: nextTools })
          }
        }
      }

      toast.success(
        replacementName !== null
          ? `Renamed "${oldName}" to "${trimmedNew}" across ${affected.length} item(s).`
          : `Removed "${oldName}" from ${affected.length} item(s).`
      )
      setSelectedTerm(replacementName !== null ? trimmedNew : null)
      setRenameTarget(null)
      setDeleteTarget(null)
      await loadData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update items")
    } finally {
      setIsMutating(false)
    }
  }

  return (
    <div className="flex flex-1 min-w-0 flex-col w-full">
      <PageSubHeader
        backHref={cfg.listHref}
        backLabel={`Back to ${cfg.label}`}
        description={`Inspect, rename, or jump directly to ${cfg.label.toLowerCase()} grouped by ${activeKind === "categories" ? "category" : "tag"}.`}
      />

      <div className="flex-1 min-w-0 p-4 lg:p-6 space-y-6">
        {/* Search & Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeKind}...`}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-[11px] font-medium">
            {buckets.length} unique {activeKind}
          </Badge>
          <Badge variant="outline" className="text-[11px] font-medium">
            {items.length} total {cfg.label.toLowerCase()}
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 border rounded-xl bg-card text-muted-foreground text-xs gap-2">
          <IconLoader2 className="size-4 animate-spin" />
          Loading {cfg.label.toLowerCase()} taxonomy...
        </div>
      ) : buckets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 border rounded-xl bg-card text-muted-foreground gap-2 p-6 text-center">
          <IconTags className="size-8 opacity-40" />
          <p className="text-sm font-medium">No {activeKind} found yet</p>
          <p className="text-xs max-w-md">
            Create or edit {cfg.label.toLowerCase()} to assign categories and tags.
          </p>
          <Button size="sm" asChild className="mt-1 h-8 text-xs gap-1.5">
            <Link href={cfg.createHref}>
              <IconPlus className="size-3.5" /> Add {cfg.singularLabel}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Term list */}
          <Card className="lg:col-span-5">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold">
                {activeKind === "categories" ? "All Categories" : "All Tags"} ({buckets.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Click a term to view matching items or rename it everywhere.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 space-y-1 max-h-[540px] overflow-y-auto">
              {buckets.map((bucket) => {
                const isSelected = activeBucket?.name === bucket.name
                return (
                  <div
                    key={bucket.name}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedTerm(bucket.name)}
                      className="flex flex-1 items-center justify-between min-w-0 text-left gap-2 py-0.5 cursor-pointer"
                    >
                      <span className="truncate">{bucket.name}</span>
                      <Badge
                        variant={isSelected ? "secondary" : "outline"}
                        className="text-[10px] h-5 px-1.5 shrink-0"
                      >
                        {bucket.items.length}
                      </Badge>
                    </button>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setRenameTarget({ oldName: bucket.name, newName: bucket.name })}
                        title={`Rename "${bucket.name}"`}
                        className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${
                          isSelected ? "text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        <IconEdit className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(bucket.name)}
                        title={`Remove "${bucket.name}" from items`}
                        className={`p-1 rounded hover:bg-destructive/15 ${
                          isSelected ? "text-primary-foreground" : "text-muted-foreground hover:text-destructive"
                        }`}
                      >
                        <IconTrash className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Right: Matching items */}
          <Card className="lg:col-span-7">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    {activeBucket ? `"${activeBucket.name}"` : "Select a term"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {activeBucket
                      ? `${activeBucket.items.length} ${cfg.label.toLowerCase()} linked to this ${activeKind === "categories" ? "category" : "tag"}`
                      : "Choose a tag or category on the left"}
                  </CardDescription>
                </div>
                {activeBucket && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setRenameTarget({ oldName: activeBucket.name, newName: activeBucket.name })}
                    className="gap-1"
                  >
                    <IconEdit className="size-3" />
                    Rename
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="divide-y">
              {activeBucket?.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.coverImage ? (
                      <div className="size-9 rounded-md border bg-muted overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveAssetUrl(item.coverImage)}
                          alt=""
                          className="size-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = "none"
                          }}
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  <Button variant="outline" size="xs" asChild className="gap-1 shrink-0">
                    <Link href={item.editUrl}>
                      <IconPencil className="size-3" />
                      Edit
                      <IconExternalLink className="size-3 opacity-60" />
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
            </Card>
          </div>
        )}
      </div>

      <StickyActionFooter
        left={
          <div className="inline-flex items-center rounded-lg border bg-muted/40 p-0.5">
            {cfg.categoriesHref && (
              <Button
                type="button"
                variant={activeKind === "categories" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setActiveKind("categories")
                  setSelectedTerm(null)
                }}
                className="h-7 gap-1.5 text-xs"
              >
                <IconCategory className="size-3.5" />
                Categories
              </Button>
            )}
            <Button
              type="button"
              variant={activeKind === "tags" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveKind("tags")
                setSelectedTerm(null)
              }}
              className="h-7 gap-1.5 text-xs"
            >
              <IconTags className="size-3.5" />
              {module === "design" ? "Tools" : "Tags"}
            </Button>
          </div>
        }
        right={
          <>
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-1.5 h-8 text-xs">
              <IconRefresh className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" asChild className="gap-1.5 h-8 text-xs font-medium">
              <Link href={cfg.createHref}>
                <IconPlus className="size-3.5" />
                Add {cfg.singularLabel}
              </Link>
            </Button>
          </>
        }
      />

      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              Rename {activeKind === "categories" ? "Category" : "Tag"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Updates &ldquo;{renameTarget?.oldName}&rdquo; across every matching {cfg.singularLabel.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Input
              value={renameTarget?.newName || ""}
              onChange={(e) =>
                setRenameTarget((prev) => (prev ? { ...prev, newName: e.target.value } : null))
              }
              placeholder="New name"
              className="h-9 text-xs"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRenameTarget(null)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isMutating || !renameTarget?.newName.trim()}
              onClick={() => renameTarget && applyTermMutation(renameTarget.oldName, renameTarget.newName)}
              className="gap-1.5"
            >
              {isMutating && <IconLoader2 className="size-3.5 animate-spin" />}
              Apply Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              Remove {activeKind === "categories" ? "Category" : "Tag"}?
            </DialogTitle>
            <DialogDescription className="text-xs">
              This will strip &ldquo;{deleteTarget}&rdquo; from all {cfg.label.toLowerCase()} without deleting any items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isMutating}
              onClick={() => deleteTarget && applyTermMutation(deleteTarget, null)}
              className="gap-1.5"
            >
              {isMutating && <IconLoader2 className="size-3.5 animate-spin" />}
              Remove Term
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
