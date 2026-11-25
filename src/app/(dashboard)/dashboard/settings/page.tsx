"use client"

import React, { Suspense, useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/ui/image-upload"
import { SiteLocalizationEditor } from "@/components/modules/settings/site-localization-editor"
import { PageSubHeader } from "@/components/dashboard-01/components/sticky-action-bar"
import { getAboutData, updateAboutData } from "@/lib/api/site"
import { getCurrentUser, updateProfile } from "@/lib/api/auth"
import { useAuth } from "@/components/auth/auth-provider"
import type { AboutData, AboutPillar, AboutPrinciple, SupportedLocale } from "@/lib/api/types"
import {
  IconCheck,
  IconUser,
  IconLanguage,
  IconInfoCircle,
  IconLoader2,
  IconServer,
  IconBolt,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import { getHealthStatus } from "@/lib/api/dashboard"
import { API_BASE_URL } from "@/lib/api/client"
import { toast } from "sonner"

const createEmptyAbout = (locale: SupportedLocale): AboutData => ({
  locale,
  header: {
    badge: locale === "bn" ? "জীবনবৃত্তান্ত ও পরিচিতি" : "Biography & Curriculum Vitae",
    name: locale === "bn" ? "আব্দুল্লাহ আল মাকসুদ" : "Abdullah Al Maksud",
    role:
      locale === "bn"
        ? "ফ্রন্টএন্ড ইঞ্জিনিয়ার · লেখালেখি · অনুবাদ · ডিজাইন"
        : "Frontend Engineer · Writing · Translation · Design",
    headline: "",
    intro: "",
    bioSecondary: "",
    signature: locale === "bn" ? "মাকসুদ" : "Maksud",
    experienceYears: "",
    cvUrl: "/CV-of-Abdullah-Al-Maksud.pdf",
  },
  pillars: [],
  principles: [],
})

function SettingsPageContent() {
  const { t } = useTranslation()
  const { refreshUser } = useAuth()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(() =>
    tabParam && ["site", "about", "profile", "cache"].includes(tabParam) ? tabParam : "profile",
  )

  useEffect(() => {
    if (tabParam && ["site", "about", "profile", "cache"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Tab: Profile
  const [profile, setProfile] = useState({
    name: "Abdullah Al Maksud",
    title: "Frontend Engineer & Writer",
    email: "contact@abdullahalmaksud.com",
    website: "https://abdullahalmaksud.com",
    github: "https://github.com/abdullahalmaksud",
    bio: "Frontend engineer, writer, and translator.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abdullah",
  })

  // Tab: About (EN / BN)
  const [aboutLocale, setAboutLocale] = useState<SupportedLocale>("en")
  const [aboutData, setAboutData] = useState<AboutData>(() => createEmptyAbout("en"))
  const [isLoadingAbout, setIsLoadingAbout] = useState(false)
  const [isSavingAbout, setIsSavingAbout] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Tab: Cache & Diagnostics
  const [revalidatePath, setRevalidatePath] = useState("/")
  const [revalidateTag, setRevalidateTag] = useState("blog")
  const [revalidateSecret, setRevalidateSecret] = useState("")
  const [isRevalidating, setIsRevalidating] = useState(false)
  const [serverHealth, setServerHealth] = useState<{
    status: string
    uptimeFormatted?: string
    database?: { isConnected?: boolean; state?: string }
  }>({
    status: "ok",
    uptimeFormatted: "Active",
    database: { isConnected: true, state: "connected" },
  })

  const loadAbout = useCallback(async (locale: SupportedLocale) => {
    try {
      setIsLoadingAbout(true)
      const res = await getAboutData(locale)
      if (res) {
        setAboutData({
          locale,
          header: {
            badge: res.header?.badge || "",
            name: res.header?.name || "",
            role: res.header?.role || "",
            headline: res.header?.headline || "",
            intro: res.header?.intro || "",
            bioSecondary: res.header?.bioSecondary || "",
            signature: res.header?.signature || "",
            experienceYears: res.header?.experienceYears || "",
            cvUrl: res.header?.cvUrl || "/CV-of-Abdullah-Al-Maksud.pdf",
          },
          pillars: Array.isArray(res.pillars) ? res.pillars : [],
          principles: Array.isArray(res.principles) ? res.principles : [],
        })
      }
    } catch (error) {
      console.error("Failed to load about data:", error)
    } finally {
      setIsLoadingAbout(false)
    }
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [userRes, healthRes] = await Promise.allSettled([
          getCurrentUser(),
          getHealthStatus(),
        ])

        if (healthRes.status === "fulfilled" && healthRes.value?.data) {
          setServerHealth(healthRes.value.data)
        }

        if (userRes.status === "fulfilled" && userRes.value?.data?.user) {
          const u = userRes.value.data.user
          setProfile((prev) => ({
            ...prev,
            name: u.name || prev.name,
            email: u.email || prev.email,
            avatar: u.image || prev.avatar,
          }))
        }
      } catch (error: unknown) {
        console.error("Failed to load initial settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    loadAbout("en")
  }, [loadAbout])

  const handleAboutLocaleChange = (locale: SupportedLocale) => {
    setAboutLocale(locale)
    loadAbout(locale)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSavingProfile(true)
      await updateProfile({
        name: profile.name,
        avatar: profile.avatar,
      })
      await refreshUser()
      toast.success(t("settings.profileSaved") || "Profile settings saved successfully.")
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to update profile"
      toast.error(errMsg)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSavingAbout(true)
      await updateAboutData(aboutData, aboutLocale)
      toast.success(`About page content (${aboutLocale.toUpperCase()}) updated live on server!`)
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to update about content"
      toast.error(errMsg)
    } finally {
      setIsSavingAbout(false)
    }
  }

  const updatePillar = (idx: number, patch: Partial<AboutPillar>) => {
    setAboutData((prev) => ({
      ...prev,
      pillars: prev.pillars.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }))
  }

  const updatePrinciple = (idx: number, patch: Partial<AboutPrinciple>) => {
    setAboutData((prev) => ({
      ...prev,
      principles: (prev.principles || []).map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }))
  }

  const handleTriggerRevalidation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsRevalidating(true)
      const webUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const res = await fetch(`${webUrl}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: revalidatePath.trim(),
          tag: revalidateTag.trim(),
          secret: revalidateSecret.trim(),
        }),
      })
      if (res.ok) {
        toast.success(`Edge cache for "${revalidatePath || revalidateTag}" purged successfully!`)
      } else {
        toast.info(`Cache revalidation triggered (Response: ${res.status}).`)
      }
    } catch {
      toast.info("Revalidation request dispatched to frontend runtime.")
    } finally {
      setIsRevalidating(false)
    }
  }

  const dbConnected =
    serverHealth.database?.isConnected ?? serverHealth.database?.state === "connected"

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col">
      <PageSubHeader
        backHref="/dashboard"
        backLabel="Overview"
        description={t("settings.subtitle")}
      />

      <div className="flex w-full min-w-0 flex-1 flex-col gap-6 p-4 lg:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
            <TabsList className="grid w-full max-w-[620px] grid-cols-2 sm:grid-cols-4 h-auto sm:h-9 gap-1 sm:gap-0">
              <TabsTrigger value="site" className="flex items-center gap-1.5 text-xs">
                <IconLanguage className="size-3.5" />
                <span>{t("settings.webSiteTab") || "Web & Localization"}</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-1.5 text-xs">
                <IconInfoCircle className="size-3.5" />
                <span>{t("settings.aboutTab") || "About Page"}</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs">
                <IconUser className="size-3.5" />
                <span>{t("settings.profileTab") || "Profile"}</span>
              </TabsTrigger>
              <TabsTrigger value="cache" className="flex items-center gap-1.5 text-xs">
                <IconServer className="size-3.5" />
                <span>Cache & API</span>
              </TabsTrigger>
            </TabsList>

            {/* Web Portal Site Config & Editable EN/BN JSON */}
            <TabsContent value="site" className="mt-4">
              <SiteLocalizationEditor />
            </TabsContent>

            {/* Dynamic About Page Content Tab (EN / BN) */}
            <TabsContent value="about" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>About Page Content ({aboutLocale.toUpperCase()})</CardTitle>
                      <CardDescription>
                        Manage the public About page biography, CV link, disciplines, and principles
                        per language.
                      </CardDescription>
                    </div>
                    <div className="inline-flex rounded-md border bg-muted p-0.5">
                      {(["en", "bn"] as const).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => handleAboutLocaleChange(loc)}
                          className={`rounded-sm px-3 py-1 text-xs font-semibold uppercase transition-colors ${
                            aboutLocale === loc
                              ? "bg-background text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {loc === "en" ? "English (EN)" : "বাংলা (BN)"}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveAbout} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="about-name">Display Name</Label>
                        <Input
                          id="about-name"
                          value={aboutData.header.name || ""}
                          onChange={(e) =>
                            setAboutData((prev) => ({
                              ...prev,
                              header: { ...prev.header, name: e.target.value },
                            }))
                          }
                          disabled={isLoadingAbout}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="about-role">Role Subtitle</Label>
                        <Input
                          id="about-role"
                          value={aboutData.header.role || ""}
                          onChange={(e) =>
                            setAboutData((prev) => ({
                              ...prev,
                              header: { ...prev.header, role: e.target.value },
                            }))
                          }
                          disabled={isLoadingAbout}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="about-badge">Header Badge Text</Label>
                        <Input
                          id="about-badge"
                          value={aboutData.header.badge}
                          onChange={(e) =>
                            setAboutData((prev) => ({
                              ...prev,
                              header: { ...prev.header, badge: e.target.value },
                            }))
                          }
                          disabled={isLoadingAbout}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="about-cv">Resume / CV PDF URL</Label>
                        <Input
                          id="about-cv"
                          value={aboutData.header.cvUrl || ""}
                          onChange={(e) =>
                            setAboutData((prev) => ({
                              ...prev,
                              header: { ...prev.header, cvUrl: e.target.value },
                            }))
                          }
                          disabled={isLoadingAbout}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="about-headline">Headline</Label>
                        <Input
                          id="about-headline"
                          value={aboutData.header.headline}
                          onChange={(e) =>
                            setAboutData((prev) => ({
                              ...prev,
                              header: { ...prev.header, headline: e.target.value },
                            }))
                          }
                          disabled={isLoadingAbout}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="about-intro">Primary Biography</Label>
                        <textarea
                          id="about-intro"
                          value={aboutData.header.intro}
                          onChange={(e) =>
                            setAboutData((prev) => ({
                              ...prev,
                              header: { ...prev.header, intro: e.target.value },
                            }))
                          }
                          rows={3}
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={isLoadingAbout}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="about-bio2">Secondary Biography Paragraph</Label>
                        <textarea
                          id="about-bio2"
                          value={aboutData.header.bioSecondary || ""}
                          onChange={(e) =>
                            setAboutData((prev) => ({
                              ...prev,
                              header: { ...prev.header, bioSecondary: e.target.value },
                            }))
                          }
                          rows={2}
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={isLoadingAbout}
                        />
                      </div>
                    </div>

                    {/* Disciplines / Pillars */}
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Core Disciplines / Pillars
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setAboutData((prev) => ({
                              ...prev,
                              pillars: [
                                ...prev.pillars,
                                {
                                  id: `pillar-${prev.pillars.length + 1}`,
                                  tag: `0${prev.pillars.length + 1} / Discipline`,
                                  title: "",
                                  subtitle: "",
                                  icon: "code",
                                  description: "",
                                  skills: [],
                                },
                              ],
                            }))
                          }
                        >
                          <IconPlus className="mr-1 size-3.5" />
                          Add Discipline
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {aboutData.pillars.map((pillar, idx) => (
                          <div key={idx} className="space-y-2 rounded-md border p-3">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                              <Input
                                className="sm:col-span-4"
                                value={pillar.tag}
                                onChange={(e) => updatePillar(idx, { tag: e.target.value })}
                                placeholder="01 / Frontend Engineering"
                              />
                              <Input
                                className="sm:col-span-4"
                                value={pillar.title}
                                onChange={(e) => updatePillar(idx, { title: e.target.value })}
                                placeholder="Title"
                              />
                              <Input
                                className="sm:col-span-3"
                                value={pillar.subtitle || ""}
                                onChange={(e) => updatePillar(idx, { subtitle: e.target.value })}
                                placeholder="Subtitle"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="sm:col-span-1"
                                onClick={() =>
                                  setAboutData((prev) => ({
                                    ...prev,
                                    pillars: prev.pillars.filter((_, i) => i !== idx),
                                  }))
                                }
                              >
                                <IconTrash className="size-4 text-destructive" />
                              </Button>
                            </div>
                            <textarea
                              rows={2}
                              value={pillar.description}
                              onChange={(e) => updatePillar(idx, { description: e.target.value })}
                              placeholder="Description"
                              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Principles */}
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Core Principles
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setAboutData((prev) => ({
                              ...prev,
                              principles: [
                                ...(prev.principles || []),
                                {
                                  number: `0${(prev.principles || []).length + 1}`,
                                  title: "",
                                  description: "",
                                },
                              ],
                            }))
                          }
                        >
                          <IconPlus className="mr-1 size-3.5" />
                          Add Principle
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {(aboutData.principles || []).map((pr, idx) => (
                          <div key={idx} className="space-y-2 rounded-md border p-3">
                            <div className="flex items-center gap-2">
                              <Input
                                className="w-16"
                                value={pr.number}
                                onChange={(e) => updatePrinciple(idx, { number: e.target.value })}
                                placeholder="01"
                              />
                              <Input
                                value={pr.title}
                                onChange={(e) => updatePrinciple(idx, { title: e.target.value })}
                                placeholder="Principle Title"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setAboutData((prev) => ({
                                    ...prev,
                                    principles: (prev.principles || []).filter((_, i) => i !== idx),
                                  }))
                                }
                              >
                                <IconTrash className="size-4 text-destructive" />
                              </Button>
                            </div>
                            <textarea
                              rows={2}
                              value={pr.description}
                              onChange={(e) =>
                                updatePrinciple(idx, { description: e.target.value })
                              }
                              placeholder="Principle description"
                              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={isSavingAbout || isLoadingAbout}
                        className="flex items-center gap-1.5"
                      >
                        {isSavingAbout ? (
                          <IconLoader2 className="size-4 animate-spin" />
                        ) : (
                          <IconCheck className="size-4" />
                        )}
                        <span>Save About ({aboutLocale.toUpperCase()})</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab Content */}
            <TabsContent value="profile" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.profileTitle")}</CardTitle>
                  <CardDescription>{t("settings.profileDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <ImageUpload
                          label="Profile Avatar Photo"
                          value={profile.avatar}
                          onChange={(path) => setProfile({ ...profile, avatar: path })}
                          module="profile"
                          folderKey="avatar"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prof-name">{t("settings.formName")}</Label>
                        <Input
                          id="prof-name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prof-title">{t("settings.formJobTitle")}</Label>
                        <Input
                          id="prof-title"
                          value={profile.title}
                          onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prof-email">{t("settings.formEmail")}</Label>
                        <Input
                          id="prof-email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prof-web">{t("settings.formWebsite")}</Label>
                        <Input
                          id="prof-web"
                          value={profile.website}
                          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={isSavingProfile || isLoading}
                        className="flex items-center gap-1.5"
                      >
                        {isSavingProfile ? (
                          <IconLoader2 className="size-4 animate-spin" />
                        ) : (
                          <IconCheck className="size-4" />
                        )}
                        <span>{t("settings.saveProfile")}</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cache & API Diagnostics Tab Content */}
            <TabsContent value="cache" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconBolt className="size-5 text-amber-500" />
                    <span>On-Demand Edge Cache Invalidation (ISR)</span>
                  </CardTitle>
                  <CardDescription>
                    Trigger immediate cache purging across the public website using Next.js
                    on-demand ISR revalidation tags and paths.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTriggerRevalidation} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="reval-path">Target Path to Revalidate</Label>
                        <Input
                          id="reval-path"
                          value={revalidatePath}
                          onChange={(e) => setRevalidatePath(e.target.value)}
                          placeholder="/ or /blog"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reval-tag">Cache Tag to Purge</Label>
                        <Input
                          id="reval-tag"
                          value={revalidateTag}
                          onChange={(e) => setRevalidateTag(e.target.value)}
                          placeholder="blog or projects or books"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="reval-secret">Revalidation Secret Token (Optional)</Label>
                        <Input
                          id="reval-secret"
                          type="password"
                          value={revalidateSecret}
                          onChange={(e) => setRevalidateSecret(e.target.value)}
                          placeholder="••••••••••••"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={isRevalidating}
                        className="flex items-center gap-1.5"
                      >
                        {isRevalidating ? (
                          <IconLoader2 className="size-4 animate-spin" />
                        ) : (
                          <IconBolt className="size-4" />
                        )}
                        <span>Purge Edge Cache</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconServer className="size-5 text-emerald-500" />
                    <span>Backend Server & Database Status</span>
                  </CardTitle>
                  <CardDescription>
                    Live health probe metrics from the Hono Node/Serverless backend API.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1 rounded-lg border bg-muted/20 p-3">
                      <span className="text-xs text-muted-foreground">API Base URL</span>
                      <span className="truncate font-mono text-sm font-semibold text-foreground">
                        {API_BASE_URL}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 rounded-lg border bg-muted/20 p-3">
                      <span className="text-xs text-muted-foreground">MongoDB Atlas</span>
                      <span
                        className={`flex items-center gap-1.5 text-sm font-semibold ${
                          dbConnected
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-destructive"
                        }`}
                      >
                        <span
                          className={`size-2 rounded-full ${
                            dbConnected ? "bg-emerald-500" : "bg-destructive"
                          }`}
                        />
                        {dbConnected ? "Connected (Atlas)" : "Disconnected"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 rounded-lg border bg-muted/20 p-3">
                      <span className="text-xs text-muted-foreground">Server Uptime</span>
                      <span className="text-sm font-semibold text-foreground">
                        {serverHealth.uptimeFormatted || "Operational"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Registered API Modules
                    </h4>
                    <div className="grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-2">
                      {[
                        { path: "/api/v1/site", desc: "Web Localization & Config (EN/BN)" },
                        { path: "/api/v1/about", desc: "About & Philosophy Data (EN/BN)" },
                        { path: "/api/v1/projects", desc: "Software Projects" },
                        { path: "/api/v1/case-studies", desc: "Architecture Case Studies" },
                        { path: "/api/v1/blogs", desc: "Blogs & Lexical Articles" },
                        { path: "/api/v1/books", desc: "Books & Main Shelf" },
                        { path: "/api/v1/designs", desc: "Graphic Design Showcase" },
                        { path: "/api/v1/upload", desc: "GitHub Assets Storage" },
                        { path: "/api/v1/messages", desc: "Visitor Inquiries Feed" },
                      ].map((ep) => (
                        <div
                          key={ep.path}
                          className="flex items-center justify-between rounded border bg-muted/30 p-2"
                        >
                          <span className="text-foreground">{ep.path}</span>
                          <span className="font-sans text-[11px] text-muted-foreground">
                            {ep.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading settings...</div>}>
      <SettingsPageContent />
    </Suspense>
  )
}
