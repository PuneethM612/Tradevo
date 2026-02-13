# MT5 Integration Setup Guide

This guide will help you connect your MT5 terminal to automatically sync trades to your journal.

## 🎯 What This Does

- ✅ Automatically imports closed trades from MT5
- ✅ Uses exact broker P&L (includes spread, commission, swap)
- ✅ Real-time sync when trades close
- ✅ No manual data entry needed
- ✅ Works with any MT5 broker (including Vantage)

---

## 📋 Setup Steps

### Step 1: Deploy the API Endpoint

1. **Add environment variables** to your `.env.local` file:

```env
# MT5 Integration
MT5_API_SECRET_KEY=your-super-secret-key-here-change-this
DEFAULT_MT5_USER_ID=bd81b65e-fb09-4bde-8cb3-683148be8fbb
```

2. **Deploy your API** (if using Vercel/Netlify):
   - The API endpoint is at `/api/mt5-sync.js`
   - After deployment, your API URL will be: `https://your-domain.com/api/mt5-sync`

3. **Test the API** (optional):
```bash
curl -X POST https://your-domain.com/api/mt5-sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-super-secret-key-here-change-this" \
  -d '{
    "ticket": "12345",
    "symbol": "EURUSD",
    "type": "LONG",
    "lots": "0.10",
    "entry": "1.0850",
    "exit": "1.0900",
    "profit": "50.00"
  }'
```

---

### Step 2: Install the MT5 Expert Advisor

1. **Open MT5 Terminal**

2. **Open MetaEditor**:
   - Click `Tools` → `MetaQuotes Language Editor` (or press F4)

3. **Create New EA**:
   - Click `File` → `New` → `Expert Advisor (template)`
   - Name it: `TradeJournalSync`
   - Click `Finish`

4. **Copy the EA Code**:
   - Open the file `mt5/TradeJournalSync.mq5` from this project
   - Copy ALL the code
   - Paste it into the MetaEditor, replacing everything

5. **Configure the EA**:
   - Find these lines at the top:
   ```mql5
   input string API_URL = "https://your-domain.com/api/mt5-sync";
   input string API_KEY = "your-super-secret-key-here-change-this";
   ```
   - Replace with YOUR actual API URL and secret key

6. **Compile the EA**:
   - Click `Compile` button (or press F7)
   - Check for errors in the `Errors` tab
   - Should see: "0 error(s), 0 warning(s)"

7. **Enable WebRequest** (IMPORTANT):
   - In MT5, go to `Tools` → `Options` → `Expert Advisors`
   - Check ✅ "Allow WebRequest for listed URL:"
   - Add your domain: `https://your-domain.com`
   - Click `OK`

---

### Step 3: Attach EA to Chart

1. **Open any chart** in MT5 (any symbol, any timeframe)

2. **Drag the EA** from Navigator panel:
   - Open `Navigator` (Ctrl+N)
   - Expand `Expert Advisors`
   - Drag `TradeJournalSync` onto the chart

3. **Configure EA Settings**:
   - A dialog will appear
   - Go to `Inputs` tab
   - Verify your API_URL and API_KEY are correct
   - Set `EnableSync = true`
   - Set `CheckInterval = 30` (checks every 30 seconds)
   - Click `OK`

4. **Verify EA is Running**:
   - You should see a smiley face 😊 in the top-right corner of the chart
   - Check the `Experts` tab in Terminal for messages:
     ```
     Trade Journal Sync EA Started
     API URL: https://your-domain.com/api/mt5-sync
     Sync Enabled: true
     ```

---

## 🧪 Testing

### Test with a Demo Trade

1. **Place a small demo trade** in MT5
2. **Close the trade**
3. **Wait 30 seconds** (or whatever CheckInterval you set)
4. **Check the Experts tab** in MT5 Terminal:
   - Should see: `✅ Trade #12345 synced successfully - EURUSD LONG P&L: $50.00`
5. **Refresh your journal dashboard**
   - The trade should appear automatically!
   - Tagged with "MT5 Import" and "Auto-Sync"

---

## 🔧 Troubleshooting

### EA Not Syncing Trades

**Check 1: WebRequest Enabled?**
- Go to `Tools` → `Options` → `Expert Advisors`
- Verify your domain is in the WebRequest list

**Check 2: EA Running?**
- Look for smiley face 😊 on chart
- If sad face ☹️, check Experts tab for errors

**Check 3: API Key Correct?**
- Double-check API_KEY in EA matches MT5_API_SECRET_KEY in .env

**Check 4: Check Experts Tab**
- Look for error messages
- Common errors:
  - `API Error: HTTP 401` → Wrong API key
  - `API Error: HTTP 404` → Wrong API URL
  - `API Error: HTTP 500` → Server error (check API logs)

### Trades Syncing Multiple Times

- The EA tracks synced trades in a file
- If you restart MT5, it remembers what's already synced
- File location: `MT5_DATA_FOLDER/MQL5/Files/TradeJournalSync.dat`

### Want to Re-sync Old Trades

1. Close MT5
2. Delete `TradeJournalSync.dat` file
3. Restart MT5
4. EA will sync last 100 closed trades

---

## 🎨 Dashboard Features (Coming Next)

I'll add these UI features to your dashboard:

- 🟢 MT5 Connection Status indicator
- 📊 Last sync time
- 🔄 Manual sync button
- 📈 Auto-imported trades counter
- ⚙️ MT5 settings panel

---

## 🔒 Security Notes

- **Keep your API_KEY secret!** Don't share it or commit it to Git
- The API key authenticates MT5 → Your Server
- Only your MT5 terminal should know this key
- Change it periodically for security

---

## 💡 Tips

1. **Leave EA running 24/7** for automatic sync
2. **Attach to any chart** - doesn't matter which symbol
3. **One EA per MT5 terminal** - don't attach multiple times
4. **Works with all brokers** - as long as they support MT5
5. **Syncs closed trades only** - open positions are not synced

---

## 📞 Support

If you encounter issues:

1. Check the `Experts` tab in MT5 for error messages
2. Check your API logs (Vercel/Netlify dashboard)
3. Verify all URLs and keys are correct
4. Test the API endpoint with curl first

---

## 🚀 Next Steps

Once MT5 sync is working:

1. You can still manually log trades (for other brokers/accounts)
2. MT5 trades will have "MT5 Import" tag
3. You can edit MT5-imported trades to add notes, emotions, analysis
4. All your trading psychology features still work!

Happy Trading! 📈
