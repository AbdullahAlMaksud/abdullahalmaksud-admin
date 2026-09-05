"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconCopy, IconCheck, IconBraces, IconList } from "@tabler/icons-react";
import { toast } from "sonner";
import type { BlogBlock } from "./block-types";

interface BlockInspectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blocks: BlogBlock[];
}

export function BlockInspectorDialog({
  open,
  onOpenChange,
  blocks,
}: BlockInspectorDialogProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(blocks, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success("Block JSON copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy JSON");
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "heading":
        return "bg-blue-500/15 text-blue-500 border-blue-500/30";
      case "paragraph":
        return "bg-slate-500/15 text-slate-400 border-slate-500/30";
      case "quote":
        return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "code":
        return "bg-purple-500/15 text-purple-500 border-purple-500/30";
      case "list":
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
      case "divider":
        return "bg-rose-500/15 text-rose-500 border-rose-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <IconBraces className="size-5 text-primary" />
              <DialogTitle className="text-base font-semibold">
                Database Block Structure
              </DialogTitle>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {blocks.length} {blocks.length === 1 ? "Block" : "Blocks"}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            This live inspector shows how Lexical content is structured into discrete blocks before saving to MongoDB.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="structured" className="flex-1 flex flex-col min-h-0 pt-2">
          <div className="flex items-center justify-between pb-3">
            <TabsList className="h-8">
              <TabsTrigger value="structured" className="text-xs gap-1.5 px-3 h-7">
                <IconList className="size-3.5" />
                <span>Visual Blocks</span>
              </TabsTrigger>
              <TabsTrigger value="raw" className="text-xs gap-1.5 px-3 h-7">
                <IconBraces className="size-3.5" />
                <span>Raw JSON</span>
              </TabsTrigger>
            </TabsList>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8 gap-1.5 text-xs font-mono"
            >
              {copied ? (
                <>
                  <IconCheck className="size-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <IconCopy className="size-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </Button>
          </div>

          <TabsContent value="structured" className="flex-1 overflow-y-auto space-y-2 pr-1 m-0">
            {blocks.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No blocks created yet. Start typing in the editor!
              </div>
            ) : (
              blocks.map((block, idx) => (
                <div
                  key={block.id || idx}
                  className="p-3 rounded-lg border border-border bg-card/60 hover:bg-card transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <Badge className={`text-[10px] font-mono capitalize px-1.5 py-0 ${getBadgeColor(block.type)}`}>
                        {block.type}
                        {block.type === "heading" && ` (H${block.data?.level || 2})`}
                        {block.type === "code" && ` (${block.data?.language || "ts"})`}
                        {block.type === "list" && ` (${block.data?.listType})`}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {block.id}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-foreground/90 bg-muted/40 p-2 rounded border border-border/50 break-words whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {block.type === "code" && block.data?.code}
                    {block.type === "list" && (block.data?.items || []).join("\n• ")}
                    {block.type !== "code" && block.type !== "list" && (block.data?.text || block.data?.markdown || "—")}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="raw" className="flex-1 overflow-y-auto m-0">
            <pre className="p-4 rounded-lg bg-muted/60 border border-border text-xs font-mono text-foreground overflow-x-auto leading-relaxed">
              {jsonString}
            </pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
