"use client";

import { Bell, Shield, User, Laptop } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceSectionHeading } from "@/components/shared/workspace-section-heading";
import { useAuthStore } from "@/lib/auth/auth-store";
import { cn } from "@/lib/utils";

interface SettingsViewProps {
  className?: string;
}

export function SettingsView({ className }: SettingsViewProps) {
  const user = useAuthStore((state) => state.user);

  const settingsSections = [
    {
      id: "profile",
      title: "Profile Settings",
      description: "Manage your public profile and account details.",
      icon: User,
      fields: [
        { label: "Display Name", value: user?.name || "Not set" },
        { label: "Email Address", value: user?.email || "Not set" },
      ],
    },
    {
      id: "notifications",
      title: "Notification Preferences",
      description: "Control how and when you receive alerts.",
      icon: Bell,
      fields: [
        { label: "Email Notifications", value: "Enabled" },
        { label: "Desktop Alerts", value: "Enabled" },
      ],
    },
    {
      id: "security",
      title: "Security & Privacy",
      description: "Manage your password and account security.",
      icon: Shield,
      fields: [
        { label: "Two-Factor Auth", value: "Disabled" },
        { label: "Last Login", value: "Today at 10:42 AM" },
      ],
    },
    {
      id: "workspace",
      title: "Workspace Appearance",
      description: "Customize your dashboard and theme.",
      icon: Laptop,
      fields: [
        { label: "Theme", value: "Swiss Dark / Light" },
        { label: "Sidebar State", value: "Expanded" },
      ],
    },
  ];

  return (
    <div className={cn("grid gap-6", className)}>
      {settingsSections.map((section) => (
        <Card key={section.id}>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/45 text-accent">
                <section.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <WorkspaceSectionHeading
                  title={section.title}
                  description={section.description}
                />
                <div className="mt-6 grid gap-4 border-t border-border/50 pt-6 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <div key={field.label} className="space-y-1">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {field.label}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
