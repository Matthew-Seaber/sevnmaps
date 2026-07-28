import { createAuthClient } from "better-auth/client";
import { dashClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,

  plugins: [
    dashClient({
      resolveUserId: ({ userId, user, session }): string | undefined => {
        return userId ?? user?.id ?? session?.user?.id ?? undefined;
      }
    })
  ],
});
