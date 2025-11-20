"use client"

import { 
  AssistantRuntimeProvider, 
  useLocalRuntime, 
  type ChatModelAdapter,
  type ChatModelRunResult
} from "@assistant-ui/react"
import { AssistantModal } from "./assistant-modal"
import { ReactNode } from "react"

const LangGraphAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    try {
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: typeof msg.content === 'string' 
              ? msg.content 
              : msg.content.map(part => {
                  if (part.type === 'text') return part.text
                  return ''
                }).join('')
          }))
        }),
        signal: abortSignal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')

      if (!reader) {
        throw new Error("No response body")
      }

      let fullText = ""
      let buffer = ""
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        const lines = buffer.split('\n')

        if (!buffer.endsWith('\n')) {
          buffer = lines.pop() || ''
        } else {
          buffer = ''
        }

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'delta') {
                fullText += data.content
                
                const result: ChatModelRunResult = {
                  content: [{
                    type: "text",
                    text: fullText
                  }]
                }
                yield result
              } else if (data.type === 'error') {
                throw new Error(data.error)
              }
            } catch (e) {
              console.error('Failed to parse SSE line:', line, e)
            }
          }
        }
      }

      if (buffer.trim()) {
        if (buffer.startsWith('data: ')) {
          try {
            const data = JSON.parse(buffer.slice(6))
            if (data.type === 'delta') {
              fullText += data.content
            }
          } catch (e) {
            console.error('Failed to parse final buffer:', buffer, e)
          }
        }
      }

      const remaining = decoder.decode(undefined, { stream: false })
      if (remaining) {
        console.error('Decoder had remaining bytes:', remaining)
      }

      if (fullText) {
        const result: ChatModelRunResult = {
          content: [{
            type: "text",
            text: fullText
          }]
        }
        yield result
      }
    } catch (error) {
      const result: ChatModelRunResult = {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`
        }]
      }
      yield result
    }
  }
}

export function AssistantProvider({ children }: { children: ReactNode }) {
  const runtime = useLocalRuntime(LangGraphAdapter)

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
      <AssistantModal />
    </AssistantRuntimeProvider>
  )
}

