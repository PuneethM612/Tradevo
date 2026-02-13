//+------------------------------------------------------------------+
//|                                           TradeJournalSync.mq5   |
//|                                  Trade Journal MT5 Integration   |
//|                                   Syncs closed trades to journal |
//+------------------------------------------------------------------+
#property copyright "Trade Journal"
#property link      ""
#property version   "1.00"
#property strict

// Input parameters
input string API_URL = "https://your-domain.com/api/mt5-sync";  // Your API endpoint
input string API_KEY = "your-secret-key-here";                   // Secret key for authentication
input bool   EnableSync = true;                                  // Enable/disable sync
input int    CheckInterval = 30;                                 // Check for new trades every X seconds

// Global variables
datetime lastCheck = 0;
string syncedTrades[];
int syncedTradesCount = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("Trade Journal Sync EA Started");
   Print("API URL: ", API_URL);
   Print("Sync Enabled: ", EnableSync);
   
   // Load previously synced trades from file
   LoadSyncedTrades();
   
   EventSetTimer(CheckInterval);
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("Trade Journal Sync EA Stopped");
}

//+------------------------------------------------------------------+
//| Timer function - checks for new closed trades                    |
//+------------------------------------------------------------------+
void OnTimer()
{
   if(!EnableSync) return;
   
   CheckAndSyncClosedTrades();
}

//+------------------------------------------------------------------+
//| Check for closed trades and sync them                            |
//+------------------------------------------------------------------+
void CheckAndSyncClosedTrades()
{
   int total = HistoryDealsTotal();
   
   // Check last 100 deals for new closed trades
   int checkCount = MathMin(100, total);
   
   for(int i = total - 1; i >= total - checkCount && i >= 0; i--)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket <= 0) continue;
      
      // Only process closed positions (OUT deals)
      if(HistoryDealGetInteger(ticket, DEAL_ENTRY) != DEAL_ENTRY_OUT) continue;
      
      // Check if already synced
      string ticketStr = IntegerToString(ticket);
      if(IsTradeAlreadySynced(ticketStr)) continue;
      
      // Get deal details
      string symbol = HistoryDealGetString(ticket, DEAL_SYMBOL);
      long dealType = HistoryDealGetInteger(ticket, DEAL_TYPE);
      double volume = HistoryDealGetDouble(ticket, DEAL_VOLUME);
      double price = HistoryDealGetDouble(ticket, DEAL_PRICE);
      double profit = HistoryDealGetDouble(ticket, DEAL_PROFIT);
      double commission = HistoryDealGetDouble(ticket, DEAL_COMMISSION);
      double swap = HistoryDealGetDouble(ticket, DEAL_SWAP);
      datetime dealTime = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
      long positionId = HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
      
      // Get position details (entry, SL, TP)
      if(!HistorySelectByPosition(positionId)) continue;
      
      double entryPrice = 0;
      double sl = 0;
      double tp = 0;
      datetime entryTime = 0;
      
      // Find the entry deal
      int dealsInPosition = HistoryDealsTotal();
      for(int j = 0; j < dealsInPosition; j++)
      {
         ulong dealTicket = HistoryDealGetTicket(j);
         if(HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID) == positionId &&
            HistoryDealGetInteger(dealTicket, DEAL_ENTRY) == DEAL_ENTRY_IN)
         {
            entryPrice = HistoryDealGetDouble(dealTicket, DEAL_PRICE);
            entryTime = (datetime)HistoryDealGetInteger(dealTicket, DEAL_TIME);
            // Note: SL/TP not directly available in history, would need to track from orders
            break;
         }
      }
      
      if(entryPrice == 0) continue;
      
      // Calculate total P&L including commission and swap
      double totalProfit = profit + commission + swap;
      
      // Determine trade type
      string tradeType = (dealType == DEAL_TYPE_BUY) ? "LONG" : "SHORT";
      
      // Determine asset class
      string assetClass = GetAssetClass(symbol);
      
      // Calculate pips
      double pips = CalculatePips(symbol, entryPrice, price, tradeType);
      
      // Send to API
      if(SyncTradeToAPI(ticketStr, symbol, assetClass, tradeType, volume, 
                        entryPrice, price, sl, tp, totalProfit, pips, 
                        entryTime, dealTime))
      {
         // Mark as synced
         AddToSyncedTrades(ticketStr);
         Print("✅ Trade #", ticket, " synced successfully - ", symbol, " ", tradeType, " P&L: $", DoubleToString(totalProfit, 2));
      }
      else
      {
         Print("❌ Failed to sync trade #", ticket);
      }
   }
}

