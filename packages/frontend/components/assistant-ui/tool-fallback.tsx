"use client"

import type { ToolCallMessagePartComponent } from "@assistant-ui/react"
import { Wrench } from "lucide-react"

export const ToolFallback: ToolCallMessagePartComponent = ({
  toolName,
  argsText,
  result,
}) => {
  return (
    <div className="aui-tool-fallback">
      <div className="aui-tool-fallback-header">
        <Wrench className="h-4 w-4 text-muted-foreground" />
        <span className="aui-tool-fallback-name font-medium">{toolName}</span>
      </div>
      {argsText && (
        <div className="aui-tool-fallback-args text-sm text-muted-foreground">
          {argsText}
        </div>
      )}
      {result && (
        <div className="aui-tool-fallback-result text-sm">
          {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
        </div>
      )}
    </div>
  )
}

