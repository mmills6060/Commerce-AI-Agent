import { StateGraph, END, START } from '@langchain/langgraph'

interface GraphState {
  messages: Array<{ role: string; content: string }>
  step: number
}

function processNode(state: GraphState): Partial<GraphState> {
  const lastMessage = state.messages[state.messages.length - 1]
  
  return {
    messages: [
      {
        role: 'assistant',
        content: `Processed: ${lastMessage.content} (step ${state.step})`
      }
    ],
    step: state.step + 1
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
  return {
    messages: [
      {
        role: 'system',
        content: 'Graph execution completed.'
      }
    ]
  }
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

