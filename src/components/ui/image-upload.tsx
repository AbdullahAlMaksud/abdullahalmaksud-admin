"use client"

import React, { useState, useRef, useEffect } from "react"
import { apiClient } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BlobMediaDialog } from "@/components/ui/blob-media-dialog"
import {
  IconX,
  IconLoader2,
  IconPhoto,
  IconLink,
  IconCloud,
  IconUpload,
  IconReplace,
} from "@tabler/icons-react"
import { toast } from "sonner"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  label = "Cover Image",
  placeholder = "https://... or upload a file",
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [isBlobModalOpen, setIsBlobModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setImageError(false)
  }, [value])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB")
      return
    }

    try {
      setIsUploading(true)
      const uploadedUrl = await apiClient.upload(file)
      onChange(uploadedUrl)
      setImageError(false)
      toast.success("Image uploaded to Vercel Blob successfully!")
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to upload image"
      toast.error(errMsg)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    onChange("")
    setImageError(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">{label}</Label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBlobModalOpen(true)}
            disabled={disabled || isUploading}
            className="text-[11px] text-primary hover:underline transition-colors flex items-center gap-1 font-medium"
          >
            <IconCloud className="size-3.5" />
            <span>Browse Blob</span>
          </button>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <IconLink className="size-3" />
            {showUrlInput ? "Hide URL" : "Direct URL"}
          </button>
        </div>
      </div>

      {showUrlInput && (
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setImageError(false)
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="text-xs h-9"
        />
      )}

      {/* Hidden file input always available for upload or replace */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
        id={`image-upload-${label.replace(/[^a-zA-Z0-9]/g, "-")}`}
      />

      {value ? (
        <div className="relative rounded-xl border bg-card p-3 group shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative size-16 shrink-0 rounded-lg overflow-hidden bg-muted border flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={value}
                src={value}
                alt="Preview"
                className={`size-full object-cover ${imageError ? "hidden" : "block"}`}
                onLoad={() => setImageError(false)}
                onError={() => setImageError(true)}
              />
              {imageError && (
                <div className="flex flex-col items-center justify-center p-1 text-center text-muted-foreground">
                  <IconPhoto className="size-6 opacity-40" />
                  <span className="text-[8px] mt-0.5">Preview N/A</span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-mono truncate text-foreground font-medium">
                {value}
              </p>
              <p className="text-[10px] text-emerald-500 font-medium mt-0.5 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Image Selected</span>
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isUploading}
                  className="h-6 text-[10px] px-2"
                >
                  {isUploading ? (
                    <IconLoader2 className="size-2.5 animate-spin mr-1" />
                  ) : (
                    <IconReplace className="size-2.5 mr-1" />
                  )}
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBlobModalOpen(true)}
                  disabled={disabled || isUploading}
                  className="h-6 text-[10px] px-2"
                >
                  <IconCloud className="size-2.5 mr-1" />
                  From Blob
                </Button>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
              title="Remove image"
            >
              <IconX className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 transition-all text-center ${
            disabled || isUploading ? "opacity-50 pointer-events-none" : "hover:bg-muted/30 hover:border-primary/40"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <IconLoader2 className="size-7 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground font-medium">
                Uploading to Vercel Blob...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                <IconPhoto className="size-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground">
                  Select image for {label}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  PNG, JPG, WebP, SVG up to 10MB
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 text-xs px-3"
                >
                  <IconUpload className="size-3 mr-1" /> Upload File
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBlobModalOpen(true)}
                  className="h-7 text-xs px-3"
                >
                  <IconCloud className="size-3 mr-1" /> Browse Blob
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blob Media Library Dialog */}
      <BlobMediaDialog
        open={isBlobModalOpen}
        onOpenChange={setIsBlobModalOpen}
        onSelect={(url) => {
          onChange(url)
          setImageError(false)
        }}
        currentValue={value}
      />
    </div>
  )
}
