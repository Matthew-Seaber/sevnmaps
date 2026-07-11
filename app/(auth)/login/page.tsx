"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import GoogleOAuth from "@/components/auth/google-oauth";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import ImageLogo from "@/components/navbar/ImageLogo";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogin() {
    setLoading(true);

    if (!email || !password) {
      toast.info(
        "You must fill in all form fields to log in to your SevnMaps account.",
      );
      setLoading(false);
      return;
    }

    const response = await authClient.signIn.email({
      email: email,
      password: password,
    });

    if (response.error) {
      toast.error(response.error.message);
      setLoading(false);
      return;
    }

    toast.success("Success! Redirecting you now...");
    router.push("/map");
  }

  return (
    <div className="bg-emerald-950 fixed inset-0 flex items-center justify-center">
      <div className="bg-slate-50 rounded-3xl p-10 m-4 sm:m-8">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.3fr_1.2fr] gap-8 sm:gap-20">
          <div>
            <ImageLogo />
            <h1 className="my-3 text-4xl font-semibold">Sign in</h1>
            <h3 className="text-lg font-medium text-muted-foreground max-w-54">
              Sign in now to use SevnMaps&apos; services
            </h3>
          </div>

          <div className="flex flex-col gap-1 my-2">
            <Label htmlFor="email" className="ml-2 text-md">
              Email address
            </Label>
            <Input
              type="email"
              id="email"
              placeholder="Email"
              className="px-4 py-6"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Label htmlFor="password" className="ml-2 mt-3 text-md">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              placeholder="Password"
              className="px-4 py-6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <a className="ml-1 mt-1 text-xs text-muted-foreground hover:underline cursor-pointer">
              Forgot password?
            </a>

            <Button
              type="submit"
              onClick={handleLogin}
              size="lg"
              className="mt-3 h-10 text-md"
              disabled={loading}
            >
              Log in
            </Button>
          </div>

          <div className="flex flex-col gap-2 items-center justify-center">
            <p className="text-muted-foreground text-xs mb-2">-- OR --</p>
            <GoogleOAuth />

            <a
              className="mt-2 text-xs text-muted-foreground hover:underline cursor-pointer"
              href="/signup"
            >
              No account yet? Sign up here
            </a>
          </div>
        </div>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}

export default LoginPage;
