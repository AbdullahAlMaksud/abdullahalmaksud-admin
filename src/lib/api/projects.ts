import { apiClient } from "./client";
import { Project, ApiResponse } from "./types";

export async function getProjects(params?: {
  category?: string;
  featured?: boolean;
}): Promise<Project[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.featured !== undefined)
    query.set("featured", params.featured.toString());

  const queryString = query.toString();
  const res = await apiClient.get<Project[] | { success: boolean; data: Project[] }>(
    `/api/v1/projects${queryString ? `?${queryString}` : ""}`
  );

  if (Array.isArray(res)) {
    return res;
  }
  if (res && "data" in res && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  return apiClient.get<Project>(`/api/v1/projects/${slug}`);
}

export async function createProject(
  data: Omit<Project, "id" | "createdAt" | "lastUpdate" | "updatedAt">
): Promise<ApiResponse<Project>> {
  return apiClient.post<ApiResponse<Project>>("/api/v1/projects", data);
}

export async function updateProject(
  id: string,
  data: Partial<Project>
): Promise<ApiResponse<Project>> {
  return apiClient.put<ApiResponse<Project>>(`/api/v1/projects/${id}`, data);
}

export async function deleteProject(id: string): Promise<ApiResponse<void>> {
  return apiClient.delete<ApiResponse<void>>(`/api/v1/projects/${id}`);
}
