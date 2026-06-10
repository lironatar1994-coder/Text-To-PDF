import type { Metadata } from "next";
import { IBM_Plex_Sans_Hebrew } from "next/font/google";
import Script from "next/script";
import "../globals.css";

const ibmPlex = IBM_Plex_Sans_Hebrew({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["hebrew", "latin"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "מחולל PDF בעברית - המרה קלה ומהירה של טקסט ל-PDF | Text to PDF",
  description: "כתוב, ערוך ועצב טקסט בעברית באופן חופשי ומקומי בדפדפן וייצא אותו לקובץ PDF מושלם בגודל A4. ללא העלאת נתונים לשרת, 100% פרטי ומאובטח.",
};

export default function HebrewRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${ibmPlex.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Canonical & Hreflang SEO Tags */}
        <link rel="canonical" href="https://vee-app.co.il/text-to-pdf/he" />
        <link rel="alternate" hrefLang="en" href="https://vee-app.co.il/text-to-pdf" />
        <link rel="alternate" hrefLang="he" href="https://vee-app.co.il/text-to-pdf/he" />
        <link rel="alternate" hrefLang="x-default" href="https://vee-app.co.il/text-to-pdf" />

        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
          strategy="beforeInteractive"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body 
        className="min-h-full flex flex-col" 
        style={{ fontFamily: "var(--font-ibm-plex), system-ui, -apple-system, sans-serif" }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
