import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dash } from "@better-auth/infra";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),

  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.insert(schema.profiles).values({
            userId: user.id,
            role: "user",
          });

          await db.insert(schema.subscriptions).values({
            userId: user.id,
            planType: "free",
            paidPlanStatus: "inactive",
            usedFreeTrial: false,
            start: new Date(),
          });
        },
      },
    },
  },

  plugins: [
    dash()
  ]
});
