import type { BaseMessage } from '@langchain/core/messages'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { createCommerceAgent, convertToBaseMessage, extractMessageContent, getChatModel } from '../agent'

export interface StreamingState {
  messages: Array<{ role: string; content: string }>
  step: number
  streamedContent?: string
}

export async function* handleStreamingChat(messages: Array<{ role: string; content: string }>): AsyncGenerator<Partial<StreamingState>> {
  try {
    const agent = createCommerceAgent()
    
    console.log('[LangChain Stream] Processing messages:', JSON.stringify(messages, null, 2))
    
    // Convert messages to BaseMessage format
    const formattedMessages = messages.map(msg => convertToBaseMessage(msg))
    
    // Use streamEvents to get streaming output from the agent with tools
    const eventStream = await agent.streamEvents({
      messages: formattedMessages
    }, {
      version: 'v2'
    })
    
    let fullContent = ''
    let chunkCount = 0
    let toolCalls = []
    
    for await (const event of eventStream) {
      // Handle different event types
      if (event.event === 'on_chat_model_stream') {
        // This is a token from the chat model
        const content = event.data?.chunk?.content
        
        if (typeof content === 'string' && content) {
          chunkCount++
          fullContent += content
          
          console.log(`[LangChain Stream] Chunk ${chunkCount}:`, {
            content,
            contentLength: content.length,
          })
          
          // Yield each chunk as it arrives
          yield {
            streamedContent: content,
            messages: [],
            step: 0
          }
        }
      } else if (event.event === 'on_tool_start') {
        // Log tool usage
        console.log('[LangChain Stream] Tool started:', event.name, 'with inputs:', event.data?.input)
        toolCalls.push({ tool: event.name, status: 'started' })
      } else if (event.event === 'on_tool_end') {
        // Log tool results
        console.log('[LangChain Stream] Tool finished:', event.name, 'with output:', event.data?.output)
        const toolIndex = toolCalls.findIndex(tc => tc.tool === event.name && tc.status === 'started')
        if (toolIndex !== -1) {
          toolCalls[toolIndex].status = 'completed'
          toolCalls[toolIndex].output = event.data?.output
        }
      }
    }
    
    console.log(`[LangChain Stream] Stream completed. Total chunks: ${chunkCount}, Full content length: ${fullContent.length}`)
    
    // Final yield with complete message
    if (fullContent) {
      yield {
        messages: [
          {
            role: 'assistant',
            content: fullContent
          }
        ],
        step: 1
      }
    } else {
      yield {
        messages: [
          {
            role: 'assistant',
            content: 'No response generated'
          }
        ],
        step: 1
      }
    }
  } catch (error) {
    console.error('[LangChain Stream] Error:', error)
    yield {
      messages: [
        {
          role: 'assistant',
          content: `Error: Failed to get response from AI. ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      step: 1
    }
  }
}

export async function handleNonStreamingChat(messages: Array<{ role: string; content: string }>): Promise<StreamingState> {
  try {
    const agent = createCommerceAgent()
    
    console.log('[LangChain] Processing messages:', JSON.stringify(messages, null, 2))
    
    // Convert messages to BaseMessage format
    const formattedMessages = messages.map(msg => convertToBaseMessage(msg))
    
    // Invoke the agent with properly formatted messages
    const result = await agent.invoke({
      messages: formattedMessages
    })
    
    console.log('[LangChain] Agent response received')
    
    // Extract the last assistant message from the result
    const lastMessage = result.messages[result.messages.length - 1]
    const { role, content } = extractMessageContent(lastMessage)
    
    if (role === 'assistant' && content) {
      return {
        messages: [...messages, { role: 'assistant', content }],
        step: 1
      }
    } else {
      return {
        messages: [...messages, { role: 'assistant', content: 'No response generated' }],
        step: 1
      }
    }
  } catch (error) {
    console.error('[LangChain] Error:', error)
    return {
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: `Error: Failed to get response from AI. ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      step: 1
    }
  }
}
