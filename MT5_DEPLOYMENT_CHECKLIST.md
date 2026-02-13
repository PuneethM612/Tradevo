# MT5 Integration - Deployment Checklist

Use this checklist to ensure everything is set up correctly.

## ☑️ Backend Setup

- [ ] Added `MT5_API_SECRET_KEY` to `.env.local` (change the default!)
- [ ] Added `DEFAULT_MT5_USER_ID` to `.env.local` (your user ID: `bd81b65e-fb09-4bde-8cb3-683148be8fbb`)
- [ ] Deployed the app (Vercel/Netlify/etc.)
- [ ] Verified API endpoint is accessible: `https://your-domain.com/api/mt5-sync`
- [ ] Tested API with curl (optional but recommended)

## ☑️ MT5 Setup

- [ ] Opened MetaEditor in MT5 (F4)
- [ ] Created new Expert Advisor named "TradeJournalSync"
- [ ] Copied code from `mt5/TradeJournalSync.mq5`
- [ ] Updated `API_URL` with your actual domain
- [ ] Updated `API_KEY` with your actual secret key (must match `.env.local`)
- [ ] Compiled EA successfully (0 errors)
- [ ] Enabled WebRequest in MT5 Options → Expert Advisors
- [ ] Added your domain to WebRequest whitelist
- [ ] Attached EA to a chart
- [ ] Verified EA is running (smiley face 😊 on chart)
- [ ] Checked Experts tab for "Trade Journal Sync EA Started" message

## ☑️ Testing

- [ ] Placed a demo trade in MT5
- [ ] Closed the trade
- [ ] Waited 30 seconds
- [ ] Checked Experts tab for sync success message
- [ ] Refreshed journal dashboard
- [ ] Verified trade appeared with "MT5 Import" tag
- [ ] Verified P&L matches MT5 exactly

## ☑️ Production

- [ ] Changed `MT5_API_SECRET_KEY` to a strong random key
- [ ] Tested with real account (small trade first!)
- [ ] Verified all trades sync correctly
- [ ] Documented your API URL and key securely
- [ ] Set up monitoring/alerts (optional)

## 🎯 Success Criteria

When everything is working:

1. ✅ EA shows smiley face on chart
2. ✅ Experts tab shows "Trade Journal Sync EA Started"
3. ✅ Closed trades appear in journal within 30 seconds
4. ✅ P&L matches MT5 exactly (includes commission/swap)
5. ✅ Trades tagged with "MT5 Import" and "Auto-Sync"
6. ✅ No duplicate trades
7. ✅ Dashboard shows MT5 trade count

## 🔧 Common Issues

### Issue: EA not syncing trades

**Solution:**
1. Check WebRequest is enabled
2. Verify domain is in whitelist
3. Check API_URL and API_KEY are correct
4. Look for errors in Experts tab

### Issue: HTTP 401 error

**Solution:**
- API key mismatch
- Check `API_KEY` in EA matches `MT5_API_SECRET_KEY` in `.env.local`

### Issue: HTTP 404 error

**Solution:**
- Wrong API URL
- Verify your domain and endpoint path
- Should be: `https://your-domain.com/api/mt5-sync`

### Issue: Trades syncing multiple times

**Solution:**
- This shouldn't happen (EA tracks synced trades)
- If it does, delete `TradeJournalSync.dat` and restart MT5

## 📞 Need Help?

1. Check `MT5_INTEGRATION_GUIDE.md` for detailed instructions
2. Review Experts tab in MT5 for error messages
3. Check API logs in your hosting dashboard
4. Verify all URLs and keys are correct

## 🚀 You're All Set!

Once all checkboxes are ticked, your MT5 integration is live!

Your trades will automatically sync from MT5 to your journal with:
- ✅ Exact broker P&L
- ✅ Real-time updates
- ✅ No manual entry needed
- ✅ Full trade history

Happy automated trading! 📈
