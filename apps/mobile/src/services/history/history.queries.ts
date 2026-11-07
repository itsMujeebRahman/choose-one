import { useQuery } from "@tanstack/react-query";
import {
  getHistory,
  getHistoryDetail,
  type HistoryDetail,
  type HistoryItem,
} from "./history.service";

export const historyKeys = {
  all: ["history"] as const,
  detail: (id: string) => ["history", id] as const,
};

export function useHistoryQuery() {
  return useQuery<HistoryItem[]>({
    queryKey: historyKeys.all,
    queryFn: getHistory,
  });
}

export function useHistoryDetailQuery(id: string) {
  return useQuery<HistoryDetail>({
    queryKey: historyKeys.detail(id),
    queryFn: () => getHistoryDetail(id),
    enabled: Boolean(id),
  });
}
