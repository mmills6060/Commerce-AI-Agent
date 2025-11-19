import { Router } from 'express'
import { createGraph } from '../langgraph/index.js'
import OpenAI from 'openai'
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { products, getProductById } from '../data/products.js'

export const apiRouter = Router()

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

function getAISDKProvider() {
  return createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

apiRouter.get('/', (req, res) => {
  res.json({ message: 'API is working' })
})

apiRouter.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint', timestamp: new Date().toISOString() })
})

apiRouter.get('/products', (req, res) => {
  res.json(products)
})

apiRouter.get('/products/:id', (req, res) => {
  const { id } = req.params
  const product = getProductById(id)
  
  if (!product) {
    return res.status(404).json({ 
      error: 'Product not found' 
    })
  }
  
  res.json(product)
})

apiRouter.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required' 
      })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key is not configured' 
      })
    }

    const provider = getAISDKProvider()
    const model = provider(process.env.OPENAI_MODEL || 'gpt-4o-mini')

    const result = streamText({
      model,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : msg.content[0]?.text || ''
      })),
    })

    result.pipeDataStreamToResponse(res)

  } catch (error) {
    console.error('Chat error:', error)
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to process chat request',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    } else {
      res.end()
    }
  }
})

apiRouter.post('/langgraph/run', async (req, res) => {
  try {
    const { messages } = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Messages array is required and must not be empty' 
      })
    }

    // Validate message format
    const isValidFormat = messages.every(
      (msg) => msg && typeof msg.role === 'string' && typeof msg.content === 'string'
    )

    if (!isValidFormat) {
      return res.status(400).json({ 
        error: 'Each message must have a role and content string' 
      })
    }

    console.log(`[LangGraph API] Received ${messages.length} messages:`, 
      messages.map(m => ({ role: m.role, contentLength: m.content.length })))

    const graph = createGraph()
    
    const initialState = {
      messages: messages,
      step: 0
    }

    const result = await graph.invoke(initialState)
    
    console.log(`[LangGraph API] Returning ${result.messages.length} messages after ${result.step} steps`)

    // Filter to only return user and assistant messages, exclude system messages
    const filteredMessages = result.messages.filter(
      (msg) => msg.role === 'user' || msg.role === 'assistant'
    )

    res.json({
      success: true,
      result: {
        messages: filteredMessages,
        step: result.step
      }
    })
  } catch (error) {
    console.error('LangGraph error:', error)
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

