# Supabase Integration Setup Guide

This guide will help you set up Supabase for the Commerce AI Agent backend.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js v20+ installed

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the project details:
   - Name: Commerce-AI-Agent (or your preferred name)
   - Database Password: Generate a strong password
   - Region: Choose the closest to your users
4. Wait for the project to be created

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ Keep this secret! Never expose in client-side code)

## Step 3: Configure Environment Variables

1. In the backend directory, create a `.env` file:
   ```bash
   cd packages/backend
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini

   # Supabase Configuration
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Server Configuration
   PORT=3001
   ```

## Step 4: Run Database Migrations

1. In your Supabase project dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `src/db/migrations/001_initial_schema.sql`
4. Click "Run" to execute the migration
5. Verify that the tables were created by going to **Table Editor**

You should see three tables:
- `products`
- `orders`
- `chat_sessions`

## Step 5: Seed the Database

Run the seed script to populate the database with initial product data:

```bash
npm run seed
```

Or manually run:

```bash
tsx src/db/seed.ts
```

## Step 6: Verify the Setup

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Test the products endpoint:
   ```bash
   curl http://localhost:3001/api/products
   ```

   You should see a JSON response with the seeded products.

## Database Schema

### Products Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| name | TEXT | Product name |
| description | TEXT | Product description |
| price | DECIMAL | Product price |
| currency | TEXT | Currency code (default: USD) |
| image | TEXT | Main product image URL |
| images | TEXT[] | Array of additional image URLs |
| category | TEXT | Product category |
| in_stock | BOOLEAN | Stock availability |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Orders Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| user_id | TEXT | User identifier (nullable) |
| total | DECIMAL | Order total amount |
| currency | TEXT | Currency code (default: USD) |
| status | TEXT | Order status (pending, processing, completed, cancelled) |
| items | JSONB | Order items as JSON |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Chat Sessions Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| user_id | TEXT | User identifier (nullable) |
| messages | JSONB | Chat messages as JSON array |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## API Endpoints

### Products

- `GET /api/products` - Get all products (supports `?category=` and `?search=` query params)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PATCH /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Orders

- `GET /api/orders` - Get all orders (supports `?userId=` query param)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create a new order
- `PATCH /api/orders/:id/status` - Update order status

### Chat

- `POST /api/chat` - Stream chat responses (existing endpoint)
- `POST /api/langgraph/run` - Run LangGraph chat (existing endpoint)

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. Products are publicly readable but require authentication to modify
3. Orders and chat sessions are scoped to their owners
4. The service role key bypasses RLS - use it only in server-side code
5. Never commit `.env` files to version control

## Troubleshooting

### Connection Errors

If you see "Missing Supabase environment variables":
- Verify your `.env` file is in the correct location
- Ensure all required variables are set
- Restart your dev server

### Query Errors

If queries fail:
- Check the Supabase dashboard logs
- Verify RLS policies are correctly set up
- Ensure migrations ran successfully

### Seed Script Fails

If seeding fails:
- Check that migrations ran successfully
- Verify your service role key is correct
- Check the Supabase dashboard for error details

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

