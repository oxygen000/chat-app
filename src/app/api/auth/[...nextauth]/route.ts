import { nextAuthConfig } from "@/lib/nextauth.config"
import NextAuth from "next-auth"

const handler = NextAuth(nextAuthConfig)

export { handler as GET, handler as POST }