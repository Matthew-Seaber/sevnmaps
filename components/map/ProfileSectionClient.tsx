"use client";

import NavbarMenu from "../navbar/NavbarMenu";

interface Notification {
  id: string;
  title: string;
  message: string;
  sent: string;
  link: string;
  read: boolean;
}

interface Props {
  profileLink: string;
  name: string;
  notifications: Notification[];
  notificationSide: "left" | "right";
}

function ProfileSectionClient({
  profileLink,
  name,
  notifications,
  notificationSide,
}: Props) {
  return (
    <div className="px-4 sm:px-6 flex justify-between items-center py-4">
      <NavbarMenu
        profileLink={profileLink}
        name={name}
        notifications={notifications}
        notificationSide={notificationSide}
      />
    </div>
  );
}

export default ProfileSectionClient;
