"use client";

import React from "react";
import { BlogEditorForm } from "@/components/modules/blogs/blog-editor-form";

export default function CreateBlogPage() {
  return (
    <div className="flex flex-1 min-w-0 flex-col">
      <BlogEditorForm mode="create" />
    </div>
  );
}
