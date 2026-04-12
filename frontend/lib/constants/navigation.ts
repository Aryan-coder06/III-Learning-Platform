import {
  BellRing,
  FileStack,
  Globe,
  LayoutDashboard,
  MessageSquareText,
  MonitorPlay,
  PanelsTopLeft,
  Settings,
  UsersRound,
  GraduationCap
} from "lucide-react";

export const workspaceNavItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Private Rooms",
    href: "/rooms",
    icon: UsersRound,
  },
  {
    label: "Public Rooms",
    href: "/public-rooms",
    icon: Globe,
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
    label: "Skill Share",
    href: "/skill-share",
    icon: GraduationCap,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
