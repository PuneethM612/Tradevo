# Quick Fix Guide - Journal Data Disappearing

## The Problem
Your trades disappear after logout/refresh because they're not being properly saved to or loaded from Supabase.

## Quick Fix (5 minutes)

### Step 1: Set Up Database Tables

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/wsygyekughkjtxrmcwzq
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Copy ALL the code from `supabase-schema.sql` file
5. Paste it and click **"Run"**
6. You should see "Success. No rows returned"

### Step 2: Verify It Worked

1. Click **"Table Editor"** in left sidebar
2. You should now see:
   - ✅ `profiles` table
   - ✅ `trades` table

### Step 3: Test Your App

1. **Clear browser cache** (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Log out of Tradevo
3. Log back in
4. Add a test trade
5. **Refresh the page** - trade should still be there! ✅
6. **Log out and log back in** - trade should still be there! ✅

## What Changed in the Code

I fixed the data loading logic in `TerminalDashboard.tsx`:

### Before (buggy):
```typescript
// Silent failures - no error logging
const { data: trades } = await supabase
  .from('trades')
  .select('*')
  .eq('user_id', session.user.id);

if (trades && trades.length > 0) {
  setLoggedTrades(trades);
}
```

### After (fixed):
```typescript
// Proper error handling and logging
const { data: trades, error: tradesError } = await supabase
  .from('trades')
  .select('*')
  .eq('user_id', session.user.id)
  .order('timestamp', { ascending: false });

if (tradesError) {
  console.error('Error fetching trades:', tradesError);
} else if (trades && trades.length > 0) {
  console.log(`Loaded ${trades.length} trades from database`);
  setLoggedTrades(trades);
} else {
  console.log('No trades found in database');
}
```

## How to Debug If Still Not Working

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for these messages:
   - ✅ "Loaded X trades from database" = Working!
   - ⚠️ "No trades found in database" = Trades not saving
   - ❌ "Error fetching trades: ..." = Database issue

### Check Supabase Directly

1. Go to Supabase Dashboard → Table Editor
2. Click on `trades` table
3. Do you see your trades there?
   - **YES** = Loading issue (check console errors)
   - **NO** = Saving issue (check if SQL ran correctly)

### Common Issues

**Issue: "relation 'public.trades' does not exist"**
- Solution: Run the SQL schema again

**Issue: Trades save but don't load**
- Solution: Check RLS policies in Supabase Dashboard → Authentication → Policies

**Issue: "permission denied for table trades"**
- Solution: RLS policies not set up correctly, re-run SQL schema

## Production Deployment

When you deploy to production:

1. The same Supabase database will work (it's already in production)
2. Make sure your environment variables are set:
   - `VITE_SUPABASE_URL` (if using env vars)
   - `VITE_SUPABASE_ANON_KEY` (if using env vars)
3. Currently hardcoded in `lib/supabase.ts` so should work as-is

## Data Persistence Checklist

- ✅ Trades save to Supabase on commit
- ✅ Trades load from Supabase on login
- ✅ Trades load from Supabase on refresh
- ✅ Initial balance saves to Supabase
- ✅ Initial balance loads from Supabase
- ✅ Goals save to localStorage (browser-specific)
- ✅ Custom tags save to localStorage (browser-specific)
- ✅ Theme preference saves to localStorage (browser-specific)

## Why Some Data Uses localStorage vs Supabase

**Supabase (syncs across devices):**
- Trades
- Initial balance
- User profile

**localStorage (device-specific):**
- Theme preference (dark/light mode)
- Goals (daily/weekly/monthly targets)
- Custom tags

This is intentional - goals and tags are personal preferences that don't need to sync across devices.

## Need More Help?

Check the full documentation in `SUPABASE_SETUP.md`
