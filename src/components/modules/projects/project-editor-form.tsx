"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Project, CoreFeature } from "@/lib/api/types"
import { createProject, updateProject } from "@/lib/api/projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
import { PageSubHeader, StickyActionFooter } from "@/components/dashboard-01/components/sticky-action-bar"
import {
  IconLoader2,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"

export interface ProjectEditorFormProps {
  project?: Project | null
  mode?: "create" | "edit"
  variant?: "page" | "embedded"
  onCancel?: () => void
  onSuccess?: (project: Project) => void
}

export function ProjectEditorForm({
  project,
  mode,
  variant = "page",
  onCancel,
  onSuccess,
}: ProjectEditorFormProps) {
  const router = useRouter()
  const isEditing = mode ? mode === "edit" : !!project

  const [title, setTitle] = useState(project?.title || "")
  const [slug, setSlug] = useState(project?.slug || "")
  const [description, setDescription] = useState(project?.description || "")
  const [coverImage, setCoverImage] = useState(project?.coverImage || project?.image || "")
  const [logo, setLogo] = useState(project?.logo || "")
  const [stackString, setStackString] = useState(
    project ? project.stack?.join(", ") || "" : "React, TypeScript, Tailwind CSS, Next.js"
  )
  const [gitRepo, setGitRepo] = useState(
    project ? project.gitRepo || project.repo || "" : "https://github.com/abdullahalmaksud/"
  )
  const [liveLink, setLiveLink] = useState(
    project ? project.liveLink || project.demo || "" : "https://"
  )
  const [categoriesString, setCategoriesString] = useState(
    project ? project.categories?.join(", ") || project.category || "" : "web, saas, tool"
  )
  const [tag, setTag] = useState(project?.tag || (isEditing ? "" : "Full-stack Application"))
  const [status, setStatus] = useState<Project["status"]>(project?.status || "live")
  const [isFeatured, setIsFeatured] = useState(!!(project?.isFeatured ?? project?.featured))
  const [coreFeatures, setCoreFeatures] = useState<CoreFeature[]>(
    project?.coreFeatures && project.coreFeatures.length > 0
      ? project.coreFeatures
      : [{ icon: "zap", text: isEditing ? "" : "Fast Performance", desc: isEditing ? "" : "Optimized response time" }]
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (
      !isEditing &&
      (!slug ||
        slug ===
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""))
    ) {
      setSlug(
        newTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      )
    }
  }

  const handleAddFeature = () => {
    setCoreFeatures([...coreFeatures, { icon: "sparkles", text: "", desc: "" }])
  }

  const handleRemoveFeature = (index: number) => {
    setCoreFeatures(coreFeatures.filter((_, i) => i !== index))
  }

  const handleFeatureChange = (index: number, field: keyof CoreFeature, value: string) => {
    const updated = [...coreFeatures]
    updated[index] = { ...updated[index], [field]: value }
    setCoreFeatures(updated)
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push("/dashboard/projects")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Project title is required")
      return
    }
    if (!slug.trim()) {
      toast.error("Project slug is required")
      return
    }

    const stack = stackString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const categories = categoriesString
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)

    const filteredFeatures = coreFeatures.filter((f) => f.text.trim() && f.desc.trim())

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      coverImage: coverImage.trim(),
      image: coverImage.trim(),
      logo: logo.trim(),
      stack,
      gitRepo: gitRepo.trim(),
      repo: gitRepo.trim(),
      liveLink: liveLink.trim(),
      demo: liveLink.trim(),
      categories,
      category: categories[0] || "",
      tag: tag.trim(),
      status,
      isFeatured,
      featured: isFeatured,
      coreFeatures: filteredFeatures,
    }

    try {
      setIsSubmitting(true)
      const targetId = project?.id || project?._id
      if (isEditing && targetId) {
        const res = await updateProject(targetId, payload)
        toast.success("Project updated successfully!")
        if (res.data) onSuccess?.(res.data)
      } else {
        const res = await createProject(payload)
        toast.success("Project created successfully!")
        if (res.data) onSuccess?.(res.data)
      }
      if (variant === "page") {
        router.push("/dashboard/projects")
        router.refresh()
      } else {
        onCancel?.()
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to save project"
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formId = "project-editor-form"

  const formFields = (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label htmlFor="title" className="text-xs font-semibold">
            Project Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={handleTitleChange}
            placeholder="e.g. Bonton Settlement Tool"
            className="h-8.5 text-xs"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug" className="text-xs font-semibold">
            Slug (URL Identifier) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. bonton"
            className="h-8.5 text-xs"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label htmlFor="desc" className="text-xs font-semibold">
          Description / Summary
        </Label>
        <textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief overview of the project, features, and problems it solves..."
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Image Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <ImageUpload
          label="Cover / Showcase Image"
          value={coverImage}
          onChange={setCoverImage}
          placeholder="/images/project/app.png"
          module="project"
          folderKey={slug || "draft"}
        />
        <ImageUpload
          label="Project Logo"
          value={logo}
          onChange={setLogo}
          placeholder="/images/project/logo/app.png"
          module="project"
          folderKey={slug || "draft"}
        />
      </div>

      {/* Stack & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label htmlFor="stack" className="text-xs font-semibold">
            Tech Stack (comma separated)
          </Label>
          <Input
            id="stack"
            value={stackString}
            onChange={(e) => setStackString(e.target.value)}
            placeholder="React, TypeScript, Zustand, Tailwind"
            className="h-8.5 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="categories" className="text-xs font-semibold">
            Categories (comma separated)
          </Label>
          <Input
            id="categories"
            value={categoriesString}
            onChange={(e) => setCategoriesString(e.target.value)}
            placeholder="saas, finance, tool"
            className="h-8.5 text-xs"
          />
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label htmlFor="liveLink" className="text-xs font-semibold">
            Live URL / Demo Link
          </Label>
          <Input
            id="liveLink"
            type="url"
            value={liveLink}
            onChange={(e) => setLiveLink(e.target.value)}
            placeholder="https://app.abdullahalmaksud.com"
            className="h-8.5 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="gitRepo" className="text-xs font-semibold">
            GitHub Repository
          </Label>
          <Input
            id="gitRepo"
            type="url"
            value={gitRepo}
            onChange={(e) => setGitRepo(e.target.value)}
            placeholder="https://github.com/abdullahmaksud/app"
            className="h-8.5 text-xs"
          />
        </div>
      </div>

      {/* Status & Tag */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Project Status</Label>
          <Select value={status} onValueChange={(val: Project["status"]) => setStatus(val)}>
            <SelectTrigger className="w-full h-8.5 text-xs">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="live">Live & Deployed</SelectItem>
              <SelectItem value="case-study">Case Study</SelectItem>
              <SelectItem value="prototype">Prototype</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="tag" className="text-xs font-semibold">
            Tagline / Badge Text
          </Label>
          <Input
            id="tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Local-first settlement tool"
            className="h-8.5 text-xs"
          />
        </div>
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center space-x-2 rounded-lg border p-2.5 bg-muted/20">
        <Checkbox
          id="featured"
          checked={isFeatured}
          onCheckedChange={(checked) => setIsFeatured(!!checked)}
        />
        <div className="grid gap-0.5 leading-none">
          <Label htmlFor="featured" className="text-xs font-semibold cursor-pointer">
            Featured Project
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Highlight this project prominently on the home hero section.
          </p>
        </div>
      </div>

      {/* Core Features */}
      <div className="space-y-2 border-t pt-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Core Highlights / Features
          </Label>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleAddFeature}
            className="gap-1"
          >
            <IconPlus className="size-3.5" /> Add Feature
          </Button>
        </div>

        <div className="space-y-2">
          {coreFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 rounded-lg border bg-background/50 p-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                <Input
                  value={feat.icon}
                  onChange={(e) => handleFeatureChange(idx, "icon", e.target.value)}
                  placeholder="Icon (e.g. zap, users)"
                  className="text-xs h-8"
                />
                <Input
                  value={feat.text}
                  onChange={(e) => handleFeatureChange(idx, "text", e.target.value)}
                  placeholder="Feature Title"
                  className="text-xs h-8"
                />
                <Input
                  value={feat.desc}
                  onChange={(e) => handleFeatureChange(idx, "desc", e.target.value)}
                  placeholder="Short description"
                  className="text-xs h-8"
                />
              </div>
              {coreFeatures.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveFeature(idx)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <IconTrash className="size-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions (embedded dialog only; full page uses sticky bar) */}
      {variant === "embedded" && (
        <div className="flex items-center justify-end gap-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
            {isSubmitting && <IconLoader2 className="size-3.5 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      )}
    </form>
  )

  if (variant === "embedded") {
    return formFields
  }

  return (
    <div className="flex flex-1 min-w-0 flex-col w-full">
      <PageSubHeader
        backHref="/dashboard/projects"
        backLabel="Back to Projects"
        description={
          isEditing
            ? "Update project details, features, tech stack, and demo links."
            : "Create a new project entry to showcase on your portfolio website."
        }
      />

      <div className="flex-1 min-w-0 p-4 lg:p-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold">Project Details</CardTitle>
            <CardDescription className="text-xs">
              All images upload cleanly into GitHub assets under <code className="font-mono">images/project/[slug]/</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>{formFields}</CardContent>
        </Card>
      </div>

      <StickyActionFooter
        right={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs gap-1.5 font-medium"
            >
              {isSubmitting && <IconLoader2 className="size-3.5 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Project"}
            </Button>
          </>
        }
      />
    </div>
  )
}
