"use client"

import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { AppSidebar } from "@/components/dashboard-01/components/app-sidebar"
import { SiteHeader } from "@/components/dashboard-01/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/ui/image-upload"
import { getHomeData, updateHomeData, getAboutData, updateAboutData } from "@/lib/api/site"
import {
  IconCheck,
  IconUser,
  IconSeo,
  IconHome,
  IconInfoCircle,
  IconLoader2,
} from "@tabler/icons-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { t } = useTranslation()

  // Tab: Profile
  const [profile, setProfile] = useState({
    name: "Abdullah Al Maksud",
    title: "Senior Software Architect & Author",
    email: "contact@abdullahalmaksud.com",
    website: "https://abdullahalmaksud.com",
    github: "https://github.com/abdullahalmaksud",
    bio: "Full-stack developer, writer, and instructor specializing in Next.js, React, Node.js, and Software System Architecture.",
  })

  // Tab: Dynamic Home Content
  const [home, setHome] = useState({
    greeting: "Hello, I'm",
    firstName: "Maksud",
    subtitlePrefix: "I build digital experiences that are ",
    subtitleHighlight: "fast, clean & meaningful.",
    exploreText: "EXPLORE MY WORLD",
    portraitImage: "/images/portrait.png",
    quoteText: "Code is like humor. When you have to explain it, it's bad.",
    quoteAuthor: "Cory House",
    quoteAuthorTitle: "Software Architect",
  })

  // Tab: Dynamic About Content
  const [about, setAbout] = useState({
    badge: "ABOUT ME",
    headline: "Curious mind. Creative soul. Code in hand.",
    intro: "Hello! I'm Abdullah Al Maksud, a software engineer and author dedicated to building resilient distributed systems and crafting delightful user interfaces.",
    signature: "Maksud",
    experienceYears: "5+ Years Experience",
  })

  // Tab: SEO
  const [seo, setSeo] = useState({
    siteName: "Abdullah Al Maksud - Official Portal",
    defaultTitle: "Abdullah Al Maksud | Software Architect & Author",
    description: "Personal admin dashboard for managing books, portfolio projects, technical articles, and graphic designs.",
    keywords: "Abdullah Al Maksud, Software Architecture, Next.js, Books, Tech Articles, Portfolio",
    analyticsId: "G-ABDULLAH2026",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSavingHome, setIsSavingHome] = useState(false)
  const [isSavingAbout, setIsSavingAbout] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [homeRes, aboutRes] = await Promise.allSettled([
          getHomeData(),
          getAboutData(),
        ])

        if (homeRes.status === "fulfilled" && homeRes.value) {
          const h = homeRes.value
          setHome((prev) => ({
            ...prev,
            greeting: h.hero?.greeting || prev.greeting,
            firstName: h.hero?.firstName || prev.firstName,
            subtitlePrefix: h.hero?.subtitlePrefix || prev.subtitlePrefix,
            subtitleHighlight: h.hero?.subtitleHighlight || prev.subtitleHighlight,
            exploreText: h.hero?.exploreText || prev.exploreText,
            portraitImage: h.hero?.portraitImage || prev.portraitImage,
            quoteText: h.quote?.text || prev.quoteText,
            quoteAuthor: h.quote?.author || prev.quoteAuthor,
            quoteAuthorTitle: h.quote?.authorTitle || prev.quoteAuthorTitle,
          }))
        }

        if (aboutRes.status === "fulfilled" && aboutRes.value) {
          const a = aboutRes.value
          setAbout((prev) => ({
            ...prev,
            badge: a.header?.badge || prev.badge,
            headline: a.header?.headline || prev.headline,
            intro: a.header?.intro || prev.intro,
            signature: a.header?.signature || prev.signature,
            experienceYears: a.header?.experienceYears || prev.experienceYears,
          }))
        }
      } catch (error: unknown) {
        console.error("Failed to load initial site settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success(t("settings.profileSaved") || "Profile settings saved successfully.")
  }

  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSavingHome(true)
      await updateHomeData({
        hero: {
          greeting: home.greeting,
          firstName: home.firstName,
          subtitlePrefix: home.subtitlePrefix,
          subtitleHighlight: home.subtitleHighlight,
          exploreText: home.exploreText,
          portraitImage: home.portraitImage,
          portraitAlt: `${home.greeting} ${home.firstName}`,
        },
        quote: {
          text: home.quoteText,
          author: home.quoteAuthor,
          authorTitle: home.quoteAuthorTitle,
        },
      })
      toast.success("Home page content updated live on server!")
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to update home content"
      toast.error(errMsg)
    } finally {
      setIsSavingHome(false)
    }
  }

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSavingAbout(true)
      await updateAboutData({
        header: {
          badge: about.badge,
          headline: about.headline,
          intro: about.intro,
          signature: about.signature,
          experienceYears: about.experienceYears,
        },
      })
      toast.success("About page content updated live on server!")
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to update about content"
      toast.error(errMsg)
    } finally {
      setIsSavingAbout(false)
    }
  }

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success(t("settings.seoSaved") || "SEO settings saved successfully.")
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6 max-w-5xl">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("settings.subtitle")}
            </p>
          </div>

          <Tabs defaultValue="home" className="w-full">
            <TabsList className="grid w-full sm:w-[560px] grid-cols-4">
              <TabsTrigger value="home" className="flex items-center gap-1.5 text-xs">
                <IconHome className="size-3.5" />
                <span>Home Page</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-1.5 text-xs">
                <IconInfoCircle className="size-3.5" />
                <span>About Page</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs">
                <IconUser className="size-3.5" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-1.5 text-xs">
                <IconSeo className="size-3.5" />
                <span>SEO</span>
              </TabsTrigger>
            </TabsList>

            {/* Dynamic Home Page Content Tab */}
            <TabsContent value="home" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dynamic Home Page Content</CardTitle>
                  <CardDescription>
                    Configure the Hero greeting, highlighted taglines, author portrait, and inspiring quote shown on the home page.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveHome} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="home-greeting">Greeting Prefix</Label>
                        <Input
                          id="home-greeting"
                          value={home.greeting}
                          onChange={(e) => setHome({ ...home, greeting: e.target.value })}
                          placeholder="Hello, I'm"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="home-name">Hero First Name / Display Name</Label>
                        <Input
                          id="home-name"
                          value={home.firstName}
                          onChange={(e) => setHome({ ...home, firstName: e.target.value })}
                          placeholder="Maksud"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="home-subtitle-prefix">Subtitle Prefix</Label>
                        <Input
                          id="home-subtitle-prefix"
                          value={home.subtitlePrefix}
                          onChange={(e) => setHome({ ...home, subtitlePrefix: e.target.value })}
                          placeholder="I build digital experiences that are"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="home-subtitle-highlight">Subtitle Highlight / Tagline</Label>
                        <Input
                          id="home-subtitle-highlight"
                          value={home.subtitleHighlight}
                          onChange={(e) => setHome({ ...home, subtitleHighlight: e.target.value })}
                          placeholder="fast, clean & meaningful."
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="home-explore">Explore Button CTA</Label>
                        <Input
                          id="home-explore"
                          value={home.exploreText}
                          onChange={(e) => setHome({ ...home, exploreText: e.target.value })}
                          placeholder="EXPLORE MY WORLD"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <ImageUpload
                          label="Author Portrait Image"
                          value={home.portraitImage}
                          onChange={(url) => setHome({ ...home, portraitImage: url })}
                          placeholder="/images/portrait.png"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2 border-t pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Inspirational Quote Section
                        </h4>
                        <Label htmlFor="quote-text">Quote Text</Label>
                        <Input
                          id="quote-text"
                          value={home.quoteText}
                          onChange={(e) => setHome({ ...home, quoteText: e.target.value })}
                          placeholder="Code is like humor. When you have to explain it, it's bad."
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quote-author">Quote Author</Label>
                        <Input
                          id="quote-author"
                          value={home.quoteAuthor}
                          onChange={(e) => setHome({ ...home, quoteAuthor: e.target.value })}
                          placeholder="Cory House"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quote-author-title">Author Subtitle / Role</Label>
                        <Input
                          id="quote-author-title"
                          value={home.quoteAuthorTitle}
                          onChange={(e) => setHome({ ...home, quoteAuthorTitle: e.target.value })}
                          placeholder="Software Architect"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button type="submit" disabled={isSavingHome || isLoading} className="flex items-center gap-1.5">
                        {isSavingHome ? (
                          <IconLoader2 className="size-4 animate-spin" />
                        ) : (
                          <IconCheck className="size-4" />
                        )}
                        <span>Save Home Content</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dynamic About Page Content Tab */}
            <TabsContent value="about" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dynamic About Page Content</CardTitle>
                  <CardDescription>
                    Manage the About header badge, headline, introductory story, experience badges, and signature.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveAbout} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="about-badge">Header Badge Text</Label>
                        <Input
                          id="about-badge"
                          value={about.badge}
                          onChange={(e) => setAbout({ ...about, badge: e.target.value })}
                          placeholder="ABOUT ME"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="about-exp">Experience Highlight</Label>
                        <Input
                          id="about-exp"
                          value={about.experienceYears}
                          onChange={(e) => setAbout({ ...about, experienceYears: e.target.value })}
                          placeholder="5+ Years Experience"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="about-headline">Main Headline</Label>
                        <Input
                          id="about-headline"
                          value={about.headline}
                          onChange={(e) => setAbout({ ...about, headline: e.target.value })}
                          placeholder="Curious mind. Creative soul. Code in hand."
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="about-intro">Intro Story / Biography</Label>
                        <textarea
                          id="about-intro"
                          value={about.intro}
                          onChange={(e) => setAbout({ ...about, intro: e.target.value })}
                          rows={4}
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Hello! I'm Abdullah Al Maksud..."
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="about-sig">Signature Text</Label>
                        <Input
                          id="about-sig"
                          value={about.signature}
                          onChange={(e) => setAbout({ ...about, signature: e.target.value })}
                          placeholder="Maksud"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button type="submit" disabled={isSavingAbout || isLoading} className="flex items-center gap-1.5">
                        {isSavingAbout ? (
                          <IconLoader2 className="size-4 animate-spin" />
                        ) : (
                          <IconCheck className="size-4" />
                        )}
                        <span>Save About Content</span>
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
                  <CardDescription>
                    {t("settings.profileDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="prof-github">{t("settings.formGithub")}</Label>
                        <Input
                          id="prof-github"
                          value={profile.github}
                          onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="prof-bio">{t("settings.formBio")}</Label>
                        <Input
                          id="prof-bio"
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button type="submit" className="flex items-center gap-1.5">
                        <IconCheck className="size-4" />
                        <span>{t("settings.saveProfile")}</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab Content */}
            <TabsContent value="seo" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.seoTitle")}</CardTitle>
                  <CardDescription>
                    {t("settings.seoDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSeo} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="site-name">{t("settings.formSiteName")}</Label>
                        <Input
                          id="site-name"
                          value={seo.siteName}
                          onChange={(e) => setSeo({ ...seo, siteName: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="def-title">{t("settings.formDefaultTitle")}</Label>
                        <Input
                          id="def-title"
                          value={seo.defaultTitle}
                          onChange={(e) => setSeo({ ...seo, defaultTitle: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="seo-desc">{t("settings.formMetaDesc")}</Label>
                        <Input
                          id="seo-desc"
                          value={seo.description}
                          onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="seo-keywords">{t("settings.formKeywords")}</Label>
                        <Input
                          id="seo-keywords"
                          value={seo.keywords}
                          onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ga-id">{t("settings.formAnalyticsId")}</Label>
                        <Input
                          id="ga-id"
                          value={seo.analyticsId}
                          onChange={(e) => setSeo({ ...seo, analyticsId: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button type="submit" className="flex items-center gap-1.5">
                        <IconCheck className="size-4" />
                        <span>{t("settings.saveSeo")}</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
