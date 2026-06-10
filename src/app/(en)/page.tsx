import React from "react";
import type { Metadata } from "next";
import LandingPageTemplate from "@/components/layout/LandingPageTemplate";

export const metadata: Metadata = {
  title: "Text to PDF | Minimal A4 Document Editor",
  description: "A clean, offline-first editor to format text and generate A4 PDF documents directly in your browser. Fully private with no server uploads.",
};

export default function LandingPage() {
  return (
    <LandingPageTemplate
      h1={
        <>
          Write text. <br className="hidden sm:inline" />
          Export beautiful PDFs.
        </>
      }
      subtitle="A minimal, offline-first document editor that runs entirely in your browser. No accounts, no uploads, 100% private."
      language="en"
    />
  );
}
