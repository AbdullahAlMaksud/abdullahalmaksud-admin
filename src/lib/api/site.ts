import { apiClient } from "./client";
import { HomeData, AboutData, ApiResponse } from "./types";

export async function getHomeData(): Promise<HomeData> {
  return apiClient.get<HomeData>("/api/v1/home");
}

export async function updateHomeData(
  data: Partial<HomeData>
): Promise<ApiResponse<HomeData>> {
  return apiClient.put<ApiResponse<HomeData>>("/api/v1/home", data);
}

export async function getAboutData(): Promise<AboutData> {
  return apiClient.get<AboutData>("/api/v1/about");
}

export async function updateAboutData(
  data: Partial<AboutData>
): Promise<ApiResponse<AboutData>> {
  return apiClient.put<ApiResponse<AboutData>>("/api/v1/about", data);
}

export async function getSiteData(locale: string = "en"): Promise<unknown> {
  return apiClient.get(`/api/v1/site?locale=${locale}`);
}

export async function getContentBackup(locale: string = "en"): Promise<unknown> {
  return apiClient.get(`/api/v1/content?locale=${locale}`);
}
