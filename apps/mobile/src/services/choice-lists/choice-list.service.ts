import { apiClient } from "../api-client";

export type ChoiceList = {
  id: string;
  title: string;
  roundNumber?: number;
  revision?: number;
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

export type RoundPick = {
  id: string;
  label: string;
  selectedOrder: number;
  selectedAt: string;
};

export type RoundHistory = {
  id: string;
  listId: string;
  roundNumber: number;
  title: string;
  picks: RoundPick[];
  completedAt: string;
};

export type ListDetail = ChoiceList & {
  options: ListOption[];
  rounds?: RoundHistory[];
};

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
  roundNumber?: number,
): Promise<PickResult> {
  return apiClient<PickResult>(`/api/choice-lists/${listId}/pick`, {
    method: "POST",
    body: {
      ...(requestId ? { requestId } : {}),
      ...(roundNumber !== undefined ? { roundNumber } : {}),
    },
  });
}

export async function renameChoiceList(
  id: string,
  title: string,
  revision: number,
): Promise<{ id: string }> {
  return apiClient<{ id: string }>(`/api/choice-lists/${id}/title`, {
    method: "PATCH",
    body: { title, revision },
  });
}

export async function updateChoiceListOptions(
  id: string,
  options: { id?: string; label: string }[],
  revision: number,
): Promise<{ id: string }> {
  return apiClient<{ id: string }>(`/api/choice-lists/${id}/options`, {
    method: "PUT",
    body: { options, revision },
  });
}

export async function restartChoiceListRound(
  id: string,
  roundNumber: number,
  revision: number,
): Promise<{ id: string }> {
  return apiClient<{ id: string }>(`/api/choice-lists/${id}/rounds`, {
    method: "POST",
    body: { roundNumber, revision },
  });
}

export async function deleteChoiceList(
  id: string,
  revision?: number,
): Promise<{ id: string }> {
  return apiClient<{ id: string }>(`/api/choice-lists/${id}`, {
    method: "DELETE",
    body: revision !== undefined ? { revision } : undefined,
  });
}
