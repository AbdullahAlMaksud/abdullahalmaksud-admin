import { apiClient } from "./client";
import {
  AboutData,
  ApiResponse,
  HomeData,
  SiteLocaleData,
  SupportedLocale,
} from "./types";

export async function getHomeData(): Promise<HomeData> {
  return apiClient.get<HomeData>("/api/v1/home");
}

export async function updateHomeData(
  data: Partial<HomeData>
): Promise<ApiResponse<HomeData>> {
  return apiClient.put<ApiResponse<HomeData>>("/api/v1/home", data);
}

export async function getAboutData(locale: SupportedLocale = "en"): Promise<AboutData> {
  return apiClient.get<AboutData>(`/api/v1/about?locale=${locale}`);
}

export async function updateAboutData(
  data: Partial<AboutData>,
  locale: SupportedLocale = "en"
): Promise<ApiResponse<AboutData>> {
  return apiClient.put<ApiResponse<AboutData>>(`/api/v1/about?locale=${locale}`, data);
}

export async function getSiteData(
  locale: SupportedLocale = "en"
): Promise<ApiResponse<SiteLocaleData>> {
  return apiClient.get<ApiResponse<SiteLocaleData>>(`/api/v1/site?locale=${locale}`);
}

export async function getAllSiteLocales(): Promise<
  ApiResponse<{ en: SiteLocaleData; bn: SiteLocaleData }>
> {
  return apiClient.get<ApiResponse<{ en: SiteLocaleData; bn: SiteLocaleData }>>("/api/v1/site/all");
}

export async function updateSiteData(
  locale: SupportedLocale,
  data: Partial<SiteLocaleData>
): Promise<ApiResponse<SiteLocaleData>> {
  return apiClient.put<ApiResponse<SiteLocaleData>>(`/api/v1/site?locale=${locale}`, data);
}

export async function resetSiteData(
  locale: SupportedLocale | "all" = "en"
): Promise<ApiResponse<SiteLocaleData | { en: SiteLocaleData; bn: SiteLocaleData }>> {
  return apiClient.post(`/api/v1/site/reset?locale=${locale}`, {});
}

export async function getContentBackup(locale: string = "en"): Promise<unknown> {
  return apiClient.get(`/api/v1/content?locale=${locale}`);
}
