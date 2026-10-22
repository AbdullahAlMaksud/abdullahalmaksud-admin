"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useTranslation } from "react-i18next"
import { apiClient } from "@/lib/api/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  IconSearch,
  IconCloudUpload,
  IconCopy,
  IconCheck,
  IconTrash,
  IconExternalLink,
  IconPhoto,
  IconFileText,
  IconRefresh,
  IconLayoutGrid,
  IconList,
  IconLoader2,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { toast } from "sonner"

interface BlobItem {
  url: string
  downloadUrl?: string
  pathname: string
  size: number
  uploadedAt: string
}

export function MediaManager() {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [blobs, setBlobs] = useState<BlobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Modals
  const [previewBlob, setPreviewBlob] = useState<BlobItem | null>(null)
  const [deletingBlob, setDeletingBlob] = useState<BlobItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadBlobs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiClient.getBlobs({ limit: 100 })
      if (res?.data?.blobs && Array.isArray(res.data.blobs)) {
        setBlobs(res.data.blobs)
      } else {
        setBlobs([])
      }
    } catch (err: unknown) {
      console.warn("Could not load blobs list:", err)
      // Vercel Blob might return empty if no token is configured locally
      setBlobs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBlobs()
  }, [loadBlobs])

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds maximum allowed size of 10MB")
      return
    }

    try {
      setUploading(true)
      const url = await apiClient.upload(file)
      toast.success(t("media.uploadSuccess"))
      // Prepend to local state
      const newBlob: BlobItem = {
        url,
        pathname: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }
      setBlobs((prev) => [newBlob, ...prev.filter((b) => b.url !== url)])
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : t("media.uploadError")
      toast.error(errMsg)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      toast.success(t("media.copied"))
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch {
      toast.error("Failed to copy URL to clipboard")
    }
  }

  const handleDelete = async () => {
    if (!deletingBlob) return
    try {
      setIsDeleting(true)
      await apiClient.deleteBlob(deletingBlob.url)
      toast.success(t("media.deleteSuccess"))
      setBlobs((prev) => prev.filter((b) => b.url !== deletingBlob.url))
      setDeletingBlob(null)
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : t("media.deleteError")
      toast.error(errMsg)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const isImageFile = (url: string, pathname: string) => {
    const ext = (pathname || url).split(".").pop()?.toLowerCase()
    return ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"].includes(ext || "")
  }

  const filteredBlobs = blobs.filter((b) => {
    const q = searchQuery.toLowerCase()
    return (
      b.pathname?.toLowerCase().includes(q) ||
      b.url?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFileUpload(e.dataTransfer.files)
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          uploading
            ? "border-primary bg-primary/5 pointer-events-none"
            : "border-muted-foreground/25 hover:border-primary/60 hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
          accept="image/*,application/pdf"
        />

        <div className="p-3.5 rounded-full bg-primary/10 text-primary mb-3 group-hover:scale-105 transition-transform">
          {uploading ? (
            <IconLoader2 className="size-6 animate-spin" />
          ) : (
            <IconCloudUpload className="size-6" />
          )}
        </div>

        <h3 className="font-semibold text-base text-foreground mb-1">
          {uploading ? t("media.uploading") : t("media.uploadAreaTitle")}
        </h3>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          {t("media.uploadAreaSubtitle")}
        </p>
      </div>

      {/* Search & View Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t("media.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-9 px-3 text-xs font-normal">
            {filteredBlobs.length} {t("media.totalFiles")}
          </Badge>

          <Button
            variant="outline"
            size="icon"
            onClick={loadBlobs}
            className="size-9"
            title="Refresh"
          >
            <IconRefresh className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <IconLayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
            >
              <IconList className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Gallery / List */}
      {loading && blobs.length === 0 ? (
        <div className="flex items-center justify-center p-16 text-muted-foreground gap-2">
          <IconLoader2 className="size-5 animate-spin" />
          <span>{t("common.loading")}</span>
        </div>
      ) : filteredBlobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-dashed text-center">
          <IconPhoto className="size-10 text-muted-foreground/40 mb-2" />
          <p className="font-semibold text-sm">{t("media.noFiles")}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {t("media.subtitle")}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBlobs.map((blob) => {
            const isImg = isImageFile(blob.url, blob.pathname)
            const isCopied = copiedUrl === blob.url

            return (
              <div
                key={blob.url}
                className="group relative rounded-xl border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => isImg && setPreviewBlob(blob)}
                  className="aspect-square bg-muted/40 relative overflow-hidden flex items-center justify-center cursor-pointer"
                >
                  {isImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={blob.url}
                      alt={blob.pathname || "Media"}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <IconFileText className="size-12 text-muted-foreground/60" />
                  )}

                  {/* Hover Overlay with Copy & View */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopyUrl(blob.url)
                      }}
                      className="size-8 rounded-full shadow-md"
                      title={t("media.copyUrl")}
                    >
                      {isCopied ? (
                        <IconCheck className="size-4 text-emerald-500" />
                      ) : (
                        <IconCopy className="size-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      asChild
                      className="size-8 rounded-full shadow-md"
                      title="Open in new tab"
                    >
                      <a
                        href={blob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconExternalLink className="size-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Info & Footer */}
                <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-xs font-semibold truncate text-foreground"
                      title={blob.pathname}
                    >
                      {blob.pathname || "Untitled"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatFileSize(blob.size)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
                    <button
                      onClick={() => handleCopyUrl(blob.url)}
                      className="flex items-center gap-1 hover:text-foreground text-xs transition-colors"
                    >
                      {isCopied ? (
                        <span className="text-emerald-500 font-medium">Copied!</span>
                      ) : (
                        <>
                          <IconCopy className="size-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setDeletingBlob(blob)}
                      className="p-1 hover:text-destructive transition-colors rounded-sm"
                      title={t("common.delete")}
                    >
                      <IconTrash className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border bg-card overflow-hidden shadow-xs divide-y">
          {filteredBlobs.map((blob) => {
            const isImg = isImageFile(blob.url, blob.pathname)
            const isCopied = copiedUrl === blob.url

            return (
              <div
                key={blob.url}
                className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    onClick={() => isImg && setPreviewBlob(blob)}
                    className="size-11 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                  >
                    {isImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={blob.url}
                        alt=""
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <IconFileText className="size-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate text-foreground">
                      {blob.pathname || "Untitled"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-sm">
                      {blob.url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {formatFileSize(blob.size)}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyUrl(blob.url)}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {isCopied ? (
                      <>
                        <IconCheck className="size-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <IconCopy className="size-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingBlob(blob)}
                    className="size-8 text-muted-foreground hover:text-destructive"
                    title={t("common.delete")}
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Preview Dialog */}
      {previewBlob && (
        <Dialog open={!!previewBlob} onOpenChange={() => setPreviewBlob(null)}>
          <DialogContent className="max-w-3xl p-4">
            <DialogHeader className="pb-2">
              <DialogTitle className="truncate text-base font-semibold">
                {previewBlob.pathname}
              </DialogTitle>
              <DialogDescription className="text-xs truncate">
                {previewBlob.url}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center max-h-[70vh] bg-black/5 rounded-lg overflow-hidden p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewBlob.url}
                alt={previewBlob.pathname}
                className="max-h-[65vh] object-contain rounded-md"
              />
            </div>
            <DialogFooter className="flex justify-between items-center sm:justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {formatFileSize(previewBlob.size)}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(previewBlob.url)}
                  className="gap-1.5 text-xs"
                >
                  <IconCopy className="size-3.5" />
                  <span>Copy CDN URL</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setPreviewBlob(null)}
                  className="text-xs"
                >
                  {t("media.closePreview")}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingBlob && (
        <Dialog open={!!deletingBlob} onOpenChange={() => setDeletingBlob(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-destructive/10 text-destructive">
                  <IconAlertTriangle className="size-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg">
                    {t("media.deleteTitle")}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {t("media.deleteConfirm")}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeletingBlob(null)}
                disabled={isDeleting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting && <IconLoader2 className="size-4 animate-spin" />}
                <span>{t("common.delete")}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
