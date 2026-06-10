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
      h1={
        <>
          Text to PDF. <br className="hidden sm:inline" />
          Beautiful documents, instantly.
        </>
      }
      subtitle="A premium markdown editor that runs seamlessly in your browser. Draft, format, and export perfect A4 PDFs with absolute privacy."
      language="en"
    />
  );
}
