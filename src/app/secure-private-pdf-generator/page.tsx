import React from "react";
import type { Metadata } from "next";
import LandingPageTemplate from "@/components/layout/LandingPageTemplate";

export const metadata: Metadata = {
  title: "Secure Client-Side PDF Creator | 100% Private",
  description: "Your data never leaves your device. Generate sensitive invoices and documents completely offline using browser-level security.",
};

export default function SecurePrivatePdfPage() {
  return (
    <LandingPageTemplate
      h1="100% Private, Client-Side PDF Creator."
      subtitle="Your data never leaves your device. Generate sensitive invoices and documents completely offline using browser-level security."
      ctaText="Create Secure PDF"
    />
  );
}
