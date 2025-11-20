import dotenv from 'dotenv'

dotenv.config()

import express from 'express'
import cors from 'cors'
import { apiRouter } from './routes/api.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())

app.use((req, res, next) => {
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
