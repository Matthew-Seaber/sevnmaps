"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  MailPlus,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

function InvitePage() {
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [invitedBy, setInvitedBy] = useState("");
  const [invitedAt, setInvitedAt] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [buttonsLoading, setButtonsLoading] = useState(true);

  const params = useParams();
  const listID = params.listID as string;

  const router = useRouter();

  useEffect(() => {
    const fetchInviteDetails = async () => {
      try {
        const response = await fetch(
          `/api/lists/get_invite_details?listID=${listID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch invite details");
        }

        const data = await response.json();

        setListName(data.listName);
        setListDescription(data.listDescription);
        setInvitedBy(data.invitedBy);
        setInvitedAt(
          new Date(data.invitedAt).toLocaleString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          }),
        );
        setRole(data.role);

        setLoading(false);
        setButtonsLoading(false);
      } catch (error) {
        console.error("Error fetching invite details:", error);
        toast.error(
          "Failed to fetch invite details. This could be because the invitation has expired or has already been accepted/declined.",
        );
      }
    };

    fetchInviteDetails();
  }, [listID]);

  async function handleAcceptInvitation() {
    setButtonsLoading(true);

    try {
      const response = await fetch("/api/lists/accept_invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listID }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept invitation");
      }

      toast.success("Invitation accepted!");
      router.push("/map");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Failed to accept the invitation. Please try again later.");
    }

    setButtonsLoading(false);
  }

  async function handleDeclineInvitation() {
    setButtonsLoading(true);

    try {
      const response = await fetch("/api/lists/decline_invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listID }),
      });

      if (!response.ok) {
        throw new Error("Failed to decline invitation");
      }

      toast.success("Invitation declined.");
      router.push("/map");
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast.error("Failed to decline the invitation. Please try again later.");
    }

    setButtonsLoading(false);
  }

  return (
    <div className="max-w-4xl text-center flex flex-col gap-8 mx-auto p-4 md:p-8">
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="w-12 h-12 md:w-24 md:h-24 mb-2 bg-primary/15 flex items-center justify-center rounded-full">
          <MailPlus
            strokeWidth={1.5}
            className="w-6 h-6 md:w-13 md:h-13 text-primary"
          />
        </div>

        <h1 className="font-bold text-3xl md:text-5xl text-center px-4">
          You&apos;ve been <span className="text-primary">invited</span> to a
          list!
        </h1>
        <p className="md:text-lg text-muted-foreground">
          Join a shared list to collaborate and explore with others.
        </p>
      </div>

      {!loading ? (
        <div className="flex flex-row gap-4 items-center p-4 md:p-6 rounded-md border border-border shadow-sm">
          <div className="hidden sm:flex relative w-36 h-36 shrink-0">
            <Image
              src="/assets/square-placeholder.png"
              alt=""
              fill
              sizes="180px"
              className="object-cover rounded-md"
            />
          </div>

          <div className="flex flex-col gap-4 px-2 items-start">
            <div className="flex flex-col gap-1 items-start">
              <h2 className="font-bold text-xl md:text-2xl">{listName}</h2>
              <p className="font-semibold text-muted-foreground">
                {listDescription}
              </p>
            </div>

            <Separator />

            <div className="flex flex-row gap-2">
              <div className="flex flex-col gap-3 items-start p-2">
                <div className="flex flex-row gap-2 items-center">
                  <UserRound className="hidden md:flex w-5 h-5 text-muted-foreground" />
                  <p className="text-left text-sm text-muted-foreground">
                    Invited by
                  </p>
                </div>
                <p className="text-left font-semibold">{invitedBy}</p>
              </div>

              <Separator orientation="vertical" />

              <div className="flex flex-col gap-3 items-start p-2">
                <div className="flex flex-row gap-2 items-center">
                  <CalendarDays className="hidden md:flex w-5 h-5 text-muted-foreground" />
                  <p className="text-left text-sm text-muted-foreground">
                    Invited on
                  </p>
                </div>
                <p className="text-left font-semibold">{invitedAt}</p>
              </div>

              <Separator orientation="vertical" />

              <div className="flex flex-col gap-3 items-start p-2">
                <div className="flex flex-row gap-2 items-center">
                  <ShieldCheck className="hidden md:flex w-5 h-5 text-muted-foreground" />
                  <p className="text-left text-sm text-muted-foreground">
                    Your role
                  </p>
                </div>
                <p className="text-left font-semibold">{role}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-row items-center justify-center gap-2">
          <Spinner />
          <p className="text-sm">Loading...</p>
        </div>
      )}

      <div className="flex flex-row gap-2 md:gap-4 items-center justify-between">
        <Button
          variant="destructive"
          disabled={buttonsLoading}
          onClick={handleDeclineInvitation}
          className="flex-1 flex-row gap-2 items-center px-4 py-6 md:py-8 md:text-lg"
        >
          <X className="w-4! h-4! md:w-5! md:h-5!" />
          Decline invitation
        </Button>

        <Button
          disabled={buttonsLoading}
          onClick={handleAcceptInvitation}
          className="flex-1 flex-row gap-2 items-center px-4 py-6 md:py-8 md:text-lg"
        >
          <Check className="w-4! h-4! md:w-5! md:h-5!" />
          Accept invitation
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        The owner of the list will only be notified if you accept the
        invitation.
      </p>

      <Toaster position="top-center" />
    </div>
  );
}

export default InvitePage;
