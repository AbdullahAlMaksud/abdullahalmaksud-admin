import { apiClient } from "./client";
import { CaseStudy, PaginatedResponse, ApiResponse } from "./types";

export async function getCaseStudies(params?: {
  page?: number;
  limit?: number;
  published?: boolean;
  category?: string;
  industry?: string;
  featured?: boolean;
  projectSlug?: string;
  search?: string;
}): Promise<PaginatedResponse<CaseStudy>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.published !== undefined)
    query.set("published", params.published.toString());
  if (params?.category) query.set("category", params.category);
  if (params?.industry) query.set("industry", params.industry);
  if (params?.featured !== undefined)
    query.set("featured", params.featured.toString());
  if (params?.projectSlug) query.set("projectSlug", params.projectSlug);
  if (params?.search) query.set("search", params.search);

  const queryString = query.toString();
  const res = await apiClient.get<PaginatedResponse<CaseStudy> | CaseStudy[]>(
    `/api/v1/case-studies${queryString ? `?${queryString}` : ""}`
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

export async function getCaseStudyBySlug(
  slug: string
): Promise<ApiResponse<CaseStudy>> {
  return apiClient.get<ApiResponse<CaseStudy>>(`/api/v1/case-studies/${slug}`);
}

export async function createCaseStudy(
  data: Omit<CaseStudy, "id" | "createdAt" | "updatedAt">
): Promise<ApiResponse<CaseStudy>> {
  return apiClient.post<ApiResponse<CaseStudy>>("/api/v1/case-studies", data);
}

export async function updateCaseStudy(
  id: string,
  data: Partial<CaseStudy>
): Promise<ApiResponse<CaseStudy>> {
  return apiClient.put<ApiResponse<CaseStudy>>(`/api/v1/case-studies/${id}`, data);
}

export async function patchCaseStudy(
  id: string,
  data: Partial<CaseStudy>
): Promise<ApiResponse<CaseStudy>> {
  return apiClient.put<ApiResponse<CaseStudy>>(`/api/v1/case-studies/${id}`, data);
}

export async function deleteCaseStudy(
  id: string
): Promise<ApiResponse<void>> {
  return apiClient.delete<ApiResponse<void>>(`/api/v1/case-studies/${id}`);
}
