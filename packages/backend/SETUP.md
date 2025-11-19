# Backend Setup Instructions

## Environment Variables

Create a `.env` file in the `packages/backend` directory with the following variables:

```env
# Server Configuration
PORT=3001

# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: OpenAI Model Configuration
OPENAI_MODEL=gpt-4o-mini
```

## Getting Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

## Installation

Make sure you have all dependencies installed:

```bash
npm install
```

This will install:
- `openai` - OpenAI SDK
- `ai` - Vercel AI SDK for streaming
- `@ai-sdk/openai` - AI SDK OpenAI provider
- Other required dependencies

## Running the Backend

```bash
npm run dev
```

The backend will start on `http://localhost:3001` (or the PORT you specified in .env)

## API Endpoints

- `GET /api` - Health check
- `GET /api/test` - Test endpoint
- `POST /api/chat` - Main chat endpoint (uses OpenAI API with streaming)
- `POST /api/langgraph/run` - LangGraph endpoint (also uses OpenAI API)

## Testing the Chat Endpoint

You can test the chat endpoint with curl:

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
```

