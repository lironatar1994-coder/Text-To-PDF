export const generatePdf = async (element: HTMLElement, filename: string = "document.pdf") => {
  // @ts-expect-error - Loaded globally via CDN script to prevent Next.js RAM loops
  const html2pdf = window.html2pdf;
  if (!html2pdf) throw new Error("PDF generator not loaded. Please try again in a moment.");

  const opt = {
    margin: [15, 0, 15, 0] as [number, number, number, number], // top, left, bottom, right in mm
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
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
