const RAW_ASSET_BASE_URL = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

export const ASSET_BASE_URL = RAW_ASSET_BASE_URL.replace(/\/+$/, "");

export const ASSET_MODULES = [
  { value: "book", label: "book (Books)" },
  { value: "blog", label: "blog (Blogs)" },
  { value: "project", label: "project (Projects)" },
  { value: "casestudy", label: "casestudy (Case Studies)" },
  { value: "design", label: "design (Designs)" },
  { value: "site", label: "site (Site Assets)" },
  { value: "profile", label: "profile (Profile)" },
  { value: "general", label: "general (General)" },
] as const;

const MODULE_ALIASES: Record<string, string> = {
  book: "book",
  books: "book",
  blog: "blog",
  blogs: "blog",
  project: "project",
  projects: "project",
  casestudy: "casestudy",
  "case-study": "casestudy",
  "case-studies": "casestudy",
  case_study: "casestudy",
  design: "design",
  designs: "design",
  site: "site",
  profile: "profile",
  general: "general",
};

export function sanitizeAssetKey(key?: string | null, fallback = "misc"): string {
  if (!key || !key.trim()) return fallback;
  const cleaned = key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || fallback;
}

export function normalizeAssetModule(moduleName?: string | null): string {
  const sanitized = sanitizeAssetKey(moduleName, "general");
  return MODULE_ALIASES[sanitized] || sanitized;
}

export function buildAssetDirectory(moduleName?: string | null, folderKey?: string | null): string {
  const mod = normalizeAssetModule(moduleName);
  const folder = sanitizeAssetKey(folderKey, "misc");
  return `images/${mod}/${folder}`;
}

export interface AssetFolderOption {
  module: string;
  folderKey: string;
  directory: string;
  count: number;
}

export interface ParsedAssetPath {
  module: string;
  folderKey: string;
  directory: string;
  filename: string;
}

export function parseAssetPath(pathname?: string | null): ParsedAssetPath {
  const clean = (pathname || "").replace(/^\/+/, "");
  const parts = clean.split("/").filter(Boolean);
  if (parts.length >= 4 && parts[0] === "images") {
    const mod = normalizeAssetModule(parts[1]);
    const folderKey = sanitizeAssetKey(parts[2], "misc");
    return {
      module: mod,
      folderKey,
      directory: `images/${mod}/${folderKey}`,
      filename: parts.slice(3).join("/"),
    };
  }

  return {
    module: "general",
    folderKey: "misc",
    directory: "images/general/misc",
    filename: parts[parts.length - 1] || clean,
  };
}

export function extractExistingAssetFolders(
  items: Array<{ pathname?: string }>,
): AssetFolderOption[] {
  const seen = new Map<string, AssetFolderOption>();
  for (const item of items) {
    if (!item.pathname) continue;
    const parsed = parseAssetPath(item.pathname);
    const existing = seen.get(parsed.directory);
    if (existing) {
      existing.count += 1;
    } else {
      seen.set(parsed.directory, {
        module: parsed.module,
        folderKey: parsed.folderKey,
        directory: parsed.directory,
        count: 1,
      });
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.directory.localeCompare(b.directory));
}

export function filterAssets<T extends { pathname?: string; url?: string }>(
  items: T[],
  options: { moduleFilter: string; folderFilter: string; searchQuery: string },
): T[] {
  const query = options.searchQuery.toLowerCase().trim();
  return items.filter((item) => {
    const parsed = parseAssetPath(item.pathname);
    if (options.moduleFilter !== "all" && parsed.module !== options.moduleFilter) {
      return false;
    }
    if (options.folderFilter !== "all" && parsed.directory !== options.folderFilter) {
      return false;
    }
    if (!query) return true;
    return (
      item.pathname?.toLowerCase().includes(query) ||
      item.url?.toLowerCase().includes(query)
    );
  });
}

/**
 * Resolves a stored asset value into a displayable URL.
 * - Local public files starting with "/" (e.g. "/images/portrait.png") are returned as-is.
 * - Relative repository paths (e.g. "images/blog/post/cover.webp") are prefixed with NEXT_PUBLIC_ASSET_BASE_URL.
 * - Full URLs / data URIs (e.g. OAuth avatars) are returned unchanged.
 */
export function resolveAssetUrl(path?: string | null): string {
  if (!path) return "";
  const trimmed = path.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/") || /^(?:https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  const cleanPath = trimmed.replace(/^(?:\.\/)+/, "").replace(/^\/+/, "");
  return ASSET_BASE_URL ? `${ASSET_BASE_URL}/${cleanPath}` : `/${cleanPath}`;
}
