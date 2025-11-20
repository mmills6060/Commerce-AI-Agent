# Quick Start Guide - Supabase Integration

Get your Commerce AI Agent backend up and running with Supabase in 5 minutes.

## Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: Commerce-AI-Agent
   - **Database Password**: (generate strong password)
   - **Region**: (choose closest to you)
4. Wait for project creation

## Step 2: Get API Keys (1 minute)

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...`
   - **service_role key**: `eyJhbG...`

## Step 3: Set Environment Variables (30 seconds)

Create `.env` file in `packages/backend/`:

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Server
PORT=3001
```

## Step 4: Create Database Tables (30 seconds)

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy/paste contents of: `src/db/migrations/001_initial_schema.sql`
4. Click **Run**
5. Verify tables appear in **Table Editor**

## Step 5: Seed Database (30 seconds)

```bash
npm run seed
```

## Step 6: Test & Run (30 seconds)

```bash
# Test connection
npm run test:supabase

# Start server
npm run dev
```

## Verify It Works

```bash
# Get all products
curl http://localhost:3001/api/products

# Health check
curl http://localhost:3001/health
```

## That's It! 🎉

Your backend is now running with:
- ✅ Supabase database
- ✅ Product management
- ✅ Order tracking
- ✅ Chat sessions
- ✅ OpenAI integration

## Common Issues

### "Missing Supabase environment variables"
- Check `.env` file exists in `packages/backend/`
- Verify all three Supabase variables are set

### "Connection failed"
- Verify Supabase project is active
- Check URL and keys are correct
- Ensure no trailing spaces in `.env`

### "No products returned"
- Run `npm run seed` again
- Check Table Editor in Supabase dashboard

## Next Steps

- Read [README.md](./README.md) for full API documentation
- See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup
- Check [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) for technical details

## Quick Commands

```bash
npm run dev              # Start dev server
npm run seed            # Seed database
npm run test:supabase   # Test connection
npm run build           # Build for production
npm start               # Run production server
```

