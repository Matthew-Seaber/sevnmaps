"use client";

import { useEffect, useState } from "react";

import { Switch } from "@/components/ui/big-switch";
import { Label } from "@/components/ui/label";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

import PerkRow from "@/components/pricing/PerkRow";

import confetti from "canvas-confetti";

function PricingPage() {
  const [annualBilling, setAnnualBilling] = useState<boolean>(true);
  const [countryCode, setCountryCode] = useState<string>("US");

  const prices = {
    pro: {
      monthly: 5.99,
      annual: 3.29,
    },
    explorer: {
      monthly: 12.99,
      annual: 7.19,
    },
  };

  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        const countryCodeResponse = await fetch(
          "api/billing/get_country_code",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const countryCode = await countryCodeResponse.text();
        setCountryCode(countryCode);
      } catch (error) {
        console.error("Error fetching country code:", error);
      }
    };

    fetchCountryCode();
  }, []);

  const getCurrencySymbol = (countryCode: string) => {
    if (countryCode === "GB") {
      return "£";
    }

    const euroCountries = [
      "AT",
      "BE",
      "CY",
      "DE",
      "EE",
      "ES",
      "FI",
      "FR",
      "GR",
      "HR",
      "IE",
      "IT",
      "LT",
      "LU",
      "LV",
      "MT",
      "NL",
      "PT",
      "SI",
      "SK",
    ];

    if (euroCountries.includes(countryCode)) {
      return "€";
    }

    return "$";
  };

  const currency = getCurrencySymbol(countryCode);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4 text-center">
      <h1 className="text-4xl font-bold">
        Simple pricing.{" "}
        <span className="text-primary">Serious exploration.</span>
      </h1>
      <p className="font-medium text-muted-foreground my-1">
        Every journey has a plan! Upgrade or downgrade any time, no questions
        asked.
      </p>

      <div className="flex items-center gap-2 mt-4 mb-2">
        <Switch
          id="annualBillingSwitch"
          checked={annualBilling}
          onCheckedChange={setAnnualBilling}
        />
        <Label
          htmlFor="annualBillingSwitch"
          className="font-semibold text-foreground/70 px-2"
        >
          Annual billing
        </Label>
        <p className="text-sm text-primary bg-primary/20 rounded-md py-1 px-3">
          Save 45%
        </p>
      </div>

      <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl items-end text-left">
        <div className="min-h-136 w-full border-[0.5px] border-border rounded-lg bg-card p-6 shadow-sm">
          <h3 className="text-2xl font-bold pt-2 pb-1">Free</h3>
          <p className="font-semibold text-foreground/70 text-sm">
            Start exploring the world.
          </p>

          <h4 className="text-2xl font-semibold py-4">
            {currency}
            <span className="text-3xl font-bold font-jakarta">0</span>
            <span className="font-bold text-xs text-foreground/70">
              {" "}
              / month
            </span>
          </h4>

          <Button
            variant="outline"
            size="lg"
            className="w-full border border-primary text-primary/80 hover:text-primary font-semibold rounded-sm"
            onClick={() => {
              window.location.href = "/signup";
            }}
          >
            Get started
          </Button>

          <div className="mt-10 flex flex-col justify-between gap-4">
            <PerkRow
              label="Create up to 3 lists"
              value="3 lists"
              included={true}
            />
            <PerkRow
              label="Save up to 30 places per list"
              value="30 places"
              included={true}
            />
          </div>
        </div>

        <div className="relative min-h-140 w-full border-2 border-primary rounded-lg bg-card p-6 shadow-md overflow-hidden">
          <div className="absolute top-0 left-0 right-0 object-cover bg-primary text-primary-foreground text-center font-medium text-sm p-1 tracking-wide">
            <p>RECOMMENDED</p>
          </div>

          <h3 className="text-2xl font-bold pt-6 pb-1">Pro</h3>
          <p className="font-semibold text-foreground/70 text-sm">
            For passionate adventurers.
          </p>

          <h4 className="text-2xl font-semibold py-4">
            {currency}
            <span className="text-3xl font-bold font-jakarta">
              {prices.pro[annualBilling ? "annual" : "monthly"]}
            </span>
            <span className="font-bold text-xs text-foreground/70">
              {" "}
              / month
            </span>
          </h4>

          <Button size="lg" className="w-full rounded-sm">
            Upgrade to Pro
          </Button>
          <p className="font-semibold text-xs text-foreground/50 my-2 text-center">
            7-day free trial. Cancel anytime.
          </p>

          <div className="mt-4 flex items-center justify-between"></div>
        </div>

        <div className="min-h-136 w-full border-[0.5px] border-border rounded-lg bg-card p-6 shadow-sm">
          <h3 className="text-2xl font-bold pt-2 pb-1">Explorer</h3>
          <p className="font-semibold text-foreground/70 text-sm">
            For the ultimate explorer.
          </p>

          <h4 className="text-2xl font-semibold py-4">
            {currency}
            <span className="text-3xl font-bold font-jakarta">
              {prices.explorer[annualBilling ? "annual" : "monthly"]}
            </span>
            <span className="font-bold text-xs text-foreground/70">
              {" "}
              / month
            </span>
          </h4>

          <Button
            variant="outline"
            size="lg"
            className="w-full border border-primary text-primary/80 hover:text-primary font-semibold rounded-sm"
          >
            Upgrade to Explorer
          </Button>
          <p className="font-semibold text-xs text-foreground/50 my-2 text-center">
            7-day free trial. Cancel anytime.
          </p>

          <div className="mt-4 flex items-center justify-between"></div>
        </div>
      </div>

      <div className="border border-border rounded-lg flex p-6 items-center justify-between text-left drop-shadow-sm gap-4 sm:gap-32 mt-2 mb-12">
        <div className="flex items-start sm:items-center gap-6">
          <WandSparkles
            className="shrink-0 h-8 w-8 mt-2 sm:mt-0"
            strokeWidth={1.25}
          />

          <div className="flex flex-col">
            <h4 className="font-semibold mb-2 sm:mb-0">
              Hesitant about upgrading?
            </h4>
            <p className="text-foreground/70 font-medium text-sm">
              All paid plans come with a 7-day free trial, just in case you
              change your mind.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="font-semibold"
          onClick={() => {
            const confettiColours = [
              "#02855e",
              "#00a171",
              "#02c38a",
              "#019065",
            ];

            confetti({
              particleCount: 200,
              angle: 60,
              spread: 50,
              startVelocity: 75,
              origin: { x: 0, y: 1 },
              colors: confettiColours,
            });

            confetti({
              particleCount: 200,
              angle: 120,
              spread: 50,
              startVelocity: 75,
              origin: { x: 1, y: 1 },
              colors: confettiColours,
            });
          }}
        >
          Launch confetti
        </Button>
      </div>
    </div>
  );
}

export default PricingPage;
