import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/components/I18nProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Abdullah Al Maksud - Admin Portal",
    template: "%s | Abdullah Al Maksud",
  },
  description:
    "Official Admin Control Panel for Abdullah Al Maksud - Managing Books, Projects, Blogs, and Portfolio content.",
  keywords: [
    "Abdullah Al Maksud",
    "Admin Portal",
    "Dashboard",
    "Book Management",
    "Project Management",
    "Blog Management",
    "Portfolio Admin",
  ],
  authors: [{ name: "Abdullah Al Maksud" }],
  creator: "Abdullah Al Maksud",
  openGraph: {
    title: "Abdullah Al Maksud - Admin Portal",
    description:
      "Control panel for managing books, projects, articles, and settings.",
    type: "website",
    locale: "en_US",
    siteName: "Abdullah Al Maksud Admin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abdullah Al Maksud - Admin Portal",
    description:
      "Control panel for managing books, projects, articles, and settings.",
  },
};

import { AuthProvider } from "@/components/auth/auth-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-purno">
        <AuthProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
