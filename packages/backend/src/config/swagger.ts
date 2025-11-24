import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Commerce AI Agent API',
      version: '1.0.0',
      description: 'API documentation for the Commerce AI Agent backend',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique product identifier'
            },
            name: {
              type: 'string',
              description: 'Product name'
            },
            description: {
              type: 'string',
              description: 'Product description'
            },
            price: {
              type: 'number',
              description: 'Product price'
            },
            currency: {
              type: 'string',
              description: 'Currency code (e.g., USD)',
              default: 'USD'
            },
            image: {
              type: 'string',
              description: 'Main product image URL'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Additional product images'
            },
            category: {
              type: 'string',
              description: 'Product category'
            },
            inStock: {
              type: 'boolean',
              description: 'Whether the product is in stock'
            }
          },
          required: ['id', 'name', 'description', 'price', 'currency', 'image']
        },
        OrderItem: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'Product identifier'
            },
            name: {
              type: 'string',
              description: 'Product name'
            },
            price: {
              type: 'number',
              description: 'Item price'
            },
            quantity: {
              type: 'number',
              description: 'Item quantity'
            },
            image: {
              type: 'string',
              description: 'Product image URL'
            }
          },
          required: ['productId', 'name', 'price', 'quantity']
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique order identifier'
            },
            userId: {
              type: 'string',
              description: 'User identifier'
            },
            total: {
              type: 'number',
              description: 'Total order amount'
            },
            currency: {
              type: 'string',
              description: 'Currency code',
              default: 'USD'
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'cancelled'],
              description: 'Order status'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem'
              },
              description: 'Order items'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order last update timestamp'
            }
          },
          required: ['id', 'total', 'currency', 'status', 'items', 'createdAt', 'updatedAt']
        },
        CreateProductRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Product name'
            },
            description: {
              type: 'string',
              description: 'Product description'
            },
            price: {
              type: 'number',
              description: 'Product price'
            },
            currency: {
              type: 'string',
              description: 'Currency code',
              default: 'USD'
            },
            image: {
              type: 'string',
              description: 'Main product image URL'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Additional product images'
            },
            category: {
              type: 'string',
              description: 'Product category'
            },
            inStock: {
              type: 'boolean',
              description: 'Whether the product is in stock'
            }
          },
          required: ['name', 'price']
        },
        CreateOrderRequest: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User identifier'
            },
            total: {
              type: 'number',
              description: 'Total order amount'
            },
            currency: {
              type: 'string',
              description: 'Currency code',
              default: 'USD'
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'cancelled'],
              description: 'Order status',
              default: 'pending'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem'
              },
              description: 'Order items'
            }
          },
          required: ['total', 'items']
        },
        UpdateOrderStatusRequest: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'cancelled'],
              description: 'New order status'
            }
          },
          required: ['status']
        },
        ChatMessage: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['user', 'assistant', 'system'],
              description: 'Message role'
            },
            content: {
              type: 'string',
              description: 'Message content'
            }
          },
          required: ['role', 'content']
        },
        ChatRequest: {
          type: 'object',
          properties: {
            messages: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ChatMessage'
              },
              description: 'Array of chat messages'
            }
          },
          required: ['messages']
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            message: {
              type: 'string',
              description: 'Detailed error message'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
}

export const swaggerSpec = swaggerJsdoc(options)

