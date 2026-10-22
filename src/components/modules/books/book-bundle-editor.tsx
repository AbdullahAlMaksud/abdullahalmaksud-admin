"use client"

import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { getBookBundle, updateBookBundle } from "@/lib/api/books"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  IconBook,
  IconCheck,
  IconLoader2,
  IconPlus,
  IconTrash,
  IconChartBar,
} from "@tabler/icons-react"
import { toast } from "sonner"

export function BookBundleEditor() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Featured Book state
  const [featuredBook, setFeaturedBook] = useState({
    titleBn: "এমন যদি হতো",
    titleEn: "Emon Jodi Hoto",
    author: "আব্দুল্লাহ আল মাকসুদ",
    publisher: "জ্ঞানকোষ প্রকাশনী",
    category: "বিজ্ঞান ও প্রযুক্তি",
    price: 344,
    rokomariUrl: "https://www.rokomari.com/book/454540/emon-jodi-hoto",
    coverImage: "/images/books/emon-jodi-hoto.webp",
    year: 2025,
    description: "",
  })

  // Stats state
  const [stats, setStats] = useState<Array<{ value: string; label: string; icon: string }>>([
    { value: "৫+", label: "প্রকাশিত বই", icon: "BookOpen" },
    { value: "১০k+", label: "পাঠক সংখ্যা", icon: "Users" },
    { value: "৪.৮", label: "গড় রেটিং", icon: "Star" },
  ])

  useEffect(() => {
    async function loadBundle() {
      try {
        setLoading(true)
        const res = await getBookBundle()
        if (res?.data) {
          const b = res.data as any
          if (b.book) {
            setFeaturedBook({
              titleBn: b.book.titleBn || b.book.title || "এমন যদি হতো",
              titleEn: b.book.titleEn || "Emon Jodi Hoto",
              author: b.book.author || "আব্দুল্লাহ আল মাকসুদ",
              publisher: b.book.publisher || b.book.specs?.publisher || "জ্ঞানকোষ প্রকাশনী",
              category: b.book.category || "বিজ্ঞান ও প্রযুক্তি",
              price: Number(b.book.price) || 344,
              rokomariUrl: b.book.rokomariUrl || "",
              coverImage: b.book.coverImage || b.book.cover || "",
              year: b.book.year || 2025,
              description: Array.isArray(b.book.description)
                ? b.book.description.join("\n")
                : b.book.description || "",
            })
          }
          if (b.stats && Array.isArray(b.stats)) {
            setStats(b.stats)
          }
        }
      } catch (err: unknown) {
        console.warn("Could not load book bundle:", err)
      } finally {
        setLoading(false)
      }
    }

    loadBundle()
  }, [])

  const handleAddStat = () => {
    setStats([...stats, { value: "", label: "", icon: "Star" }])
  }

  const handleRemoveStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index))
  }

  const handleStatChange = (
    index: number,
    field: "value" | "label" | "icon",
    val: string
  ) => {
    const updated = [...stats]
    updated[index] = { ...updated[index], [field]: val }
    setStats(updated)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateBookBundle({
        book: {
          title: featuredBook.titleBn,
          tagline: featuredBook.titleEn,
          description: featuredBook.description.split("\n").filter(Boolean),
          specs: {
            publisher: featuredBook.publisher,
            pages: 128,
            edition: "১ম প্রকাশ",
            language: "বাংলা",
            price: `৳${featuredBook.price}`,
          },
          rokomariUrl: featuredBook.rokomariUrl,
          coverImage: featuredBook.coverImage,
        },
        stats,
      } as any)
      toast.success("Main Book Bundle & Reader Stats saved live on server!")
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update book bundle"
      toast.error(errMsg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-muted-foreground gap-2">
        <IconLoader2 className="size-5 animate-spin text-primary" />
        <span className="text-sm">{t("common.loading")}</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Featured Book Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <IconBook className="size-5 text-blue-500" />
            <span>Featured Highlighted Book (Hero Monograph)</span>
          </CardTitle>
          <CardDescription>
            Configure the primary book showcased with full cover mockup, Rokomari distributor links, and pricing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fb-title-bn">Title (Bengali)</Label>
              <Input
                id="fb-title-bn"
                value={featuredBook.titleBn}
                onChange={(e) =>
                  setFeaturedBook({ ...featuredBook, titleBn: e.target.value })
                }
                placeholder="যেমন: এমন যদি হতো"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fb-title-en">Title (English / Romanized)</Label>
              <Input
                id="fb-title-en"
                value={featuredBook.titleEn}
                onChange={(e) =>
                  setFeaturedBook({ ...featuredBook, titleEn: e.target.value })
                }
                placeholder="e.g. Emon Jodi Hoto"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fb-author">Author Name</Label>
              <Input
                id="fb-author"
                value={featuredBook.author}
                onChange={(e) =>
                  setFeaturedBook({ ...featuredBook, author: e.target.value })
                }
                placeholder="আব্দুল্লাহ আল মাকসুদ"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fb-publisher">Publisher</Label>
              <Input
                id="fb-publisher"
                value={featuredBook.publisher}
                onChange={(e) =>
                  setFeaturedBook({ ...featuredBook, publisher: e.target.value })
                }
                placeholder="জ্ঞানকোষ প্রকাশনী"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fb-category">Category / Genre</Label>
              <Input
                id="fb-category"
                value={featuredBook.category}
                onChange={(e) =>
                  setFeaturedBook({ ...featuredBook, category: e.target.value })
                }
                placeholder="বিজ্ঞান ও প্রযুক্তি"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fb-price">Price (৳)</Label>
              <Input
                id="fb-price"
                type="number"
                value={featuredBook.price}
                onChange={(e) =>
                  setFeaturedBook({
                    ...featuredBook,
                    price: Number(e.target.value),
                  })
                }
                placeholder="344"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="fb-rokomari">Rokomari / Purchase URL</Label>
              <Input
                id="fb-rokomari"
                value={featuredBook.rokomariUrl}
                onChange={(e) =>
                  setFeaturedBook({ ...featuredBook, rokomariUrl: e.target.value })
                }
                placeholder="https://www.rokomari.com/book/..."
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUpload
                label="Book Cover Artwork"
                value={featuredBook.coverImage}
                onChange={(url) =>
                  setFeaturedBook({ ...featuredBook, coverImage: url })
                }
                placeholder="/images/books/emon-jodi-hoto.webp"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="fb-desc">Short Synopsis / Overview</Label>
              <textarea
                id="fb-desc"
                rows={3}
                value={featuredBook.description}
                onChange={(e) =>
                  setFeaturedBook({ ...featuredBook, description: e.target.value })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="বইটির সংক্ষিপ্ত সারাংশ লিখুন..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reader Statistics Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <IconChartBar className="size-5 text-amber-500" />
              <span>Reader Statistics & Impact Badges</span>
            </CardTitle>
            <CardDescription>
              Statistics displayed in the book showcase header (e.g. copies distributed, reader ratings).
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddStat}
            className="gap-1 text-xs"
          >
            <IconPlus className="size-3.5" />
            <span>Add Stat</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-lg border bg-muted/20 items-center"
            >
              <div className="sm:col-span-4">
                <Label className="text-xs text-muted-foreground mb-1 block">Value</Label>
                <Input
                  value={stat.value}
                  onChange={(e) => handleStatChange(idx, "value", e.target.value)}
                  placeholder="৫+ or ১০k+"
                  className="h-8 text-xs font-semibold"
                />
              </div>
              <div className="sm:col-span-5">
                <Label className="text-xs text-muted-foreground mb-1 block">Label</Label>
                <Input
                  value={stat.label}
                  onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                  placeholder="প্রকাশিত বই"
                  className="h-8 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground mb-1 block">Icon</Label>
                <Input
                  value={stat.icon}
                  onChange={(e) => handleStatChange(idx, "icon", e.target.value)}
                  placeholder="BookOpen"
                  className="h-8 text-xs"
                />
              </div>
              <div className="sm:col-span-1 flex justify-end pt-5 sm:pt-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveStat(idx)}
                  className="size-8 text-muted-foreground hover:text-destructive"
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconCheck className="size-4" />
          )}
          <span>Save Book Bundle Settings</span>
        </Button>
      </div>
    </form>
  )
}
