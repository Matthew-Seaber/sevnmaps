"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import ConfirmationPopup from "@/components/utility/ConfirmationPopup";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

interface Props {
  userInfo: {
    name: string;
    username: string;
    email: string;
  };
}

function SettingsForm({ userInfo }: Props) {
  const [fullName, setFullName] = useState(userInfo.name || "");
  const [username, setUsername] = useState(userInfo.username || "");
  const [email, setEmail] = useState(userInfo.email);
  const [loading, setLoading] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);

  const router = useRouter();

  async function saveChanges() {
    setLoading(true);

    try {
      if (fullName !== userInfo.name) {
        if (fullName.length === 0) {
          toast.info("Name field cannot be empty.");
          setLoading(false);
          return;
        }

        await authClient.updateUser({
          name: fullName,
        });
      }

      if (username !== userInfo.username) {
        if (username.length < 5) {
          toast.info("Username must be at least 5 characters long.");
          setLoading(false);
          return;
        }

        await fetch("/api/profile/update_username", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        });
      }

      toast.success("Changes saved.");
      window.location.reload();
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes. Please try again.");
      setLoading(false);
    }
  }

  async function deleteAccount() {
    const deletePromise = authClient.deleteUser();

    toast.promise(deletePromise, {
      loading: "Deleting account...",
      success: "Account deleted successfully.",
      error: "Failed to delete account. Please try again later.",
    });

    try {
      await deletePromise;

      await authClient.signOut();

      setTimeout(() => {
        router.push("/signup");
      }, 1500);
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  }

  const noChanges =
    fullName === userInfo.name &&
    username === userInfo.username &&
    email === userInfo.email;

  return (
    <>
      <Label htmlFor="fullName" className="px-2 py-3 text-md">
        Name
      </Label>
      <Input
        id="fullName"
        className="px-3 py-5 sm:max-w-[256px]"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <Label htmlFor="username" className="px-2 py-3 text-md">
        Username
      </Label>
      <Input
        id="username"
        className="px-3 py-5 sm:max-w-[256px]"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <Label htmlFor="email" className="px-2 py-3 text-md">
        Email
      </Label>
      <Input
        id="email"
        className="px-3 py-5 sm:max-w-100"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled
      />
      <p className="text-muted-foreground text-xs mt-2 ml-1">
        Note: you are temporarily unable to change your email address.
      </p>

      <Button
        size="lg"
        className="mt-6 h-10 px-6"
        disabled={loading || noChanges}
        onClick={saveChanges}
      >
        {loading ? "Saving..." : "Save changes"}
      </Button>

      <Separator className="mt-8" />

      <div className="flex flex-row gap-2 mt-8">
        <Button
          size="lg"
          className="h-10 px-6"
          onClick={async () => {
            await authClient.signOut();
            router.push("/login");
          }}
        >
          Logout
        </Button>
        <Button
          variant="destructive"
          size="lg"
          className="h-10 px-6"
          onClick={() => setDeletePopupOpen(true)}
        >
          Delete SevnMaps account
        </Button>
      </div>

      <Toaster position="top-center" />
      <ConfirmationPopup
        open={deletePopupOpen}
        setOpen={setDeletePopupOpen}
        title="Delete account"
        message="Are you sure you want to permanently delete your SevnMaps account?"
        destructive={true}
        confirmText="Delete account"
        cancelText="Cancel"
        onConfirm={deleteAccount}
      />
    </>
  );
}

export default SettingsForm;
