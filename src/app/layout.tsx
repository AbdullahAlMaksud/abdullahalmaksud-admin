import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/components/I18nProvider";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const geistSans = localFont({
  src: "../../public/fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "../../public/fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const purno = localFont({
  src: [
    {
      path: "../../public/fonts/Purno Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Purno Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Purno Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Purno Bold-Italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-purno-face",
  display: "swap",
});

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
  icons: {
    icon: [
      { url: "/icons/brand-logo.svg", type: "image/svg+xml" },
      { url: "/icons/brand-logo.png", type: "image/png" },
    ],
    apple: "/icons/brand-logo.png",
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${purno.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
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
