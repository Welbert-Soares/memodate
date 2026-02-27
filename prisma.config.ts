import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// DIRECT_URL é necessário para migrations (sem pgbouncer / pooler)
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
})
