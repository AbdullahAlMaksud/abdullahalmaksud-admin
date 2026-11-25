"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  IconBraces,
  IconCheck,
  IconCode,
  IconForms,
  IconLanguage,
  IconLoader2,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllSiteLocales, resetSiteData, updateSiteData } from "@/lib/api/site"
import type { SiteLocaleData, SupportedLocale } from "@/lib/api/types"

type EditorMode = "form" | "json"

export function SiteLocalizationEditor() {
  const { t } = useTranslation()

  const [activeLocale, setActiveLocale] = useState<SupportedLocale>("en")
  const [editorMode, setEditorMode] = useState<EditorMode>("form")
  const [localesData, setLocalesData] = useState<Record<SupportedLocale, SiteLocaleData | null>>({
    en: null,
    bn: null,
  })
  const [rawJsonText, setRawJsonText] = useState<string>("")
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isResetting, setIsResetting] = useState<boolean>(false)

  const currentData = localesData[activeLocale]

  const syncJsonFromData = useCallback((data: SiteLocaleData | null) => {
    if (!data) {
      setRawJsonText("")
      return
    }
    const { id: _id, ...clean } = data as SiteLocaleData & { id?: string }
    setRawJsonText(JSON.stringify(clean, null, 2))
    setJsonError(null)
  }, [])

  const loadLocales = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await getAllSiteLocales()
      if (res?.data) {
        setLocalesData({
          en: res.data.en,
          bn: res.data.bn,
        })
        syncJsonFromData(res.data[activeLocale])
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load site localization"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [activeLocale, syncJsonFromData])

  useEffect(() => {
    loadLocales()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLocaleSwitch = (nextLocale: SupportedLocale) => {
    if (editorMode === "json" && currentData) {
      try {
        const parsed = JSON.parse(rawJsonText) as SiteLocaleData
        setLocalesData((prev) => ({ ...prev, [activeLocale]: parsed }))
      } catch {
        // Keep existing state if JSON is temporarily invalid
      }
    }
    setActiveLocale(nextLocale)
    syncJsonFromData(localesData[nextLocale])
  }

  const handleModeSwitch = (nextMode: EditorMode) => {
    if (nextMode === "json") {
      syncJsonFromData(currentData)
      setEditorMode("json")
      return
    }

    // Switching from JSON -> Form: validate JSON first
    try {
      const parsed = JSON.parse(rawJsonText) as SiteLocaleData
      setLocalesData((prev) => ({ ...prev, [activeLocale]: parsed }))
      setJsonError(null)
      setEditorMode("form")
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON syntax")
      toast.error(t("settings.invalidJsonError") || "Fix JSON syntax errors before switching mode.")
    }
  }

  const updateSectionField = <K extends keyof SiteLocaleData>(
    section: K,
    updater: (prev: SiteLocaleData[K]) => SiteLocaleData[K]
  ) => {
    setLocalesData((prev) => {
      const existing = prev[activeLocale]
      if (!existing) return prev
      const nextLocaleData: SiteLocaleData = {
        ...existing,
        [section]: updater(existing[section]),
      }
      return {
        ...prev,
        [activeLocale]: nextLocaleData,
      }
    })
  }

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText)
      setRawJsonText(JSON.stringify(parsed, null, 2))
      setJsonError(null)
      toast.success("JSON formatted")
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON")
    }
  }

  const handleSave = async () => {
    let payloadToSave: SiteLocaleData | null = currentData

    if (editorMode === "json") {
      try {
        payloadToSave = JSON.parse(rawJsonText) as SiteLocaleData
        setJsonError(null)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Invalid JSON syntax"
        setJsonError(msg)
        toast.error(msg)
        return
      }
    }

    if (!payloadToSave) return

    try {
      setIsSaving(true)
      const res = await updateSiteData(activeLocale, payloadToSave)
      const savedDoc = res?.data || payloadToSave
      setLocalesData((prev) => ({ ...prev, [activeLocale]: savedDoc }))
      syncJsonFromData(savedDoc)
      toast.success(
        t("settings.siteSaved") ||
          `Web configuration (${activeLocale.toUpperCase()}) saved to server!`
      )
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save site configuration")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    try {
      setIsResetting(true)
      const res = await resetSiteData(activeLocale)
      const resetDoc = res?.data as SiteLocaleData
      if (resetDoc) {
        setLocalesData((prev) => ({ ...prev, [activeLocale]: resetDoc }))
        syncJsonFromData(resetDoc)
      }
      toast.success(`Reset ${activeLocale.toUpperCase()} localization to default template.`)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to reset localization")
    } finally {
      setIsResetting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <IconLoader2 className="size-4 animate-spin" />
          <span>{t("common.loading") || "Loading site localization..."}</span>
        </CardContent>
      </Card>
    )
  }

  if (!currentData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
          <p className="text-sm text-muted-foreground">
            Could not load site localization from server. Verify MongoDB connection and retry.
          </p>
          <Button variant="outline" onClick={loadLocales} className="gap-2">
            <IconRefresh className="size-4" />
            <span>Retry</span>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Locale Switcher + Mode Toggle + Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconLanguage className="size-5" />
                <span>{t("settings.webSiteTitle") || "Web Portal & Localization (EN / BN)"}</span>
              </CardTitle>
              <CardDescription>
                {t("settings.webSiteDesc") ||
                  "Control all public website copy, navigation, advisory, contact details, SEO, and localized JSON directly from the database."}
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Language Selector */}
              <div className="inline-flex rounded-md border bg-muted p-0.5">
                {(["en", "bn"] as const).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLocaleSwitch(loc)}
                    className={`rounded-sm px-3 py-1 text-xs font-semibold uppercase transition-colors ${
                      activeLocale === loc
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {loc === "en" ? "English (EN)" : "বাংলা (BN)"}
                  </button>
                ))}
              </div>

              {/* Editor Mode Selector */}
              <div className="inline-flex rounded-md border bg-muted p-0.5">
                <button
                  type="button"
                  onClick={() => handleModeSwitch("form")}
                  className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs font-medium transition-colors ${
                    editorMode === "form"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <IconForms className="size-3.5" />
                  <span>Structured Form</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch("json")}
                  className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs font-medium transition-colors ${
                    editorMode === "json"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <IconBraces className="size-3.5" />
                  <span>Raw JSON</span>
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {editorMode === "json" ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconCode className="size-4" />
                  <span>Localized JSON Editor ({activeLocale.toUpperCase()})</span>
                </CardTitle>
                <CardDescription>
                  Directly edit the complete front-site localization & configuration JSON stored in
                  MongoDB.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleFormatJson}>
                  Format JSON
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isResetting || isSaving}
                >
                  {isResetting ? (
                    <IconLoader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <IconRefresh className="mr-1.5 size-3.5" />
                  )}
                  Reset Default
                </Button>
                <Button type="button" size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <IconLoader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <IconCheck className="mr-1.5 size-3.5" />
                  )}
                  Save JSON
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {jsonError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
                JSON Syntax Error: {jsonError}
              </div>
            )}
            <textarea
              value={rawJsonText}
              onChange={(e) => {
                setRawJsonText(e.target.value)
                try {
                  JSON.parse(e.target.value)
                  setJsonError(null)
                } catch (err: unknown) {
                  setJsonError(err instanceof Error ? err.message : "Invalid JSON")
                }
              }}
              spellCheck={false}
              rows={28}
              className="w-full rounded-md border bg-muted/30 p-4 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="identity" className="w-full">
              <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-1">
                <TabsTrigger value="identity" className="text-xs">
                  Identity & Nav
                </TabsTrigger>
                <TabsTrigger value="sections" className="text-xs">
                  Section Titles
                </TabsTrigger>
                <TabsTrigger value="advisory" className="text-xs">
                  Advisory & Pillars
                </TabsTrigger>
                <TabsTrigger value="contact" className="text-xs">
                  Contact & CV
                </TabsTrigger>
                <TabsTrigger value="footer" className="text-xs">
                  Footer & Socials
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-xs">
                  SEO & Error UI
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Identity & Nav */}
              <TabsContent value="identity" className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={currentData.identity.name}
                      onChange={(e) =>
                        updateSectionField("identity", (p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      value={currentData.identity.role}
                      onChange={(e) =>
                        updateSectionField("identity", (p) => ({ ...p, role: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Line 1</Label>
                    <Input
                      value={currentData.identity.firstNameLine}
                      onChange={(e) =>
                        updateSectionField("identity", (p) => ({
                          ...p,
                          firstNameLine: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Line 2</Label>
                    <Input
                      value={currentData.identity.lastNameLine}
                      onChange={(e) =>
                        updateSectionField("identity", (p) => ({
                          ...p,
                          lastNameLine: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Sub-role / Disciplines</Label>
                    <Input
                      value={currentData.identity.subRole}
                      onChange={(e) =>
                        updateSectionField("identity", (p) => ({ ...p, subRole: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Hero Tagline</Label>
                    <textarea
                      rows={2}
                      value={currentData.identity.tagline}
                      onChange={(e) =>
                        updateSectionField("identity", (p) => ({ ...p, tagline: e.target.value }))
                      }
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Portrait Image URL</Label>
                    <Input
                      value={currentData.identity.portraitUrl || ""}
                      onChange={(e) =>
                        updateSectionField("identity", (p) => ({
                          ...p,
                          portraitUrl: e.target.value,
                        }))
                      }
                      placeholder="/images/portrait.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ticker / Marquee Tags (comma-separated)</Label>
                    <Input
                      value={(currentData.marqueeItems || []).join(", ")}
                      onChange={(e) =>
                        updateSectionField("marqueeItems", () =>
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Hero Metrics Bar
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateSectionField("metrics", (prev) => [
                          ...(prev || []),
                          { value: "10+", label: "Metric", icon: "award" },
                        ])
                      }
                    >
                      <IconPlus className="mr-1 size-3.5" />
                      Add Metric
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(currentData.metrics || []).map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-md border p-2">
                        <Input
                          className="w-24"
                          value={m.value}
                          onChange={(e) =>
                            updateSectionField("metrics", (prev) =>
                              (prev || []).map((it, i) =>
                                i === idx ? { ...it, value: e.target.value } : it
                              )
                            )
                          }
                          placeholder="5+"
                        />
                        <Input
                          value={m.label}
                          onChange={(e) =>
                            updateSectionField("metrics", (prev) =>
                              (prev || []).map((it, i) =>
                                i === idx ? { ...it, label: e.target.value } : it
                              )
                            )
                          }
                          placeholder="Years Experience"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            updateSectionField("metrics", (prev) =>
                              (prev || []).filter((_, i) => i !== idx)
                            )
                          }
                        >
                          <IconTrash className="size-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Navigation Labels
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(
                      [
                        ["home", "Home"],
                        ["about", "About"],
                        ["work", "Work"],
                        ["blog", "Blog / Writing"],
                        ["books", "Books"],
                        ["contact", "Contact"],
                        ["downloadCv", "CV Button"],
                        ["backToHome", "Back to Home"],
                        ["allWritings", "All Writings"],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-xs">{label}</Label>
                        <Input
                          value={currentData.nav[key]}
                          onChange={(e) =>
                            updateSectionField("nav", (p) => ({ ...p, [key]: e.target.value }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Section Headings */}
              <TabsContent value="sections" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(
                  [
                    ["caseStudiesCategory", "Case Studies Eyebrow"],
                    ["caseStudiesTitle", "Case Studies Title"],
                    ["projectsCategory", "Projects Eyebrow"],
                    ["projectsTitle", "Projects Title"],
                    ["writingsCategory", "Writings Eyebrow"],
                    ["writingsTitle", "Writings Title"],
                    ["bookLabel", "Featured Book Eyebrow"],
                    ["viewBookDetails", "View Book CTA"],
                    ["viewAllWritings", "View All Writings CTA"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      value={currentData.sections[key]}
                      onChange={(e) =>
                        updateSectionField("sections", (p) => ({ ...p, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </TabsContent>

              {/* Tab 3: Advisory & Pillars */}
              <TabsContent value="advisory" className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Section Eyebrow</Label>
                    <Input
                      value={currentData.advisory.badge}
                      onChange={(e) =>
                        updateSectionField("advisory", (p) => ({ ...p, badge: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Availability Status</Label>
                    <Input
                      value={currentData.advisory.availability}
                      onChange={(e) =>
                        updateSectionField("advisory", (p) => ({
                          ...p,
                          availability: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Headline</Label>
                    <Input
                      value={currentData.advisory.headline}
                      onChange={(e) =>
                        updateSectionField("advisory", (p) => ({ ...p, headline: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Statement</Label>
                    <textarea
                      rows={3}
                      value={currentData.advisory.statement}
                      onChange={(e) =>
                        updateSectionField("advisory", (p) => ({ ...p, statement: e.target.value }))
                      }
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary CTA Label</Label>
                    <Input
                      value={currentData.advisory.primaryCta}
                      onChange={(e) =>
                        updateSectionField("advisory", (p) => ({
                          ...p,
                          primaryCta: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Copy Email CTA</Label>
                    <Input
                      value={currentData.advisory.copyEmailCta}
                      onChange={(e) =>
                        updateSectionField("advisory", (p) => ({
                          ...p,
                          copyEmailCta: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Advisory Pillars
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateSectionField("advisory", (p) => ({
                          ...p,
                          pillars: [
                            ...p.pillars,
                            {
                              number: `0${p.pillars.length + 1}`,
                              title: "",
                              description: "",
                            },
                          ],
                        }))
                      }
                    >
                      <IconPlus className="mr-1 size-3.5" />
                      Add Pillar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {currentData.advisory.pillars.map((pillar, idx) => (
                      <div key={idx} className="space-y-2 rounded-md border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <Input
                            className="w-20"
                            value={pillar.number}
                            onChange={(e) =>
                              updateSectionField("advisory", (p) => ({
                                ...p,
                                pillars: p.pillars.map((it, i) =>
                                  i === idx ? { ...it, number: e.target.value } : it
                                ),
                              }))
                            }
                            placeholder="01"
                          />
                          <Input
                            value={pillar.title}
                            onChange={(e) =>
                              updateSectionField("advisory", (p) => ({
                                ...p,
                                pillars: p.pillars.map((it, i) =>
                                  i === idx ? { ...it, title: e.target.value } : it
                                ),
                              }))
                            }
                            placeholder="Pillar Title"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              updateSectionField("advisory", (p) => ({
                                ...p,
                                pillars: p.pillars.filter((_, i) => i !== idx),
                              }))
                            }
                          >
                            <IconTrash className="size-4 text-destructive" />
                          </Button>
                        </div>
                        <textarea
                          rows={2}
                          value={pillar.description}
                          onChange={(e) =>
                            updateSectionField("advisory", (p) => ({
                              ...p,
                              pillars: p.pillars.map((it, i) =>
                                i === idx ? { ...it, description: e.target.value } : it
                              ),
                            }))
                          }
                          placeholder="Description"
                          className="w-full rounded-md border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Contact & CV */}
              <TabsContent value="contact" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Direct Email</Label>
                  <Input
                    value={currentData.contact.email}
                    onChange={(e) =>
                      updateSectionField("contact", (p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>CV / Resume PDF URL</Label>
                  <Input
                    value={currentData.meta.cvUrl}
                    onChange={(e) =>
                      updateSectionField("meta", (p) => ({ ...p, cvUrl: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Response Time</Label>
                  <Input
                    value={currentData.contact.responseTimeValue}
                    onChange={(e) =>
                      updateSectionField("contact", (p) => ({
                        ...p,
                        responseTimeValue: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Input
                    value={currentData.contact.availabilityValue}
                    onChange={(e) =>
                      updateSectionField("contact", (p) => ({
                        ...p,
                        availabilityValue: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Contact Page Headline</Label>
                  <Input
                    value={currentData.contact.headline}
                    onChange={(e) =>
                      updateSectionField("contact", (p) => ({ ...p, headline: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Contact Page Intro</Label>
                  <textarea
                    rows={3}
                    value={currentData.contact.intro}
                    onChange={(e) =>
                      updateSectionField("contact", (p) => ({ ...p, intro: e.target.value }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Quick Subject Chips (comma-separated)</Label>
                  <Input
                    value={currentData.contact.quickSubjects.join(", ")}
                    onChange={(e) =>
                      updateSectionField("contact", (p) => ({
                        ...p,
                        quickSubjects: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }))
                    }
                  />
                </div>
              </TabsContent>

              {/* Tab 5: Footer & Socials */}
              <TabsContent value="footer" className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Copyright Line</Label>
                    <Input
                      value={currentData.footer.copyright}
                      onChange={(e) =>
                        updateSectionField("footer", (p) => ({ ...p, copyright: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rights Line</Label>
                    <Input
                      value={currentData.footer.rights}
                      onChange={(e) =>
                        updateSectionField("footer", (p) => ({ ...p, rights: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Footer Links
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateSectionField("footer", (p) => ({
                          ...p,
                          socials: [...p.socials, { label: "", url: "", isExternal: true }],
                        }))
                      }
                    >
                      <IconPlus className="mr-1 size-3.5" />
                      Add Link
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {currentData.footer.socials.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 items-center gap-2">
                        <Input
                          className="col-span-4"
                          value={item.label}
                          onChange={(e) =>
                            updateSectionField("footer", (p) => ({
                              ...p,
                              socials: p.socials.map((s, i) =>
                                i === idx ? { ...s, label: e.target.value } : s
                              ),
                            }))
                          }
                          placeholder="Label"
                        />
                        <Input
                          className="col-span-6"
                          value={item.url}
                          onChange={(e) =>
                            updateSectionField("footer", (p) => ({
                              ...p,
                              socials: p.socials.map((s, i) =>
                                i === idx ? { ...s, url: e.target.value } : s
                              ),
                            }))
                          }
                          placeholder="https://..."
                        />
                        <label className="col-span-1 flex items-center justify-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={item.isExternal}
                            onChange={(e) =>
                              updateSectionField("footer", (p) => ({
                                ...p,
                                socials: p.socials.map((s, i) =>
                                  i === idx ? { ...s, isExternal: e.target.checked } : s
                                ),
                              }))
                            }
                          />
                          <span>Ext</span>
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="col-span-1"
                          onClick={() =>
                            updateSectionField("footer", (p) => ({
                              ...p,
                              socials: p.socials.filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          <IconTrash className="size-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 6: SEO & Error UI */}
              <TabsContent value="seo" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input
                    value={currentData.meta.siteName}
                    onChange={(e) =>
                      updateSectionField("meta", (p) => ({ ...p, siteName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Page Title</Label>
                  <Input
                    value={currentData.meta.defaultTitle}
                    onChange={(e) =>
                      updateSectionField("meta", (p) => ({ ...p, defaultTitle: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Meta Description</Label>
                  <textarea
                    rows={2}
                    value={currentData.meta.description}
                    onChange={(e) =>
                      updateSectionField("meta", (p) => ({ ...p, description: e.target.value }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>SEO Keywords</Label>
                  <Input
                    value={currentData.meta.keywords}
                    onChange={(e) =>
                      updateSectionField("meta", (p) => ({ ...p, keywords: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2 border-t pt-4">
                  <Label>Network Error Page Title</Label>
                  <Input
                    value={currentData.ui.errorTitle}
                    onChange={(e) =>
                      updateSectionField("ui", (p) => ({ ...p, errorTitle: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Network Error Page Description</Label>
                  <textarea
                    rows={2}
                    value={currentData.ui.errorDescription}
                    onChange={(e) =>
                      updateSectionField("ui", (p) => ({ ...p, errorDescription: e.target.value }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isResetting || isSaving}
              >
                {isResetting ? (
                  <IconLoader2 className="mr-1.5 size-4 animate-spin" />
                ) : (
                  <IconRefresh className="mr-1.5 size-4" />
                )}
                <span>Reset {activeLocale.toUpperCase()} Defaults</span>
              </Button>

              <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <IconLoader2 className="mr-1.5 size-4 animate-spin" />
                ) : (
                  <IconCheck className="mr-1.5 size-4" />
                )}
                <span>Save {activeLocale.toUpperCase()} Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
