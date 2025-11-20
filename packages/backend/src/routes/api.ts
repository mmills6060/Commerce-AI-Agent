import { Router } from 'express'
import { createGraph } from '../langgraph/index.js'
import OpenAI from 'openai'
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { 
  getAllProducts, 
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory
} from '../db/products.js'
import { 
  createOrder, 
  getOrderById, 
  getOrdersByUserId, 
  updateOrderStatus,
  getAllOrders
} from '../db/orders.js'

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

apiRouter.get('/products', async (req, res) => {
  try {
    const { category, search } = req.query

    let products
    if (search && typeof search === 'string') {
      products = await searchProducts(search)
    } else if (category && typeof category === 'string') {
      products = await getProductsByCategory(category)
    } else {
      products = await getAllProducts()
    }

    res.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

apiRouter.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const product = await getProductById(id)
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found' 
      })
    }
    
    res.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ 
      error: 'Failed to fetch product',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

apiRouter.post('/products', async (req, res) => {
  try {
    const productData = req.body

    if (!productData.name || !productData.price) {
      return res.status(400).json({ 
        error: 'Name and price are required' 
      })
    }

    const product = await createProduct(productData)
    res.status(201).json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({ 
      error: 'Failed to create product',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

apiRouter.patch('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const product = await updateProduct(id, updates)
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found' 
      })
    }

    res.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ 
      error: 'Failed to update product',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

apiRouter.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    await deleteProduct(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ 
      error: 'Failed to delete product',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

apiRouter.post('/orders', async (req, res) => {
  try {
    const orderData = req.body

    if (!orderData.total || !orderData.items || !Array.isArray(orderData.items)) {
      return res.status(400).json({ 
        error: 'Total and items array are required' 
      })
    }

    const order = await createOrder({
      userId: orderData.userId,
      total: orderData.total,
      currency: orderData.currency || 'USD',
      status: orderData.status || 'pending',
      items: orderData.items
    })

    res.status(201).json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ 
      error: 'Failed to create order',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

apiRouter.get('/orders', async (req, res) => {
  try {
    const { userId } = req.query

    let orders
    if (userId && typeof userId === 'string') {
      orders = await getOrdersByUserId(userId)
    } else {
      orders = await getAllOrders()
    }

    res.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

apiRouter.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params
    const order = await getOrderById(id)
    
    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found' 
      })
    }
    
    res.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({ 
      error: 'Failed to fetch order',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

apiRouter.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ 
        error: 'Status is required' 
      })
    }

    const order = await updateOrderStatus(id, status)
    
    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found' 
      })
    }

    res.json(order)
  } catch (error) {
    console.error('Error updating order status:', error)
    res.status(500).json({ 
      error: 'Failed to update order status',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

apiRouter.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body

    console.log('[Backend Chat] Received messages:', JSON.stringify(messages, null, 2))

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

    // Transform messages to handle different content formats
    const transformedMessages = messages.map((msg: any) => {
      let content = ''
      
      // Check for parts array (assistant-ui format)
      if (Array.isArray(msg.parts)) {
        content = msg.parts
          .map((part: any) => {
            if (typeof part === 'string') return part
            if (part.text) return part.text
            if (part.type === 'text' && part.text) return part.text
            return ''
          })
          .filter(Boolean)
          .join(' ')
      }
      // Check for content field
      else if (typeof msg.content === 'string') {
        content = msg.content
      } else if (Array.isArray(msg.content)) {
        // Handle array of content parts
        content = msg.content
          .map((part: any) => {
            if (typeof part === 'string') return part
            if (part.text) return part.text
            if (part.type === 'text' && part.text) return part.text
            return ''
          })
          .filter(Boolean)
          .join(' ')
      } else if (msg.content && typeof msg.content === 'object') {
        // Handle object content
        content = msg.content.text || msg.content.value || ''
      }

      return {
        role: msg.role || 'user',
        content: content || ''
      }
    }).filter((msg: any) => msg.content.trim() !== '')

    console.log('[Backend Chat] Transformed messages:', JSON.stringify(transformedMessages, null, 2))

    const result = streamText({
      model,
      messages: transformedMessages,
    })

    console.log('[Backend Chat] Streaming with toUIMessageStreamResponse')
    
    // Convert to UI message stream response (for assistant-ui)
    const response = result.toUIMessageStreamResponse()
    
    // Copy headers to Express response
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })
    
    // Stream the body
    if (response.body) {
      const reader = response.body.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            res.end()
            console.log('[Backend Chat] Stream completed')
            break
          }
          res.write(value)
        }
      } catch (error) {
        console.error('[Backend Chat] Streaming error:', error)
        res.end()
      }
    } else {
      res.end()
    }

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
      (msg: { role: string; content: string }) => msg.role === 'user' || msg.role === 'assistant'
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

