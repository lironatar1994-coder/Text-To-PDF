import React from "react";
import type { Metadata } from "next";
import LandingPageTemplate from "@/components/layout/LandingPageTemplate";

export const metadata: Metadata = {
  title: "RTL Hebrew PDF Generator | Text to PDF",
  description: "Flawless right-to-left alignment, Hebrew typography, and secure local editing. Create professional Israeli documents fast.",
};

export default function HebrewTextToPdfPage() {
  return (
    <LandingPageTemplate
      h1="The Native RTL Hebrew PDF Generator."
      subtitle="Flawless right-to-left alignment, Hebrew typography, and secure local editing. Create professional Israeli documents fast."
      ctaText="Generate Hebrew PDF"
    />
  );
}
