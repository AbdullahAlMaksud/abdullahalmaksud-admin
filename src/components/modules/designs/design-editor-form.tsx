"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Design } from "@/lib/api/types"
import { createDesign, updateDesign } from "@/lib/api/designs"
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
import { IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

export const DESIGN_CATEGORIES = [
  "Brand Identity",
  "UI/UX Design",
  "Packaging Design",
  "Typography & Poster",
  "Editorial & Book Cover",
  "Illustration & 3D",
  "Social Media & Marketing",
]

export interface DesignEditorFormProps {
  design?: Design | null
  mode?: "create" | "edit"
  variant?: "page" | "embedded"
  onCancel?: () => void
  onSuccess?: (design: Design) => void
}

export function DesignEditorForm({
  design,
  mode,
  variant = "page",
  onCancel,
  onSuccess,
}: DesignEditorFormProps) {
  const router = useRouter()
  const isEditing = mode ? mode === "edit" : !!design

  const [title, setTitle] = useState(design?.title || "")
  const [subtitle, setSubtitle] = useState(design?.subtitle || "")
  const [description, setDescription] = useState(design?.description || "")
  const [coverImage, setCoverImage] = useState(design?.coverImage || "")
  const [toolsString, setToolsString] = useState(
    design?.tools?.join(", ") || "Figma, Illustrator, Photoshop"
  )
  const [year, setYear] = useState(
    design?.year ? design.year.toString() : new Date().getFullYear().toString()
  )
  const [category, setCategory] = useState(design?.category || "Brand Identity")
  const [isFeatured, setIsFeatured] = useState(!!(design?.isFeatured ?? design?.featured))
  const [behanceUrl, setBehanceUrl] = useState(design?.behanceUrl || "")
  const [dribbbleUrl, setDribbbleUrl] = useState(design?.dribbbleUrl || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push("/dashboard/designs")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Design title is required")
      return
    }
    if (!coverImage.trim()) {
      toast.error("Cover image is required")
      return
    }

    const tools = toolsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      coverImage: coverImage.trim(),
      tools,
      year: parseInt(year) || new Date().getFullYear(),
      category: category.trim(),
      isFeatured,
      featured: isFeatured,
      behanceUrl: behanceUrl.trim() || undefined,
      dribbbleUrl: dribbbleUrl.trim() || undefined,
    }

    try {
      setIsSubmitting(true)
      const targetId = design?.id || design?._id
      if (isEditing && targetId) {
        const res = await updateDesign(targetId, payload)
        toast.success("Graphic design item updated successfully!")
        if (res.data) onSuccess?.(res.data)
      } else {
        const res = await createDesign(payload)
        toast.success("New graphic design item created successfully!")
        if (res.data) onSuccess?.(res.data)
      }
      if (variant === "page") {
        router.push("/dashboard/designs")
        router.refresh()
      } else {
        onCancel?.()
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to save design"
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formId = "design-editor-form"

  const formFields = (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label htmlFor="design-title" className="text-xs font-semibold">
            Project / Design Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="design-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. BYOU Minimal Identity"
            className="h-8.5 text-xs"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="design-subtitle" className="text-xs font-semibold">
            Subtitle / Tagline
          </Label>
          <Input
            id="design-subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. Brand & Packaging System"
            className="h-8.5 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full h-8.5 text-xs">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {DESIGN_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="design-year" className="text-xs font-semibold">
            Creation Year
          </Label>
          <Input
            id="design-year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2025"
            className="h-8.5 text-xs"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="design-desc" className="text-xs font-semibold">
          Description
        </Label>
        <textarea
          id="design-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the design aesthetic, philosophy, and client goals..."
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <ImageUpload
        label="Design Showcase / Cover Image"
        value={coverImage}
        onChange={setCoverImage}
        placeholder="/images/design/byou.webp"
        module="design"
        folderKey={
          design?.id ||
          (title
            ? title
                .toLowerCase()
                .replace(/[^a-z0-9_-]/g, "-")
                .replace(/-{2,}/g, "-")
                .replace(/^-|-$/g, "")
            : "draft")
        }
      />

      <div className="space-y-1">
        <Label htmlFor="design-tools" className="text-xs font-semibold">
          Tools Used (comma-separated)
        </Label>
        <Input
          id="design-tools"
          value={toolsString}
          onChange={(e) => setToolsString(e.target.value)}
          placeholder="Figma, Illustrator, Photoshop, Blender"
          className="h-8.5 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label htmlFor="behance-link" className="text-xs font-semibold">
            Behance Showcase URL
          </Label>
          <Input
            id="behance-link"
            type="url"
            value={behanceUrl}
            onChange={(e) => setBehanceUrl(e.target.value)}
            placeholder="https://behance.net/gallery/..."
            className="h-8.5 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="dribbble-link" className="text-xs font-semibold">
            Dribbble Shot URL
          </Label>
          <Input
            id="dribbble-link"
            type="url"
            value={dribbbleUrl}
            onChange={(e) => setDribbbleUrl(e.target.value)}
            placeholder="https://dribbble.com/shots/..."
            className="h-8.5 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 rounded-lg border p-2.5 bg-muted/20">
        <Checkbox
          id="design-featured"
          checked={isFeatured}
          onCheckedChange={(checked) => setIsFeatured(!!checked)}
        />
        <div className="grid gap-0.5 leading-none">
          <Label htmlFor="design-featured" className="text-xs font-semibold cursor-pointer">
            Featured Design Item
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Highlight this design on the portfolio home graphic design section.
          </p>
        </div>
      </div>

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
            {isEditing ? "Save Changes" : "Create Item"}
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
        backHref="/dashboard/designs"
        backLabel="Back to Designs"
        description={
          isEditing
            ? "Update visual showcase, branding assets, tools, and links."
            : "Upload and showcase creative branding, posters, UI/UX, or packaging design."
        }
      />

      <div className="flex-1 min-w-0 p-4 lg:p-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold">Design Showcase Details</CardTitle>
            <CardDescription className="text-xs">
              Images upload cleanly under <code className="font-mono">images/design/</code>.
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
              {isEditing ? "Save Changes" : "Create Item"}
            </Button>
          </>
        }
      />
    </div>
  )
}
