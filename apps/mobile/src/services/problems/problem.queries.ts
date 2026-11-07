import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chooseOption } from "./problem.service";
import { historyKeys } from "../history/history.queries";

export function useChooseOptionMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    string,
    Error,
    {
      title: string;
      options: string[];
      requestId?: string;
      signal?: AbortSignal;
    }
  >({
    mutationFn: ({ title, options, requestId, signal }) =>
      chooseOption(title, options, requestId, signal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
    },
  });
}
