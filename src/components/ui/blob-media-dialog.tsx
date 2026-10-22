"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api/client"
import {
  IconCloud,
  IconCheck,
  IconLoader2,
  IconPhoto,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"

export interface BlobItem {
  url: string;
  downloadUrl?: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

interface BlobMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  currentValue?: string;
}

export function BlobMediaDialog({
  open,
  onOpenChange,
  onSelect,
  currentValue,
}: BlobMediaDialogProps) {
  const [blobs, setBlobs] = useState<BlobItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchBlobs = async () => {
    try {
      setIsLoading(true)
      const res = await apiClient.getBlobs({ limit: 100 })
      if (res.success && res.data?.blobs) {
        setBlobs(res.data.blobs)
      } else {
        setBlobs([])
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to load Vercel Blob storage"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchBlobs()
    }
  }, [open])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit")
      return
    }

    try {
      setIsUploading(true)
      const uploadedUrl = await apiClient.upload(file)
      toast.success("Image uploaded to Vercel Blob!")
      await fetchBlobs()
      onSelect(uploadedUrl)
      onOpenChange(false)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to upload image"
      toast.error(msg)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this file from Vercel Blob?")) {
      return
    }

    try {
      setDeletingUrl(url)
      await apiClient.deleteBlob(url)
      toast.success("File deleted from Vercel Blob")
      setBlobs((prev) => prev.filter((b) => b.url !== url))
      if (currentValue === url) {
        onSelect("")
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to delete file"
      toast.error(msg)
    } finally {
      setDeletingUrl(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const filteredBlobs = blobs.filter((blob) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return blob.pathname.toLowerCase().includes(query) || blob.url.toLowerCase().includes(query)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <IconCloud className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Vercel Blob Media Library
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Browse, select, or upload images stored in Vercel Blob CDN.
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={isUploading}
                className="hidden"
                id="blob-modal-upload-input"
              />
              <Button
                type="button"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 h-8 text-xs"
              >
                {isUploading ? (
                  <IconLoader2 className="size-3.5 animate-spin" />
                ) : (
                  <IconUpload className="size-3.5" />
                )}
                <span>Upload New</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchBlobs}
                disabled={isLoading}
                className="h-8 w-8 p-0"
                title="Refresh Blobs"
              >
                <IconRefresh className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="pt-3">
            <div className="relative">
              <IconSearch className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search images by filename..."
                className="pl-9 h-8 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <IconX className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 min-h-[300px]">
          {isLoading && blobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <IconLoader2 className="size-8 animate-spin text-primary" />
              <p className="text-xs">Loading files from Vercel Blob...</p>
            </div>
          ) : filteredBlobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
              <div className="p-3 rounded-full bg-muted">
                <IconPhoto className="size-8 text-muted-foreground/60" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {searchQuery ? "No matching files found" : "No images uploaded yet"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {searchQuery
                    ? "Try a different search term"
                    : "Upload your first image directly to Vercel Blob"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs mt-1"
              >
                <IconUpload className="size-3.5 mr-1" /> Upload Image Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredBlobs.map((blob) => {
                const isSelected = currentValue === blob.url
                const isDeleting = deletingUrl === blob.url

                return (
                  <div
                    key={blob.url}
                    onClick={() => {
                      onSelect(blob.url)
                      onOpenChange(false)
                      toast.success("Image selected from Vercel Blob!")
                    }}
                    className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:shadow-md bg-card flex flex-col justify-between ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 shadow-xs"
                        : "border-border/60 hover:bg-accent/20"
                    }`}
                  >
                    <div className="aspect-square relative w-full bg-muted/40 overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={blob.url}
                        alt={blob.pathname}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.opacity = "0.3"
                        }}
                      />
                      {isSelected && (
                        <div className="absolute top-2 left-2 size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                          <IconCheck className="size-3.5" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(blob.url, e)}
                        disabled={isDeleting}
                        title="Delete from Vercel Blob"
                        className="absolute top-2 right-2 size-6 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all shadow-xs"
                      >
                        {isDeleting ? (
                          <IconLoader2 className="size-3 animate-spin" />
                        ) : (
                          <IconTrash className="size-3" />
                        )}
                      </button>
                    </div>

                    <div className="p-2 border-t bg-card/90">
                      <p className="text-[11px] font-medium text-foreground truncate" title={blob.pathname}>
                        {blob.pathname}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                        <span>{formatFileSize(blob.size)}</span>
                        <span>{new Date(blob.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredBlobs.length} {filteredBlobs.length === 1 ? "file" : "files"} in Vercel Blob</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
