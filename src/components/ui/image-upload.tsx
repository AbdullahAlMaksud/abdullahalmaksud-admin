"use client"

import React, { useState, useRef } from "react"
import { apiClient } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconX, IconLoader2, IconPhoto, IconLink } from "@tabler/icons-react"
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB")
      return
    }

    try {
      setIsUploading(true)
      const uploadedUrl = await apiClient.upload(file)
      onChange(uploadedUrl)
      toast.success("Image uploaded successfully!")
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
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">{label}</Label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <IconLink className="size-3" />
          {showUrlInput ? "Hide Direct URL" : "Enter Direct URL"}
        </button>
      </div>

      {showUrlInput && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="text-xs h-9"
        />
      )}

      {value ? (
        <div className="relative rounded-lg border bg-muted/30 p-2 group">
          <div className="flex items-center gap-3">
            <div className="relative size-16 shrink-0 rounded-md overflow-hidden bg-background border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Preview"
                className="size-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none"
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-mono truncate text-muted-foreground">
                {value}
              </p>
              <p className="text-[10px] text-emerald-500 font-medium mt-0.5">
                ✓ Image selected
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
            >
              <IconX className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
            id={`image-upload-${label.replace(/\s+/g, "-")}`}
          />
          <label
            htmlFor={`image-upload-${label.replace(/\s+/g, "-")}`}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all hover:bg-muted/40 hover:border-primary/50 text-center ${
              disabled || isUploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-1.5 py-2">
                <IconLoader2 className="size-6 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">
                  Uploading to Vercel Blob...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <IconPhoto className="size-5" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  Click to upload image
                </span>
                <span className="text-[10px] text-muted-foreground">
                  PNG, JPG, WebP, SVG up to 5MB
                </span>
              </div>
            )}
          </label>
        </div>
      )}
    </div>
  )
}
