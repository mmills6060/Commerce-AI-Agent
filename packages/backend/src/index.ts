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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Commerce AI Agent API Documentation'
}))

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`)
})
