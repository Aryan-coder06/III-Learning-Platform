import {
  BellRing,
  FileStack,
  LayoutDashboard,
  MessageSquareText,
  MonitorPlay,
  PanelsTopLeft,
  Settings,
  UsersRound,
} from "lucide-react";

export const workspaceNavItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Study Rooms",
    href: "/rooms",
    icon: UsersRound,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquareText,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileStack,
  },
  {
    label: "Whiteboard",
    href: "/whiteboard",
    icon: PanelsTopLeft,
  },
  {
    label: "Sessions",
    href: "/sessions",
    icon: MonitorPlay,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: BellRing,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
