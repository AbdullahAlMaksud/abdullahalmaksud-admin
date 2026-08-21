import { apiClient } from "./client";
import { Design, ApiResponse } from "./types";

export async function getDesigns(params?: {
  category?: string;
  featured?: boolean;
}): Promise<Design[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.featured !== undefined)
    query.set("featured", params.featured.toString());

  const queryString = query.toString();
  const res = await apiClient.get<Design[] | { success: boolean; data: Design[] }>(
    `/api/v1/designs${queryString ? `?${queryString}` : ""}`
  );

  if (Array.isArray(res)) {
    return res;
  }
  if (res && "data" in res && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

export async function getDesignById(id: string): Promise<Design> {
  return apiClient.get<Design>(`/api/v1/designs/${id}`);
}

export async function createDesign(
  data: Omit<Design, "id" | "createdAt" | "updatedAt">
): Promise<ApiResponse<Design>> {
  return apiClient.post<ApiResponse<Design>>("/api/v1/designs", data);
}

export async function updateDesign(
  id: string,
  data: Partial<Design>
): Promise<ApiResponse<Design>> {
  return apiClient.put<ApiResponse<Design>>(`/api/v1/designs/${id}`, data);
}

export async function deleteDesign(id: string): Promise<ApiResponse<void>> {
  return apiClient.delete<ApiResponse<void>>(`/api/v1/designs/${id}`);
}
