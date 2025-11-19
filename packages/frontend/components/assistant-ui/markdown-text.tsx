"use client"

import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown"
import remarkGfm from "remark-gfm"

export function MarkdownText({ children }: { children: string }) {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className="aui-markdown"
    >
      {children}
    </MarkdownTextPrimitive>
  )
}

