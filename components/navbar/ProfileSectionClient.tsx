"use client";

import NavbarMenu from "./NavbarMenu";

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
  nameVisible: "default" | "true" | "false";
}

function ProfileSectionClient({
  profileLink,
  name,
  notifications,
  notificationSide,
  nameVisible,
}: Props) {
  return (
    <NavbarMenu
      profileLink={profileLink}
      name={name}
      notifications={notifications}
      notificationSide={notificationSide}
      nameVisible={nameVisible}
      chevronVisible={false}
    />
  );
}

export default ProfileSectionClient;
