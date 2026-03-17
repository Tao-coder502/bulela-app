import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let dbInstance: NeonHttpDatabase<typeof schema> | null = null;

export function getDb() {
  if (!dbInstance) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(dbUrl);
    dbInstance = drizzle(sql, { schema });
  }
  return dbInstance;
}

// Export a proxy or just the getter. Using getter is safer for lazy init.
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  }
});