//+------------------------------------------------------------------+
//| Send trade data to API                                           |
//+------------------------------------------------------------------+
bool SyncTradeToAPI(string ticket, string symbol, string assetClass, string tradeType,
                    double lots, double entry, double exit, double sl, double tp,
                    double profit, double pips, datetime entryTime, datetime exitTime)
{
   string url = API_URL;
   string headers = "Content-Type: application/json\r\n";
   headers += "X-API-Key: " + API_KEY + "\r\n";
   
   // Build JSON payload
   string json = "{";
   json += "\"ticket\":\"" + ticket + "\",";
   json += "\"symbol\":\"" + symbol + "\",";
   json += "\"assetClass\":\"" + assetClass + "\",";
   json += "\"type\":\"" + tradeType + "\",";
   json += "\"lots\":\"" + DoubleToString(lots, 2) + "\",";
   json += "\"entry\":\"" + DoubleToString(entry, 5) + "\",";
   json += "\"exit\":\"" + DoubleToString(exit, 5) + "\",";
   json += "\"sl\":\"" + DoubleToString(sl, 5) + "\",";
   json += "\"tp\":\"" + DoubleToString(tp, 5) + "\",";
   json += "\"profit\":\"" + DoubleToString(profit, 2) + "\",";
   json += "\"pips\":\"" + DoubleToString(pips, 1) + "\",";
   json += "\"entryTime\":\"" + TimeToString(entryTime, TIME_DATE|TIME_SECONDS) + "\",";
   json += "\"exitTime\":\"" + TimeToString(exitTime, TIME_DATE|TIME_SECONDS) + "\"";
   json += "}";
   
   char post[];
   char result[];
   string result_headers;
   
   ArrayResize(post, StringToCharArray(json, post, 0, WHOLE_ARRAY) - 1);
   
   int timeout = 5000; // 5 seconds
   int res = WebRequest("POST", url, headers, timeout, post, result, result_headers);
   
   if(res == 200)
   {
      return true;
   }
   else
   {
      Print("API Error: HTTP ", res);
      Print("Response: ", CharArrayToString(result));
      return false;
   }
}

//+------------------------------------------------------------------+
//| Determine asset class from symbol                                |
//+------------------------------------------------------------------+
string GetAssetClass(string symbol)
{
   // Forex pairs
   if(StringFind(symbol, "USD") >= 0 || StringFind(symbol, "EUR") >= 0 || 
      StringFind(symbol, "GBP") >= 0 || StringFind(symbol, "JPY") >= 0 ||
      StringFind(symbol, "AUD") >= 0 || StringFind(symbol, "CAD") >= 0 ||
      StringFind(symbol, "CHF") >= 0 || StringFind(symbol, "NZD") >= 0)
      return "FOREX";
   
   // Crypto
   if(StringFind(symbol, "BTC") >= 0 || StringFind(symbol, "ETH") >= 0 || 
      StringFind(symbol, "USDT") >= 0)
      return "CRYPTO";
   
   // Commodities
   if(StringFind(symbol, "XAU") >= 0 || StringFind(symbol, "XAG") >= 0 || 
      StringFind(symbol, "OIL") >= 0 || StringFind(symbol, "GOLD") >= 0)
      return "COMMODITIES";
   
   // Indices
   if(StringFind(symbol, "NAS") >= 0 || StringFind(symbol, "SPX") >= 0 || 
      StringFind(symbol, "US30") >= 0 || StringFind(symbol, "GER") >= 0)
      return "FUTURES";
   
   return "FOREX"; // Default
}

//+------------------------------------------------------------------+
//| Calculate pips for the trade                                     |
//+------------------------------------------------------------------+
double CalculatePips(string symbol, double entry, double exit, string type)
{
   double diff = (type == "LONG") ? (exit - entry) : (entry - exit);
   
   // JPY pairs use 2 decimal places
   if(StringFind(symbol, "JPY") >= 0)
      return diff * 100;
   
   // Most forex pairs use 4-5 decimal places
   return diff * 10000;
}

//+------------------------------------------------------------------+
//| Check if trade already synced                                    |
//+------------------------------------------------------------------+
bool IsTradeAlreadySynced(string ticket)
{
   for(int i = 0; i < syncedTradesCount; i++)
   {
      if(syncedTrades[i] == ticket)
         return true;
   }
   return false;
}

//+------------------------------------------------------------------+
//| Add trade to synced list                                         |
//+------------------------------------------------------------------+
void AddToSyncedTrades(string ticket)
{
   ArrayResize(syncedTrades, syncedTradesCount + 1);
   syncedTrades[syncedTradesCount] = ticket;
   syncedTradesCount++;
   
   // Save to file
   SaveSyncedTrades();
}

//+------------------------------------------------------------------+
//| Save synced trades to file                                       |
//+------------------------------------------------------------------+
void SaveSyncedTrades()
{
   int handle = FileOpen("TradeJournalSync.dat", FILE_WRITE|FILE_BIN);
   if(handle != INVALID_HANDLE)
   {
      FileWriteInteger(handle, syncedTradesCount);
      for(int i = 0; i < syncedTradesCount; i++)
      {
         FileWriteString(handle, syncedTrades[i]);
      }
      FileClose(handle);
   }
}

//+------------------------------------------------------------------+
//| Load synced trades from file                                     |
//+------------------------------------------------------------------+
void LoadSyncedTrades()
{
   int handle = FileOpen("TradeJournalSync.dat", FILE_READ|FILE_BIN);
   if(handle != INVALID_HANDLE)
   {
      syncedTradesCount = FileReadInteger(handle);
      ArrayResize(syncedTrades, syncedTradesCount);
      
      for(int i = 0; i < syncedTradesCount; i++)
      {
         syncedTrades[i] = FileReadString(handle);
      }
      FileClose(handle);
      Print("Loaded ", syncedTradesCount, " previously synced trades");
   }
}
//+------------------------------------------------------------------+
