"use client"

import React from "react"
import { useTranslation } from "react-i18next"
import { CaseStudy } from "@/lib/api/types"
import { CaseStudyEditorForm } from "./case-study-editor-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconSparkles } from "@tabler/icons-react"

interface CaseStudyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseStudy?: CaseStudy | null
  onSuccess: (caseStudy: CaseStudy) => void
}

export function CaseStudyFormDialog({
  open,
  onOpenChange,
  caseStudy,
  onSuccess,
}: CaseStudyFormDialogProps) {
  const { t } = useTranslation()
  const isEditing = !!caseStudy
  const dialogKey = open
    ? caseStudy
      ? caseStudy.id || caseStudy._id || "edit"
      : "new"
    : "closed"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <IconSparkles className="size-4 text-primary" />
            <span>{isEditing ? t("caseStudies.editTitle") : t("caseStudies.addTitle")}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">{t("caseStudies.formSubtitle")}</DialogDescription>
        </DialogHeader>

        {open && (
          <CaseStudyEditorForm
            key={dialogKey}
            caseStudy={caseStudy}
            mode={isEditing ? "edit" : "create"}
            variant="embedded"
            onCancel={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
