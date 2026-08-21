"use client"

import React, { useState } from "react"
import { Book } from "@/lib/api/types"
import { createBook, updateBook } from "@/lib/api/books"
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
import { IconBook, IconLoader2, IconStar } from "@tabler/icons-react"
import { toast } from "sonner"

interface BookFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book?: Book | null
  onSuccess: (book: Book) => void
}

function BookFormInner({
  book,
  onClose,
  onSuccess,
}: {
  book?: Book | null
  onClose: () => void
  onSuccess: (book: Book) => void
}) {
  const isEditing = !!book

  const [title, setTitle] = useState(book?.title || "")
  const [slug, setSlug] = useState(book?.slug || "")
  const [author, setAuthor] = useState(book?.author || "Robert C. Martin")
  const [coverImage, setCoverImage] = useState(book?.coverImage || "")
  const [description, setDescription] = useState(book?.description || "")
  const [genre, setGenre] = useState(book?.genre || "Software Engineering")
  const [rating, setRating] = useState(book?.rating || 5)
  const [readDate, setReadDate] = useState(
    book?.readDate || (isEditing ? "" : new Date().toISOString().split("T")[0])
  )
  const [reviewText, setReviewText] = useState(book?.reviewText || "")
  const [tagsString, setTagsString] = useState(
    book?.tags?.join(", ") || "programming, best-practices, architecture"
  )
  const [isRecommended, setIsRecommended] = useState(!!(book?.isRecommended ?? true))
  const [purchaseLink, setPurchaseLink] = useState(book?.purchaseLink || (isEditing ? "" : "https://amazon.com"))
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
        if (res.data) onSuccess(res.data)
      } else {
        const res = await createBook(payload)
        toast.success("Book added to collection successfully!")
        if (res.data) onSuccess(res.data)
      }
      onClose()
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to save book"
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
          <Label htmlFor="book-title" className="text-xs font-semibold">
            Book Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="book-title"
            value={title}
            onChange={handleTitleChange}
            placeholder="e.g. Clean Code"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="book-slug" className="text-xs font-semibold">
            Slug <span className="text-destructive">*</span>
          </Label>
          <Input
            id="book-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. clean-code"
            required
          />
        </div>
      </div>

      {/* Author & Genre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="book-author" className="text-xs font-semibold">
            Author <span className="text-destructive">*</span>
          </Label>
          <Input
            id="book-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. Robert C. Martin"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="book-genre" className="text-xs font-semibold">
            Genre / Category
          </Label>
          <Input
            id="book-genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Software Engineering, Self-help, Fiction"
          />
        </div>
      </div>

      {/* Cover Image */}
      <ImageUpload
        label="Book Cover Image"
        value={coverImage}
        onChange={setCoverImage}
        placeholder="/images/books/cover.png"
      />

      {/* Rating & Read Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Star Rating ({rating} / 5)
          </Label>
          <div className="flex items-center gap-1 pt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 rounded hover:scale-110 transition-transform"
              >
                <IconStar
                  className={`size-6 ${
                    star <= rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="book-readDate" className="text-xs font-semibold">
            Read Date
          </Label>
          <Input
            id="book-readDate"
            type="date"
            value={readDate}
            onChange={(e) => setReadDate(e.target.value)}
          />
        </div>
      </div>

      {/* Tags & Purchase Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="book-tags" className="text-xs font-semibold">
            Tags (comma separated)
          </Label>
          <Input
            id="book-tags"
            value={tagsString}
            onChange={(e) => setTagsString(e.target.value)}
            placeholder="programming, career, habits"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="book-link" className="text-xs font-semibold">
            Purchase / GoodReads Link
          </Label>
          <Input
            id="book-link"
            type="url"
            value={purchaseLink}
            onChange={(e) => setPurchaseLink(e.target.value)}
            placeholder="https://amazon.com/dp/..."
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="book-desc" className="text-xs font-semibold">
          Book Synopsis / Summary
        </Label>
        <textarea
          id="book-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What this book is about..."
          rows={2}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Personal Review */}
      <div className="space-y-1.5">
        <Label htmlFor="book-review" className="text-xs font-semibold">
          Personal Review & Key Takeaways
        </Label>
        <textarea
          id="book-review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Your personal review, insights, and recommendations..."
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Recommended Toggle */}
      <div className="flex items-center space-x-2 rounded-lg border p-3 bg-muted/20">
        <Checkbox
          id="isRecommended"
          checked={isRecommended}
          onCheckedChange={(checked) => setIsRecommended(!!checked)}
        />
        <div className="grid gap-0.5 leading-none">
          <Label
            htmlFor="isRecommended"
            className="text-xs font-semibold cursor-pointer"
          >
            Recommended Read
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Highlight this book in your top recommendations collection.
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
          {isEditing ? "Save Changes" : "Add Book"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function BookFormDialog({
  open,
  onOpenChange,
  book,
  onSuccess,
}: BookFormDialogProps) {
  const isEditing = !!book
  const dialogKey = open ? (book ? (book.id || book._id || "edit") : "new") : "closed"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <IconBook className="size-5 text-primary" />
            {isEditing ? "Edit Book" : "Add Book to Reading List"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update book details, ratings, reviews, and links."
              : "Add a new book you recommend or have read to your public shelf."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <BookFormInner
            key={dialogKey}
            book={book}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
