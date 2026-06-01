import { z } from 'zod'
import dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), '.env') })

const envSchema = z.object({
  PORT: z.string().default('3001').transform(Number),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  SESSION_SECRET: z.string().min(16).default('default_dev_secret_change_me'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format())
  process.exit(1)
}

export const env = parsed.data
