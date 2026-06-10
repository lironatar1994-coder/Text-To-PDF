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
      "p-2 rounded-md hover:bg-indigo-50 transition-colors text-slate-600 hover:text-indigo-600 focus:outline-none focus-visible:outline-none",
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
  const [showMobileOptions, setShowMobileOptions] = useState(false);
  const [expandedSection, setExpandedSection] = useState<"templates" | "fonts" | "watermark" | null>(null);

  // Stamp library & Settings states
  const [showStampsPopover, setShowStampsPopover] = useState(false);
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [savedStamps, setSavedStamps] = useState<{ id: string; src: string }[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        className="w-full sm:w-auto bg-white sm:bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2 cursor-pointer outline-none hover:bg-slate-50 transition-colors font-medium shadow-sm sm:shadow-none"
      >
        <option value="">Templates...</option>
        <option value="blank">Blank Document</option>
        <option value="letter">Formal Letter</option>
        <option value="invoice">Simple Invoice</option>
      </select>

      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as FontTheme)}
        className="w-full sm:w-auto bg-white sm:bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2 cursor-pointer outline-none hover:bg-slate-50 transition-colors font-medium shadow-sm sm:shadow-none"
      >
        <option value="font-sans">Modern (Sans)</option>
        <option value="font-serif">Classic (Serif)</option>
        <option value="font-mono">Technical (Mono)</option>
      </select>

      <input
        type="text"
        placeholder="Watermark..."
        value={watermark}
        onChange={(e) => setWatermark(e.target.value)}
        className="w-full sm:w-28 bg-white sm:bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none hover:bg-slate-50 transition-colors placeholder-slate-400 shadow-sm sm:shadow-none font-medium"
      />
    </>
  );

  const StampsPopoverContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={cn(
        "absolute z-50 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-3 flex flex-col gap-3 animate-in fade-in duration-150",
        isMobile ? "end-0 bottom-full mb-3" : "start-0 top-full mt-2"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-700">Stamp & Signature Library</span>
        <span className="text-[9px] text-slate-400 font-medium">Max 400px (WebP)</span>
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
                title="Delete stamp"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 border border-dashed border-slate-200 rounded-lg text-slate-400 bg-slate-50/50">
          <span className="text-[11px] font-medium">No stamps saved yet</span>
        </div>
      )}

      <button
        onClick={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-xs font-semibold shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
      >
        <span>➕ Upload New Stamp</span>
      </button>
    </div>
  );

  const SettingsPopoverContent = () => (
    <div
      className="absolute z-50 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-3.5 flex flex-col gap-3.5 animate-in fade-in duration-150 end-0 top-full mt-2"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Action Section */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-slate-700">Actions</span>
        <button
          onClick={(e) => {
            e.preventDefault();
            onClearDocument();
            setShowSettingsPopover(false);
          }}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/40 font-semibold py-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 duration-100 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Canvas</span>
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

      {/* 1. Mobile Redesigned Floating Toolbar Card (Single-Row UI) */}
      <div className="sm:hidden mx-4 mb-4 bg-white rounded-2xl border border-slate-200 shadow-md flex items-center justify-between p-2 relative overflow-visible">
        {/* Top Row: Formatting tools */}
        <div className="flex items-center gap-1 flex-wrap">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")}>
            <Bold className="w-5 h-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")}>
            <Italic className="w-5 h-5" />
          </ToolbarButton>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })}>
            <Heading1 className="w-5 h-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })}>
            <Heading2 className="w-5 h-5" />
          </ToolbarButton>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")}>
            <List className="w-5 h-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")}>
            <ListOrdered className="w-5 h-5" />
          </ToolbarButton>
          
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          {/* Mobile Stamp Popover */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowStampsPopover(!showStampsPopover);
              }}
              className={cn(
                "p-2 rounded-lg transition-all text-slate-600 hover:text-slate-800 outline-none focus:outline-none focus-visible:outline-none",
                showStampsPopover ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 hover:bg-slate-100"
              )}
              aria-label="Toggle stamps library"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            {showStampsPopover && <StampsPopoverContent isMobile={true} />}
          </div>
        </div>

        {/* Settings Button */}
        <button 
          onClick={() => {
            setShowMobileOptions(!showMobileOptions);
            setExpandedSection(null);
          }}
          className={cn(
            "p-2 rounded-lg transition-all text-slate-600 hover:text-slate-800 outline-none focus:outline-none focus-visible:outline-none",
            showMobileOptions ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 hover:bg-slate-100"
          )}
          aria-label="Toggle options"
        >
          <Settings2 className="w-5 h-5" />
        </button>

        {/* Settings Floating Popover */}
        {showMobileOptions && (
          <div className="absolute end-0 bottom-full mb-3 z-50 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-2 flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Templates Accordion */}
            <div className="flex flex-col">
              <button
                onClick={() => setExpandedSection(expandedSection === "templates" ? null : "templates")}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <span>Templates</span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", expandedSection === "templates" && "rotate-180")} />
              </button>
              
              {expandedSection === "templates" && (
                <div className="flex flex-col ps-3 pe-2 py-1 gap-0.5 border-s-2 border-slate-100 ms-3 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={() => {
                      onSelectTemplate("blank");
                      setShowMobileOptions(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-md transition-colors"
                  >
                    Blank Document
                  </button>
                  <button
                    onClick={() => {
                      onSelectTemplate("letter");
                      setShowMobileOptions(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-md transition-colors"
                  >
                    Formal Letter
                  </button>
                  <button
                    onClick={() => {
                      onSelectTemplate("invoice");
                      setShowMobileOptions(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-md transition-colors"
                  >
                    Simple Invoice
                  </button>
                </div>
              )}
            </div>

            {/* Fonts Accordion */}
            <div className="flex flex-col">
              <button
                onClick={() => setExpandedSection(expandedSection === "fonts" ? null : "fonts")}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <span>Fonts</span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", expandedSection === "fonts" && "rotate-180")} />
              </button>
              
              {expandedSection === "fonts" && (
                <div className="flex flex-col ps-3 pe-2 py-1 gap-0.5 border-s-2 border-slate-100 ms-3 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={() => {
                      setTheme("font-sans");
                      setShowMobileOptions(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors text-start",
                      theme === "font-sans" ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span>Modern (Sans)</span>
                    {theme === "font-sans" && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setTheme("font-serif");
                      setShowMobileOptions(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors text-start",
                      theme === "font-serif" ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span>Classic (Serif)</span>
                    {theme === "font-serif" && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setTheme("font-mono");
                      setShowMobileOptions(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors text-start",
                      theme === "font-mono" ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span>Technical (Mono)</span>
                    {theme === "font-mono" && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Watermark Accordion */}
            <div className="flex flex-col">
              <button
                onClick={() => setExpandedSection(expandedSection === "watermark" ? null : "watermark")}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <span>Watermark</span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", expandedSection === "watermark" && "rotate-180")} />
              </button>
              
              {expandedSection === "watermark" && (
                <div className="px-3 py-1.5 ms-3 mt-1 border-s-2 border-slate-100 ps-3 animate-in fade-in slide-in-from-top-1 duration-150">
                  <input
                    type="text"
                    placeholder="Type watermark..."
                    value={watermark}
                    onChange={(e) => setWatermark(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md block p-1.5 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-slate-400 shadow-sm font-medium"
                  />
                </div>
              )}
            </div>

            {/* Clear Document Row */}
            <div className="border-t border-slate-100 mt-1 pt-1.5">
              <button
                onClick={() => {
                  onClearDocument();
                  setShowMobileOptions(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-start cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Document</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Desktop Toolbar */}
      <div className="hidden sm:flex flex-wrap justify-center sm:justify-start items-center gap-1 p-2 sm:bg-white border-t sm:border-t-0 sm:border-b border-slate-200 w-full sm:shadow-sm">
        <div className="flex items-center justify-between mx-auto w-full sm:max-w-[794px] gap-2">
          <div className="flex items-center gap-1 flex-wrap">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")}>
              <Bold className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")}>
              <Italic className="w-5 h-5" />
            </ToolbarButton>
            <div className="w-[1px] h-6 bg-slate-200 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })}>
              <Heading1 className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })}>
              <Heading2 className="w-5 h-5" />
            </ToolbarButton>
            <div className="w-[1px] h-6 bg-slate-200 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")}>
              <List className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")}>
              <ListOrdered className="w-5 h-5" />
            </ToolbarButton>
            
            <div className="w-[1px] h-6 bg-slate-200 mx-1" />
            {/* Desktop Stamp Popover */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowStampsPopover(!showStampsPopover);
                }}
                className={cn(
                  "p-2 rounded-md hover:bg-indigo-50 transition-colors text-slate-600 hover:text-indigo-600 focus:outline-none cursor-pointer",
                  showStampsPopover && "bg-indigo-100 text-indigo-700 shadow-inner"
                )}
                title="Stamps / Signatures"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              {showStampsPopover && <StampsPopoverContent isMobile={false} />}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AdvancedOptions />

            {/* Desktop Settings button */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowSettingsPopover(!showSettingsPopover);
                }}
                className={cn(
                  "p-2 rounded-md hover:bg-indigo-50 transition-all text-slate-600 hover:text-indigo-600 focus:outline-none cursor-pointer",
                  showSettingsPopover && "bg-indigo-100 text-indigo-700 shadow-inner"
                )}
                title="Settings"
              >
                <Settings2 className="w-5 h-5" />
              </button>
              {showSettingsPopover && <SettingsPopoverContent />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
