import { Hono } from "hono";
import type { AuthBindings } from "../../auth";
import { getProfile } from "./profile.controller";

export const profileRoutes = new Hono<{ Bindings: AuthBindings }>();
profileRoutes.get("/profile", getProfile);
// Preserve the existing endpoint for current clients.
profileRoutes.get("/me", getProfile);
