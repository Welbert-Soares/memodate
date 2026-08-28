import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { seedHolidaysForUser } from '@/lib/holidays'

const {
  handlers,
  auth: uncachedAuth,
  signIn,
  signOut,
} = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any),
  // JWT sessions avoid a database round-trip on every auth() call (middleware +
  // page + server action all call it per navigation). Nothing in this app reads
  // the Session table directly, so there's no loss from dropping DB sessions.
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await seedHolidaysForUser(user.id)
      }
    },
  },
})

// Dedupes repeated auth() calls within the same server request (e.g. a page
// and the server action it calls both check the session).
const auth = cache(uncachedAuth)

export { handlers, auth, uncachedAuth, signIn, signOut }
