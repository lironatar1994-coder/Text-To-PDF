import React from "react";
import type { Metadata } from "next";
import LandingPageTemplate from "@/components/layout/LandingPageTemplate";

export const metadata: Metadata = {
  title: "Convert Markdown to PDF Instantly | Text to PDF",
  description: "Write in standard markdown and generate beautiful, perfectly formatted A4 PDFs right in your browser. No server uploads. 100% private.",
};

export default function MarkdownToPdfPage() {
  return (
    <LandingPageTemplate
      h1="Convert Markdown to PDF Instantly."
      subtitle="Write in standard markdown and generate beautiful, perfectly formatted A4 PDFs right in your browser. No server uploads."
      ctaText="Start Converting Markdown"
      language="en"
    />
  );
}
