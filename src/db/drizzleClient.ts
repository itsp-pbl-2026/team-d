import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.ts";

export const drizzleClient = drizzle(process.env.DATABASE_URL, { schema });
