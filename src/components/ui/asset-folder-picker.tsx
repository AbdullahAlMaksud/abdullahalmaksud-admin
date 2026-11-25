"use client"

import React, { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ASSET_MODULES,
  buildAssetDirectory,
  extractExistingAssetFolders,
  normalizeAssetModule,
} from "@/lib/asset-url"
import { IconFolder } from "@tabler/icons-react"

interface AssetFolderPickerProps {
  module: string
  folderKey: string
  onModuleChange: (module: string) => void
  onFolderKeyChange: (folderKey: string) => void
  existingPaths?: Array<{ pathname?: string }>
  compact?: boolean
  disabled?: boolean
}

export function AssetFolderPicker({
  module,
  folderKey,
  onModuleChange,
  onFolderKeyChange,
  existingPaths = [],
  compact = false,
  disabled = false,
}: AssetFolderPickerProps) {
  const normalizedModule = normalizeAssetModule(module)
  const existingFolders = useMemo(
    () => extractExistingAssetFolders(existingPaths),
    [existingPaths],
  )
  const matchingFolders = useMemo(
    () => existingFolders.filter((f) => f.module === normalizedModule),
    [existingFolders, normalizedModule],
  )
  const previewDir = buildAssetDirectory(normalizedModule, folderKey)

  return (
    <div
      className={`rounded-lg border bg-muted/25 ${
        compact ? "p-2.5 space-y-2" : "p-3.5 space-y-2.5"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
          <IconFolder className="size-3.5 text-primary" />
          Upload Folder Path
        </span>
        <code className="text-[10px] font-mono bg-background border rounded px-1.5 py-0.5 text-muted-foreground">
          {previewDir}/&lt;file&gt;
        </code>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Category / Module
          </Label>
          <Select
            value={normalizedModule}
            onValueChange={onModuleChange}
            disabled={disabled}
          >
            <SelectTrigger size="sm" className="w-full bg-background text-xs">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent position="popper">
              {ASSET_MODULES.map((m) => (
                <SelectItem key={m.value} value={m.value} className="text-xs">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Folder / Slug
          </Label>
          <Input
            value={folderKey}
            onChange={(e) => onFolderKeyChange(e.target.value)}
            placeholder="e.g. my-slug"
            disabled={disabled}
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      {matchingFolders.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-muted-foreground">Existing:</span>
          {matchingFolders.slice(0, 8).map((folder) => {
            const isActive = folder.folderKey === folderKey
            return (
              <button
                key={folder.directory}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onModuleChange(folder.module)
                  onFolderKeyChange(folder.folderKey)
                }}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {folder.folderKey}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
