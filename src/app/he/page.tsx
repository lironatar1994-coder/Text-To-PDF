import React from "react";
import type { Metadata } from "next";
import LandingPageTemplate from "@/components/layout/LandingPageTemplate";

export const metadata: Metadata = {
  title: "Text to PDF | יצירת מסמכים בקלות ובאלגנטיות",
  description: "ערוך וייצא קובצי A4 PDF מושלמים ישירות מהדפדפן. עורך טקסט פרמיום המיועד למהירות ופרטיות מוחלטת ללא העלאת קבצים לשרת.",
};

export default function HebrewLandingPage() {
  return (
    <LandingPageTemplate
      h1="מסמכי PDF יפהפיים, ברגע."
      subtitle="העורך הפרטי שלך, ישירות בדפדפן, ליצירת מסמכי A4 מושלמים."
      ctaText="התחל לכתוב"
      language="he"
    />
  );
}
