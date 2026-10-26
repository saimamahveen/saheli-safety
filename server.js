import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Pool } from "pg";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { createServer as createViteServer } from "vite";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./server/middlewares/clerkProxyMiddleware.js";
import { readPlanPayload } from "./server/planValidation.js";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5000);
const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("SUPABASE_DB_URL is required to start Saheli.");
}

if (isProduction && !process.env.SUPABASE_DB_URL) {
  throw new Error("SUPABASE_DB_URL is required in production; DATABASE_URL is only a development fallback.");
}

if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_PUBLISHABLE_KEY) {
  throw new Error("Clerk authentication is not configured.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  application_name: "saheli-web",
});
const app = express();
const httpServer = createServer(app);
let viteServer;

pool.on("error", (error) => {
  console.error("Unexpected idle PostgreSQL client error", {
    name: error?.name,
    code: error?.code,
  });
});

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
  if (req.path.startsWith("/api/")) res.setHeader("Cache-Control", "no-store");
  next();
});

app.get("/favicon.ico", (_req, res) => res.status(204).end());

// Clerk's proxy must run before body parsers so it can forward raw request bytes.
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false, limit: "32kb" }));
app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

function requireAuth(req, res, next) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Sign in to access your saved safety plan." });
  }
  req.authUserId = userId;
  return next();
}

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.status(200).type("text").send("ok");
  } catch {
    return res.status(503).type("text").send("unavailable");
  }
});

app.get("/api/safety-plan", requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT contacts, checked_steps, updated_at FROM safety_plans WHERE user_id = $1",
      [req.authUserId],
    );
    const row = result.rows[0];
    res.json({
      contacts: row?.contacts ?? [],
      checkedSteps: row?.checked_steps ?? [],
      updatedAt: row?.updated_at ?? null,
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/safety-plan", requireAuth, async (req, res, next) => {
  const plan = readPlanPayload(req.body);
  if (plan.error) return res.status(400).json({ error: plan.error });

  try {
    const result = await pool.query(
      `INSERT INTO safety_plans (user_id, contacts, checked_steps, updated_at)
       VALUES ($1, $2::jsonb, $3::jsonb, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         contacts = EXCLUDED.contacts,
         checked_steps = EXCLUDED.checked_steps,
         updated_at = NOW()
       RETURNING contacts, checked_steps, updated_at`,
      [req.authUserId, JSON.stringify(plan.contacts), JSON.stringify(plan.checkedSteps)],
    );
    const row = result.rows[0];
    res.json({
      contacts: row.contacts,
      checkedSteps: row.checked_steps,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/safety-plan", requireAuth, async (req, res, next) => {
  try {
    await pool.query("DELETE FROM safety_plans WHERE user_id = $1", [req.authUserId]);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use("/api", (_req, res) => res.status(404).json({ error: "API route not found." }));

if (isProduction) {
  const distPath = path.join(projectRoot, "dist");
  app.use(express.static(distPath, { index: false }));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    res.setHeader("Cache-Control", "no-store");
    return res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  viteServer = await createViteServer({
    configFile: path.join(projectRoot, "vite.config.js"),
    server: {
      middlewareMode: true,
      ws: { server: httpServer },
      allowedHosts: true,
    },
    appType: "spa",
  });
  app.use(viteServer.middlewares);
}

app.use((error, _req, res, _next) => {
  console.error("Request failed", {
    name: error?.name,
    code: error?.code,
  });
  if (res.headersSent) return;
  res.status(500).json({ error: "Saheli could not complete that request. Please try again." });
});

await pool.query("SELECT contacts, checked_steps FROM safety_plans LIMIT 0");
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Saheli is listening on port ${port}`);
});

async function shutdown() {
  await new Promise((resolve) => httpServer.close(resolve));
  await viteServer?.close();
  await pool.end();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
