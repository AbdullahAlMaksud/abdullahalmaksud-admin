"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/components/dashboard-01/components/app-sidebar";
import { SiteHeader } from "@/components/dashboard-01/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BlogEditorForm } from "@/components/modules/blogs/blog-editor-form";
import { getBlogById } from "@/lib/api/blogs";
import { Blog } from "@/lib/api/types";
import { IconLoader2, IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditBlogPage() {
  const params = useParams();
  const blogId = params?.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!blogId) return;

    let isMounted = true;
    async function loadBlog() {
      try {
        setLoading(true);
        setError(null);
        const res = await getBlogById(blogId);
        if (isMounted) {
          if (res?.data) {
            setBlog(res.data);
          } else {
            setError("Blog post was not found on the server.");
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load blog post."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBlog();
    return () => {
      isMounted = false;
    };
  }, [blogId]);

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
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
              <IconLoader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading article and block content...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center max-w-md mx-auto">
              <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <IconAlertCircle className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  Could Not Load Article
                </h3>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
              <Link href="/dashboard/blogs">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <IconArrowLeft className="size-4" />
                  <span>Return to Articles</span>
                </Button>
              </Link>
            </div>
          ) : blog ? (
            <BlogEditorForm initialBlog={blog} mode="edit" />
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
