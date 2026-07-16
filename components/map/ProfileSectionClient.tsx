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
    <div className="flex justify-between items-center">
      <NavbarMenu
        profileLink={profileLink}
        name={name}
        notifications={notifications}
        notificationSide={notificationSide}
        chevronVisible={false}
      />
    </div>
  );
}

export default ProfileSectionClient;
