"use client"

import React, { useState } from "react"
import { Blog } from "@/lib/api/types"
import { updateBlog } from "@/lib/api/blogs"
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
  IconArticle,
  IconPlus,
} from "@tabler/icons-react"
import { toast } from "sonner"

interface BlogsTableProps {
  blogs: Blog[]
  loading?: boolean
  onEdit: (blog: Blog) => void
  onDelete: (blog: Blog) => void
  onAdd: () => void
  onUpdateSuccess: (updated: Blog) => void
}

export function BlogsTable({
  blogs,
  loading = false,
  onEdit,
  onDelete,
  onAdd,
  onUpdateSuccess,
}: BlogsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredBlogs = blogs.filter((blog) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      blog.title.toLowerCase().includes(query) ||
      blog.slug.toLowerCase().includes(query) ||
      blog.category?.toLowerCase().includes(query) ||
      blog.tags?.some((t) => t.toLowerCase().includes(query))

    const isPub = blog.isPublished ?? blog.published
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && isPub) ||
      (statusFilter === "draft" && !isPub)

    return matchesSearch && matchesStatus
  })

  const handleTogglePublish = async (blog: Blog) => {
    const targetId = blog.id || blog._id
    if (!targetId) return

    const currentPub = !!(blog.isPublished ?? blog.published)
    const newPub = !currentPub

    try {
      const res = await updateBlog(targetId, {
        isPublished: newPub,
        published: newPub,
      })
      toast.success(
        `Article ${newPub ? "published" : "moved to draft"}!`
      )
      if (res.data) onUpdateSuccess(res.data)
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to update publish state"
      toast.error(errMsg)
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-xl border">
        <div className="flex flex-1 items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search articles by title, tags, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Articles</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onAdd} size="sm" className="gap-1.5 h-9 text-xs w-full sm:w-auto font-medium">
          <IconPlus className="size-4" /> New Article
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="min-w-[260px]">Article</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="h-16 text-center text-muted-foreground animate-pulse">
                    Loading articles data...
                  </TableCell>
                </TableRow>
              ))
            ) : filteredBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <IconArticle className="size-8 opacity-40" />
                    <p className="text-sm font-medium">No blog posts found</p>
                    <p className="text-xs text-muted-foreground/70">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : "Click 'New Article' to create your first tech post."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBlogs.map((blog) => (
                <TableRow key={blog.id} className="hover:bg-muted/30 transition-colors">
                  {/* Article Title & Cover */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {blog.coverImage && (
                        <div className="size-10 rounded-lg bg-muted border overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={blog.coverImage}
                            alt=""
                            className="size-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none"
                            }}
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-foreground truncate block">
                          {blog.title}
                        </span>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          /{blog.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs font-medium text-muted-foreground">
                      {blog.category || "General"}
                    </span>
                  </TableCell>

                  {/* Tags */}
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {blog.tags?.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-muted text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                      {blog.tags && blog.tags.length > 2 && (
                        <span className="px-1 py-0.5 text-[10px] text-muted-foreground font-mono">
                          +{blog.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Status Toggle */}
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(blog)}
                      className="cursor-pointer"
                      title="Click to toggle publish status"
                    >
                      {blog.isPublished ? (
                        <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/25">
                          ● Published
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20">
                          Draft
                        </Badge>
                      )}
                    </button>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-mono">
                    {blog.publishedAt || blog.createdAt?.split("T")[0] || "—"}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(blog)}
                        className="size-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <IconPencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(blog)}
                        className="size-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    </div>
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
