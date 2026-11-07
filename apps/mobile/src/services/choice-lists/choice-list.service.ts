import { apiClient } from "../api-client";

export type ChoiceList = {
  id: string;
  title: string;
  pickCount: number;
  optionCount: number;
  createdAt: string;
  updatedAt: string;
  latestResult: string | null;
  latestSelectedAt: string | null;
};

export type ListOption = {
  id: string;
  label: string;
  sortOrder: number;
  selectedOrder: number | null;
  selectedAt: string | null;
};

export type ListDetail = ChoiceList & { options: ListOption[] };

export type CreateListInput = {
  id?: string;
  title: string;
  options: string[];
};

export type PickResult = {
  id: string;
  label: string;
  pickCount: number;
  optionCount: number;
  selectedAt: string;
};

export async function getChoiceLists(): Promise<ChoiceList[]> {
  return apiClient<ChoiceList[]>("/api/choice-lists");
}

export async function getChoiceList(id: string): Promise<ListDetail> {
  return apiClient<ListDetail>(`/api/choice-lists/${id}`);
}

export async function createChoiceList(
  input: CreateListInput,
): Promise<{ id: string }> {
  return apiClient<{ id: string }>("/api/choice-lists", {
    method: "POST",
    body: input,
  });
}

export async function pickFromChoiceList(
  listId: string,
  requestId?: string,
): Promise<PickResult> {
  return apiClient<PickResult>(`/api/choice-lists/${listId}/pick`, {
    method: "POST",
    body: requestId ? { requestId } : {},
  });
}
