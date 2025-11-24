import dotenv from 'dotenv'

dotenv.config()

import express, { type Request, type Response } from 'express'
import cors from 'cors'
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

app.get('/api-docs', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Commerce AI Agent API Documentation</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css" />
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    #swagger-ui {
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js"></script>
  <script>
    window.onload = function () {
      const ui = SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: 'StandaloneLayout'
      })
      window.ui = ui
    }
  </script>
</body>
</html>`)
})

app.get('/api-docs.json', (req: Request, res: Response) => {
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
