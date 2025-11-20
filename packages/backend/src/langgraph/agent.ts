import { createAgent, tool, type ReactAgent } from 'langchain'
import { ChatOpenAI } from '@langchain/openai'
import type { BaseMessage } from '@langchain/core/messages'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import * as z from 'zod'
import { searchProducts, searchOrders, getProductDetails } from './handlers/supabase-tools.js'

// Initialize the OpenAI model
export function getChatModel() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables')
  }
  
  console.log('[LangChain Agent] OpenAI client initialized with API key:', apiKey.substring(0, 10) + '...')
  
  return new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.7,
    streaming: true,
  })
}

// Create the commerce agent using createAgent API
export function createCommerceAgent(): ReactAgent {
  const model = getChatModel()
  
  // Create agent with Supabase search tools
  const agent = createAgent({
    model,
    tools: [searchProducts, searchOrders, getProductDetails],
    systemPrompt: `You are a helpful AI assistant for an e-commerce platform. 
    
You can help users:
- Search for products by name, category, price range, or availability
- Look up specific product details
- Search and track orders
- Answer questions about our inventory

Use the available tools to search our database and provide accurate, helpful information.
When searching, be specific and use appropriate filters to give users the most relevant results.`,
  })
  
  return agent
}

// Convert message format from { role, content } to BaseMessage
export function convertToBaseMessage(message: { role: string; content: string }): BaseMessage {
  if (message.role === 'user') {
    return new HumanMessage(message.content)
  } else if (message.role === 'assistant') {
    return new AIMessage(message.content)
  } else {
    // Default to HumanMessage for unknown roles
    return new HumanMessage(message.content)
  }
}

// Helper to extract content from BaseMessage
export function extractMessageContent(message: BaseMessage): { role: string; content: string } {
  const role = message._getType() === 'human' ? 'user' : 
               message._getType() === 'ai' ? 'assistant' : 
               'system'
  
  return {
    role,
    content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
  }
}