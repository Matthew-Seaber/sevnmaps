"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  ChevronUp,
  ChevronDown,
  CircleUserRound,
  WandSparkles,
  User,
  CreditCard,
  CircleQuestionMark,
  Settings,
  LogOut,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  sent: string;
  link: string;
  read: boolean;
}

function NavbarMenu({
  profileLink,
  name,
  notifications,
}: {
  profileLink: string;
  name: string;
  notifications: Notification[];
}) {
  const [notificationList, setNotificationList] =
    useState<Notification[]>(notifications);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  const unreadNotificationsCount = notificationList.filter(
    (notification) => !notification.read,
  ).length;

  async function markNotificationsAsRead() {
    if (unreadNotificationsCount > 0) {
      try {
        const response = await fetch("/api/notifications/mark_read", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationIDs: notificationList
              .filter((notification) => !notification.read)
              .map((notification) => notification.id),
          }),
        });

        if (!response.ok) {
          console.error(
            "Error marking notifications as read:",
            response.statusText,
          );
          return;
        }

        setNotificationList((prev) =>
          prev.map((notification) => ({ ...notification, read: true })),
        );
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    }
  }

  return (
    <>
      <div className="flex items-center gap-6 sm:gap-8 text-gray-700">
        <Popover
          open={notificationPanelOpen}
          onOpenChange={(open) => {
            setNotificationPanelOpen(open);

            if (open) {
              notificationTimeoutRef.current = setTimeout(() => {
                markNotificationsAsRead();
              }, 2000);
            } else if (notificationTimeoutRef.current) {
              clearTimeout(notificationTimeoutRef.current);
              notificationTimeoutRef.current = null;
            }
          }}
        >
          <PopoverTrigger className="relative cursor-pointer">
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-destructive/70 w-1.5 h-1.5 rounded-full" />
            )}
          </PopoverTrigger>
          <PopoverContent className="mt-2 mr-1 sm:mr-0">
            <div className="flex flex-col gap-4 p-2">
              <div className="flex flex-row items-center justify-between">
                <h2 className="font-semibold text-base">Notifications</h2>
                <p>{unreadNotificationsCount} unread</p>
              </div>

              {notificationList.length === 0 ? (
                <p className="text-sm text-center">No recent notifications.</p>
              ) : (
                <div className="flex flex-col gap-2 ">
                  {notificationList.map((notification) => (
                    <div
                      key={notification.id}
                      className={`${notification.link !== "" ? "cursor-pointer hover:bg-primary/30" : "cursor-default"} bg-primary/20 rounded-lg p-3 flex flex-col`}
                      onClick={() => {
                        if (notification.link !== "") {
                          window.location.href = notification.link;
                        }
                      }}
                    >
                      <div className="flex flex-row items-center gap-2">
                        {!notification.read ? (
                          <span className="bg-destructive/70 w-1.5 h-1.5 rounded-full" />
                        ) : null}
                        <p className="font-semibold">{notification.title}</p>
                      </div>

                      <p className="mb-2">{notification.message}</p>
                      <i className="text-xs text-muted-foreground">
                        {notification.sent}
                      </i>
                    </div>
                  ))}
                </div>
              )}

              <i className="text-muted-foreground text-xs">
                Note: notifications are automatically deleted after 2 weeks.
              </i>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-2 sm:gap-3 hover:cursor-pointer">
              {profileLink !== "" ? (
                <Image
                  src={profileLink}
                  alt="User's profile picture"
                  width={30}
                  height={30}
                  loading="eager"
                  className="w-auto h-auto rounded-full drop-shadow-xl"
                />
              ) : (
                <CircleUserRound
                  strokeWidth={1.5}
                  className="w-8 h-8 bg-primary text-primary-foreground rounded-full drop-shadow-xl"
                />
              )}
              <p className="hidden sm:flex font-semibold text-sm">{name}</p>
              {(menuOpen && <ChevronUp className="w-4 h-4" />) || (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mt-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  window.location.href = "/pricing";
                }}
              >
                <WandSparkles />
                Upgrade
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.location.href = "/profile";
                }}
              >
                <User />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.location.href = "/billing";
                }}
              >
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.location.href = "/contact";
                }}
              >
                <CircleQuestionMark />
                Support
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.location.href = "/settings";
                }}
              >
                <Settings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                onClick={async () => {
                  await authClient.signOut();
                  router.push("/login");
                }}
              >
                <LogOut />
                Logout
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

export default NavbarMenu;
