import React from "react";
import type { Metadata } from "next";
import EditorPageContainer from "@/components/editor/EditorPageContainer";

export const metadata: Metadata = {
  title: "Free Online Text to PDF Converter | Live Preview & Editor",
  description:
    "Write, edit, and format text with our distraction-free WYSIWYG editor and instantly convert it to a beautifully formatted A4 PDF. 100% free, no server uploads, fully private.",
};

export default function EnglishEditorPage() {
  return <EditorPageContainer language="en" />;
}
