import { Hono } from "hono";
import type { AuthBindings } from "../../auth";
import {
  createProblemChoice,
  getProblemHistoryDetail,
  listProblemHistory,
} from "./problem.controller";

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const problemRoutes = new Hono<{ Bindings: AuthBindings }>();
problemRoutes.post("/choose", createProblemChoice);
problemRoutes.get("/history", listProblemHistory);
problemRoutes.get(
  "/history/:id",
  (c, next) => {
    const id = c.req.param("id");
    if (!id || !uuid.test(id))
      return c.json({ message: "Choice not found." }, 404);
    return next();
  },
  getProblemHistoryDetail,
);
