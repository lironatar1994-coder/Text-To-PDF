import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Quote,
  List,
  ListOrdered,
  Settings2,
  ChevronDown,
  Check,
  Trash2,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

export type FontTheme = "font-sans" | "font-serif" | "font-mono";

interface EditorToolbarProps {
  editor: Editor | null;
  theme: FontTheme;
  setTheme: (theme: FontTheme) => void;
  watermark: string;
  setWatermark: (watermark: string) => void;
  onSelectTemplate: (template: string) => void;
  language: "en" | "he";
  onClearDocument: () => void;
}

const ToolbarButton = ({
  onClick,
  isActive,
  children,
}: {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={cn(
      "p-2 rounded-md hover:bg-indigo-50 transition-colors text-slate-600 hover:text-indigo-600 focus:outline-none focus-visible:outline-none shrink-0",
      isActive && "bg-indigo-100 text-indigo-700 shadow-inner"
    )}
  >
    {children}
  </button>
);

export function EditorToolbar({
  editor,
  theme,
  setTheme,
  watermark,
  setWatermark,
  onSelectTemplate,
  language,
  onClearDocument,
}: EditorToolbarProps) {
  // States
  const [showStampsPopover, setShowStampsPopover] = useState(false);
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [showAlignPopover, setShowAlignPopover] = useState(false);
  const [savedStamps, setSavedStamps] = useState<{ id: string; src: string }[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    en: {
      templatesPlaceholder: "Templates...",
      templateBlank: "Blank Document",
      templateLetter: "Formal Letter",
      templateInvoice: "Simple Invoice",
      fontSans: "Modern (Sans)",
      fontSerif: "Classic (Serif)",
      fontMono: "Technical (Mono)",
      watermarkPlaceholder: "Watermark...",
      watermarkMobilePlaceholder: "Type watermark...",
      stampLibraryHeader: "Stamp & Signature Library",
      stampLibrarySub: "Max 400px (WebP)",
      stampLibraryEmpty: "No stamps saved yet",
      stampUploadBtn: "➕ Upload New Stamp",
      deleteStampTooltip: "Delete stamp",
      actionsHeader: "Actions",
      clearCanvasBtn: "Clear Canvas",
      mobileTemplates: "Templates",
      mobileFonts: "Fonts",
      mobileWatermark: "Watermark",
      mobileClearDoc: "Clear Document",
      stampsTooltip: "Stamps / Signatures",
      settingsTooltip: "Settings",
      styleNormal: "Normal Text",
      styleH1: "Heading 1",
      styleH2: "Heading 2",
      styleH3: "Heading 3",
      alignLeft: "Align Left",
      alignCenter: "Align Center",
      alignRight: "Align Right",
      alignJustify: "Align Justify",
      alignTooltip: "Align Text",
    },
    he: {
      templatesPlaceholder: "תבניות...",
      templateBlank: "מסמך ריק",
      templateLetter: "מכתב רשמי",
      templateInvoice: "חשבונית פשוטה",
      fontSans: "מודרני (Sans)",
      fontSerif: "קלאסי (Serif)",
      fontMono: "טכני (Mono)",
      watermarkPlaceholder: "סימן מים...",
      watermarkMobilePlaceholder: "הקלד סימן מים...",
      stampLibraryHeader: "ספריית חותמות וחתימות",
      stampLibrarySub: "מקסימום 400px (WebP)",
      stampLibraryEmpty: "אין חותמות שמורות עדיין",
      stampUploadBtn: "➕ העלה חותמת חדשה",
      deleteStampTooltip: "מחק חותמת",
      actionsHeader: "פעולות",
      clearCanvasBtn: "נקה לוח",
      mobileTemplates: "תבניות",
      mobileFonts: "גופנים",
      mobileWatermark: "סימן מים",
      mobileClearDoc: "נקה מסמך",
      stampsTooltip: "חותמות / חתימות",
      settingsTooltip: "הגדרות",
      styleNormal: "טקסט רגיל",
      styleH1: "כותרת 1",
      styleH2: "כותרת 2",
      styleH3: "כותרת 3",
      alignLeft: "יישור לשמאל",
      alignCenter: "יישור למרכז",
      alignRight: "יישור לימין",
      alignJustify: "יישור דו-צדדי",
      alignTooltip: "יישור טקסט",
    }
  }[language];

  // Helper functions for formatting active states
  const getActiveStyle = () => {
    if (!editor) return "p";
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "p";
  };

  const handleStyleChange = (val: string) => {
    if (!editor) return;
    if (val === "p") {
      editor.chain().focus().setParagraph().run();
    } else if (val === "h1") {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (val === "h2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (val === "h3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  const getActiveAlign = () => {
    if (!editor) return "left";
    if (editor.isActive({ textAlign: "center" })) return "center";
    if (editor.isActive({ textAlign: "right" })) return "right";
    if (editor.isActive({ textAlign: "justify" })) return "justify";
    return "left";
  };

  // Load stamps from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pdf_app_stamps");
    if (saved) {
      try {
        setSavedStamps(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved stamps", e);
      }
    }
  }, []);

  if (!editor) {
    return null;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const maxW = 400;
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const compressedBase64 = canvas.toDataURL("image/webp", 0.8);

        const newStamp = {
          id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Date.now().toString(),
          src: compressedBase64,
        };

        const updatedStamps = [...savedStamps, newStamp];
        setSavedStamps(updatedStamps);
        localStorage.setItem("pdf_app_stamps", JSON.stringify(updatedStamps));

        editor.chain().focus().setImage({ src: compressedBase64 }).run();
        setShowStampsPopover(false);
        e.target.value = ""; // Clear file selection
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };



  const StampsPopoverContent = () => (
    <div
      className="absolute z-50 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-3 flex flex-col gap-3 animate-in fade-in duration-150 end-0 bottom-full mb-3 sm:start-0 sm:top-full sm:mt-2 sm:bottom-auto sm:mb-0"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-700">{t.stampLibraryHeader}</span>
        <span className="text-[9px] text-slate-400 font-medium">{t.stampLibrarySub}</span>
      </div>

      {savedStamps.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
          {savedStamps.map((stamp) => (
            <div
              key={stamp.id}
              onClick={() => {
                editor.chain().focus().setImage({ src: stamp.src }).run();
                setShowStampsPopover(false);
              }}
              className="group relative aspect-square bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center p-1 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer"
            >
              <img
                src={stamp.src}
                alt="Stamp thumbnail"
                className="max-w-full max-h-full object-contain pointer-events-none"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const updated = savedStamps.filter((s) => s.id !== stamp.id);
                  setSavedStamps(updated);
                  localStorage.setItem("pdf_app_stamps", JSON.stringify(updated));
                }}
                className="opacity-0 group-hover:opacity-100 hover:scale-110 p-1 bg-red-50 text-red-500 rounded border border-red-100 absolute end-1 top-1 transition-all cursor-pointer shadow-sm"
                title={t.deleteStampTooltip}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 border border-dashed border-slate-200 rounded-lg text-slate-400 bg-slate-50/50">
          <span className="text-[11px] font-medium">{t.stampLibraryEmpty}</span>
        </div>
      )}

      <button
        onClick={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-xs font-semibold shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
      >
        <span>{t.stampUploadBtn}</span>
      </button>
    </div>
  );

  const SettingsPopoverContent = () => (
    <div
      className="absolute z-50 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-4 flex flex-col gap-4 animate-in fade-in duration-150 end-0 bottom-full mb-3 sm:top-full sm:mt-2 sm:bottom-auto sm:mb-0"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-700">{t.settingsTooltip}</span>
        
        {/* Templates */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              onSelectTemplate(e.target.value);
              e.target.value = "";
              setShowSettingsPopover(false);
            }
          }}
          className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2 cursor-pointer outline-none hover:bg-slate-100 transition-colors font-medium shadow-sm"
        >
          <option value="">{t.templatesPlaceholder}</option>
          <option value="blank">{t.templateBlank}</option>
          <option value="letter">{t.templateLetter}</option>
          <option value="invoice">{t.templateInvoice}</option>
        </select>

        {/* Font Theme */}
        <select
          value={theme}
          onChange={(e) => {
             setTheme(e.target.value as FontTheme);
          }}
          className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2 cursor-pointer outline-none hover:bg-slate-100 transition-colors font-medium shadow-sm"
        >
          <option value="font-sans">{t.fontSans}</option>
          <option value="font-serif">{t.fontSerif}</option>
          <option value="font-mono">{t.fontMono}</option>
        </select>

        {/* Watermark */}
        <input
          type="text"
          placeholder={t.watermarkPlaceholder}
          value={watermark}
          onChange={(e) => setWatermark(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none hover:bg-slate-100 transition-colors placeholder-slate-400 shadow-sm font-medium"
        />
      </div>

      <div className="h-px w-full bg-slate-100" />

      {/* Action Section */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-slate-700">{t.actionsHeader}</span>
        <button
          onClick={(e) => {
            e.preventDefault();
            onClearDocument();
            setShowSettingsPopover(false);
          }}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/40 font-semibold py-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 duration-100 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.clearCanvasBtn}</span>
        </button>
      </div>
    </div>
  );

  const activeAlign = getActiveAlign();
  const AlignIcon = {
    left: AlignLeft,
    center: AlignCenter,
    right: AlignRight,
    justify: AlignJustify,
  }[activeAlign] || AlignLeft;

  return (
    <div className="flex flex-col w-full bg-transparent sm:bg-transparent z-30 relative">
      {/* Click-away backdrop for popovers */}
      {(showStampsPopover || showSettingsPopover || showAlignPopover) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setShowStampsPopover(false);
            setShowSettingsPopover(false);
            setShowAlignPopover(false);
          }}
        />
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Responsive unified Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 w-full bg-white border-t sm:border-t-0 sm:border-b border-slate-200 sm:shadow-sm">
        <div className="flex flex-wrap items-center justify-between mx-auto w-full sm:max-w-[794px] gap-2">
          <div className="flex flex-wrap items-center gap-1">
            {/* Style Dropdown */}
            <select
              value={getActiveStyle()}
              onChange={(e) => handleStyleChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 sm:p-2 cursor-pointer outline-none hover:bg-slate-100 transition-colors font-semibold shadow-sm sm:shadow-none shrink-0"
            >
              <option value="p">{t.styleNormal}</option>
              <option value="h1">{t.styleH1}</option>
              <option value="h2">{t.styleH2}</option>
              <option value="h3">{t.styleH3}</option>
            </select>

            <div className="w-[1px] h-6 bg-slate-200 mx-1 shrink-0" />

            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")}>
              <Bold className="w-5 h-5 shrink-0" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")}>
              <Italic className="w-5 h-5 shrink-0" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")}>
              <Underline className="w-5 h-5 shrink-0" />
            </ToolbarButton>

            <div className="w-[1px] h-6 bg-slate-200 mx-1 shrink-0" />

            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")}>
              <List className="w-5 h-5 shrink-0" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")}>
              <ListOrdered className="w-5 h-5 shrink-0" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")}>
              <Quote className="w-5 h-5 shrink-0" />
            </ToolbarButton>
            
            <div className="w-[1px] h-6 bg-slate-200 mx-1 shrink-0" />
            
            {/* Alignment Popover */}
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowAlignPopover(!showAlignPopover);
                }}
                className={cn(
                  "p-2 rounded-md hover:bg-indigo-50 transition-colors text-slate-600 hover:text-indigo-600 focus:outline-none cursor-pointer shrink-0",
                  showAlignPopover && "bg-indigo-100 text-indigo-700 shadow-inner"
                )}
                title={t.alignTooltip}
              >
                <AlignIcon className="w-5 h-5 shrink-0" />
              </button>
              {showAlignPopover && (
                <div
                  className="absolute z-50 bg-white rounded-xl border border-slate-200 shadow-xl p-1 flex gap-1 animate-in fade-in duration-100 end-0 bottom-full mb-3 sm:start-0 sm:top-full sm:mt-2 sm:bottom-auto sm:mb-0 animate-out fade-out"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      editor.chain().focus().setTextAlign("left").run();
                      setShowAlignPopover(false);
                    }}
                    className={cn(
                      "p-1.5 rounded hover:bg-indigo-50 transition-colors text-slate-600 hover:text-indigo-600 cursor-pointer",
                      activeAlign === "left" && "bg-indigo-100 text-indigo-700 shadow-inner"
                    )}
                    title={t.alignLeft}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().setTextAlign("center").run();
                      setShowAlignPopover(false);
                    }}
                    className={cn(
                      "p-1.5 rounded hover:bg-indigo-50 transition-colors text-slate-600 hover:text-indigo-600 cursor-pointer",
                      activeAlign === "center" && "bg-indigo-100 text-indigo-700 shadow-inner"
                    )}
                    title={t.alignCenter}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().setTextAlign("right").run();
                      setShowAlignPopover(false);
                    }}
                    className={cn(
                      "p-1.5 rounded hover:bg-indigo-50 transition-colors text-slate-600 hover:text-indigo-600 cursor-pointer",
                      activeAlign === "right" && "bg-indigo-100 text-indigo-700 shadow-inner"
                    )}
                    title={t.alignRight}
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().setTextAlign("justify").run();
                      setShowAlignPopover(false);
                    }}
                    className={cn(
                      "p-1.5 rounded hover:bg-indigo-50 transition-colors text-slate-600 hover:text-indigo-600 cursor-pointer",
                      activeAlign === "justify" && "bg-indigo-100 text-indigo-700 shadow-inner"
                    )}
                    title={t.alignJustify}
                  >
                    <AlignJustify className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Stamp Popover */}
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowStampsPopover(!showStampsPopover);
                }}
                className={cn(
                  "p-2 rounded-md hover:bg-indigo-50 transition-colors text-slate-600 hover:text-indigo-600 focus:outline-none cursor-pointer shrink-0",
                  showStampsPopover && "bg-indigo-100 text-indigo-700 shadow-inner"
                )}
                title={t.stampsTooltip}
              >
                <ImageIcon className="w-5 h-5 shrink-0" />
              </button>
              {showStampsPopover && <StampsPopoverContent />}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">            {/* Settings button */}
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowSettingsPopover(!showSettingsPopover);
                }}
                className={cn(
                  "p-2 rounded-md hover:bg-indigo-50 transition-all text-slate-600 hover:text-indigo-600 focus:outline-none cursor-pointer shrink-0",
                  showSettingsPopover && "bg-indigo-100 text-indigo-700 shadow-inner"
                )}
                title={t.settingsTooltip}
              >
                <Settings2 className="w-5 h-5 shrink-0" />
              </button>
              {showSettingsPopover && <SettingsPopoverContent />}
            </div>
        </div>
      </div>
    </div>
  </div>
);
}
