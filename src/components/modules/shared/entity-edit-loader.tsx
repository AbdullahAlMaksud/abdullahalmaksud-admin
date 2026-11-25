"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { IconAlertCircle, IconArrowLeft, IconLoader2 } from "@tabler/icons-react"

interface EntityEditLoaderProps<T> {
  backHref: string
  entityLabel: string
  fetcher: (id: string) => Promise<T | null>
  children: (entity: T) => React.ReactNode
}

export function EntityEditLoader<T>({
  backHref,
  entityLabel,
  fetcher,
  children,
}: EntityEditLoaderProps<T>) {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : ""

  const [entity, setEntity] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!id) {
        setError(`Invalid ${entityLabel.toLowerCase()} ID`)
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const item = await fetcher(id)
        if (!cancelled) {
          if (item) {
            setEntity(item)
          } else {
            setError(`${entityLabel} not found`)
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : `Failed to load ${entityLabel.toLowerCase()}`)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id, entityLabel, fetcher])

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-[360px] gap-2.5 text-muted-foreground">
        <IconLoader2 className="size-6 animate-spin text-primary" />
        <p className="text-xs font-medium">Loading {entityLabel.toLowerCase()}...</p>
      </div>
    )
  }

  if (error || !entity) {
    return (
      <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-[360px] gap-3 text-center">
        <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <IconAlertCircle className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">{error || `${entityLabel} not found`}</p>
          <p className="text-xs text-muted-foreground">
            The requested {entityLabel.toLowerCase()} could not be retrieved.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <Link href={backHref}>
            <IconArrowLeft className="size-3.5" /> Back to {entityLabel}s
          </Link>
        </Button>
      </div>
    )
  }

  return <>{children(entity)}</>
}
