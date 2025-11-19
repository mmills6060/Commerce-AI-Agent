"use client"

import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown"
import type { TextMessagePartProps } from "@assistant-ui/react"
import remarkGfm from "remark-gfm"

export function MarkdownText(_props: TextMessagePartProps) {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className="aui-markdown"
    />
  )
}

