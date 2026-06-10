import React from "react";
import type { Metadata } from "next";
import LandingPageTemplate from "@/components/layout/LandingPageTemplate";

export const metadata: Metadata = {
  title: "Text to PDF | Turn Text into Beautiful PDFs Instantly",
  description: "The lightning-fast, distraction-free A4 PDF editor that runs locally in your browser. No server uploads, no signups, 100% private.",
};

export default function LandingPage() {
  return (
    <LandingPageTemplate
      h1={
        <>
          Turn Text into <br className="hidden sm:inline" />
          Beautiful PDFs.
        </>
      }
      subtitle="The lightning-fast, distraction-free editor that runs locally in your browser. No server uploads. No accounts required."
      language="en"
    />
  );
}
