"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AdBannerPlaceholder from "@/components/layout/AdBannerPlaceholder";
import { generatePdf } from "@/utils/generatePdf";
import { FileDown, FolderOpen } from "lucide-react";
import ExportModal from "@/components/editor/ExportModal";
import Image from "next/image";
import logoImg from "../../../public/logo.png";

const TipTapEditor = dynamic(() => import("@/components/editor/TipTapEditor"), {
  ssr: false,
});

export default function EditorPage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const titleRef = useRef<string>("");
  const editorApiRef = useRef<{ getText: () => string } | null>(null);

  // Hebrew RTL & Language State
  const [language, setLanguage] = useState<"en" | "he">("en");
  const isRtl = language === "he";

  useEffect(() => {
    const savedLang = localStorage.getItem("app_language") as "en" | "he";
    if (savedLang) {
      setLanguage(savedLang);
      document.documentElement.dir = savedLang === "he" ? "rtl" : "ltr";
    }
  }, []);

  const handleLanguageChange = (lang: "en" | "he") => {
    setLanguage(lang);
    localStorage.setItem("app_language", lang);
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  };

  const handleExportPdf = async () => {
    if (!editorRef.current) return;
    
    setIsExporting(true);
    try {
      const filename = `${titleRef.current.trim() || "Untitled Document"}.pdf`;
      await generatePdf(editorRef.current, filename);
      setIsModalOpen(false); // Close modal on successful download
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = editorApiRef.current?.getText()?.trim();
    if (!text) {
      alert("Your document is empty! Please write something before sharing.");
      return;
    }

    const title = titleRef.current.trim() ? `*${titleRef.current.trim()}*\n\n` : "";
    const promoFooter = `\n\n---\nFormatted and generated for free via Text to PDF - www.yourdomain.com`;
    const finalMessage = `${title}${text}${promoFooter}`;
    
    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-slate-50 font-sans">
      {/* Header */}
      <header className="shrink-0 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <Image 
              src={logoImg} 
              alt="Text to PDF logo" 
              width={28} 
              height={28} 
              className="h-7 w-7 object-cover"
            />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">Text to PDF</h1>
        </div>
        <div className="flex items-center gap-2.5">
          {/* History Toggle Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:scale-[1.01] active:scale-95 transition-all duration-150 cursor-pointer"
            aria-label="Open document history"
          >
            <FolderOpen className="h-4 w-4 text-slate-500" />
            <span>History</span>
          </button>
          
          {/* Primary Export Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.01] active:scale-95 duration-150 cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <TipTapEditor 
          editorRef={editorRef} 
          titleRef={titleRef} 
          editorApiRef={editorApiRef} 
          isHistoryOpen={isHistoryOpen}
          onCloseHistory={() => setIsHistoryOpen(false)}
          isRtl={isRtl}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
      </main>

      {/* Ad Space */}
      <div className="hidden sm:block shrink-0 bg-white border-t border-slate-200 p-2 sm:p-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] z-10 relative">
        <AdBannerPlaceholder />
      </div>
      
      {/* Success Export and Share Modal */}
      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDownload={handleExportPdf}
        onShare={handleShareWhatsApp}
        isExporting={isExporting}
        documentTitle={titleRef.current}
      />
    </div>
  );
}
