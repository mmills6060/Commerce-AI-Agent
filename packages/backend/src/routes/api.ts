import { Router } from 'express'
import { createGraph } from '../langgraph/index.js'

export const apiRouter = Router()

apiRouter.get('/', (req, res) => {
  res.json({ message: 'API is working' })
})

apiRouter.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint', timestamp: new Date().toISOString() })
})

apiRouter.post('/langgraph/run', async (req, res) => {
  try {
    const { message } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      })
    }

    const graph = createGraph()
    
    const initialState = {
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      step: 0
    }

    const result = await graph.invoke(initialState)

    res.json({
      success: true,
      result: {
        messages: result.messages,
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

