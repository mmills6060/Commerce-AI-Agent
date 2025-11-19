import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { apiRouter } from './routes/api.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.url
  const ip = req.ip || req.socket.remoteAddress
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`)
  
  // Log response when it finishes
  const startTime = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const statusCode = res.statusCode
    console.log(`[${timestamp}] ${method} ${url} - ${statusCode} - ${duration}ms`)
  })
  
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', apiRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

