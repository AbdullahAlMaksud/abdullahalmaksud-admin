"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Book } from "@/lib/api/types"
import { createBook, updateBook } from "@/lib/api/books"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/ui/image-upload"
import { PageSubHeader, StickyActionFooter } from "@/components/dashboard-01/components/sticky-action-bar"
import { IconLoader2, IconStar } from "@tabler/icons-react"
import { toast } from "sonner"

export interface BookEditorFormProps {
  book?: Book | null
  mode?: "create" | "edit"
  variant?: "page" | "embedded"
  onCancel?: () => void
  onSuccess?: (book: Book) => void
}

export function BookEditorForm({
  book,
  mode,
  variant = "page",
  onCancel,
  onSuccess,
}: BookEditorFormProps) {
  const router = useRouter()
  const isEditing = mode ? mode === "edit" : !!book

  const [title, setTitle] = useState(book?.title || "")
  const [slug, setSlug] = useState(book?.slug || "")
  const [author, setAuthor] = useState(book?.author || "Robert C. Martin")
  const [coverImage, setCoverImage] = useState(book?.coverImage || "")
  const [description, setDescription] = useState(book?.description || "")
  const [genre, setGenre] = useState(book?.genre || book?.category || "Software Engineering")
  const [rating, setRating] = useState(book?.rating || 5)
  const [readDate, setReadDate] = useState(
    book?.readDate || (isEditing ? "" : new Date().toISOString().split("T")[0])
  )
  const [reviewText, setReviewText] = useState(book?.reviewText || "")
  const [tagsString, setTagsString] = useState(
    book?.tags?.join(", ") || "programming, best-practices, architecture"
  )
  const [isRecommended, setIsRecommended] = useState(!!(book?.isRecommended ?? true))
  const [purchaseLink, setPurchaseLink] = useState(
    book?.purchaseLink || (isEditing ? "" : "https://amazon.com")
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push("/dashboard/books")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Book title is required")
      return
    }
    if (!slug.trim()) {
      toast.error("Book slug is required")
      return
    }
    if (!author.trim()) {
      toast.error("Author name is required")
      return
    }

    const tags = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      author: author.trim(),
      coverImage: coverImage.trim(),
      description: description.trim(),
      genre: genre.trim(),
      rating: Number(rating) || 5,
      readDate: readDate.trim(),
      reviewText: reviewText.trim(),
      tags,
      isRecommended,
      purchaseLink: purchaseLink.trim(),
    }

    try {
      setIsSubmitting(true)
      const targetId = book?.id || book?._id
      if (isEditing && targetId) {
        const res = await updateBook(targetId, payload)
        toast.success("Book updated successfully!")
        if (res.data) onSuccess?.(res.data)
      } else {
        const res = await createBook(payload)
        toast.success("Book added to collection successfully!")
        if (res.data) onSuccess?.(res.data)
      }
      if (variant === "page") {
        router.push("/dashboard/books")
        router.refresh()
      } else {
        onCancel?.()
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to save book"
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formId = "book-editor-form"

  const formFields = (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label htmlFor="book-title" className="text-xs font-semibold">
            Book Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="book-title"
            value={title}
            onChange={handleTitleChange}
            placeholder="e.g. Clean Code"
            className="h-8.5 text-xs"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="book-slug" className="text-xs font-semibold">
            Slug <span className="text-destructive">*</span>
          </Label>
          <Input
            id="book-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. clean-code"
            className="h-8.5 text-xs"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label htmlFor="book-author" className="text-xs font-semibold">
            Author <span className="text-destructive">*</span>
          </Label>
          <Input
            id="book-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. Robert C. Martin"
            className="h-8.5 text-xs"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="book-genre" className="text-xs font-semibold">
            Genre / Category
          </Label>
          <Input
            id="book-genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Software Engineering, Self-help, Fiction"
            className="h-8.5 text-xs"
          />
        </div>
      </div>

      <ImageUpload
        label="Book Cover Image"
        value={coverImage}
        onChange={setCoverImage}
        placeholder="/images/book/cover.png"
        module="book"
        folderKey={slug || "draft"}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Star Rating ({rating} / 5)</Label>
          <div className="flex items-center gap-1 pt-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 rounded hover:scale-110 transition-transform"
              >
                <IconStar
                  className={`size-5 ${
                    star <= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="book-readDate" className="text-xs font-semibold">
            Read Date
          </Label>
          <Input
            id="book-readDate"
            type="date"
            value={readDate}
            onChange={(e) => setReadDate(e.target.value)}
            className="h-8.5 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label htmlFor="book-tags" className="text-xs font-semibold">
            Tags (comma separated)
          </Label>
          <Input
            id="book-tags"
            value={tagsString}
            onChange={(e) => setTagsString(e.target.value)}
            placeholder="programming, career, habits"
            className="h-8.5 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="book-link" className="text-xs font-semibold">
            Purchase / GoodReads Link
          </Label>
          <Input
            id="book-link"
            type="url"
            value={purchaseLink}
            onChange={(e) => setPurchaseLink(e.target.value)}
            placeholder="https://amazon.com/dp/..."
            className="h-8.5 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label htmlFor="book-desc" className="text-xs font-semibold">
            Book Synopsis / Summary
          </Label>
          <textarea
            id="book-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this book is about..."
            rows={3}
            className="w-full rounded-md border bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="book-review" className="text-xs font-semibold">
            Personal Review & Key Takeaways
          </Label>
          <textarea
            id="book-review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Your personal review, insights, and recommendations..."
            rows={3}
            className="w-full rounded-md border bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 rounded-lg border p-2.5 bg-muted/20">
        <Checkbox
          id="isRecommended"
          checked={isRecommended}
          onCheckedChange={(checked) => setIsRecommended(!!checked)}
        />
        <div className="grid gap-0.5 leading-none">
          <Label htmlFor="isRecommended" className="text-xs font-semibold cursor-pointer">
            Recommended Read
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Highlight this book in your top recommendations collection.
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
            {isEditing ? "Save Changes" : "Add Book"}
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
        backHref="/dashboard/books"
        backLabel="Back to Books"
        description={
          isEditing
            ? "Update book details, ratings, reviews, and links."
            : "Add a new book you recommend or have read to your public shelf."
        }
      />

      <div className="flex-1 min-w-0 p-4 lg:p-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold">Book Details</CardTitle>
            <CardDescription className="text-xs">
              Book covers upload cleanly under <code className="font-mono">images/book/[slug]/</code>.
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
              {isEditing ? "Save Changes" : "Add Book"}
            </Button>
          </>
        }
      />
    </div>
  )
}
