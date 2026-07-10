"use client";

import { authClient } from "@/lib/auth-client";

import Image from "next/image";

function GoogleOAuth() {
  async function handleGoogleSignIn() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/app",
    });
  }

  return (
    <button onClick={handleGoogleSignIn}>
      <Image src="/google-sign-in.svg" alt="Sign in with Google" loading="eager" width={200} height={50} className="w-auto h-auto cursor-pointer" />
    </button>
  );
}

export default GoogleOAuth;
