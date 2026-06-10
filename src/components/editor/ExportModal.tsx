"use client";

import React from "react";
import { X, FileDown, Share2, ShieldCheck, Loader2, PartyPopper, Lock } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
  isExporting: boolean;
  documentTitle: string;
  language?: "en" | "he";
}

export default function ExportModal({
  isOpen,
  onClose,
  onDownload,
  onShare,
  isExporting,
  documentTitle,
  language = "en",
}: ExportModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const finalTitle = documentTitle.trim() || (language === "he" ? "כותרת כאן" : "Title here");

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-2xl relative flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isExporting}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon / Illustration */}
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4 mt-2 shadow-inner">
          <ShieldCheck className="w-9 h-9" />
        </div>

        {/* Header Title with PartyPopper icon and Title Truncation */}
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug px-1 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 mb-5">
          <PartyPopper className="w-5 h-5 text-indigo-500 shrink-0" />
          <span>Your Document</span>
          <span 
            className="inline-block max-w-[160px] align-bottom truncate text-indigo-600 font-bold"
            title={finalTitle}
          >
            &ldquo;{finalTitle}&rdquo;
          </span>
          <span>is Ready!</span>
        </h3>

        {/* Actions List */}
        <div className="w-full flex flex-col gap-3">
          {/* Download Action */}
          <button
            onClick={() => {
              onDownload();
            }}
            disabled={isExporting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 duration-150 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileDown className="w-5 h-5" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          {/* Share Action */}
          <button
            onClick={() => {
              onShare();
              onClose(); // Close modal upon redirecting to share
            }}
            disabled={isExporting}
            className="w-full bg-emerald-50 hover:bg-emerald-100 disabled:opacity-55 text-emerald-700 border border-emerald-200/80 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 duration-150 disabled:scale-100 disabled:cursor-not-allowed"
          >
            <Share2 className="w-5 h-5" />
            <span>Share to WhatsApp</span>
          </button>
        </div>

        {/* Trust Footer with Lock Icon */}
        <div className="flex items-center gap-1.5 mt-5 text-[11px] font-semibold text-slate-400 select-none">
          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Generated locally. Your data is 100% private.</span>
        </div>
        
      </div>
    </div>
  );
}
