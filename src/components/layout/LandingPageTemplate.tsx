import React from "react";
import Link from "next/link";
import { Zap, Type, Lock, Feather, ArrowRight } from "lucide-react";
import Image from "next/image";
import logoImg from "../../../public/logo.png";

interface LandingPageTemplateProps {
  h1: React.ReactNode;
  subtitle: string;
  ctaText?: string;
}

export default function LandingPageTemplate({
  h1,
  subtitle,
  ctaText = "Open Free Editor",
}: LandingPageTemplateProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 font-sans relative overflow-x-hidden">
      
      {/* Ambient glow absolute background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] sm:w-[800px] sm:h-[800px] bg-gradient-to-tr from-indigo-200/20 to-violet-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navbar header */}
      <header className="w-full h-16 bg-white/70 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40 flex items-center justify-between px-6 sm:px-12">
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
          <span className="text-xl font-bold tracking-tight text-slate-900">Text to PDF</span>
        </div>
        <Link
          href="/editor"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4.5 py-1.5 text-sm rounded-lg shadow-sm hover:shadow transition-all hover:scale-105 active:scale-95 duration-150 cursor-pointer"
        >
          Open Editor
        </Link>
      </header>

      {/* Hero & App Preview Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center py-20 px-6 sm:px-12 max-w-5xl mx-auto z-10">

        {/* H1 Headline - Stark black with tracking-tight */}
        <h1 className="animate-fade-in-up animate-delay-100 opacity-0-init text-4xl sm:text-6xl font-extrabold tracking-tighter text-slate-900 leading-tight mb-6 max-w-3xl">
          {h1}
        </h1>

        {/* H2 Subheadline - Snug leading with darker gray text */}
        <p className="animate-fade-in-up animate-delay-100 opacity-0-init text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-snug font-medium">
          {subtitle}
        </p>

        {/* Call to Action Button - Rectangular with gradient, glow, and hover scales */}
        <div className="animate-fade-in-up animate-delay-100 opacity-0-init mb-16">
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-8 py-4 text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all hover:scale-[1.03] active:scale-95 duration-150 group cursor-pointer"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 duration-150" />
          </Link>
        </div>

        {/* Browser App Mockup Visual */}
        <div className="w-full max-w-4xl px-4 mt-4 animate-fade-in-up animate-delay-200 opacity-0-init [perspective:1200px] overflow-hidden sm:overflow-visible py-4">
          <div 
            className="bg-[#1e1e24] border border-slate-800 rounded-2xl shadow-2xl shadow-indigo-500/15 overflow-hidden w-full transition-all duration-500 hover:scale-[1.02] hover:shadow-indigo-500/25 flex flex-col"
            style={{ 
              transform: "rotateX(8deg) rotateY(-2deg) rotateZ(1deg)",
              transformStyle: "preserve-3d"
            }}
          >
            {/* Browser Header controls */}
            <div className="bg-[#121216] border-b border-slate-800 px-4 py-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              </div>
              <div className="bg-[#1e1e24] border border-slate-800/85 rounded-md text-[10px] text-slate-500 px-12 py-1 font-medium select-none truncate max-w-[200px] sm:max-w-none">
                text-to-pdf.com/demo
              </div>
              <div className="w-12" />
            </div>
            
            {/* App Preview Video */}
            <div className="bg-[#18181c] relative w-full aspect-video select-none overflow-hidden">
              <video
                src="/this_is_a_web_i_created_named.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </div>

        {/* Bento Box Feature Layout */}
        <section className="w-full mt-28 sm:mt-36 max-w-4xl px-4 animate-fade-in-up animate-delay-300 opacity-0-init">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-10 text-center">
            Designed for speed. Engineered for privacy.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: Markdown (2-column wide span) */}
            <div className="md:col-span-2 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between items-start text-left min-h-[180px] gap-4">
              <div className="bg-slate-100 text-slate-950 p-2.5 rounded-xl w-fit">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Markdown Shortcuts</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-normal font-medium max-w-md">
                  Write at the speed of thought. Use shortcuts like `#` for headers and `**` for bolding to format document text instantly without lifting your hands.
                </p>
              </div>
            </div>

            {/* Box 2: Typography (1-column square) */}
            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between items-start text-left min-h-[180px] gap-4">
              <div className="bg-slate-100 text-slate-950 p-2.5 rounded-xl w-fit">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Typography Themes</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-normal font-medium">
                  Style text layouts instantly with Modern (Sans), Classic (Serif), and Technical (Mono) font themes.
                </p>
              </div>
            </div>

            {/* Box 3: Local Auto-Save (1-column square) */}
            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between items-start text-left min-h-[180px] gap-4">
              <div className="bg-slate-100 text-slate-950 p-2.5 rounded-xl w-fit">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">100% Client-Side</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-normal font-medium">
                  Drafts auto-save to browser storage cache. Total privacy with zero server uploads.
                </p>
              </div>
            </div>

            {/* Box 4: PDF Export (2-column wide span) */}
            <div className="md:col-span-2 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between items-start text-left min-h-[180px] gap-4">
              <div className="bg-slate-100 text-slate-950 p-2.5 rounded-xl w-fit">
                <Feather className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Perfect A4 PDF Exports</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-normal font-medium max-w-md">
                  Export formatted drafts in one click. Perfect page breaks, text margins, and optional diagonal watermarks.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full bg-white border-t border-slate-200/60 py-8 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
        <span className="text-xs font-semibold text-slate-400 select-none">
          © {new Date().getFullYear()} Text to PDF. All rights reserved.
        </span>
        <div className="flex gap-6">
          <Link
            href="#"
            className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
