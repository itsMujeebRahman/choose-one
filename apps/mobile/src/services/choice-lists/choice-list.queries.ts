import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createChoiceList,
  deleteChoiceList,
  getChoiceList,
  getChoiceLists,
  pickFromChoiceList,
  renameChoiceList,
  restartChoiceListRound,
  updateChoiceListOptions,
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
  return useMutation<
    PickResult,
    Error,
    { listId: string; requestId?: string; roundNumber?: number }
  >({
    mutationFn: ({ listId, requestId, roundNumber }) =>
      pickFromChoiceList(listId, requestId, roundNumber),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: choiceListKeys.all });
      queryClient.invalidateQueries({
        queryKey: choiceListKeys.detail(variables.listId),
      });
    },
  });
}

export function useRenameChoiceListMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    { id: string },
    Error,
    { id: string; title: string; revision: number }
  >({
    mutationFn: ({ id, title, revision }) =>
      renameChoiceList(id, title, revision),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: choiceListKeys.all });
      queryClient.invalidateQueries({
        queryKey: choiceListKeys.detail(variables.id),
      });
    },
  });
}

export function useUpdateChoiceListOptionsMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    { id: string },
    Error,
    {
      id: string;
      options: { id?: string; label: string }[];
      revision: number;
    }
  >({
    mutationFn: ({ id, options, revision }) =>
      updateChoiceListOptions(id, options, revision),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: choiceListKeys.all });
      queryClient.invalidateQueries({
        queryKey: choiceListKeys.detail(variables.id),
      });
    },
  });
}

export function useRestartChoiceListRoundMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    { id: string },
    Error,
    { id: string; roundNumber: number; revision: number }
  >({
    mutationFn: ({ id, roundNumber, revision }) =>
      restartChoiceListRound(id, roundNumber, revision),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: choiceListKeys.all });
      queryClient.invalidateQueries({
        queryKey: choiceListKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteChoiceListMutation() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, { id: string; revision: number }>({
    mutationFn: ({ id, revision }) => deleteChoiceList(id, revision),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: choiceListKeys.all });
      queryClient.removeQueries({
        queryKey: choiceListKeys.detail(variables.id),
      });
    },
  });
}
