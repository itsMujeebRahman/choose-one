import { Hono } from "hono";
import type { AuthBindings } from "../../auth";
import { createProblemChoice } from "./problem.controller";

export const problemRoutes = new Hono<{ Bindings: AuthBindings }>();
problemRoutes.post("/choose", createProblemChoice);
