import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeFlow - Life Management Dashboard",
  description: "Manage your life with MeFlow - Track expenses, todos, projects, and entertainment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

