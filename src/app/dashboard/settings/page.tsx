"use client"

import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { AppSidebar } from "@/components/dashboard-01/components/app-sidebar"
import { SiteHeader } from "@/components/dashboard-01/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconCheck, IconUser, IconSeo } from "@tabler/icons-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState({
    name: "Abdullah Al Maksud",
    title: "Senior Software Architect & Author",
    email: "contact@abdullahalmaksud.com",
    website: "https://abdullahalmaksud.com",
    github: "https://github.com/abdullahalmaksud",
    bio: "Full-stack developer, writer, and instructor specializing in Next.js, React, Node.js, and Software System Architecture.",
  })

  const [seo, setSeo] = useState({
    siteName: "Abdullah Al Maksud - Admin Portal",
    defaultTitle: "Abdullah Al Maksud | Official Portal",
    description: "Personal admin dashboard for managing books, portfolio projects, technical articles, and system settings.",
    keywords: "Abdullah Al Maksud, Software Architecture, Web Development, Books, Tech Articles, Portfolio",
    analyticsId: "G-ABDULLAH2026",
  })

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success(t("settings.profileSaved"))
  }

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success(t("settings.seoSaved"))
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

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-1.5">
                <IconUser className="size-4" />
                <span>{t("settings.profileTab")}</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-1.5">
                <IconSeo className="size-4" />
                <span>{t("settings.seoTab")}</span>
              </TabsTrigger>
            </TabsList>

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
