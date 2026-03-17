
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './server/db/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Assuming Neon connection string is in env
  },
  verbose: true,
  strict: true,
});
