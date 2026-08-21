"use client"

import React, { useState } from "react"
import { Design } from "@/lib/api/types"
import { createDesign, updateDesign } from "@/lib/api/designs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
import { IconPalette, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

interface DesignFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  design?: Design | null
  onSuccess: (design: Design) => void
}

const DESIGN_CATEGORIES = [
  "Brand Identity",
  "UI/UX Design",
  "Packaging Design",
  "Typography & Poster",
  "Editorial & Book Cover",
  "Illustration & 3D",
  "Social Media & Marketing",
]

function DesignFormInner({
  design,
  onClose,
  onSuccess,
}: {
  design?: Design | null
  onClose: () => void
  onSuccess: (design: Design) => void
}) {
  const isEditing = !!design

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
        if (res.data) onSuccess(res.data)
      } else {
        const res = await createDesign(payload)
        toast.success("New graphic design item created successfully!")
        if (res.data) onSuccess(res.data)
      }
      onClose()
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to save design"
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* Title & Subtitle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="design-title" className="text-xs font-semibold">
            Project / Design Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="design-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. BYOU Minimal Identity"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="design-subtitle" className="text-xs font-semibold">
            Subtitle / Tagline
          </Label>
          <Input
            id="design-subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. Brand & Packaging System"
          />
        </div>
      </div>

      {/* Category & Year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
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

        <div className="space-y-1.5">
          <Label htmlFor="design-year" className="text-xs font-semibold">
            Creation Year
          </Label>
          <Input
            id="design-year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2025"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="design-desc" className="text-xs font-semibold">
          Description
        </Label>
        <textarea
          id="design-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the design aesthetic, philosophy, and client goals..."
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Cover Image Upload */}
      <ImageUpload
        label="Design Showcase / Cover Image"
        value={coverImage}
        onChange={setCoverImage}
        placeholder="/images/designs/byou.webp"
      />

      {/* Tools */}
      <div className="space-y-1.5">
        <Label htmlFor="design-tools" className="text-xs font-semibold">
          Tools Used (comma-separated)
        </Label>
        <Input
          id="design-tools"
          value={toolsString}
          onChange={(e) => setToolsString(e.target.value)}
          placeholder="Figma, Illustrator, Photoshop, Blender"
        />
      </div>

      {/* External Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="behance-link" className="text-xs font-semibold">
            Behance Showcase URL
          </Label>
          <Input
            id="behance-link"
            type="url"
            value={behanceUrl}
            onChange={(e) => setBehanceUrl(e.target.value)}
            placeholder="https://behance.net/gallery/..."
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dribbble-link" className="text-xs font-semibold">
            Dribbble Shot URL
          </Label>
          <Input
            id="dribbble-link"
            type="url"
            value={dribbbleUrl}
            onChange={(e) => setDribbbleUrl(e.target.value)}
            placeholder="https://dribbble.com/shots/..."
          />
        </div>
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center space-x-2 rounded-lg border p-3 bg-muted/20">
        <Checkbox
          id="design-featured"
          checked={isFeatured}
          onCheckedChange={(checked) => setIsFeatured(!!checked)}
        />
        <div className="grid gap-0.5 leading-none">
          <Label
            htmlFor="design-featured"
            className="text-xs font-semibold cursor-pointer"
          >
            Featured Design Item
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Highlight this design on the portfolio home graphic design section.
          </p>
        </div>
      </div>

      <DialogFooter className="border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting && <IconLoader2 className="size-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Item"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function DesignFormDialog({
  open,
  onOpenChange,
  design,
  onSuccess,
}: DesignFormDialogProps) {
  const isEditing = !!design
  const dialogKey = open ? (design ? (design.id || design._id || "edit") : "new") : "closed"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <IconPalette className="size-5 text-primary" />
            {isEditing ? "Edit Graphic Design Item" : "Add New Graphic Design"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update visual showcase, branding assets, tools, and links."
              : "Upload and showcase your creative branding, posters, UI/UX, or packaging design."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <DesignFormInner
            key={dialogKey}
            design={design}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
