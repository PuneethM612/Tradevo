# MT5 Expert Advisor

This folder contains the MT5 Expert Advisor (EA) for automatic trade synchronization.

## File

- `TradeJournalSync.mq5` - The Expert Advisor source code

## Installation

1. Open MT5 MetaEditor (F4 in MT5)
2. Create a new Expert Advisor
3. Copy the code from `TradeJournalSync.mq5`
4. Update the `API_URL` and `API_KEY` parameters
5. Compile (F7)
6. Attach to any chart in MT5

## Configuration

Before using, you MUST update these parameters in the EA:

```mql5
input string API_URL = "https://your-domain.com/api/mt5-sync";  // Your deployed API URL
input string API_KEY = "your-secret-key-here";                   // Match MT5_API_SECRET_KEY in .env
```

## Important: Enable WebRequest

In MT5:
1. Go to `Tools` → `Options` → `Expert Advisors`
2. Check "Allow WebRequest for listed URL:"
3. Add your domain (e.g., `https://your-domain.com`)
4. Click OK

Without this, the EA cannot send data to your API!

## How It Works

1. EA runs in background on any chart
2. Every 30 seconds (configurable), checks for new closed trades
3. Sends trade data to your API via HTTP POST
4. API saves to Supabase database
5. Trade appears in your journal automatically

## Features

- ✅ Auto-detects closed trades
- ✅ Prevents duplicate syncing
- ✅ Includes exact broker P&L (profit + commission + swap)
- ✅ Calculates pips automatically
- ✅ Determines asset class from symbol
- ✅ Persists sync history across MT5 restarts

## Troubleshooting

Check the `Experts` tab in MT5 Terminal for messages:

- ✅ Success: `✅ Trade #12345 synced successfully`
- ❌ Error: `❌ Failed to sync trade #12345`
- 🔒 Auth Error: `API Error: HTTP 401` (wrong API key)
- 🌐 URL Error: `API Error: HTTP 404` (wrong API URL)

## Support

See `MT5_INTEGRATION_GUIDE.md` in the root folder for complete setup instructions.
