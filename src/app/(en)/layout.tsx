import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import Script from "next/script";
import "../globals.css";

const ibmPlex = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "Free Online Text to PDF Converter | Live Preview & Editor | Text to PDF",
  description:
    "Write, edit, and format text with our distraction-free WYSIWYG editor and instantly convert it to a beautifully formatted A4 PDF. 100% free, no server uploads, fully private.",
  openGraph: {
    title: "Free Online Text to PDF Converter | Live Preview & Editor | Text to PDF",
    description:
      "Write, edit, and format text with our distraction-free WYSIWYG editor and instantly convert it to a beautifully formatted A4 PDF. 100% free, no server uploads, fully private.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Text to PDF Converter | Live Preview & Editor | Text to PDF",
    description:
      "Write, edit, and format text with our distraction-free WYSIWYG editor and instantly convert it to a beautifully formatted A4 PDF. 100% free, no server uploads, fully private.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlex.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Canonical & Hreflang SEO Tags */}
        <link rel="canonical" href="https://vee-app.co.il/text-to-pdf" />
        <link rel="alternate" hrefLang="en" href="https://vee-app.co.il/text-to-pdf" />
        <link rel="alternate" hrefLang="he" href="https://vee-app.co.il/text-to-pdf/he" />
        <link rel="alternate" hrefLang="x-default" href="https://vee-app.co.il/text-to-pdf" />

        {/* html2pdf.js CDN - Loaded externally to prevent Turbopack/Next.js memory leaks during bundling */}
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
