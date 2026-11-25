"use client"

import React, { useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { extractExistingAssetFolders } from "@/lib/asset-url"
import { IconFilter, IconFolder, IconX } from "@tabler/icons-react"

interface AssetFolderFilterProps {
  items: Array<{ pathname?: string }>
  moduleFilter: string
  folderFilter: string
  onModuleFilterChange: (module: string) => void
  onFolderFilterChange: (directory: string) => void
  compact?: boolean
}

export function AssetFolderFilter({
  items,
  moduleFilter,
  folderFilter,
  onModuleFilterChange,
  onFolderFilterChange,
  compact = false,
}: AssetFolderFilterProps) {
  const folders = useMemo(() => extractExistingAssetFolders(items), [items])

  const moduleOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const f of folders) {
      counts.set(f.module, (counts.get(f.module) || 0) + f.count)
    }
    return Array.from(counts.entries())
      .map(([module, count]) => ({ module, count }))
      .sort((a, b) => a.module.localeCompare(b.module))
  }, [folders])

  const visibleFolders = useMemo(
    () =>
      moduleFilter === "all"
        ? folders
        : folders.filter((f) => f.module === moduleFilter),
    [folders, moduleFilter],
  )

  if (folders.length === 0) return null

  const hasActiveFilter = moduleFilter !== "all" || folderFilter !== "all"

  return (
    <div className="flex flex-wrap items-center gap-2 min-w-0">
      <div className="w-full sm:w-[160px]">
        <Select
          value={moduleFilter}
          onValueChange={(val) => {
            onModuleFilterChange(val)
            onFolderFilterChange("all")
          }}
        >
          <SelectTrigger
            size="sm"
            className={`w-full bg-background text-xs ${compact ? "h-8" : "h-9"}`}
          >
            <IconFilter className="size-3.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all" className="text-xs">
              All Categories ({items.length})
            </SelectItem>
            {moduleOptions.map((opt) => (
              <SelectItem key={opt.module} value={opt.module} className="text-xs">
                {opt.module} ({opt.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[185px]">
        <Select value={folderFilter} onValueChange={onFolderFilterChange}>
          <SelectTrigger
            size="sm"
            className={`w-full bg-background text-xs ${compact ? "h-8" : "h-9"}`}
          >
            <IconFolder className="size-3.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="All Folders" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all" className="text-xs">
              All Folders
            </SelectItem>
            {visibleFolders.map((folder) => (
              <SelectItem
                key={folder.directory}
                value={folder.directory}
                className="text-xs font-mono"
              >
                {moduleFilter === "all"
                  ? `${folder.module}/${folder.folderKey}`
                  : folder.folderKey}{" "}
                ({folder.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilter && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            onModuleFilterChange("all")
            onFolderFilterChange("all")
          }}
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <IconX className="size-3.5 mr-1" />
          Reset
        </Button>
      )}
    </div>
  )
}
