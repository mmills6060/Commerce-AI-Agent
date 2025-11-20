# 🚀 Getting Started - Commerce AI Agent

Your backend needs Supabase to be configured before it can run. Follow these steps:

## Current Issue

The frontend is trying to fetch from the backend, but the backend isn't running because:
- ❌ No `.env` file with Supabase credentials
- ❌ Backend server not started

## Fix in 3 Steps

### 1️⃣ Create `.env` File

```bash
cd packages/backend
touch .env
```

Then add this content to the `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Server Configuration
PORT=3001
```

### 2️⃣ Get Supabase Credentials (5 minutes)

**Create a free Supabase project:**

1. Visit https://supabase.com and sign in
2. Click "New Project"
3. Fill in:
   - Name: `Commerce-AI-Agent`
   - Password: (generate strong password)
   - Region: (choose closest)
4. Wait for creation (~2 minutes)
5. Go to **Settings** → **API**
6. Copy these 3 values into your `.env`:
   - **URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbG...`
   - **service_role** key: `eyJhbG...`

### 3️⃣ Set Up Database

**Run the migration:**

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Run this command to get the migration SQL:
   ```bash
   cat packages/backend/src/db/migrations/001_initial_schema.sql
   ```
4. Copy the entire output and paste into Supabase SQL Editor
5. Click **Run**
6. Verify tables appear in **Table Editor**

**Seed initial data:**

```bash
cd packages/backend
npm run seed
```

### 4️⃣ Start Backend

```bash
cd packages/backend
npm run dev
```

Or use the helper script:

```bash
cd packages/backend
./START_BACKEND.sh
```

### 5️⃣ Verify It's Working

Open a new terminal and test:

```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","message":"Server is running"}

curl http://localhost:3001/api/products
# Should return: array of products
```

## Frontend Setup

The frontend should work automatically once the backend is running. If you need to configure it:

Create `packages/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Quick Commands

```bash
# Backend
cd packages/backend
npm run test:supabase    # Test Supabase connection
npm run seed             # Seed database
npm run dev              # Start backend server

# Frontend
cd packages/frontend
npm run dev              # Start frontend (port 3000)
```

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists in `packages/backend/`
- Verify all three Supabase variables are set (not placeholder values)

### "fetch failed" in frontend
- Make sure backend is running: `curl http://localhost:3001/health`
- Check backend terminal for errors

### "Connection failed" when testing
- Verify Supabase project is active
- Check credentials are correct (no extra spaces)
- Ensure database migration has been run

## Documentation

- **Quick Setup**: `packages/backend/QUICK_START.md`
- **Detailed Setup**: `packages/backend/SUPABASE_SETUP.md`
- **API Docs**: `packages/backend/README.md`
- **Integration Details**: `packages/backend/SUPABASE_INTEGRATION.md`

## Need Help?

1. Check if backend is running: `curl http://localhost:3001/health`
2. Test Supabase connection: `npm run test:supabase`
3. Check Supabase dashboard logs
4. Review `packages/backend/SUPABASE_SETUP.md`

## Status Checklist

- [ ] Created `.env` file in `packages/backend/`
- [ ] Added Supabase credentials to `.env`
- [ ] Created Supabase project
- [ ] Ran database migration in Supabase SQL Editor
- [ ] Seeded database with `npm run seed`
- [ ] Started backend with `npm run dev`
- [ ] Verified backend health: `curl http://localhost:3001/health`
- [ ] Started frontend with `npm run dev`
- [ ] Opened http://localhost:3000 in browser

Once all checked, your app should be working! 🎉

