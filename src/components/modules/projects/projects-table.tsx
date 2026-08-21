"use client"

import React, { useState } from "react"
import { Project } from "@/lib/api/types"
import { updateProject } from "@/lib/api/projects"
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
  IconExternalLink,
  IconBrandGithub,
  IconBriefcase,
  IconPlus,
} from "@tabler/icons-react"
import { toast } from "sonner"

interface ProjectsTableProps {
  projects: Project[]
  loading?: boolean
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onAdd: () => void
  onUpdateSuccess: (updated: Project) => void
}

export function ProjectsTable({
  projects,
  loading = false,
  onEdit,
  onDelete,
  onAdd,
  onUpdateSuccess,
}: ProjectsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      project.title.toLowerCase().includes(query) ||
      project.slug.toLowerCase().includes(query) ||
      project.category?.toLowerCase().includes(query) ||
      project.stack?.some((s) => s.toLowerCase().includes(query))

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleToggleFeatured = async (project: Project) => {
    const targetId = project.id || project._id
    if (!targetId) return

    try {
      const res = await updateProject(targetId, {
        isFeatured: !project.isFeatured,
      })
      toast.success(
        `Project ${!project.isFeatured ? "featured" : "unfeatured"} successfully!`
      )
      if (res.data) onUpdateSuccess(res.data)
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to update featured status"
      toast.error(errMsg)
    }
  }

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30">
            ● Live
          </Badge>
        )
      case "case-study":
        return (
          <Badge className="bg-blue-500/15 text-blue-500 border-blue-500/30">
            Case Study
          </Badge>
        )
      case "prototype":
        return (
          <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30">
            Prototype
          </Badge>
        )
      case "archived":
        return (
          <Badge className="bg-muted text-muted-foreground border-border">
            Archived
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
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
              placeholder="Search projects by title, stack, slug..."
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
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="case-study">Case Study</SelectItem>
              <SelectItem value="prototype">Prototype</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onAdd} size="sm" className="gap-1.5 h-9 text-xs w-full sm:w-auto font-medium">
          <IconPlus className="size-4" /> Add Project
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="min-w-[220px]">Project</TableHead>
              <TableHead className="hidden md:table-cell">Stack</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Links</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="h-16 text-center text-muted-foreground animate-pulse">
                    Loading projects data...
                  </TableCell>
                </TableRow>
              ))
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <IconBriefcase className="size-8 opacity-40" />
                    <p className="text-sm font-medium">No projects found</p>
                    <p className="text-xs text-muted-foreground/70">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : "Click 'Add Project' to create your first portfolio entry."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id} className="hover:bg-muted/30 transition-colors">
                  {/* Featured star toggle */}
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(project)}
                      className={`p-1 rounded-md transition-colors ${
                        project.isFeatured
                          ? "text-amber-400 hover:text-amber-300"
                          : "text-muted-foreground/40 hover:text-amber-400"
                      }`}
                      title={project.isFeatured ? "Featured" : "Mark as featured"}
                    >
                      <IconStar className={`size-4 ${project.isFeatured ? "fill-amber-400" : ""}`} />
                    </button>
                  </TableCell>

                  {/* Title & info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {(project.coverImage || project.logo) && (
                        <div className="size-10 rounded-lg bg-muted border overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={project.logo || project.coverImage}
                            alt=""
                            className="size-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none"
                            }}
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-foreground truncate">
                            {project.title}
                          </span>
                          {project.isFeatured && (
                            <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/30">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          /{project.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Stack */}
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[280px]">
                      {project.stack?.slice(0, 3).map((stk, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-muted text-muted-foreground"
                        >
                          {stk}
                        </span>
                      ))}
                      {project.stack && project.stack.length > 3 && (
                        <span className="px-1 py-0.5 text-[10px] text-muted-foreground font-mono">
                          +{project.stack.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>{getStatusBadge(project.status)}</TableCell>

                  {/* Links */}
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
                          title="Live Demo"
                        >
                          <IconExternalLink className="size-4" />
                        </a>
                      )}
                      {project.gitRepo && (
                        <a
                          href={project.gitRepo}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                          title="GitHub Repo"
                        >
                          <IconBrandGithub className="size-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(project)}
                        className="size-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <IconPencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(project)}
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
