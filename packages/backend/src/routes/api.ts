import { Router } from 'express'
import { handleStreamingChat, handleNonStreamingChat } from '../langgraph/handlers/streaming-handler.js'
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
    res.status(500).json({ 
      error: 'Failed to update order status',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
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

    interface MessagePart {
      text?: string
      type?: string
    }

    interface IncomingMessage {
      role?: string
      content?: string | MessagePart[] | { text?: string; value?: string }
      parts?: Array<string | MessagePart>
    }

    interface TransformedMessage {
      role: string
      content: string
    }

    const transformedMessages = messages.map((msg: IncomingMessage): TransformedMessage | null => {
      let content = ''
      
      if (Array.isArray(msg.parts)) {
        content = msg.parts
          .map((part: string | MessagePart) => {
            if (typeof part === 'string') return part
            if (part.text) return part.text
            if (part.type === 'text' && part.text) return part.text
            return ''
          })
          .filter(Boolean)
          .join(' ')
      }
      else if (typeof msg.content === 'string') {
        content = msg.content
      } else if (Array.isArray(msg.content)) {
        content = msg.content
          .map((part: string | MessagePart) => {
            if (typeof part === 'string') return part
            if (part.text) return part.text
            if (part.type === 'text' && part.text) return part.text
            return ''
          })
          .filter(Boolean)
          .join(' ')
      } else if (msg.content && typeof msg.content === 'object') {
        content = msg.content.text || msg.content.value || ''
      }

      const transformed: TransformedMessage = {
        role: msg.role || 'user',
        content: content || ''
      }
      
      return transformed.content.trim() !== '' ? transformed : null
    }).filter((msg): msg is TransformedMessage => msg !== null)
    
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    try {
      const stream = handleStreamingChat(transformedMessages)

      let fullResponse = ''

      for await (const value of stream) {
        if (value.streamedContent) {
          const delta = value.streamedContent
          fullResponse += delta
          
          const sseData = `data: ${JSON.stringify({ type: 'delta', content: delta })}\n\n`
          res.write(sseData)
        }
        
        if (value.messages && value.messages.length > 0) {
          const lastMessage = value.messages[value.messages.length - 1]
          if (lastMessage.role === 'assistant' && !value.streamedContent) {
            fullResponse = lastMessage.content
          }
        }
      }

      res.write(`data: ${JSON.stringify({ type: 'done', content: fullResponse })}\n\n`)
      res.end()

    } catch (streamError) {
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Failed to stream response',
          message: streamError instanceof Error ? streamError.message : 'Unknown error'
        })
      } else {
        res.write(`data: ${JSON.stringify({ type: 'error', error: streamError instanceof Error ? streamError.message : 'Unknown error' })}\n\n`)
        res.end()
      }
    }

  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to process chat request',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
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

    const isValidFormat = messages.every(
      (msg) => msg && typeof msg.role === 'string' && typeof msg.content === 'string'
    )

    if (!isValidFormat) {
      return res.status(400).json({ 
        error: 'Each message must have a role and content string' 
      })
    }

    const result = await handleNonStreamingChat(messages)
    
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
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

