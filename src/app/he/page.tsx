import React from "react";
import type { Metadata } from "next";
import LandingPageTemplate from "@/components/layout/LandingPageTemplate";

export const metadata: Metadata = {
  title: "Text to PDF | עורך מסמכים מינימלי לייצוא PDF",
  description: "ערוך טקסט ועצב מסמכי A4 PDF ישירות בדפדפן באופן מקומי ומאובטח לחלוטין. ללא הרשמה וללא העלאת קבצים לשרת.",
};

export default function HebrewLandingPage() {
  return (
    <LandingPageTemplate
      h1={
        <>
          כתוב טקסט. <br className="hidden sm:inline" />
          ייצא קובצי PDF מעוצבים.
        </>
      }
      subtitle="עורך מסמכים מינימליסטי הפועל ישירות ובאופן מקומי בדפדפן. ללא הרשמה, ללא שרתים, 100% פרטי."
      ctaText="פתח את העורך החינמי"
      language="he"
    />
  );
}
