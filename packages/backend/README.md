# Backend

Express backend server for Commerce AI Agent.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration values.

## Development

Run the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the PORT specified in your `.env` file).

## Build

Build for production:
```bash
npm run build
```

## Start Production Server

Start the production server:
```bash
npm start
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api` - API root endpoint
- `GET /api/test` - Test endpoint

