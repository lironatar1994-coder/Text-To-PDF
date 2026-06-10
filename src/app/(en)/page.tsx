import React from "react";
import type { Metadata } from "next";
import LandingPageTemplate from "@/components/layout/LandingPageTemplate";

export const metadata: Metadata = {
  title: "Text to PDF | Beautifully Simple Document Creation",
  description: "Craft and export flawless A4 PDFs directly in your browser. A premium, offline-first markdown editor designed for speed and absolute privacy.",
};

export default function LandingPage() {
  return (
    <LandingPageTemplate
      h1="Beautiful PDFs, instantly."
      subtitle="The private, browser-based text editor for perfect A4 documents."
      ctaText="Start Writing"
      language="en"
    />
  );
}
