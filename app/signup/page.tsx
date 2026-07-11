"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import GoogleOAuth from "@/components/auth/google-oauth";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import ImageLogo from "@/components/navbar/ImageLogo";

function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [legalBoxTicked, setLegalBoxTicked] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSignUp() {
    setLoading(true);

    if (!firstName || !email || !password) {
      toast.info(
        "You must fill in all form fields to create a SevnMaps account.",
      );
      return;
    }

    if (legalBoxTicked) {
      const response = await authClient.signUp.email({
        email: email,
        password: password,
        name: firstName,
      });

      if (response.error) {
        toast.error(response.error.message);
        setLoading(false);
        return;
      }

      toast.success("Account created! Redirecting you now...");
      router.push("/app");
    } else {
      toast.info(
        "You must agree to the Terms of Service and Privacy Policy to create a SevnMaps account.",
      );
      setLoading(false);
      return;
    }
  }

  return (
    <div className="bg-emerald-950 fixed inset-0 flex items-center justify-center">
      <div className="bg-slate-50 rounded-3xl p-10 m-4 sm:m-8">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_0.8fr] gap-8 sm:gap-20">
          <div className="max-w-85">
            <ImageLogo />
            <h1 className="my-3 text-4xl font-semibold">
              Create a SevnMaps account
            </h1>
            <h3 className="text-lg font-medium text-muted-foreground max-w-54">
              Sign up now to use SevnMaps&apos; services
            </h3>
          </div>

          <div className="flex flex-col gap-1 my-2">
            <Label htmlFor="firstName" className="ml-2 text-md">
              First name
            </Label>
            <Input
              type="text"
              id="firstName"
              placeholder="Name"
              className="px-4 py-6"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <Label htmlFor="email" className="ml-2 mt-3 text-md">
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

            <div className="mt-4 flex items-start gap-2">
              <Checkbox
                id="agreements"
                className="mt-1"
                checked={legalBoxTicked}
                onCheckedChange={setLegalBoxTicked}
              />
              <label
                htmlFor="agreements"
                className="max-w-64 text-sm leading-relaxed text-muted-foreground cursor-default"
              >
                I agree to the{" "}
                <a
                  className="font-semibold text-foreground hover:underline cursor-pointer"
                  href="/terms"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  className="font-semibold text-foreground hover:underline cursor-pointer"
                  href="/privacy"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            <Button
              type="submit"
              onClick={handleSignUp}
              size="lg"
              className="mt-3 h-10 text-md"
              disabled={loading}
            >
              Create account
            </Button>
          </div>

          <div className="flex flex-col gap-2 items-center justify-center">
            <p className="text-muted-foreground text-xs mb-2">-- OR --</p>
            <GoogleOAuth />

            <a
              className="mt-2 text-xs text-muted-foreground hover:underline cursor-pointer"
              href="/login"
            >
              Already got an account? Sign in here
            </a>
          </div>
        </div>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}

export default SignUpPage;
