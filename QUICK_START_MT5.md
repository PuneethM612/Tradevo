# MT5 Integration - Quick Start (5 Minutes)

Get MT5 auto-sync working in 5 minutes!

## Step 1: Update Environment (1 min)

Open `.env.local` and change the secret key:

```env
MT5_API_SECRET_KEY=your-super-secret-random-key-12345
DEFAULT_MT5_USER_ID=bd81b65e-fb09-4bde-8cb3-683148be8fbb
```

**Important:** Change `your-super-secret-random-key-12345` to something unique!

## Step 2: Deploy (1 min)

Deploy your app to Vercel/Netlify:

```bash
# If using Vercel
vercel --prod

# If using Netlify
netlify deploy --prod
```

Note your URL: `https://your-domain.com`

## Step 3: Install MT5 EA (3 min)

1. **Open MT5** → Press `F4` (MetaEditor)

2. **Create EA:**
   - File → New → Expert Advisor
   - Name: `TradeJournalSync`
   - Click Finish

3. **Copy Code:**
   - Open `mt5/TradeJournalSync.mq5` from this project
   - Copy ALL the code
   - Paste into MetaEditor

4. **Update Settings** (lines 10-11):
   ```mql5
   input string API_URL = "https://your-domain.com/api/mt5-sync";
   input string API_KEY = "your-super-secret-random-key-12345";
   ```

5. **Compile:**
   - Press `F7`
   - Should see: "0 error(s)"

6. **Enable WebRequest:**
   - In MT5: Tools → Options → Expert Advisors
   - Check ✅ "Allow WebRequest for listed URL:"
   - Add: `https://your-domain.com`
   - Click OK

7. **Attach EA:**
   - Drag `TradeJournalSync` from Navigator onto any chart
   - Click OK
   - Look for smiley face 😊 on chart

## Step 4: Test (30 seconds)

1. Place a small demo trade
2. Close it immediately
3. Wait 30 seconds
4. Check Experts tab: Should see `✅ Trade #12345 synced successfully`
5. Refresh your journal - trade should appear!

## ✅ Done!

Your MT5 is now connected! All future trades will auto-sync.

## 🆘 Not Working?

**Check Experts tab in MT5 for errors:**

- `HTTP 401` → API key mismatch (check keys match)
- `HTTP 404` → Wrong URL (check API_URL)
- `WebRequest error` → Enable WebRequest in Options

**Still stuck?** See `MT5_INTEGRATION_GUIDE.md` for detailed help.

---

**That's it! Your trades will now automatically sync from MT5 to your journal with exact broker P&L.** 🎉
