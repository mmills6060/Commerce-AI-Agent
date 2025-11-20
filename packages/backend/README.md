# Commerce AI Agent - Backend

A Node.js/Express backend with Supabase integration, OpenAI chat capabilities, and LangGraph support.

## Features

- 🛍️ **Product Management** - CRUD operations for e-commerce products
- 📦 **Order Management** - Create and track customer orders
- 💬 **AI Chat** - OpenAI-powered chat with streaming responses
- 🔄 **LangGraph Integration** - Advanced conversational AI workflows
- 🗄️ **Supabase Database** - PostgreSQL database with real-time capabilities
- 🔒 **Row Level Security** - Secure data access policies
- 🚀 **Modern Stack** - TypeScript, Express, Supabase

## Prerequisites

- Node.js v20+ (v18 may work but is not recommended)
- A Supabase account and project
- OpenAI API key

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Get your API credentials
- Run database migrations
- Seed initial data

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update with your credentials:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Server Configuration
PORT=3001
```

### 4. Test Supabase Connection

```bash
npm run test:supabase
```

This will verify:
- Environment variables are set
- Database connection works
- Tables exist
- Sample data can be queried

### 5. Seed the Database

```bash
npm run seed
```

This populates the database with initial product data.

### 6. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with initial data
- `npm run test:supabase` - Test Supabase connection

## Project Structure

```
packages/backend/
├── src/
│   ├── db/
│   │   ├── migrations/          # SQL migration files
│   │   ├── products.ts          # Product database operations
│   │   ├── orders.ts            # Order database operations
│   │   ├── chat-sessions.ts     # Chat session operations
│   │   └── seed.ts              # Database seeding script
│   ├── lib/
│   │   └── supabase.ts          # Supabase client configuration
│   ├── routes/
│   │   └── api.ts               # API route handlers
│   ├── types/
│   │   ├── product.ts           # Product type definitions
│   │   └── supabase.ts          # Supabase database types
│   ├── utils/
│   │   └── test-supabase-connection.ts  # Connection testing utility
│   ├── langgraph/               # LangGraph integration
│   └── index.ts                 # Application entry point
├── .env.example                 # Environment variable template
├── .gitignore
├── package.json
├── tsconfig.json
├── SUPABASE_SETUP.md           # Detailed Supabase setup guide
└── README.md                    # This file
```

## API Endpoints

### Health Check

- `GET /health` - Server health check

### Products

- `GET /api/products` - Get all products
  - Query params: `?category=Clothing` or `?search=shirt`
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product (requires auth)
- `PATCH /api/products/:id` - Update a product (requires auth)
- `DELETE /api/products/:id` - Delete a product (requires auth)

**Example: Create Product**
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "price": 29.99,
    "currency": "USD",
    "category": "Accessories",
    "inStock": true
  }'
```

### Orders

- `GET /api/orders` - Get all orders
  - Query params: `?userId=user123`
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create a new order
- `PATCH /api/orders/:id/status` - Update order status

**Example: Create Order**
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "total": 45.00,
    "currency": "USD",
    "status": "pending",
    "items": [
      {
        "productId": "prod-123",
        "name": "T-Shirt",
        "price": 25.00,
        "quantity": 1
      }
    ]
  }'
```

### Chat

- `POST /api/chat` - Stream chat responses using OpenAI
- `POST /api/langgraph/run` - Process chat with LangGraph

**Example: Chat**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What products do you have?"
      }
    ]
  }'
```

## Database Schema

### Products Table

- `id` (UUID) - Primary key
- `name` (TEXT) - Product name
- `description` (TEXT) - Product description
- `price` (DECIMAL) - Product price
- `currency` (TEXT) - Currency code
- `image` (TEXT) - Main image URL
- `images` (TEXT[]) - Additional images
- `category` (TEXT) - Product category
- `in_stock` (BOOLEAN) - Availability
- `created_at` (TIMESTAMP) - Creation time
- `updated_at` (TIMESTAMP) - Last update time

### Orders Table

- `id` (UUID) - Primary key
- `user_id` (TEXT) - User identifier
- `total` (DECIMAL) - Order total
- `currency` (TEXT) - Currency code
- `status` (TEXT) - Order status
- `items` (JSONB) - Order items
- `created_at` (TIMESTAMP) - Creation time
- `updated_at` (TIMESTAMP) - Last update time

### Chat Sessions Table

- `id` (UUID) - Primary key
- `user_id` (TEXT) - User identifier
- `messages` (JSONB) - Chat messages
- `created_at` (TIMESTAMP) - Creation time
- `updated_at` (TIMESTAMP) - Last update time

## Development

### Adding New Features

1. **Database Changes**: Update migration files in `src/db/migrations/`
2. **Types**: Add TypeScript types in `src/types/`
3. **Database Operations**: Create functions in `src/db/`
4. **API Routes**: Add endpoints in `src/routes/api.ts`

### Type Safety

The project uses TypeScript with strict type checking. Supabase types are defined in `src/types/supabase.ts` and mapped to application types in the database modules.

### Error Handling

All database operations include proper error handling:
- Early returns for validation errors
- Specific error codes (e.g., `PGRST116` for not found)
- Descriptive error messages
- Console logging for debugging

## Troubleshooting

### "Missing Supabase environment variables"

- Verify `.env` file exists in `packages/backend/`
- Check all three Supabase variables are set
- Restart the dev server

### Database Query Errors

- Run `npm run test:supabase` to diagnose
- Check Supabase dashboard logs
- Verify RLS policies in Supabase dashboard

### No Products Returned

- Run `npm run seed` to populate database
- Check database in Supabase Table Editor
- Verify RLS policies allow public read access

### Port Already in Use

Change the port in `.env`:
```env
PORT=3002
```

## Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Service role key only used server-side
- ✅ Environment variables not committed to git
- ✅ Input validation on all endpoints
- ✅ Early return error handling pattern

## License

Private - Commerce AI Agent

## Support

For issues or questions, please check:
1. [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for Supabase setup help
2. [Supabase Documentation](https://supabase.com/docs)
3. Project issues and discussions
