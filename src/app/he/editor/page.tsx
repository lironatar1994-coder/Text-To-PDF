import React from "react";
import type { Metadata } from "next";
import EditorPageContainer from "@/components/editor/EditorPageContainer";

export const metadata: Metadata = {
  title: "עורך טקסט ל-PDF בעברית | Text to PDF",
  description: "עורך WYSIWYG תומך RTL מלא לעריכת מסמכים וייצוא מהיר ל-A4 PDF. 100% מקומי ומאובטח.",
};

export default function HebrewEditorPage() {
  return <EditorPageContainer language="he" />;
}
