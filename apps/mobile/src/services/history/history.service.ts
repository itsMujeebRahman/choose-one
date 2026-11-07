import { apiClient } from "../api-client";

export type HistoryItem = {
  id: string;
  title: string;
  selectedOption: string | null;
  optionCount: number;
  createdAt: string;
  chosenAt: string | null;
};

export type HistoryOption = {
  id: string;
  label: string;
  sortOrder: number;
  isSelected: boolean;
  selectedOrder: number | null;
};

export type HistoryDetail = {
  id: string;
  title: string;
  createdAt: string;
  chosenAt: string | null;
  options: HistoryOption[];
};

export async function getHistory(): Promise<HistoryItem[]> {
  return apiClient<HistoryItem[]>("/api/history");
}

export async function getHistoryDetail(id: string): Promise<HistoryDetail> {
  return apiClient<HistoryDetail>(`/api/history/${id}`);
}
