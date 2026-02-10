import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import { logger } from "hono/logger";

// Api Services
import { authApi } from "./auth";
import { categoriesApi } from "./categories";
import { groupsApi } from "./groups";
import { usersApi } from "./users";
import { reportsApi } from "./reports";
import { profileApi } from "./profile";
import { viewsApi } from "./views";
// ReportsList APIs
import { dispatcherApi } from "@/reports-list/dispatcher-rapor/api";
import { User } from "@/generated/prisma/client";
declare module "hono" {
  interface ContextVariableMap {
    user: User;
  }
}

const api = new Hono().basePath("/api");

api.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow requests from your domains
      const allowedOrigins = [
        "https://reporting-web-app.arneca.app",
        "http://localhost:3000",
        "http://localhost:3007",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3007",
      ];

      // Allow if origin is in the list or if it's undefined (same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return origin || "*";
      }

      return allowedOrigins[0]; // Fallback to first allowed origin
    },
    credentials: true, // CRITICAL for cookies
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposeHeaders: ["Set-Cookie"],
    maxAge: 86400, // 24 hours
  })
);

api.use("*", logger());

api.get("/health", (c) =>
  c.json({
    status: "ok",
    message: "Healthy",
    result: {
      status: "ok",
      message: "Healthy",
      time: new Date().toISOString(),
    },
  })
);

api.route("/auth", authApi);
api.route("/categories", categoriesApi);
api.route("/groups", groupsApi);
api.route("/users", usersApi);
api.route("/reports", reportsApi);
api.route("/profile", profileApi);
api.route("/views", viewsApi);
api.route("/dispatcher-rapor", dispatcherApi);
// Not found
api.notFound((c) =>
  c.json(
    {
      status: "error",
      message: "Not found",
      result: {
        status: "error",
        message: "Not found",
        time: new Date().toISOString(),
      },
    },
    404
  )
);

// Error
api.onError((err, c) => {
  console.error(err);
  return c.json(
    {
      status: "error",
      message: "Error",
      result: {
        status: "error",
        message: "Error",
        time: new Date().toISOString(),
      },
    },
    500
  );
});

export const GET = handle(api);
export const POST = handle(api);
export const PUT = handle(api);
export const DELETE = handle(api);
export const PATCH = handle(api);
export const HEAD = handle(api);
export const OPTIONS = handle(api);
