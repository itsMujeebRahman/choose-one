import { apiClient } from "../api-client";

export type ChooseResult = {
  option: string;
  problemId: string;
  optionId: string;
};

export async function chooseOption(
  title: string,
  options: string[],
  requestId?: string,
  signal?: AbortSignal,
): Promise<string> {
  const data = await apiClient<ChooseResult>("/api/choose", {
    method: "POST",
    body: { title, options, ...(requestId ? { requestId } : {}) },
    signal,
  });

  if (
    typeof data.option !== "string" ||
    !options.includes(data.option) ||
    typeof data.problemId !== "string" ||
    typeof data.optionId !== "string"
  ) {
    throw new Error("The saved answer wasn’t valid. Please try again.");
  }

  return data.option;
}
