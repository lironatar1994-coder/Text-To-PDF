import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import Script from "next/script";
import "../globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "מחולל PDF בעברית - המרה קלה ומהירה של טקסט ל-PDF",
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
      className={`${rubik.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
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
        style={{ fontFamily: "var(--font-rubik), system-ui, -apple-system, sans-serif" }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
