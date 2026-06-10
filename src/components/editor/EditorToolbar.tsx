import { type Editor } from "@tiptap/react";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Settings2, ChevronDown, Check, Trash2, Image as ImageIcon } from "lucide-react";
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
  // Stamp library & Settings states
  const [showStampsPopover, setShowStampsPopover] = useState(false);
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
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
    }
  }[language];

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

  const AdvancedOptions = () => (
    <>
      <select
        onChange={(e) => {
          if (e.target.value) {
            onSelectTemplate(e.target.value);
            e.target.value = "";
          }
        }}
        className="w-full sm:w-auto bg-white sm:bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2 cursor-pointer outline-none hover:bg-slate-50 transition-colors font-medium shadow-sm sm:shadow-none shrink-0"
      >
        <option value="">{t.templatesPlaceholder}</option>
        <option value="blank">{t.templateBlank}</option>
        <option value="letter">{t.templateLetter}</option>
        <option value="invoice">{t.templateInvoice}</option>
      </select>

      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as FontTheme)}
        className="w-full sm:w-auto bg-white sm:bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2 cursor-pointer outline-none hover:bg-slate-50 transition-colors font-medium shadow-sm sm:shadow-none shrink-0"
      >
        <option value="font-sans">{t.fontSans}</option>
        <option value="font-serif">{t.fontSerif}</option>
        <option value="font-mono">{t.fontMono}</option>
      </select>

      <input
        type="text"
        placeholder={t.watermarkPlaceholder}
        value={watermark}
        onChange={(e) => setWatermark(e.target.value)}
        className="w-full sm:w-28 bg-white sm:bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none hover:bg-slate-50 transition-colors placeholder-slate-400 shadow-sm sm:shadow-none font-medium shrink-0"
      />
    </>
  );

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
      className="absolute z-50 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-3.5 flex flex-col gap-3.5 animate-in fade-in duration-150 end-0 bottom-full mb-3 sm:top-full sm:mt-2 sm:bottom-auto sm:mb-0"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Action Section */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-slate-700">{t.actionsHeader}</span>
        <button
          onClick={(e) => {
            e.preventDefault();
            onClearDocument();
            setShowSettingsPopover(false);
          }}
          className="w-full bg-red-55 hover:bg-red-100 text-red-600 border border-red-200/40 font-semibold py-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 duration-100 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.clearCanvasBtn}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full bg-transparent sm:bg-transparent z-30 relative">
      {/* Click-away backdrop for popovers */}
      {(showStampsPopover || showSettingsPopover) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setShowStampsPopover(false);
            setShowSettingsPopover(false);
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
      <div className="flex overflow-x-auto items-center gap-1 p-2 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-white border-t sm:border-t-0 sm:border-b border-slate-200 sm:shadow-sm">
        <div className="flex items-center justify-between mx-auto w-full sm:max-w-[794px] gap-2 shrink-0">
          <div className="flex items-center gap-1 shrink-0">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")}>
              <Bold className="w-5 h-5 shrink-0" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")}>
              <Italic className="w-5 h-5 shrink-0" />
            </ToolbarButton>
            <div className="w-[1px] h-6 bg-slate-200 mx-1 shrink-0" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })}>
              <Heading1 className="w-5 h-5 shrink-0" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })}>
              <Heading2 className="w-5 h-5 shrink-0" />
            </ToolbarButton>
            <div className="w-[1px] h-6 bg-slate-200 mx-1 shrink-0" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")}>
              <List className="w-5 h-5 shrink-0" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")}>
              <ListOrdered className="w-5 h-5 shrink-0" />
            </ToolbarButton>
            
            <div className="w-[1px] h-6 bg-slate-200 mx-1 shrink-0" />
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

          <div className="flex items-center gap-2 shrink-0">
            <AdvancedOptions />

            {/* Settings button */}
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
