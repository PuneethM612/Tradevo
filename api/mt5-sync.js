// MT5 Trade Sync API Endpoint
// Receives trade data from MT5 EA and saves to Supabase

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      console.log('❌ No API key provided');
      return res.status(401).json({ error: 'Unauthorized - API key required' });
    }

    // Extract user ID from API key (format: mt5_USERID_timestamp_random)
    const keyParts = apiKey.split('_');
    if (keyParts.length < 2 || keyParts[0] !== 'mt5') {
      console.log('❌ Invalid API key format');
      return res.status(401).json({ error: 'Unauthorized - Invalid API key format' });
    }

    const userId = keyParts[1];
    console.log(`📥 Received trade from MT5 for user: ${userId}`);

    // Get trade data from request body
    const {
      ticket,
      symbol,
      assetClass,
      type,
      lots,
      entry,
      exit,
      sl,
      tp,
      profit,
      pips,
      entryTime,
      exitTime
    } = req.body;

    // Validate required fields
    if (!ticket || !symbol || !type || !entry || !exit || !profit) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['ticket', 'symbol', 'type', 'entry', 'exit', 'profit']
      });
    }

    console.log(`📊 Trade: ${symbol} ${type} - Ticket: ${ticket} - P&L: $${profit}`);

    // Calculate R:R ratio
    const entryPrice = parseFloat(entry);
    const slPrice = parseFloat(sl) || entryPrice;
    const tpPrice = parseFloat(tp) || parseFloat(exit);
    
    const risk = Math.abs(entryPrice - slPrice);
    const reward = Math.abs(tpPrice - entryPrice);
    const rr = risk === 0 ? '0.00' : (reward / risk).toFixed(2);

    // Determine session based on exit time
    const exitDate = new Date(exitTime);
    const hour = exitDate.getUTCHours();
    let session = 'LONDON';
    if (hour >= 0 && hour < 7) session = 'ASIA';
    else if (hour >= 13 && hour < 22) session = 'NY';
    else if (hour >= 13 && hour < 17) session = 'OVERLAP';

    // Create trade object for database
    const tradeId = `MT5-${ticket}`;
    const tradeData = {
      id: tradeId,
      user_id: userId,
      timestamp: new Date(entryTime).toISOString(),
      displaydate: new Date(entryTime).toLocaleString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }).toUpperCase(),
      symbol: symbol,
      assetclass: assetClass || 'FOREX',
      type: type,
      lots: lots,
      entry: entry,
      sl: sl || '0',
      tp: tp || exit,
      rr: rr,
      pips: pips || '0',
      profit: profit,
      rating: 'N/A',
      analysis: 'Auto-imported from MT5',
      screenshot: null,
      emotions: [],
      premarketanalysis: '',
      postmarketanalysis: '',
      session: session,
      prechecklist: false,
      tags: ['MT5 Import', 'Auto-Sync'],
      mistakes: [],
      lessonslearned: '',
      woulddodifferently: '',
      entrytime: new Date(entryTime).toISOString(),
      exittime: exitTime,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('trades')
      .upsert(tradeData, { onConflict: 'id' });

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ 
        error: 'Database error', 
        details: error.message 
      });
    }

    console.log(`✅ Trade ${ticket} saved successfully for user ${userId}`);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Trade synced successfully',
      tradeId: tradeId,
      symbol: symbol,
      profit: profit
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
