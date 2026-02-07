import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes";

const app = new Hono().basePath("/api");

// Middleware
app.use("*", cors({ origin: (origin) => origin || "*", credentials: true }));

// Mount auth routes
app.route("/auth", authRoutes);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

export { app };
