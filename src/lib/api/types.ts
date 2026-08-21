export interface CoreFeature {
  icon: string;
  text: string;
  desc: string;
}

export interface Project {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  image?: string;
  logo: string;
  stack: string[];
  gitRepo: string;
  repo?: string;
  liveLink: string;
  demo?: string;
  categories: string[];
  category?: string;
  tag: string;
  year?: string;
  status: "live" | "case-study" | "prototype" | "archived";
  isFeatured: boolean;
  featured?: boolean;
  isArchived?: boolean;
  coreFeatures: CoreFeature[];
  createdAt?: string;
  lastUpdate?: string;
  updatedAt?: string;
}

export interface BlogContentBlock {
  type: "paragraph" | "heading" | "quote" | "code" | "list" | "image";
  text?: string;
  level?: number;
  items?: string[];
  code?: string;
  language?: string;
  url?: string;
  caption?: string;
}

export interface Blog {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  content: string | BlogContentBlock[];
  excerpt: string;
  coverImage: string;
  author?: string;
  tags: string[];
  category: string;
  readingTime?: string;
  isPublished?: boolean;
  published?: boolean;
  publishedAt?: string;
  featured?: boolean;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Book {
  id?: string;
  _id?: string;
  title: string;
  author: string;
  coverImage: string;
  category?: string;
  genre?: string;
  price?: number;
  year?: number | string;
  rating?: number;
  readDate?: string;
  reviewText?: string;
  rokomariUrl?: string;
  purchaseLink?: string;
  slug?: string;
  description?: string;
  tags?: string[];
  isRecommended?: boolean;
  status?: "published" | "draft";
  createdAt?: string;
  updatedAt?: string;
}

export interface BookBundle {
  book: {
    title: string;
    tagline: string;
    description: string[];
    specs: {
      publisher: string;
      pages: number;
      edition: string;
      language: string;
      price: string;
    };
    rokomariUrl: string;
    coverImage: string;
    previewUrl?: string;
  };
  stats: Array<{ value: string; label: string; icon: string }>;
  books: Book[];
}

export interface Design {
  id?: string;
  _id?: string;
  title: string;
  subtitle?: string;
  description: string;
  coverImage: string;
  tools: string[];
  year: number | string;
  category: string;
  isFeatured?: boolean;
  featured?: boolean;
  behanceUrl?: string;
  dribbbleUrl?: string;
  client?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeData {
  hero: {
    greeting: string;
    firstName: string;
    subtitlePrefix: string;
    subtitleHighlight: string;
    exploreText: string;
    portraitImage: string;
    portraitAlt: string;
  };
  about: {
    badge: string;
    headlineLines: string[];
    signature: string;
    infoBadges: Array<{ text: string; icon: string }>;
  };
  featuredProjects?: Project[];
  books?: Book[];
  quote?: {
    text: string;
    author: string;
    authorTitle: string;
  };
  graphicDesign?: Design[];
  contact?: {
    email: string;
    location: string;
    availability: string;
  };
}

export interface AboutPillar {
  id: string;
  tag: string;
  title: string;
  icon: string;
  description: string;
  skills: string[];
}

export interface AboutData {
  header: {
    badge: string;
    headline: string;
    intro: string;
    signature: string;
    experienceYears: string;
  };
  pillars: AboutPillar[];
  experience?: Array<{
    period: string;
    role: string;
    company: string;
    desc: string;
  }>;
  education?: Array<{
    period: string;
    degree: string;
    institution: string;
  }>;
  skillsCategories?: Array<{
    category: string;
    skills: string[];
  }>;
}

export interface DashboardMetrics {
  totalProjects: number;
  totalBlogs: number;
  totalBooks: number;
  totalDesigns: number;
  totalViews: number;
  unreadMessages?: number;
  notificationsCount?: number;
}

export interface InquiryMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "info" | "warning" | "success";
  read: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  url?: string;
  token?: string;
  session?: Session;
  user?: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  image?: string;
  createdAt?: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  token?: string;
}

export interface AuthSessionData {
  user: User;
  session: Session;
  token?: string;
}
