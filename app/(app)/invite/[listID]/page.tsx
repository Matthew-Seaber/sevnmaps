"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Image from "next/image";
import { Check, MailPlus, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

function InvitePage() {
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [invitedBy, setInvitedBy] = useState("");
  const [invitedAt, setInvitedAt] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const listID = params.listID as string;

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
        setInvitedAt(data.invitedAt);
        setRole(data.role);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching invite details:", error);
      }
    };

    fetchInviteDetails();
  }, [listID]);

  return (
    <div className="max-w-5xl text-center flex flex-col gap-4 mx-auto p-4 md:p-8">
      <div className="flex flex-col gap-4">
        <div className="w-24 h-24 bg-primary/15 p-4 flex rounded-full">
          <MailPlus className="text-primary justify mx-auto my-auto" />
        </div>

        <h1 className="font-bold text-2xl md:text-5xl text-center">
          You&apos;ve been <span className="text-primary">invited</span> to a
          list!
        </h1>
        <p className="text-lg text-muted-foreground">
          Join a shared list to collaborate and explore with others.
        </p>
      </div>

      {!loading && (
        <div className="flex flex-row items-center p-4 border border-border shadow-sm">
          <Image
            src="/assets/square-placeholder.png"
            alt=""
            width={64}
            height={64}
            className="rounded-md"
          />

          <div className="flex flex-col">
            <div>
              <h2>{listName}</h2>
              <p>{listDescription}</p>
            </div>

            <Separator />

            <div className="flex flex-row">
              <div>
                <p>Invited by</p>
                <p>{invitedBy}</p>
              </div>
              <Separator orientation="vertical" />
              <div>
                <p>Invited at</p>
                <p>{invitedAt}</p>
              </div>
              <Separator orientation="vertical" />
              <div>
                <p>Your role</p>
                <p>{role}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-row gap-4 items-center justify-between">
        <Button
          variant="destructive"
          disabled={loading}
          className="flex flex-row gap-2 items-center"
        >
          <X />
          Decline invitation
        </Button>

        <Button disabled={loading} className="flex flex-row gap-2 items-center">
          <Check />
          Accept invitation
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        The owner of the list will only be notified if you accept the
        invitation.
      </p>
    </div>
  );
}

export default InvitePage;
