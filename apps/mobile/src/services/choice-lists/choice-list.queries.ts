import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createChoiceList,
  getChoiceList,
  getChoiceLists,
  pickFromChoiceList,
  type ChoiceList,
  type CreateListInput,
  type ListDetail,
  type PickResult,
} from "./choice-list.service";

export const choiceListKeys = {
  all: ["choice-lists"] as const,
  detail: (id: string) => ["choice-lists", id] as const,
};

export function useChoiceListsQuery() {
  return useQuery<ChoiceList[]>({
    queryKey: choiceListKeys.all,
    queryFn: getChoiceLists,
  });
}

export function useChoiceListDetailQuery(id: string) {
  return useQuery<ListDetail>({
    queryKey: choiceListKeys.detail(id),
    queryFn: () => getChoiceList(id),
    enabled: Boolean(id),
  });
}

export function useCreateChoiceListMutation() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, CreateListInput>({
    mutationFn: createChoiceList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: choiceListKeys.all });
    },
  });
}

export function usePickFromChoiceListMutation() {
  const queryClient = useQueryClient();
  return useMutation<PickResult, Error, { listId: string; requestId?: string }>(
    {
      mutationFn: ({ listId, requestId }) =>
        pickFromChoiceList(listId, requestId),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: choiceListKeys.all });
        queryClient.invalidateQueries({
          queryKey: choiceListKeys.detail(variables.listId),
        });
      },
    },
  );
}
