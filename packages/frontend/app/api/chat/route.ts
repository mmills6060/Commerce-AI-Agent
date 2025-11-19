import { randomUUID } from "crypto"
import { createUIMessageStreamResponse, type UIMessage, type UIMessageChunk, type UIMessagePart } from "ai"

const backendBaseUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:3001"
const langgraphEndpoint = "/api/langgraph/run"

export const maxDuration = 30

interface TextPart {
  type: "text"
  text: string
}

function isTextPart<TData extends Record<string, unknown>, TTools extends Record<string, unknown>>(
  part: UIMessagePart<TData, TTools>
): part is TextPart {
  return part?.type === "text" && typeof (part as any).text === "string"
}

export async function POST(req: Request) {
  const requestResult = await parseRequest({ req })
  if ("error" in requestResult) {
    return Response.json(
      { error: requestResult.error },
      { status: requestResult.status ?? 400 }
    )
  }

  const { text: latestUserText } = getLatestUserText({ messages: requestResult.messages })
  if (!latestUserText) {
    return Response.json(
      { error: "User message text is required" },
      { status: 400 }
    )
  }

  const conversationMessages = convertUIMessagesToBackendFormat({ messages: requestResult.messages })
  
  console.log(`[Chat API] Sending ${conversationMessages.length} messages to backend:`, 
    conversationMessages.map(m => ({ role: m.role, contentLength: m.content.length })))

  const langGraphResult = await invokeLangGraph({ messages: conversationMessages })
  if ("error" in langGraphResult) {
    return Response.json(
      { error: langGraphResult.error, details: langGraphResult.details },
      { status: langGraphResult.status ?? 502 }
    )
  }

  const { text: assistantText } = getAssistantText({ graphResult: langGraphResult.result })
  if (!assistantText) {
    return Response.json(
      { error: "Assistant response was empty" },
      { status: 502 }
    )
  }

  return streamAssistantResponse({ text: assistantText })
}

interface ParseRequestSuccess {
  messages: UIMessage[]
}

interface ParseRequestFailure {
  error: string
  status?: number
}

type ParseRequestResult = ParseRequestSuccess | ParseRequestFailure

async function parseRequest({ req }: { req: Request }): Promise<ParseRequestResult> {
  try {
    const payload = await req.json()
    if (!payload || !Array.isArray(payload.messages)) {
      return { error: "Request body must include a messages array", status: 400 }
    }

    return { messages: payload.messages as UIMessage[] }
  } catch {
    return { error: "Invalid JSON payload", status: 400 }
  }
}

interface BackendMessage {
  role: string
  content: string
}

interface BackendGraphResult {
  messages: BackendMessage[]
  step: number
}

interface BackendGraphResponse {
  success: boolean
  result?: BackendGraphResult
  error?: string
  message?: string
}

interface InvokeLangGraphSuccess {
  result: BackendGraphResult
}

interface InvokeLangGraphFailure {
  error: string
  status?: number
  details?: string
}

type InvokeLangGraphResult = InvokeLangGraphSuccess | InvokeLangGraphFailure

async function invokeLangGraph({ messages }: { messages: BackendMessage[] }): Promise<InvokeLangGraphResult> {
  if (!messages || messages.length === 0) {
    return { error: "Messages array cannot be empty", status: 400 }
  }

  try {
    const response = await fetch(`${backendBaseUrl}${langgraphEndpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      cache: "no-store"
    })

    if (!response.ok) {
      return {
        error: "Backend request failed",
        status: response.status,
        details: await response.text()
      }
    }

    const payload = await response.json() as BackendGraphResponse
    if (!payload.success || !payload.result) {
      return {
        error: payload.error ?? payload.message ?? "Backend returned an invalid payload",
        status: 502
      }
    }

    return { result: payload.result }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Backend request failed"
    }
  }
}

function getLatestUserText({ messages }: { messages: UIMessage[] }): { text: string | null } {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { text: null }
  }

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const candidate = messages[index]
    if (!candidate || candidate.role !== "user") continue

    const textParts = candidate.parts?.filter(isTextPart) ?? []

    if (textParts.length === 0) continue

    const text = textParts
      .map((part) => part.text.trim())
      .filter(Boolean)
      .join("\n")
      .trim()

    if (text) {
      return { text }
    }
  }

  return { text: null }
}

function convertUIMessagesToBackendFormat({ messages }: { messages: UIMessage[] }): BackendMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return []
  }

  return messages
    .map((message) => {
      if (!message || !message.role) return null

      let content = ""
      
      if (message.role === "user") {
        const textParts = message.parts?.filter(isTextPart) ?? []
        
        content = textParts
          .map((part) => part.text.trim())
          .filter(Boolean)
          .join("\n")
          .trim()
      } else if (message.role === "assistant") {
        const textParts = message.parts?.filter(isTextPart) ?? []
        
        content = textParts
          .map((part) => part.text.trim())
          .filter(Boolean)
          .join("\n")
          .trim()
      }

      if (!content) return null

      return {
        role: message.role,
        content
      }
    })
    .filter((msg): msg is BackendMessage => msg !== null)
}

function getAssistantText({ graphResult }: { graphResult?: BackendGraphResult }): { text: string | null } {
  if (!graphResult?.messages?.length) {
    return { text: null }
  }

  // Get only the last assistant message to avoid duplicates
  const assistantMessages = graphResult.messages.filter((entry) => entry.role === "assistant")
  
  if (assistantMessages.length === 0) {
    return { text: null }
  }

  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]
  const text = typeof lastAssistantMessage.content === "string" ? lastAssistantMessage.content.trim() : ""

  return { text: text || null }
}

function streamAssistantResponse({ text }: { text: string }) {
  const messageId = randomUUID()
  const textChunkId = randomUUID()

  const stream = new ReadableStream<UIMessageChunk>({
    start(controller) {
      controller.enqueue({ type: "start", messageId })
      controller.enqueue({ type: "text-start", id: textChunkId })
      controller.enqueue({ type: "text-delta", id: textChunkId, delta: text })
      controller.enqueue({ type: "text-end", id: textChunkId })
      controller.enqueue({ type: "finish", finishReason: "stop" })
      controller.close()
    }
  })

  return createUIMessageStreamResponse({ stream })
}

