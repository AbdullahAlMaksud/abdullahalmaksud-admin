"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";

interface InsertImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetModule?: string;
  folderKey?: string;
  onConfirm: (payload: { src: string; caption: string; altText: string }) => void;
}

/**
 * Reusable modal for inserting an inline image block with a caption and optional alt text.
 */
export function InsertImageDialog({
  open,
  onOpenChange,
  assetModule = "blog",
  folderKey = "misc",
  onConfirm,
}: InsertImageDialogProps) {
  const [imagePath, setImagePath] = useState("");
  const [caption, setCaption] = useState("");
  const [altText, setAltText] = useState("");

  useEffect(() => {
    if (open) {
      setImagePath("");
      setCaption("");
      setAltText("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!imagePath.trim()) return;
    onConfirm({
      src: imagePath.trim(),
      caption: caption.trim(),
      altText: altText.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Insert Inline Image
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Upload an image to GitHub Assets or choose an existing asset, then add a caption.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <ImageUpload
            label="Inline Asset"
            value={imagePath}
            onChange={setImagePath}
            module={assetModule}
            folderKey={folderKey}
          />

          <div className="space-y-1.5">
            <Label htmlFor="inline-image-caption" className="text-xs font-semibold">
              Caption
            </Label>
            <Input
              id="inline-image-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a descriptive caption shown beneath the image..."
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inline-image-alt" className="text-xs font-semibold">
              Alt Text (Optional)
            </Label>
            <Input
              id="inline-image-alt"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Accessibility description (defaults to caption)"
              className="h-8 text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={!imagePath.trim()}
          >
            Insert Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
