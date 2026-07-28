import { createAuthClient } from "better-auth/client";
import { sentinelClient } from "@better-auth/infra/client";

const sentinelIdentifyUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL;

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,

  plugins: [
    ...(sentinelIdentifyUrl
      ? [sentinelClient({ identifyUrl: sentinelIdentifyUrl })]
      : []),
  ],
});
