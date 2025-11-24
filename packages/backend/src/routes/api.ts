import { Router } from 'express'
import { handleStreamingChat } from '../langchain/handlers/streaming-handler.js'
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

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns a simple message indicating the API is working
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API is working
 */
apiRouter.get('/', (req, res) => {
  res.json({ message: 'API is working' })
})

/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Test endpoint
 *     description: Returns a test message with current timestamp
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Test response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Test endpoint
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
apiRouter.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint', timestamp: new Date().toISOString() })
})

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get products
 *     description: Retrieve all products, optionally filtered by category or search query
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name or description
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a single product by its unique identifier
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product identifier
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product with the provided details
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid request - name and price are required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Update a product
 *     description: Update an existing product with partial data
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *               image:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               inStock:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete a product by its unique identifier
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product identifier
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order with the provided items and details
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request - total and items are required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders
 *     description: Retrieve all orders or filter by user ID
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter orders by user ID
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve a single order by its unique identifier
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order identifier
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     description: Update the status of an existing order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request - status is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat with AI assistant (streaming)
 *     description: Send messages to the AI assistant and receive a streaming response via Server-Sent Events (SSE)
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: Streaming response via Server-Sent Events
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: |
 *                 data: {"type":"delta","content":"Hello"}
 *                 data: {"type":"delta","content":" there"}
 *                 data: {"type":"done","content":"Hello there"}
 *       400:
 *         description: Invalid request - messages array is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error or OpenAI API key not configured
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

