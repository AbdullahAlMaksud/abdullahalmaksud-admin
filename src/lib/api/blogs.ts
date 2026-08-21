import { apiClient } from "./client";
import { Blog, PaginatedResponse, ApiResponse } from "./types";

export async function getBlogs(params?: {
  page?: number;
  limit?: number;
  published?: boolean;
  category?: string;
  featured?: boolean;
}): Promise<PaginatedResponse<Blog>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.published !== undefined)
    query.set("published", params.published.toString());
  if (params?.category) query.set("category", params.category);
  if (params?.featured !== undefined)
    query.set("featured", params.featured.toString());

  const queryString = query.toString();
  const res = await apiClient.get<PaginatedResponse<Blog> | Blog[]>(
    `/api/v1/blogs${queryString ? `?${queryString}` : ""}`
  );

  if (res && "data" in res && Array.isArray(res.data)) {
    return res;
  }
  if (Array.isArray(res)) {
    return {
      success: true,
      data: res,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || res.length,
        total: res.length,
        totalPages: 1,
      },
    };
  }

  return {
    success: true,
    data: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

export async function getBlogBySlug(slug: string): Promise<ApiResponse<Blog>> {
  return apiClient.get<ApiResponse<Blog>>(`/api/v1/blogs/${slug}`);
}

export async function createBlog(
  data: Omit<Blog, "id" | "createdAt" | "updatedAt">
): Promise<ApiResponse<Blog>> {
  return apiClient.post<ApiResponse<Blog>>("/api/v1/blogs", data);
}

export async function updateBlog(
  id: string,
  data: Partial<Blog>
): Promise<ApiResponse<Blog>> {
  return apiClient.put<ApiResponse<Blog>>(`/api/v1/blogs/${id}`, data);
}

export async function deleteBlog(id: string): Promise<ApiResponse<void>> {
  return apiClient.delete<ApiResponse<void>>(`/api/v1/blogs/${id}`);
}
