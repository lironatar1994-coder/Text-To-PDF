import React from "react";
import type { Metadata } from "next";
import LandingPageTemplate from "@/components/layout/LandingPageTemplate";

export const metadata: Metadata = {
  title: "מחולל PDF מקומי ומהיר בעברית | Text to PDF",
  description: "המרת טקסט למסמכי PDF מעוצבים בגודל A4 באופן מיידי ובאופן מקומי לחלוטין בדפדפן שלך. ללא העלאת קבצים וללא הרשמה.",
};

export default function HebrewLandingPage() {
  return (
    <LandingPageTemplate
      h1={
        <>
          הפוך טקסט לקבצי <br className="hidden sm:inline" />
          PDF מעוצבים ומקצועיים.
        </>
      }
      subtitle="עורך מהיר במיוחד, ללא הסחות דעת, הפועל ישירות ומקומית בדפדפן שלך. ללא העלאת קבצים לשרתים וללא צורך ברישום."
      ctaText="פתח את העורך החינמי"
      language="he"
    />
  );
}
