# Supabase Database Setup for Tradevo

## Problem
Your journal data disappears after logout/refresh because the database tables might not be properly configured in Supabase.

## Solution

### Step 1: Run the SQL Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (wsygyekughkjtxrmcwzq)
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire contents of `supabase-schema.sql` file
6. Paste it into the SQL editor
7. Click "Run" or press Cmd/Ctrl + Enter

This will create:
- `profiles` table (stores initial_balance for each user)
- `trades` table (stores all your trade journal entries)
- Row Level Security (RLS) policies (ensures users can only see their own data)
- Indexes for better performance
- Automatic triggers for timestamps

### Step 2: Verify Tables Were Created

1. In Supabase Dashboard, click "Table Editor" in the left sidebar
2. You should see two tables:
   - `profiles`
   - `trades`

### Step 3: Test the Application

1. **Clear your browser cache** (important!)
2. Log out of Tradevo
3. Log back in
4. Add a test trade
5. Refresh the page - your trade should still be there
6. Log out and log back in - your trade should still be there

## How It Works

### Data Flow

**When you add a trade:**
1. Trade is added to React state (immediate UI update)
2. Trade is saved to Supabase `trades` table (persistent storage)

**When you login/refresh:**
1. App fetches your user session from Supabase Auth
2. App loads your `initial_balance` from `profiles` table
3. App loads all your trades from `trades` table
4. UI displays your data

### Row Level Security (RLS)

RLS ensures that:
- You can only see YOUR trades (not other users' trades)
- You can only modify YOUR trades
- Each user's data is completely isolated

## Troubleshooting

### Issue: Trades still disappear after running SQL

**Solution 1: Check browser console**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages when loading trades
4. Share any errors you see

**Solution 2: Verify RLS policies**
1. In Supabase Dashboard, go to "Authentication" → "Policies"
2. Make sure policies exist for both `profiles` and `trades` tables
3. Policies should allow SELECT, INSERT, UPDATE, DELETE for authenticated users

**Solution 3: Check if data is actually being saved**
1. In Supabase Dashboard, go to "Table Editor"
2. Click on `trades` table
3. Check if you see any rows
4. If rows exist but don't show in app, there's a loading issue
5. If no rows exist, there's a saving issue

### Issue: "relation 'public.profiles' does not exist"

This means the SQL didn't run properly. Try:
1. Delete any partially created tables
2. Run the SQL schema again
3. Make sure you're running it in the correct project

### Issue: Initial balance not saving

1. Check if `profiles` table exists
2. Verify you have a row in `profiles` table with your user ID
3. Check browser console for errors

## Database Schema Details

### profiles table
```
id              UUID (references auth.users)
initial_balance NUMERIC (default: 50000)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### trades table
```
id                   TEXT (primary key, e.g., "TRD-12345")
user_id              UUID (references auth.users)
timestamp            TIMESTAMP
symbol               TEXT (e.g., "XAUUSD")
assetClass           TEXT (e.g., "COMMODITIES")
type                 TEXT ("LONG" or "SHORT")
lots                 TEXT
entry                TEXT
sl                   TEXT (stop loss)
tp                   TEXT (take profit)
rr                   TEXT (risk:reward ratio)
profit               TEXT
rating               TEXT (A+, A, B, C, N/A)
analysis             TEXT
screenshot           TEXT (base64 image)
emotions             TEXT[] (array)
preMarketAnalysis    TEXT
postMarketAnalysis   TEXT
session              TEXT
preChecklist         BOOLEAN
tags                 TEXT[] (array)
mistakes             TEXT[] (array)
lessonsLearned       TEXT
wouldDoDifferently   TEXT
entryTime            TIMESTAMP
exitTime             TEXT
created_at           TIMESTAMP
updated_at           TIMESTAMP
```

## Need Help?

If you're still having issues:
1. Check the browser console for errors
2. Check Supabase logs in Dashboard → "Logs"
3. Verify your Supabase URL and anon key are correct in `lib/supabase.ts`
