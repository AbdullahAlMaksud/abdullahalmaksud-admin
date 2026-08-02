export interface BookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  isbn: string;
  publishedYear: number;
  salesCount: number;
  status: "Published" | "Draft" | "Archived";
  coverUrl?: string;
  description?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  status: "Completed" | "In Progress" | "Planned";
  featured: boolean;
  completionDate: string;
  description?: string;
}

export interface BlogItem {
  id: string;
  title: string;
  category: string;
  author: string;
  publishDate: string;
  readTime: string;
  views: number;
  status: "Published" | "Draft" | "Scheduled";
  tags: string[];
  excerpt: string;
}

export const initialBooks: BookItem[] = [
  {
    id: "bk-1",
    title: "ওয়েব ডেভেলপমেন্টের আধুনিক টেকনিক",
    author: "Abdullah Al Maksud",
    category: "Programming & Web",
    price: 450,
    isbn: "978-984-1234-56-1",
    publishedYear: 2025,
    salesCount: 1240,
    status: "Published",
    description: "Next.js, TypeScript এবং আধুনিক ওয়েব আর্কিটেকচার নিয়ে গাইডবুক।"
  },
  {
    id: "bk-2",
    title: "সফটওয়্যার আর্কিটেকচার ও ডিজাইন প্যাটার্নস",
    author: "Abdullah Al Maksud",
    category: "Software Engineering",
    price: 520,
    isbn: "978-984-9876-54-3",
    publishedYear: 2024,
    salesCount: 890,
    status: "Published",
    description: "স্কেলেবল ও মেইনটেইনেবল সফটওয়্যার তৈরির বিভিন্ন স্ট্র্যাটেজি।"
  },
  {
    id: "bk-3",
    title: "এআই অ্যান্ড মেশিন লার্নিং হ্যান্ডবুক",
    author: "Abdullah Al Maksud",
    category: "Artificial Intelligence",
    price: 600,
    isbn: "978-984-4567-89-0",
    publishedYear: 2026,
    salesCount: 310,
    status: "Published",
    description: "বাস্তব জীবনের এআই প্রজেক্ট ডেভেলপমেন্ট হ্যান্ডবুক।"
  },
  {
    id: "bk-4",
    title: "মাইক্রোসার্ভিস আর্কিটেকচার ইন প্র্যাকটিস",
    author: "Abdullah Al Maksud",
    category: "Cloud & DevOps",
    price: 480,
    isbn: "978-984-1122-33-4",
    publishedYear: 2026,
    salesCount: 0,
    status: "Draft",
    description: "ডকার, কুবারনেটিস এবং ইভেন্ট-ড্রিভেন আর্কিটেকচারের ওপর খসড়া বই।"
  }
];

export const initialProjects: ProjectItem[] = [
  {
    id: "proj-1",
    title: "BYOU E-Commerce Platform",
    category: "Web Application",
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js"],
    liveUrl: "https://byou-demo.com",
    githubUrl: "https://github.com/abdullahalmaksud/byou",
    status: "Completed",
    featured: true,
    completionDate: "2025-11-15",
    description: "Modern, high-performance multi-vendor e-commerce platform."
  },
  {
    id: "proj-2",
    title: "Smart Inventory & POS System",
    category: "Enterprise System",
    techStack: ["React", "Express", "PostgreSQL", "Prisma"],
    liveUrl: "https://smartpos.dev",
    githubUrl: "https://github.com/abdullahalmaksud/smart-pos",
    status: "Completed",
    featured: true,
    completionDate: "2025-08-20",
    description: "Real-time inventory management with barcode scanner integration."
  },
  {
    id: "proj-3",
    title: "AI Document Analyzer",
    category: "AI / ML",
    techStack: ["Python", "FastAPI", "OpenAI", "Next.js"],
    liveUrl: "https://aianalyzer.ai",
    githubUrl: "https://github.com/abdullahalmaksud/ai-doc-analyzer",
    status: "In Progress",
    featured: false,
    completionDate: "2026-09-01",
    description: "Extract insights, summaries, and search terms from large PDF documents."
  },
  {
    id: "proj-4",
    title: "Portfolio & Tech Portal",
    category: "Personal Brand",
    techStack: ["Next.js 16", "Tailwind CSS", "Shadcn UI"],
    liveUrl: "https://abdullahalmaksud.com",
    githubUrl: "https://github.com/abdullahalmaksud/portfolio",
    status: "Completed",
    featured: true,
    completionDate: "2026-01-10",
    description: "Personal web portfolio showcasing books, projects, and technical blogs."
  }
];

export const initialBlogs: BlogItem[] = [
  {
    id: "blog-1",
    title: "Next.js 16 এ সার্ভার অ্যাকশন ও ক্যাশিং অপটিমাইজেশন",
    category: "Web Development",
    author: "Abdullah Al Maksud",
    publishDate: "2026-07-28",
    readTime: "6 min read",
    views: 1420,
    status: "Published",
    tags: ["Next.js", "React", "Performance"],
    excerpt: "Next.js 16-এর নতুন ফিচার সার্ভার অ্যাকশন এবং ডায়নামিক ক্যাশিং ব্যবহার করে অ্যাপ্লিকেশন সুপারফাস্ট করার উপায়।"
  },
  {
    id: "blog-2",
    title: "লার্জ স্কেল অ্যাপ্লিকেশনে স্টেট ম্যানেজমেন্টের সেরা উপায়",
    category: "Frontend",
    author: "Abdullah Al Maksud",
    publishDate: "2026-06-15",
    readTime: "8 min read",
    views: 2150,
    status: "Published",
    tags: ["Redux", "Zustand", "React"],
    excerpt: "রেড্যাক্স কিট বা জুস্ট্যান্ড – বিশাল প্রজেক্টের জন্য কোনটি বেছে নেবেন?"
  },
  {
    id: "blog-3",
    title: "টাইপস্ক্রিপ্ট প্রফেশনাল গাইড: অ্যাডভান্সড টাইপ ও মেটাপ্রোগ্রামিং",
    category: "Programming",
    author: "Abdullah Al Maksud",
    publishDate: "2026-05-10",
    readTime: "10 min read",
    views: 3400,
    status: "Published",
    tags: ["TypeScript", "Best Practices"],
    excerpt: "গেনেরিক্স, মেপড টাইপস এবং কন্ডিশনাল টাইপসের বাস্তব প্রয়োগ।"
  },
  {
    id: "blog-4",
    title: "সফটওয়্যার আর্কিটেকচারে ক্লিন কোড ও সলিড প্রিন্সিপাল",
    category: "Architecture",
    author: "Abdullah Al Maksud",
    publishDate: "2026-08-10",
    readTime: "7 min read",
    views: 0,
    status: "Draft",
    tags: ["Clean Code", "Design Patterns"],
    excerpt: "মেইনটেনেবল কোড লেখার জন্য SOLID প্রিন্সিপালের প্র্যাকটিক্যাল গাইড।"
  }
];
