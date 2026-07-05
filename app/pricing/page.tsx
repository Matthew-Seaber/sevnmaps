"use client";

import { useState } from "react";

import { Switch } from "@/components/ui/big-switch";
import { Label } from "@/components/ui/label";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

import confetti from "canvas-confetti";

function PricingPage() {
  const [annualBilling, setAnnualBilling] = useState<boolean>(true);

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

      <div className="flex items-center gap-2 mt-4">
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
          Save 20%
        </p>
      </div>

      <div>{/* Main content */}</div>

      <div className="border border-border rounded-lg flex p-6 items-center justify-between text-left drop-shadow-sm gap-8 sm:gap-16 mb-12">
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
              All paid plans come with a 7-day free trial; just in case you
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
          Play confetti
        </Button>
      </div>
    </div>
  );
}

export default PricingPage;
