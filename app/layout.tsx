import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Social Post Helper",
  description: "Metadata-first social post drafting MVP with deterministic templates."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
