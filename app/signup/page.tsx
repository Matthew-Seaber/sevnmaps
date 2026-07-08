import GoogleOAuth from "@/components/auth/google-oauth";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import ImageLogo from "@/components/navbar/ImageLogo";

function LoginPage() {
  return (
    <div className="bg-emerald-950 fixed inset-0 flex items-center justify-center">
      <div className="bg-slate-50 rounded-3xl p-10 m-4 sm:m-8">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr] gap-8 sm:gap-20">
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
            />

            <Label htmlFor="email" className="ml-2 mt-3 text-md">
              Email address
            </Label>
            <Input
              type="email"
              id="email"
              placeholder="Email"
              className="px-4 py-6"
            />

            <Label htmlFor="password" className="ml-2 mt-3 text-md">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              placeholder="Password"
              className="px-4 py-6"
            />

            <div className="mt-4 flex items-start gap-2">
              <Checkbox id="agreements" className="mt-1" />
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

            <Button type="submit" size="lg" className="mt-3 h-10 text-md">
              Create account
            </Button>
          </div>

          <div className="flex flex-col gap-2 items-center justify-center">
            <p className="text-muted-foreground text-xs mb-2">-- OR --</p>
            <GoogleOAuth type="signup" />

            <a
              className="mt-2 text-xs text-muted-foreground hover:underline cursor-pointer"
              href="/login"
            >
              Already got an account? Sign in here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
