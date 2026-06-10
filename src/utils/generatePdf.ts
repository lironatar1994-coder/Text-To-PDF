export const generatePdf = async (element: HTMLElement, filename: string = "document.pdf") => {
  // @ts-expect-error - Loaded globally via CDN script to prevent Next.js RAM loops
  const html2pdf = window.html2pdf;
  if (!html2pdf) throw new Error("PDF generator not loaded. Please try again in a moment.");

  const opt = {
    margin: [15, 0, 15, 0] as [number, number, number, number], // top, left, bottom, right in mm
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      letterRendering: true,
      onclone: (clonedDoc: Document) => {
        // 1. Inject a style element to override Tailwind v4 OKLCH CSS variables with hex equivalents
        const style = clonedDoc.createElement("style");
        style.innerHTML = `
          :root, html, body {
            --color-slate-50: #f8fafc !important;
            --color-slate-100: #f1f5f9 !important;
            --color-slate-200: #e2e8f0 !important;
            --color-slate-300: #cbd5e1 !important;
            --color-slate-400: #94a3b8 !important;
            --color-slate-500: #64748b !important;
            --color-slate-600: #475569 !important;
            --color-slate-700: #334155 !important;
            --color-slate-800: #1e293b !important;
            --color-slate-900: #0f172a !important;
            --color-indigo-50: #e0e7ff !important;
            --color-indigo-100: #e0e7ff !important;
            --color-indigo-600: #4f46e5 !important;
            --color-indigo-700: #4338ca !important;
            --color-violet-600: #7c3aed !important;
            --color-violet-700: #6d28d9 !important;
          }
          /* Fallbacks for editor empty paragraph styling */
          .tiptap p.is-editor-empty:first-child::before {
            color: #9ca3af !important;
          }
        `;
        clonedDoc.head.appendChild(style);

        // 2. Loop through all cloned elements and replace any computed OKLCH/LAB colors with fallback hex codes
        const elements = clonedDoc.getElementsByTagName("*");
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i] as HTMLElement;
          try {
            const computed = clonedDoc.defaultView?.getComputedStyle(el);
            if (!computed) continue;

            const colorProps = ["color", "backgroundColor", "borderColor", "outlineColor"];
            for (const prop of colorProps) {
              const val = computed[prop as any];
              if (val && (val.includes("oklch") || val.includes("lab"))) {
                if (prop === "backgroundColor") {
                  el.style.backgroundColor = "#ffffff";
                } else if (prop === "borderColor") {
                  el.style.borderColor = "#cbd5e1";
                } else {
                  el.style.color = "#0f172a";
                }
              }
            }
          } catch (e) {
            // Ignore frame/style errors
          }
        }
      }
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  const originalShadow = element.style.boxShadow;
  const originalBorder = element.style.border;
  // Remove styles that look weird in the PDF output
  element.style.boxShadow = "none";
  element.style.border = "none";

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await html2pdf().set(opt as any).from(element).save();
  } finally {
    // Restore original styles
    element.style.boxShadow = originalShadow;
    element.style.border = originalBorder;
  }
};
