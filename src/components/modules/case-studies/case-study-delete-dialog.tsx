"use client"

import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { CaseStudy } from "@/lib/api/types"
import { deleteCaseStudy } from "@/lib/api/case-studies"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

interface CaseStudyDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseStudy: CaseStudy | null
  onSuccess: (deletedId: string) => void
}

export function CaseStudyDeleteDialog({
  open,
  onOpenChange,
  caseStudy,
  onSuccess,
}: CaseStudyDeleteDialogProps) {
  const { t } = useTranslation()
  const [isDeleting, setIsDeleting] = useState(false)

  if (!caseStudy) return null

  const handleDelete = async () => {
    const targetId = caseStudy.id || caseStudy._id
    if (!targetId) return

    try {
      setIsDeleting(true)
      await deleteCaseStudy(targetId)
      toast.success(t("caseStudies.deleteSuccess"))
      onSuccess(targetId)
      onOpenChange(false)
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Failed to delete case study"
      toast.error(errMsg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-destructive/10 text-destructive">
              <IconAlertTriangle className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {t("common.delete")}
              </DialogTitle>
              <DialogDescription className="mt-1">
                <span className="font-semibold text-foreground">
                  &ldquo;{caseStudy.title}&rdquo;
                </span>
                {" — "}
                {t("media.deleteConfirm")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
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
  )
}
