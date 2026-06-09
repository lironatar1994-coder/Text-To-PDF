"use client";

import { useEffect, useRef } from "react";

export default function AdBannerPlaceholder() {
  const adInit = useRef(false);

  useEffect(() => {
    if (!adInit.current && typeof window !== "undefined") {
      try {
        // @ts-expect-error adsbygoogle is added by the external script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adInit.current = true;
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, []);

  return (
    <div className="flex flex-col w-full items-center justify-center mx-auto shrink-0 overflow-hidden min-h-[50px] relative">
      {/* Fallback layout to preserve dimensions before ads load */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-400 border border-slate-200 bg-slate-50/50 rounded pointer-events-none z-0 max-w-[320px] mx-auto w-full h-[50px]">
        Advertisement
      </div>
      
      {/* Actual AdSense Tag */}
      <div className="z-10 flex justify-center w-full min-w-[320px] min-h-[50px]">
        <ins
          className="adsbygoogle"
          style={{ display: "inline-block", width: "320px", height: "50px" }}
          data-ad-client="ca-pub-0000000000000000"
          data-ad-slot="1234567890"
        ></ins>
      </div>
    </div>
  );
}
