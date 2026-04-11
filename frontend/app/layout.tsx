import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk, Manrope } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

const fontDisplay = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const fontBody = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StudySync AI",
    template: "%s | StudySync AI",
  },
  description:
    "A collaborative study operating system for rooms, messaging, files, whiteboards, sessions, and reminders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
