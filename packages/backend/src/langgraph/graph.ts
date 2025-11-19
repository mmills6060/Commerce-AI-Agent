import { StateGraph, END, START } from '@langchain/langgraph'
import OpenAI from 'openai'

interface GraphState {
  messages: Array<{ role: string; content: string }>
  step: number
}

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

async function processNode(state: GraphState): Promise<Partial<GraphState>> {
  const lastMessage = state.messages[state.messages.length - 1]
  
  try {
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: state.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      })),
    })

    const assistantMessage = completion.choices[0]?.message?.content || 'No response generated'
    
    return {
      messages: [
        {
          role: 'assistant',
          content: assistantMessage
        }
      ],
      step: state.step + 1
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
  return {
    messages: [
      {
        role: 'assistant',
          content: `Error: Failed to get response from AI. ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    ],
    step: state.step + 1
    }
  }
}

function validateNode(state: GraphState): Partial<GraphState> {
  if (state.messages.length === 0) {
    return {
      messages: [
        {
          role: 'system',
          content: 'No messages found. Please provide a message.'
        }
      ]
    }
  }
  
  return {}
}

function shouldContinue(state: GraphState): string {
  if (state.step >= 3) {
    return 'end'
  }
  return 'continue'
}

function endNode(state: GraphState): Partial<GraphState> {
  // Don't add any extra messages in the end node
  return {}
}

export function createGraph() {
  const workflow = new StateGraph<GraphState>({
    channels: {
      messages: {
        reducer: (x: Array<{ role: string; content: string }>, y: Array<{ role: string; content: string }>) => {
          return [...(x || []), ...(y || [])]
        },
        default: () => []
      },
      step: {
        reducer: (x: number, y: number) => y ?? x,
        default: () => 0
      }
    }
  })

  workflow.addNode('validate', validateNode)
  workflow.addNode('process', processNode)
  workflow.addNode('end', endNode)

  workflow.addEdge(START, 'validate')
  workflow.addEdge('validate', 'process')
  
  workflow.addConditionalEdges(
    'process',
    shouldContinue,
    {
      continue: 'process',
      end: 'end'
    }
  )
  
  workflow.addEdge('end', END)

  return workflow.compile()
}

export type { GraphState }

