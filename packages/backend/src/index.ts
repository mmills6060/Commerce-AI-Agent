import dotenv from 'dotenv'

dotenv.config()

import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { apiRouter } from './routes/api.js'
import { swaggerSpec } from './config/swagger.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())

app.use((req, res, next) => {
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', apiRouter)

app.use('/api-docs', swaggerUi.serve, (req, res, next) => {
  const spec = { ...swaggerSpec }
  
  if (spec.servers && spec.servers.length > 0) {
    const protocol = req.protocol || 'http'
    const host = req.get('host') || 'localhost:3001'
    const baseUrl = `${protocol}://${host}`
    
    spec.servers = [
      {
        url: baseUrl,
        description: 'Current server'
      },
      ...spec.servers.filter((s: { url: string }) => s.url !== '/')
    ]
  }
  
  return swaggerUi.setup(spec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Commerce AI Agent API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true
    }
  })(req, res, next)
})

app.get('/api-docs.json', (req, res) => {
  const spec = { ...swaggerSpec }
  
  if (spec.servers && spec.servers.length > 0) {
    const protocol = req.protocol || 'http'
    const host = req.get('host') || 'localhost:3001'
    const baseUrl = `${protocol}://${host}`
    
    spec.servers = [
      {
        url: baseUrl,
        description: 'Current server'
      },
      ...spec.servers.filter((s: { url: string }) => s.url !== '/')
    ]
  }
  
  res.setHeader('Content-Type', 'application/json')
  res.send(spec)
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`)
})
