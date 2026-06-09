"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { EditorToolbar, type FontTheme } from "./EditorToolbar";
import AdBannerPlaceholder from "@/components/layout/AdBannerPlaceholder";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SavedDocument {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface TipTapEditorProps {
  editorRef?: React.MutableRefObject<HTMLDivElement | null>;
  titleRef: React.MutableRefObject<string>;
  editorApiRef?: React.MutableRefObject<{ getText: () => string } | null>;
  isHistoryOpen?: boolean;
  onCloseHistory?: () => void;
  isRtl?: boolean;
  language?: "en" | "he";
  onLanguageChange?: (lang: "en" | "he") => void;
}

const extensions = [
  StarterKit,
  Placeholder.configure({
    placeholder: "Start typing here...",
    emptyEditorClass: "is-editor-empty",
  }),
  Image.configure({
    HTMLAttributes: {
      class: "max-w-full h-auto inline-block rounded-md my-2 border border-slate-200",
    },
  }),
];

const editorProps = {
  attributes: {
    className:
      "tiptap w-full text-base sm:text-lg focus:outline-none min-h-[300px] sm:min-h-[900px] relative z-20",
  },
};

export default function TipTapEditor({
  editorRef,
  titleRef,
  editorApiRef,
  isHistoryOpen,
  onCloseHistory,
  isRtl = false,
  language = "en",
  onLanguageChange,
}: TipTapEditorProps) {
  const [theme, setTheme] = useState<FontTheme>("font-sans");
  const [watermark, setWatermark] = useState("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Document Title state (bound to the editable input field)
  const [title, setTitle] = useState("");

  // Local history states
  const [historyList, setHistoryList] = useState<SavedDocument[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Refs for inside callbacks to avoid stale state closures
  const currentDocIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  // Keep titleRef in sync with title state for external use (like PDF generation)
  useEffect(() => {
    titleRef.current = title;
  }, [title, titleRef]);

  const editor = useEditor({
    extensions,
    content: "",
    immediatelyRender: false,
    editorProps,
    onUpdate: ({ editor }) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        const html = editor.getHTML();
        const activeId = currentDocIdRef.current;
        if (!activeId) return;

        setHistoryList((prev) => {
          const updated = prev.map((doc) => {
            if (doc.id === activeId) {
              const currentTitle = titleRef.current;
              const titleToSave = currentTitle.trim() === "" ? "Untitled Document" : currentTitle;
              
              return {
                ...doc,
                content: html,
                title: titleToSave,
                updatedAt: new Date().toISOString(),
              };
            }
            return doc;
          });
          localStorage.setItem("pdf_app_history", JSON.stringify(updated));
          return updated;
        });
      }, 500);
    },
  });

  // Dynamically set TipTap editor options on RTL changes
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: "tiptap w-full text-base sm:text-lg focus:outline-none min-h-[300px] sm:min-h-[900px] relative z-20",
            dir: isRtl ? "rtl" : "ltr",
          },
        },
      });
    }
  }, [editor, isRtl]);

  // Clean up auto-save timeout on component unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Hydrate editor content from localStorage on mount (once editor is ready)
  useEffect(() => {
    if (!editor || isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Load history
    const savedHistoryStr = localStorage.getItem("pdf_app_history");
    const savedActiveId = localStorage.getItem("current_doc_id");

    let parsedHistory: SavedDocument[] = [];
    if (savedHistoryStr) {
      try {
        parsedHistory = JSON.parse(savedHistoryStr);
      } catch (e) {
        console.error("Failed to parse local history", e);
      }
    }

    // Migrate old single-document drafts if they exist
    const oldTitle = localStorage.getItem("pdf_draft_title");
    const oldContent = localStorage.getItem("pdf_draft_content");

    if (parsedHistory.length === 0 && (oldTitle || oldContent)) {
      const migratedId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Date.now().toString();
      parsedHistory = [{
        id: migratedId,
        title: oldTitle || "Migrated Draft",
        content: oldContent || "",
        updatedAt: new Date().toISOString(),
      }];
      localStorage.setItem("pdf_app_history", JSON.stringify(parsedHistory));
      localStorage.removeItem("pdf_draft_title");
      localStorage.removeItem("pdf_draft_content");
    }

    // Initialize fresh empty document if nothing exists
    if (parsedHistory.length === 0) {
      const newId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Date.now().toString();
      parsedHistory = [{
        id: newId,
        title: "Untitled Document",
        content: "",
        updatedAt: new Date().toISOString(),
      }];
      localStorage.setItem("pdf_app_history", JSON.stringify(parsedHistory));
    }

    setHistoryList(parsedHistory);

    // Determine active document
    let activeId = savedActiveId;
    if (!activeId || !parsedHistory.some((doc) => doc.id === activeId)) {
      activeId = parsedHistory[0].id;
    }

    currentDocIdRef.current = activeId;
    setCurrentDocId(activeId);
    localStorage.setItem("current_doc_id", activeId);

    // Populate active document content & title
    const activeDoc = parsedHistory.find((doc) => doc.id === activeId) || parsedHistory[0];
    setTitle(activeDoc.title);
    titleRef.current = activeDoc.title;
    editor.commands.setContent(activeDoc.content);

    setIsHydrated(true);
  }, [editor, titleRef]);

  // Expose the editor's text extraction method to the parent
  if (editorApiRef && editor) {
    editorApiRef.current = {
      getText: () => editor.getText(),
    };
  }

  // Save changes immediately (useful when switching documents or creating a new one)
  const saveActiveDocumentImmediately = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    if (!editor || !currentDocIdRef.current) return;
    const html = editor.getHTML();
    const activeId = currentDocIdRef.current;
    const currentTitle = titleRef.current;
    const titleToSave = currentTitle.trim() === "" ? "Untitled Document" : currentTitle;

    setHistoryList((prev) => {
      const updated = prev.map((doc) => {
        if (doc.id === activeId) {
          return {
            ...doc,
            content: html,
            title: titleToSave,
            updatedAt: new Date().toISOString(),
          };
        }
        return doc;
      });
      localStorage.setItem("pdf_app_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearDocument = () => {
    if (!editor) return;
    if (confirm("Are you sure you want to clear the entire document? This cannot be undone.")) {
      editor.commands.setContent("");
      setTitle("Untitled Document");
      titleRef.current = "Untitled Document";

      const activeId = currentDocIdRef.current;
      if (activeId) {
        setHistoryList((prev) => {
          const updated = prev.map((doc) => {
            if (doc.id === activeId) {
              return {
                ...doc,
                content: "",
                title: "Untitled Document",
                updatedAt: new Date().toISOString(),
              };
            }
            return doc;
          });
          localStorage.setItem("pdf_app_history", JSON.stringify(updated));
          return updated;
        });
      }
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    titleRef.current = val;

    const activeId = currentDocIdRef.current;
    if (!activeId) return;

    // Strict fallback: use 'Untitled Document' if trimmed is empty
    const titleToSave = val.trim() === "" ? "Untitled Document" : val;

    setHistoryList((prev) => {
      const updated = prev.map((doc) => {
        if (doc.id === activeId) {
          return {
            ...doc,
            title: titleToSave,
            updatedAt: new Date().toISOString(),
          };
        }
        return doc;
      });
      localStorage.setItem("pdf_app_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleNewDocument = () => {
    saveActiveDocumentImmediately();

    const newId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Date.now().toString();
    const newDoc: SavedDocument = {
      id: newId,
      title: "Untitled Document",
      content: "",
      updatedAt: new Date().toISOString(),
    };

    const updated = [newDoc, ...historyList];
    setHistoryList(updated);
    localStorage.setItem("pdf_app_history", JSON.stringify(updated));

    currentDocIdRef.current = newId;
    setCurrentDocId(newId);
    localStorage.setItem("current_doc_id", newId);

    // Load into UI
    setTitle(newDoc.title);
    titleRef.current = newDoc.title;
    editor?.commands.setContent(newDoc.content);

    if (onCloseHistory) {
      onCloseHistory();
    }
  };

  const handleLoadDocument = (docId: string) => {
    saveActiveDocumentImmediately();

    const targetDoc = historyList.find((doc) => doc.id === docId);
    if (!targetDoc) return;

    currentDocIdRef.current = targetDoc.id;
    setCurrentDocId(targetDoc.id);
    localStorage.setItem("current_doc_id", targetDoc.id);

    // Load into UI
    setTitle(targetDoc.title);
    titleRef.current = targetDoc.title;
    editor?.commands.setContent(targetDoc.content);

    if (onCloseHistory) {
      onCloseHistory();
    }
  };

  const handleDeleteDocument = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid loading the deleted document

    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      return;
    }

    const updatedList = historyList.filter((doc) => doc.id !== docId);
    setHistoryList(updatedList);
    localStorage.setItem("pdf_app_history", JSON.stringify(updatedList));

    if (currentDocId === docId) {
      if (updatedList.length > 0) {
        const nextDoc = updatedList[0];
        currentDocIdRef.current = nextDoc.id;
        setCurrentDocId(nextDoc.id);
        localStorage.setItem("current_doc_id", nextDoc.id);

        setTitle(nextDoc.title);
        titleRef.current = nextDoc.title;
        editor?.commands.setContent(nextDoc.content);
      } else {
        // Create fresh empty doc
        const newId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Date.now().toString();
        const freshDoc: SavedDocument = {
          id: newId,
          title: "Untitled Document",
          content: "",
          updatedAt: new Date().toISOString(),
        };
        const freshList = [freshDoc];
        setHistoryList(freshList);
        localStorage.setItem("pdf_app_history", JSON.stringify(freshList));

        currentDocIdRef.current = newId;
        setCurrentDocId(newId);
        localStorage.setItem("current_doc_id", newId);

        setTitle(freshDoc.title);
        titleRef.current = freshDoc.title;
        editor?.commands.setContent(freshDoc.content);
      }
    }
  };

  const handleTemplateSelect = (template: string) => {
    if (!editor) return;

    let newTitle = "Untitled Document";
    let newContent = "";

    if (template === "blank") {
      newTitle = "Untitled Document";
      newContent = "";
    } else if (template === "letter") {
      newTitle = "Formal Letter";
      newContent = `
        <h2>Formal Letter</h2>
        <p><strong>Date:</strong> [Insert Date]</p>
        <p><strong>To:</strong> [Recipient Name/Address]</p>
        <br />
        <p>Dear [Name],</p>
        <p>I am writing to inform you that...</p>
        <br />
        <p>Sincerely,</p>
        <p>[Your Name]</p>
      `;
    } else if (template === "invoice") {
      newTitle = "Simple Invoice";
      newContent = `
        <h1>INVOICE</h1>
        <p><strong>Invoice Number:</strong> #001</p>
        <p><strong>Date:</strong> [Insert Date]</p>
        <br />
        <p><strong>Bill To:</strong></p>
        <p>[Client Name]</p>
        <p>[Client Address]</p>
        <br />
        <ul>
          <li>Service/Item 1 - $0.00</li>
          <li>Service/Item 2 - $0.00</li>
        </ul>
        <br />
        <h2><strong>Total Due:</strong> $0.00</h2>
      `;
    }

    editor.commands.setContent(newContent);
    setTitle(newTitle);
    titleRef.current = newTitle;

    const activeId = currentDocIdRef.current;
    if (activeId) {
      setHistoryList((prev) => {
        const updated = prev.map((doc) => {
          if (doc.id === activeId) {
            return {
              ...doc,
              title: newTitle,
              content: newContent,
              updatedAt: new Date().toISOString(),
            };
          }
          return doc;
        });
        localStorage.setItem("pdf_app_history", JSON.stringify(updated));
        return updated;
      });
    }
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Visually Hidden SEO H1 Header */}
      <h1 className="sr-only">Free Online Text to PDF Converter</h1>

      {/* Toolbar is ordered to the top on desktop, bottom on mobile */}
      <div className="order-2 sm:order-1 shrink-0 z-30">
        <EditorToolbar
          editor={editor}
          theme={theme}
          setTheme={setTheme}
          watermark={watermark}
          setWatermark={setWatermark}
          onSelectTemplate={handleTemplateSelect}
          language={language}
          onLanguageChange={onLanguageChange}
          onClearDocument={handleClearDocument}
        />
      </div>

      {/* The scrolling editor content area */}
      <div className="order-1 sm:order-2 flex-1 overflow-y-auto w-full flex flex-col items-center py-0 sm:py-8 px-0 sm:px-4 z-10 bg-gradient-to-br from-indigo-50/60 via-slate-50 to-sky-50/40">
        
        {/* A4 Paper Editor */}
        <div
          ref={editorRef}
          className={`relative bg-white w-full sm:max-w-[794px] sm:shadow-lg sm:rounded-sm sm:border sm:border-slate-200 flex flex-col shrink-0 h-fit min-h-[70vh] sm:min-h-[1123px] p-6 sm:p-16 sm:mb-12 transition-colors overflow-hidden ${theme}`}
        >
          {/* Watermark Overlay Layer */}
          {watermark.trim() && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10 opacity-5 select-none">
              <span
                className="text-slate-900 font-black tracking-widest whitespace-nowrap"
                style={{
                  fontSize: 'clamp(4rem, 15vw, 12rem)',
                  transform: 'rotate(-45deg)',
                }}
              >
                {watermark.toUpperCase()}
              </span>
            </div>
          )}

          {/* Document Title Input */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onFocus={(e) => {
              if (e.target.value === "Untitled Document") {
                e.target.select();
              }
            }}
            placeholder="Untitled Document"
            className="w-full text-4xl font-extrabold text-slate-900 bg-transparent border-none outline-none focus:ring-0 placeholder-slate-300 mb-4"
          />
          <div className="w-full h-[1px] bg-slate-100 mb-6 shrink-0 relative z-20" />
          
          <EditorContent editor={editor} className="w-full flex-1 relative z-20" />
        </div>

        {/* Mobile Ad Space */}
        <div className="sm:hidden shrink-0 my-4 w-full flex justify-center max-w-[794px] px-6">
          <AdBannerPlaceholder />
        </div>

        {/* SEO FAQ Section */}
        <section className="w-full sm:max-w-[794px] mt-12 px-6 py-12 text-slate-600 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 mb-6">How it Works & FAQ</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800">How do I convert text to PDF?</h3>
              <p className="mt-2 text-sm leading-relaxed">Simply start typing in our distraction-free WYSIWYG editor above. You can format your text using the toolbar to add bolding, italics, headings, and lists. When you&apos;re ready, click the &quot;Export PDF&quot; button to instantly generate and download a perfectly formatted A4 PDF document.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800">Is my document private?</h3>
              <p className="mt-2 text-sm leading-relaxed">Yes, absolutely! Unlike other converters, our Text to PDF tool is 100% client-side. This means your text is never uploaded or saved to any server. All PDF generation happens securely inside your own web browser.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800">Can I use this on mobile?</h3>
              <p className="mt-2 text-sm leading-relaxed">Yes. We designed this application with a mobile-first approach. The editor seamlessly adapts to your smartphone&apos;s screen, and the formatting toolbar is designed to sit perfectly above your device&apos;s virtual keyboard for easy thumbs-reach formatting.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Slide-over History Drawer */}
      {isHistoryOpen && isHydrated && (
        <div className="fixed inset-0 z-[100] flex justify-end rtl:justify-start">
          {/* Backdrop blur with fade animation */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={onCloseHistory}
          />
          
          {/* Slide-in panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right rtl:slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Document History</h2>
                <p className="text-xs text-slate-500 mt-0.5">Saved locally in your browser</p>
              </div>
              <button
                onClick={onCloseHistory}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                aria-label="Close panel"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Create New Document Row */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <button
                onClick={handleNewDocument}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all duration-150 cursor-pointer"
              >
                <span>➕ New Document</span>
              </button>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {historyList.map((doc) => {
                const isActive = doc.id === currentDocId;
                
                // Extract plain text snippet
                const snippet = doc.content
                  ? doc.content
                      .replace(/<[^>]*>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()
                      .substring(0, 80)
                  : "";

                // Last edited formatting
                const formattedDate = new Date(doc.updatedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={doc.id}
                    onClick={() => handleLoadDocument(doc.id)}
                    className={cn(
                      "group relative flex flex-col p-4 rounded-xl border transition-all duration-150 cursor-pointer text-start",
                      isActive
                        ? "bg-indigo-50/40 border-indigo-200 ring-1 ring-indigo-200"
                        : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="font-semibold text-slate-800 truncate pe-6 text-sm">
                        {doc.title || "Untitled Document"}
                      </div>
                      
                      {/* Delete icon (visible on hover/focus) */}
                      <button
                        onClick={(e) => handleDeleteDocument(doc.id, e)}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all absolute end-3 top-3 cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 pe-4 min-h-[2rem]">
                      {snippet || <span className="italic text-slate-400">Empty document</span>}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/50 text-[10px] text-slate-400">
                      <span>Edited {formattedDate}</span>
                      {isActive && (
                        <span className="font-medium text-indigo-600 bg-indigo-50/80 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
