"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { getContactMessages } from "@/lib/api/dashboard"
import { InquiryMessage } from "@/lib/api/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  IconSearch,
  IconMail,
  IconMailOpened,
  IconSend,
  IconRefresh,
  IconLoader2,
  IconCalendar,
  IconUser,
} from "@tabler/icons-react"
import { useLocale } from "@/components/I18nProvider"

export function MessagesView() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [messages, setMessages] = useState<InquiryMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<InquiryMessage | null>(null)

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getContactMessages(locale)
      setMessages(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      console.warn("Could not load contact inquiries:", err)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [locale])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const filteredMessages = messages.filter((m) => {
    const q = searchQuery.toLowerCase()
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      {/* Controls: Search & Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t("messages.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-9 px-3 text-xs font-normal">
            {filteredMessages.length} {t("messages.totalMessages")}
          </Badge>

          <Button
            variant="outline"
            size="icon"
            onClick={loadMessages}
            className="size-9"
            title="Refresh"
          >
            <IconRefresh className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Messages Table */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>{t("messages.tableSender")}</TableHead>
              <TableHead>{t("messages.tableSubject")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t("messages.tableDate")}</TableHead>
              <TableHead className="text-right">{t("messages.tableActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <IconLoader2 className="size-4 animate-spin text-primary" />
                    <span>{t("common.loading")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <IconMail className="size-8 text-muted-foreground/40 mb-1" />
                    <p className="text-sm font-medium">{t("messages.noMessages")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("messages.subtitle")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMessages.map((msg) => (
                <TableRow
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className="hover:bg-muted/30 cursor-pointer"
                >
                  <TableCell className="pl-3 pr-0">
                    {msg.read ? (
                      <IconMailOpened className="size-4 text-muted-foreground/50" />
                    ) : (
                      <IconMail className="size-4 text-primary" />
                    )}
                  </TableCell>

                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground text-sm">
                        {msg.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {msg.email}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col max-w-[280px] sm:max-w-md">
                      <span className="text-sm font-medium truncate text-foreground">
                        {msg.subject || "No Subject"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {msg.message}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground whitespace-nowrap">
                    {msg.date || "Recent"}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMessage(msg)
                      }}
                      className="h-8 gap-1 text-xs"
                    >
                      <IconMailOpened className="size-3.5" />
                      <span>{t("messages.viewMessage")}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reader Dialog */}
      {selectedMessage && (
        <Dialog
          open={!!selectedMessage}
          onOpenChange={() => setSelectedMessage(null)}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-normal">
                  <IconCalendar className="size-3 mr-1" />
                  {selectedMessage.date || "Recent"}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold">
                {selectedMessage.subject || "No Subject"}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                  <IconUser className="size-4" />
                  <span>
                    <strong className="text-foreground">{selectedMessage.name}</strong>{" "}
                    &lt;{selectedMessage.email}&gt;
                  </span>
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 p-4 rounded-lg border bg-muted/20 text-sm leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
              {selectedMessage.message}
            </div>

            <DialogFooter className="flex justify-between items-center sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMessage(null)}
              >
                {t("common.cancel")}
              </Button>

              <Button size="sm" asChild className="gap-1.5">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject || "Inquiry"
                  )}`}
                >
                  <IconSend className="size-3.5" />
                  <span>{t("messages.replyEmail")}</span>
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
