import { apiClient } from "./client";
import { DashboardMetrics, InquiryMessage, SystemNotification } from "./types";

export async function getDashboardData(locale: string = "en"): Promise<Record<string, unknown>> {
  return apiClient.get<Record<string, unknown>>(`/api/v1/dashboard?locale=${locale}`);
}

export async function getContactMessages(locale: string = "en"): Promise<InquiryMessage[]> {
  const res = await apiClient.get<InquiryMessage[]>(`/api/v1/messages?locale=${locale}`);
  return Array.isArray(res) ? res : [];
}

export async function getNotifications(locale: string = "en"): Promise<SystemNotification[]> {
  const res = await apiClient.get<SystemNotification[]>(`/api/v1/notifications?locale=${locale}`);
  return Array.isArray(res) ? res : [];
}

export type { DashboardMetrics, InquiryMessage, SystemNotification };
