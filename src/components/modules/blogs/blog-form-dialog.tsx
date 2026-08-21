"use client"

import React, { useState } from "react"
import { Blog } from "@/lib/api/types"
import { createBlog, updateBlog } from "@/lib/api/blogs"
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
import { ImageUpload } from "@/components/ui/image-upload"
import { IconArticle, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

interface BlogFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blog?: Blog | null
  onSuccess: (blog: Blog) => void
}

function BlogFormInner({
  blog,
  onClose,
  onSuccess,
}: {
  blog?: Blog | null
  onClose: () => void
  onSuccess: (blog: Blog) => void
}) {
  const isEditing = !!blog

  const [title, setTitle] = useState(blog?.title || "")
  const [slug, setSlug] = useState(blog?.slug || "")
  const [content, setContent] = useState(
    typeof blog?.content === "string"
      ? blog.content
      : "# Post Title\n\nWrite your blog content here in Markdown format."
  )
  const [excerpt, setExcerpt] = useState(blog?.excerpt || "")
  const [coverImage, setCoverImage] = useState(blog?.coverImage || "")
  const [author, setAuthor] = useState(blog?.author || "Abdullah Al Maksud")
  const [tagsString, setTagsString] = useState(blog?.tags?.join(", ") || "nextjs, react, tutorial")
  const [category, setCategory] = useState(blog?.category || "Web Development")
  const [isPublished, setIsPublished] = useState(!!(blog?.isPublished ?? blog?.published ?? true))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!isEditing && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))) {
      setSlug(
        newTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Blog title is required")
      return
    }
    if (!slug.trim()) {
      toast.error("Blog slug is required")
      return
    }

    const tags = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content: content.trim(),
      excerpt: excerpt.trim(),
      coverImage: coverImage.trim(),
      author: author.trim(),
      tags,
      category: category.trim(),
      isPublished,
      published: isPublished,
      publishedAt: isPublished
        ? new Date().toISOString().split("T")[0]
        : "",
    }

    try {
      setIsSubmitting(true)
      const targetId = blog?.id || blog?._id
      if (isEditing && targetId) {
        const res = await updateBlog(targetId, payload)
        toast.success("Blog post updated successfully!")
        if (res.data) onSuccess(res.data)
      } else {
        const res = await createBlog(payload)
        toast.success("Blog post created successfully!")
        if (res.data) onSuccess(res.data)
      }
      onClose()
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to save blog post"
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="blog-title" className="text-xs font-semibold">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="blog-title"
            value={title}
            onChange={handleTitleChange}
            placeholder="e.g. Next.js 16 Server Actions Guide"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="blog-slug" className="text-xs font-semibold">
            Slug <span className="text-destructive">*</span>
          </Label>
          <Input
            id="blog-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. nextjs-16-server-actions-guide"
            required
          />
        </div>
      </div>

      {/* Author & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="blog-author" className="text-xs font-semibold">
            Author
          </Label>
          <Input
            id="blog-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Abdullah Al Maksud"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="blog-category" className="text-xs font-semibold">
            Category
          </Label>
          <Input
            id="blog-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Web Development, Tutorial, Architecture"
          />
        </div>
      </div>

      {/* Cover Image */}
      <ImageUpload
        label="Article Cover Image"
        value={coverImage}
        onChange={setCoverImage}
        placeholder="/images/blog/cover.png"
      />

      {/* Tags */}
      <div className="space-y-1.5">
        <Label htmlFor="blog-tags" className="text-xs font-semibold">
          Tags (comma separated)
        </Label>
        <Input
          id="blog-tags"
          value={tagsString}
          onChange={(e) => setTagsString(e.target.value)}
          placeholder="nextjs, react, typescript, performance"
        />
      </div>

      {/* Excerpt */}
      <div className="space-y-1.5">
        <Label htmlFor="blog-excerpt" className="text-xs font-semibold">
          Short Excerpt / Description
        </Label>
        <textarea
          id="blog-excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief summary appearing on blog cards..."
          rows={2}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Markdown Content */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="blog-content" className="text-xs font-semibold">
            Article Body (Markdown Supported)
          </Label>
          <span className="text-[11px] font-mono text-muted-foreground">
            Markdown
          </span>
        </div>
        <textarea
          id="blog-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="# Article Title&#10;&#10;Write content here..."
          rows={7}
          className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Published Toggle */}
      <div className="flex items-center space-x-2 rounded-lg border p-3 bg-muted/20">
        <Checkbox
          id="isPublished"
          checked={isPublished}
          onCheckedChange={(checked) => setIsPublished(!!checked)}
        />
        <div className="grid gap-0.5 leading-none">
          <Label
            htmlFor="isPublished"
            className="text-xs font-semibold cursor-pointer"
          >
            Publish Immediately
          </Label>
          <p className="text-[11px] text-muted-foreground">
            When unchecked, the article is saved as a private Draft.
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
          {isEditing ? "Save Changes" : "Create Article"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function BlogFormDialog({
  open,
  onOpenChange,
  blog,
  onSuccess,
}: BlogFormDialogProps) {
  const isEditing = !!blog
  const dialogKey = open ? (blog ? (blog.id || blog._id || "edit") : "new") : "closed"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <IconArticle className="size-5 text-primary" />
            {isEditing ? "Edit Blog Article" : "Create New Blog Article"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update article content, metadata, cover image, and published state."
              : "Draft a new technical article or tutorial for your audience."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <BlogFormInner
            key={dialogKey}
            blog={blog}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
