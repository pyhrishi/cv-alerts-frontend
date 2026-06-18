import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cyber Vision — Alert Console",
  description: "OT/ICS alert dashboard for Cisco Cyber Vision (security · operations · vulnerability exposure).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ot-bg text-ot-text font-sans antialiased">{children}</body>
    </html>
  );
}
