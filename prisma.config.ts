import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// DIRECT_URL é necessário para migrations (sem pgbouncer / pooler)
export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL!,
  },
})
