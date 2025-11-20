import { createCommerceAgent, convertToBaseMessage, extractMessageContent } from '../agent.js'

export interface StreamingState {
  messages: Array<{ role: string; content: string }>
  step: number
  streamedContent?: string
}

export async function* handleStreamingChat(messages: Array<{ role: string; content: string }>): AsyncGenerator<Partial<StreamingState>> {
  try {
    const agent = createCommerceAgent()
    
    const formattedMessages = messages.map(msg => convertToBaseMessage(msg))
    
    const eventStream = await agent.streamEvents({
      messages: formattedMessages
    }, {
      version: 'v2'
    })
    
    let fullContent = ''
    interface ToolCall {
      tool: string
      status: string
      output?: any
    }
    const toolCalls: ToolCall[] = []
    
    for await (const event of eventStream) {
      if (event.event === 'on_chat_model_stream') {
        const content = event.data?.chunk?.content
        
        if (typeof content === 'string' && content) {
          fullContent += content
          
          yield {
            streamedContent: content,
            messages: [],
            step: 0
          }
        }
      } else if (event.event === 'on_tool_start') {
        toolCalls.push({ tool: event.name, status: 'started' })
      } else if (event.event === 'on_tool_end') {
        const toolIndex = toolCalls.findIndex(tc => tc.tool === event.name && tc.status === 'started')
        if (toolIndex !== -1) {
          toolCalls[toolIndex].status = 'completed'
          toolCalls[toolIndex].output = event.data?.output
        }
      }
    }
    
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
    
    const formattedMessages = messages.map(msg => convertToBaseMessage(msg))
    
    const result = await agent.invoke({
      messages: formattedMessages
    })
    
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
