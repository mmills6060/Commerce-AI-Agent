"use client"

import { AssistantRuntimeProvider } from "@assistant-ui/react"
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk"
import { AssistantModal } from "./assistant-modal"
import { useState } from "react"

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null)
  
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
    onError: (err) => {
      console.error("Assistant runtime error:", err)
      setError(err)
    },
  })

  // If there's an error, still render children but skip the assistant
  if (error) {
    console.warn("Assistant provider error, rendering without assistant:", error)
    return <>{children}</>
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
      <AssistantModal />
    </AssistantRuntimeProvider>
  )
}

