import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import { defineConfig } from 'drizzle-kit';
export default defineConfig({schema:'./db/schema.ts',out:'./db/migrations',dialect:'postgresql',dbCredentials:{url:process.env.SUPABASE_DATABASE_URL??''}});



