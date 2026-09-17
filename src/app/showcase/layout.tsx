import React from "react";
import type { Metadata } from "next";
import { ShowcaseNav } from "@/components/ShowcaseNav";

export const metadata: Metadata = {
  title: "Shadowcasting Showcase Gallery",
  description:
    "Curated design studies exploring realistic dynamic shadow casting across editorial and architectural layouts.",
};

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 relative">
      <ShowcaseNav />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
