# MT5 Integration - User Guide

## 🎯 How It Works

Your trading journal now has **one-click MT5 integration**! Here's the simple flow:

1. **Click "Connect MT5 Broker"** in the Tools tab
2. **Get your unique API credentials** (generated instantly)
3. **Copy credentials into MT5 EA** (Expert Advisor)
4. **Done!** Trades auto-sync when closed

---

## 📱 Step-by-Step Setup

### Step 1: Connect in Dashboard (30 seconds)

1. Open your journal dashboard
2. Go to **Tools** tab
3. Find the **MT5 Integration** card
4. Click **"Connect MT5 Broker"** button
5. A modal will appear with your unique credentials

### Step 2: Copy Your Credentials

The modal shows:
- **API URL**: Your unique endpoint (e.g., `https://your-domain.com/api/mt5-sync`)
- **API Key**: Your secret key (e.g., `mt5_bd81b65e_1234567890_abc123`)

Click the **Copy** button next to each field.

### Step 3: Install MT5 Expert Advisor (5 minutes)

1. **Download the EA**:
   - Click "Download EA File" in the modal
   - Or get it from the `mt5/TradeJournalSync.mq5` file

2. **Open MT5 MetaEditor**:
   - In MT5, press `F4` (or Tools → MetaQuotes Language Editor)

3. **Create New EA**:
   - File → New → Expert Advisor
   - Name: `TradeJournalSync`
   - Click Finish

4. **Paste the Code**:
   - Copy ALL the code from the downloaded file
   - Paste into MetaEditor

5. **Update Credentials** (lines 10-11):
   ```mql5
   input string API_URL = "PASTE_YOUR_API_URL_HERE";
   input string API_KEY = "PASTE_YOUR_API_KEY_HERE";
   ```

6. **Compile**:
   - Press `F7` or click Compile button
   - Should see: "0 error(s), 0 warning(s)"

### Step 4: Enable WebRequest (IMPORTANT!)

1. In MT5: **Tools → Options → Expert Advisors**
2. Check ✅ **"Allow WebRequest for listed URL:"**
3. Add your domain (e.g., `https://your-domain.com`)
4. Click **OK**

**Without this step, the EA cannot send data!**

### Step 5: Attach EA to Chart

1. Open any chart in MT5 (any symbol, any timeframe)
2. Open **Navigator** panel (Ctrl+N)
3. Expand **Expert Advisors**
4. **Drag** `TradeJournalSync` onto the chart
5. Click **OK** in the settings dialog

### Step 6: Verify It's Running

Look for:
- **Smiley face 😊** in top-right corner of chart
- **"Trade Journal Sync EA Started"** message in Experts tab

---

## 🧪 Test It!

1. **Place a small demo trade** in MT5
2. **Close the trade**
3. **Wait 30 seconds**
4. **Check Experts tab** for: `✅ Trade #12345 synced successfully`
5. **Refresh your journal** - trade should appear!

---

## ✨ What Happens Now?

### Automatic Sync
- EA checks for closed trades every 30 seconds
- When a trade closes, it's sent to your journal automatically
- Trade appears with "MT5 Import" and "Auto-Sync" tags

### Exact Broker Data
- P&L includes spread, commission, and swap
- Entry/exit prices are exact
- Timestamps are accurate
- No manual calculation errors

### You Can Still
- Manually log trades from other brokers
- Edit MT5-imported trades to add notes
- Add emotions, analysis, and lessons learned
- Use all psychology tracking features

---

## 📊 Dashboard Features

### MT5 Integration Card (Tools Tab)

**When Not Connected:**
- Shows "Not Connected" status
- "Connect MT5 Broker" button
- Benefits list

**When Connected:**
- Shows "Connected" status with green indicator
- MT5 trade count
- Last sync time
- "View Connection Details" button (to see credentials again)
- "Disconnect MT5" button

---

## 🔒 Security

### Your API Key
- **Unique to you**: Each user gets their own API key
- **Stored locally**: Saved in your browser's localStorage
- **User-specific**: Key contains your user ID for authentication
- **Revocable**: Disconnect and reconnect to get a new key

### What's Sent
- Trade data only (symbol, type, lots, entry, exit, P&L)
- No personal information
- No account balance
- No broker credentials

### Best Practices
- Don't share your API key
- If compromised, disconnect and reconnect for a new key
- Keep your journal domain secure (HTTPS)

---

## 🔧 Troubleshooting

### EA Not Syncing

**Check 1: Is EA Running?**
- Look for smiley face 😊 on chart
- If sad face ☹️, check Experts tab for errors

**Check 2: WebRequest Enabled?**
- Tools → Options → Expert Advisors
- Verify your domain is in the list

**Check 3: Credentials Correct?**
- Open MetaEditor
- Verify API_URL and API_KEY match your dashboard

**Check 4: Check Experts Tab**
- Look for error messages
- Common errors:
  - `HTTP 401` → Wrong API key
  - `HTTP 404` → Wrong API URL
  - `WebRequest error` → WebRequest not enabled

### Trades Not Appearing

1. **Check Experts tab** for sync success message
2. **Refresh your dashboard**
3. **Check Tools tab** for MT5 trade count
4. **Verify connection status** is "Connected"

### Want to Reconnect

1. Click **"Disconnect MT5"** in Tools tab
2. Click **"Connect MT5 Broker"** again
3. You'll get new credentials
4. Update EA with new credentials
5. Recompile and restart EA

---

## 💡 Tips

1. **Leave EA running 24/7** for continuous sync
2. **Attach to any chart** - symbol doesn't matter
3. **One EA per MT5 terminal** - don't attach multiple times
4. **Works with all brokers** - Vantage, IC Markets, etc.
5. **Demo and live accounts** - works with both

---

## 🎉 Benefits

### Time Savings
- No manual trade entry
- No copying data from MT5
- No calculation errors
- More time for analysis

### Accuracy
- Exact broker P&L
- Includes all fees
- Precise timestamps
- No human error

### Psychology Focus
- Trades logged automatically
- You focus on emotions and analysis
- Add notes after the fact
- Review patterns easily

---

## 📞 Need Help?

1. **Check Experts tab** in MT5 for error messages
2. **View connection details** in dashboard
3. **Verify all steps** were completed
4. **Try disconnecting and reconnecting**

---

## 🚀 You're All Set!

Once connected, your MT5 trades will automatically appear in your journal with:
- ✅ Exact broker P&L
- ✅ Real-time sync
- ✅ No manual entry
- ✅ Full trade history

**Focus on your trading psychology and let MT5 handle the logging!** 📈
