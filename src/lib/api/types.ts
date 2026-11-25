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
  content: any;
  contentType?: "lexical" | "markdown" | "html";
  excerpt: string;
  cover?: string;
  coverImage: string;
  author?: any;
  tags: string[];
  category: string;
  readingTime?: string;
  isPublished?: boolean;
  published?: boolean;
  publishedAt?: string;
  featured?: boolean;
  featuredType?: "large" | "small" | "standard" | "";
  metaTitle?: string;
  metaDescription?: string;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CaseStudyResult {
  metric: string;
  value: string;
  description?: string;
}

export interface CaseStudy {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: any;
  contentType?: "lexical" | "markdown" | "html";
  coverImage?: string;
  screenshots?: string[];
  projectSlug?: string;
  tags?: string[];
  category: string;
  industry?: string;
  client?: string;
  challenge?: string;
  solution?: string;
  results?: CaseStudyResult[];
  stack: string[];
  duration?: string;
  readingTime?: string;
  featured?: boolean;
  isPublished?: boolean;
  publishedAt?: string;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
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

export type SupportedLocale = "en" | "bn";

export interface SiteLocaleData {
  id?: string;
  locale: SupportedLocale;
  meta: {
    siteName: string;
    defaultTitle: string;
    description: string;
    keywords: string;
    cvUrl: string;
  };
  nav: {
    home: string;
    about: string;
    work: string;
    blog: string;
    books: string;
    contact: string;
    downloadCv: string;
    backToHome: string;
    allWritings: string;
  };
  identity: {
    name: string;
    firstNameLine: string;
    lastNameLine: string;
    role: string;
    subRole: string;
    tagline: string;
    portraitUrl?: string;
  };
  metrics?: Array<{
    value: string;
    label: string;
    icon?: string;
  }>;
  marqueeItems?: string[];
  sections: {
    caseStudiesCategory: string;
    caseStudiesTitle: string;
    caseStudyModalLabel: string;
    projectsCategory: string;
    projectsTitle: string;
    projectModalLabel: string;
    writingsCategory: string;
    writingsTitle: string;
    writingModalLabel: string;
    bookLabel: string;
    viewBookDetails: string;
    viewAllWritings: string;
  };
  advisory: {
    badge: string;
    availability: string;
    category: string;
    headline: string;
    statement: string;
    pillars: Array<{
      number: string;
      title: string;
      description: string;
    }>;
    ctaEyebrow: string;
    ctaTitle: string;
    primaryCta: string;
    copyEmailCta: string;
    emailCopiedCta: string;
  };
  contact: {
    badge: string;
    headline: string;
    intro: string;
    responseTimeLabel: string;
    responseTimeValue: string;
    availabilityLabel: string;
    availabilityValue: string;
    emailLabel: string;
    email: string;
    copyLabel: string;
    copiedLabel: string;
    cvButtonLabel: string;
    formTitle: string;
    formSubtitle: string;
    modalTitle: string;
    modalSubtitle: string;
    topicLabel: string;
    quickSubjects: string[];
    nameLabel: string;
    namePlaceholder: string;
    emailFieldLabel: string;
    emailPlaceholder: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitButton: string;
    sendingButton: string;
    poweredBy: string;
    successTitle: string;
    successMessage: string;
    sendAnotherButton: string;
    closeButton: string;
  };
  footer: {
    copyright: string;
    rights: string;
    socials: Array<{
      label: string;
      url: string;
      isExternal: boolean;
    }>;
  };
  ui: {
    blogTitle: string;
    blogSubtitle: string;
    searchPlaceholder: string;
    sortLabel: string;
    sortNewest: string;
    sortOldest: string;
    sortReadTime: string;
    sortTitle: string;
    emptyBlogsTitle: string;
    emptyBlogsSubtitle: string;
    clearSearch: string;
    writtenByLabel: string;
    authorName: string;
    contactAuthor: string;
    bookSpecLabel: string;
    bookAuthorLabel: string;
    bookPublisherLabel: string;
    bookYearLabel: string;
    bookLanguageLabel: string;
    bookPagesLabel: string;
    bookIsbnLabel: string;
    bookSynopsisLabel: string;
    bookThemesLabel: string;
    bookQuotesLabel: string;
    bookChaptersLabel: string;
    bookAuthorNoteLabel: string;
    bookNotFoundTitle: string;
    bookNotFoundSubtitle: string;
    stackLabel: string;
    metricsLabel: string;
    errorTitle: string;
    errorDescription: string;
    retryButton: string;
  };
}

export interface AboutPillar {
  id: string;
  tag: string;
  title: string;
  subtitle?: string;
  icon: string;
  description: string;
  skills: string[];
}

export interface AboutPrinciple {
  number: string;
  title: string;
  description: string;
}

export interface AboutData {
  locale?: SupportedLocale;
  header: {
    badge: string;
    name?: string;
    role?: string;
    headline: string;
    intro: string;
    bioSecondary?: string;
    signature: string;
    experienceYears: string;
    cvUrl?: string;
  };
  pillars: AboutPillar[];
  principles?: AboutPrinciple[];
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
