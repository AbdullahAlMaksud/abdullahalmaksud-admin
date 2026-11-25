"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  COMMAND_PRIORITY_HIGH,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
} from "lexical";

/**
 * Registers reliable keyboard shortcuts for inline text formatting (Bold, Italic, Underline)
 * matching both `event.code` (KeyB/KeyI/KeyU) and `event.key` so shortcuts work seamlessly
 * across Windows/macOS and both English & Bangla keyboard layouts.
 */
export function KeyboardShortcutsPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<KeyboardEvent>(
      KEY_DOWN_COMMAND,
      (event) => {
        const isModifier = event.ctrlKey || event.metaKey;
        if (!isModifier || event.altKey || event.shiftKey) {
          return false;
        }

        const code = event.code;
        const key = event.key.toLowerCase();

        if (code === "KeyB" || key === "b") {
          event.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          return true;
        }

        if (code === "KeyI" || key === "i") {
          event.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          return true;
        }

        if (code === "KeyU" || key === "u") {
          event.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}
