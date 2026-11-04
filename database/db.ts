import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// Declaración global para reutilizar cliente en desarrollo y mitigar fuga de conexiones
declare global {
  // eslint-disable-next-line no-var
  var __neonPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __drizzleDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function getConnectionString(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    // Lectura segura si las variables de entorno aún no fueron cargadas (hoisting de imports en tsx/Next.js)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)/);
      if (match) {
        process.env.DATABASE_URL = match[1];
        return match[1];
      }
    }
  } catch (e) {
    // Ignore in edge/browser contexts
  }
  return "";
}

function initDatabase() {
  const connectionString = getConnectionString();

  if (!connectionString && process.env.NODE_ENV === "production") {
    console.warn("[Database Security] DATABASE_URL no configurada en el entorno.");
  }

  // Patrón Singleton de conexión con pooling para Neon PostgreSQL Serverless
  const pool =
    globalThis.__neonPool ??
    new Pool({
      connectionString: connectionString || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
      max: 10,
    });

  if (process.env.NODE_ENV !== "production") {
    globalThis.__neonPool = pool;
  }

  const dbInstance =
    globalThis.__drizzleDb ??
    drizzle(pool, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalThis.__drizzleDb = dbInstance;
  }

  return dbInstance;
}

export const db = initDatabase();

export * from "./schema";
