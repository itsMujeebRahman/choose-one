import { parseOptions } from "./random-choice";
import type { SaveProblemInput } from "../modules/problems/problem.service";

export function parseProblemInput(body: unknown): SaveProblemInput {
  if (
    !body ||
    typeof body !== "object" ||
    !("title" in body) ||
    !("requestId" in body) ||
    !("options" in body)
  ) {
    throw new Error("Enter a problem name and options.");
  }
  if (
    typeof body.title !== "string" ||
    !body.title.trim() ||
    body.title.trim().length > 100
  ) {
    throw new Error("Problem names must contain 1–100 characters.");
  }
  if (
    typeof body.requestId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      body.requestId,
    )
  ) {
    throw new Error("Invalid request ID.");
  }
  return {
    title: body.title.trim(),
    requestId: body.requestId,
    options: parseOptions(body.options),
  };
}
