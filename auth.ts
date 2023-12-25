import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'

const allowedGHUsers = JSON.parse( process.env.ALLOWED_GH_USERS || '[]').map((u: string) => u.toLowerCase())

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string
    } & DefaultSession['user']
  }
}

export const {
  handlers: { GET, POST },
  auth
} = NextAuth({
  providers: [GitHub],
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.id = profile.id
        token.image = profile.avatar_url || profile.picture
      }
      return token
    },
    session: ({ session, token }) => {
      if (session?.user && token?.id) {
        session.user.id = String(token.id)
      }
      return session
    },
    authorized({ auth }) {
      return !!auth?.user // this ensures there is a logged in user for -every- request
    },
    signIn({ profile }) {
      if (!profile?.email) return false
      return !!allowedGHUsers.includes(profile.email.toLowerCase())
    }
  },
  pages: {
    signIn: '/sign-in'
  }
})
