"use client"

import { useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { Thread } from "./thread"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function AssistantModal() {
  const [open, setOpen] = useState(false)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          aria-label="Open assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="end"
          sideOffset={8}
          className={cn(
            "w-[90vw] max-w-4xl h-[85vh] max-h-[800px]",
            "bg-background rounded-lg shadow-lg border z-50",
            "flex flex-col overflow-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">AI Assistant</h2>
            <Popover.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </Popover.Close>
          </div>
          <div className="flex-1 overflow-hidden">
            <Thread />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

