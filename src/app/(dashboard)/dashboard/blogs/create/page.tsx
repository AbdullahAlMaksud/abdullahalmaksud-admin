"use client";

import React from "react";
import { AppSidebar } from "@/components/dashboard-01/components/app-sidebar";
import { SiteHeader } from "@/components/dashboard-01/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BlogEditorForm } from "@/components/modules/blogs/blog-editor-form";

export default function CreateBlogPage() {
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
        <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6">
          <BlogEditorForm mode="create" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
