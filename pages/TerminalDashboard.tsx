// ...existing code...

"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BookText, 
  Plus,
  Target,
  X,
  FileText,
  Search,
  Pencil,
  Trash2,
  Lock,
  Brain,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Save,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Image as ImageIcon,
  Upload,
  BarChart as BarChartIcon,
  Activity,
  TrendingDown,
  LogOut,
  Calendar as CalendarIcon,
  Star,
  Flame,
  Trophy,
  Zap,
  Download,
  Filter,
  Clock,
  DollarSign,
  Percent,
  PieChart as PieChartIcon,
  Tag,
  Tags
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { supabase, isConfigured } from '../lib/supabase';
// ...existing code...
import CustomChartBuilder from '../components/CustomChartBuilder';
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  PieChart,
  Pie,
  Legend,
  CartesianGrid
} from 'recharts';

interface TerminalDashboardProps {
  onLogout: () => void;
}

type AssetClass = 'FOREX' | 'CRYPTO' | 'FUTURES' | 'COMMODITIES';
type TradeRating = 'A+' | 'A' | 'B' | 'C' | 'N/A';

interface TradeLog {
  id: string;
  timestamp: string;
  displayDate: string;
  symbol: string;
  assetClass: AssetClass;
  type: 'LONG' | 'SHORT';
  lots: string;
  entry: string;
  sl: string;
  tp: string;
  rr: string;
  pips: string;
  profit: string;
  rating: TradeRating;
  analysis: string;
  screenshot: string | null;
  emotions: string[];
  preMarketAnalysis: string;
  postMarketAnalysis: string;
  session: 'LONDON' | 'NY' | 'ASIA' | 'OVERLAP';
  preChecklist: boolean;
  tags: string[];
  mistakes: string[];
  lessonsLearned: string;
  wouldDoDifferently: string;
  entryTime: string;
  exitTime: string;
}

// Mistake categories for trade analysis
const MISTAKE_CATEGORIES = [
  'Early Entry', 'Late Entry', 'Moved SL', 'Exited Early', 'Held Too Long',
  'Overtrading', 'Revenge Trade', 'No Confirmation', 'Wrong Session', 
  'Ignored Plan', 'Position Too Large', 'FOMO Entry', 'Chased Price'
];

const STORAGE_KEY = 'tradevo_terminal_data_v9';
const SETTINGS_KEY = 'tradevo_terminal_settings_v9';

const ASSET_PAIRS: Record<AssetClass, string[]> = {
  FOREX: [
    // Major Pairs
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    // Minor Pairs (Crosses)
    'EURGBP', 'EURJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'EURNZD',
    'GBPJPY', 'GBPCHF', 'GBPAUD', 'GBPCAD', 'GBPNZD',
    'AUDJPY', 'AUDCHF', 'AUDCAD', 'AUDNZD',
    'NZDJPY', 'NZDCHF', 'NZDCAD',
    'CADJPY', 'CADCHF',
    'CHFJPY',
    // Exotic Pairs
    'USDZAR', 'USDMXN', 'USDTRY', 'USDSEK', 'USDNOK', 'USDDKK', 'USDSGD', 'USDHKD', 'USDPLN', 'USDHUF',
    'EURPLN', 'EURTRY', 'EURSEK', 'EURNOK', 'EURHUF', 'EURCZK',
    'GBPZAR', 'GBPSGD', 'GBPTRY'
  ],
  CRYPTO: [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT', 'DOGEUSDT',
    'MATICUSDT', 'LTCUSDT', 'AVAXUSDT', 'LINKUSDT', 'UNIUSDT', 'ATOMUSDT', 'XLMUSDT',
    'BTCETH', 'ETHBTC', 'ARBUSDT', 'OPUSDT', 'APTUSDT', 'SUIUSDT', 'PEPEUSDT', 'SHIBUSDT'
  ],
  FUTURES: [
    // US Indices
    'NAS100', 'US30', 'SPX500', 'US2000',
    // European Indices
    'GER40', 'UK100', 'FRA40', 'EU50',
    // Asian Indices
    'JPN225', 'HK50', 'AUS200', 'CHINA50',
    // Other Futures
    'VIX', 'DXY'
  ],
  COMMODITIES: [
    // Precious Metals
    'XAUUSD', 'XAGUSD', 'XPTUSD', 'XPDUSD',
    // Energy
    'USOIL', 'UKOIL', 'NGAS',
    // Agricultural
    'WHEAT', 'CORN', 'SOYBEAN', 'COFFEE', 'SUGAR', 'COTTON', 'COCOA'
  ]
};

const RADAR_MOCK_DATA = [
  { subject: 'Discipline', A: 120, fullMark: 150 },
  { subject: 'Patience', A: 98, fullMark: 150 },
  { subject: 'Risk Mgmt', A: 140, fullMark: 150 },
  { subject: 'Timing', A: 70, fullMark: 150 },
  { subject: 'Focus', A: 110, fullMark: 150 },
  { subject: 'Consistency', A: 130, fullMark: 150 },
];

// Default trading tags - users can add their own
const DEFAULT_TAGS = [
  'SDTV 4.5', '15 mins A+', 'Breakout', 'Reversal', 'Scalp', 'Swing', 
  'News Event', 'Supply Zone', 'Demand Zone', 'FVG', 'Order Block', 
  'Liquidity Grab', 'BOS', 'CHoCH', 'MSS', 'Premium', 'Discount',
  'HTF Confluence', 'LTF Entry', 'Asian Kill', 'London Kill', 'NY Kill'
];

const TAGS_STORAGE_KEY = 'tradevo_custom_tags';

// Economic News Events Interface
interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  currency: string;
  impact: 'high' | 'medium' | 'low';
  date: string;
  time: string;
  forecast?: string;
  previous?: string;
}

// Market Hours Component
const MarketHours: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const getMarketStatus = () => {
    const utcHours = currentTime.getUTCHours();
    const utcMinutes = currentTime.getUTCMinutes();
    const totalMinutes = utcHours * 60 + utcMinutes;
    
    // Market sessions in UTC
    const sessions = [
      { name: 'Sydney', start: 22 * 60, end: 7 * 60, color: '#3b82f6', emoji: '🇦🇺' },
      { name: 'Tokyo', start: 0 * 60, end: 9 * 60, color: '#ef4444', emoji: '🇯🇵' },
      { name: 'London', start: 8 * 60, end: 17 * 60, color: '#10b981', emoji: '🇬🇧' },
      { name: 'New York', start: 13 * 60, end: 22 * 60, color: '#f59e0b', emoji: '🇺🇸' }
    ];
    
    const activeSessions = sessions.filter(session => {
      if (session.start > session.end) {
        // Session crosses midnight
        return totalMinutes >= session.start || totalMinutes < session.end;
      }
      return totalMinutes >= session.start && totalMinutes < session.end;
    });
    
    // Check for overlaps
    const londonActive = activeSessions.some(s => s.name === 'London');
    const nyActive = activeSessions.some(s => s.name === 'New York');
    const tokyoActive = activeSessions.some(s => s.name === 'Tokyo');
    const sydneyActive = activeSessions.some(s => s.name === 'Sydney');
    
    let overlap = null;
    if (londonActive && nyActive) overlap = { name: 'London/NY Overlap', color: '#00ff9c', high: true };
    else if (londonActive && tokyoActive) overlap = { name: 'Tokyo/London Overlap', color: '#8b5cf6', high: false };
    else if (sydneyActive && tokyoActive) overlap = { name: 'Sydney/Tokyo Overlap', color: '#06b6d4', high: false };
    
    return { activeSessions, overlap };
  };
  
  const { activeSessions, overlap } = getMarketStatus();
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };
  
  const getTimeInTimezone = (offset: number) => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const newTime = new Date(utc + (3600000 * offset));
    return formatTime(newTime);
  };
  
  return (
    <div className={cn("border p-8 rounded-[2rem] space-y-6 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/10" : "bg-white border-slate-200 shadow-xl")}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">Market Hours</h3>
          <p className={cn("text-[10px] uppercase tracking-wider", theme === 'dark' ? "text-white/40" : "text-slate-400")}>
            Live Session Tracker
          </p>
        </div>
      </div>
      
      {/* Current UTC Time */}
      <div className={cn("border rounded-xl p-4", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
        <div className="text-[9px] font-black uppercase tracking-wider opacity-40 mb-1">UTC Time</div>
        <div className="text-3xl font-black font-mono text-[#00ff9c]">{formatTime(currentTime)}</div>
      </div>
      
      {/* Active Sessions */}
      <div className="space-y-3">
        <div className="text-[9px] font-black uppercase tracking-wider opacity-40">Active Sessions</div>
        
        {activeSessions.length === 0 ? (
          <div className={cn("text-center py-6 rounded-xl border", theme === 'dark' ? "border-white/10 text-white/30" : "border-slate-200 text-slate-400")}>
            <span className="text-sm font-bold">Markets Closed</span>
          </div>
        ) : (
          <div className="space-y-2">
            {activeSessions.map(session => (
              <div 
                key={session.name}
                className={cn("border rounded-xl p-4 flex items-center justify-between transition-all", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                style={{ borderLeftWidth: '4px', borderLeftColor: session.color }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{session.emoji}</span>
                  <div>
                    <div className="font-black text-sm">{session.name}</div>
                    <div className={cn("text-[9px] uppercase tracking-wider", theme === 'dark' ? "text-white/40" : "text-slate-400")}>
                      {Math.floor(session.start / 60)}:00 - {Math.floor(session.end / 60)}:00 UTC
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-green-500">Live</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Overlap Alert */}
      {overlap && (
        <div className={cn("border-2 rounded-xl p-4", overlap.high ? "bg-[#00ff9c]/10 border-[#00ff9c]/50" : "bg-purple-500/10 border-purple-500/50")}>
          <div className="flex items-center gap-3">
            <Zap className={cn("w-5 h-5", overlap.high ? "text-[#00ff9c]" : "text-purple-400")} />
            <div>
              <div className={cn("font-black text-sm", overlap.high ? "text-[#00ff9c]" : "text-purple-400")}>
                {overlap.name}
              </div>
              <div className="text-[9px] uppercase tracking-wider opacity-60">
                {overlap.high ? '🔥 High Volatility Expected' : 'Moderate Activity'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* World Clocks */}
      <div className="grid grid-cols-2 gap-3">
        <div className={cn("border rounded-xl p-3", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
          <div className="text-[8px] font-black uppercase tracking-wider opacity-40 mb-1">London</div>
          <div className="text-sm font-mono font-bold">{getTimeInTimezone(0)}</div>
        </div>
        <div className={cn("border rounded-xl p-3", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
          <div className="text-[8px] font-black uppercase tracking-wider opacity-40 mb-1">New York</div>
          <div className="text-sm font-mono font-bold">{getTimeInTimezone(-5)}</div>
        </div>
        <div className={cn("border rounded-xl p-3", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
          <div className="text-[8px] font-black uppercase tracking-wider opacity-40 mb-1">Tokyo</div>
          <div className="text-sm font-mono font-bold">{getTimeInTimezone(9)}</div>
        </div>
        <div className={cn("border rounded-xl p-3", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
          <div className="text-[8px] font-black uppercase tracking-wider opacity-40 mb-1">Sydney</div>
          <div className="text-sm font-mono font-bold">{getTimeInTimezone(11)}</div>
        </div>
      </div>
      
      <div className={cn("text-center text-[9px] pt-2 border-t", theme === 'dark' ? "text-white/30 border-white/10" : "text-slate-400 border-slate-200")}>
        💡 Best trading during London/NY overlap (13:00-17:00 UTC)
      </div>
    </div>
  );
};

// Position Size Calculator Component
const PositionSizeCalculator: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  const [accountBalance, setAccountBalance] = useState('10000');
  const [riskPercent, setRiskPercent] = useState('1');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  
  const pipValues: Record<string, number> = {
    'XAUUSD': 0.1, 'XAGUSD': 0.01, 'EURUSD': 0.0001, 'GBPUSD': 0.0001, 'USDJPY': 0.01,
    'BTCUSDT': 1, 'NAS100': 1, 'US30': 1, 'SPX500': 0.1
  };
  
  const calculation = useMemo(() => {
    const balance = parseFloat(accountBalance) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    
    if (!balance || !risk || !entry || !sl) return null;
    
    const riskAmount = balance * (risk / 100);
    const slDistance = Math.abs(entry - sl);
    const pipValue = pipValues[selectedPair] || 0.0001;
    const pips = slDistance / pipValue;
    
    // For forex, 1 standard lot = $10/pip (for USD pairs)
    // For gold, 1 lot = $1/pip (0.1 movement = $10)
    let lotSize: number;
    if (selectedPair === 'XAUUSD') {
      lotSize = riskAmount / (slDistance * 100); // Gold: $100 per lot per $1 move
    } else if (selectedPair === 'XAGUSD') {
      lotSize = riskAmount / (slDistance * 5000); // Silver: $5000 per lot per $1 move
    } else if (['BTCUSDT', 'NAS100', 'US30', 'SPX500'].includes(selectedPair)) {
      lotSize = riskAmount / slDistance; // 1:1 for indices/crypto
    } else {
      lotSize = riskAmount / (pips * 10); // Standard forex calculation
    }
    
    return {
      riskAmount: riskAmount.toFixed(2),
      pips: pips.toFixed(1),
      lotSize: Math.max(0.01, lotSize).toFixed(2),
      slDistance: slDistance.toFixed(selectedPair.includes('JPY') ? 3 : 5)
    };
  }, [accountBalance, riskPercent, entryPrice, stopLoss, selectedPair]);

  return (
    <div className={cn("border p-8 rounded-[2rem] space-y-6 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/10" : "bg-white border-slate-200 shadow-xl")}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00ff9c]/10 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-[#00ff9c]" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">Position Calculator</h3>
          <p className={cn("text-[10px] uppercase tracking-wider", theme === 'dark' ? "text-white/40" : "text-slate-400")}>Risk Management Tool</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={cn("text-[9px] font-black uppercase tracking-wider", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Account Balance ($)</label>
          <input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(e.target.value)}
            className={cn("w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none", theme === 'dark' ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200")}
          />
        </div>
        <div className="space-y-2">
          <label className={cn("text-[9px] font-black uppercase tracking-wider", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Risk (%)</label>
          <input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            className={cn("w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none", theme === 'dark' ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200")}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className={cn("text-[9px] font-black uppercase tracking-wider", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Trading Pair</label>
        <select
          value={selectedPair}
          onChange={(e) => setSelectedPair(e.target.value)}
          className={cn("w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none", theme === 'dark' ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200")}
        >
          <option value="XAUUSD">XAUUSD (Gold)</option>
          <option value="XAGUSD">XAGUSD (Silver)</option>
          <option value="EURUSD">EURUSD</option>
          <option value="GBPUSD">GBPUSD</option>
          <option value="USDJPY">USDJPY</option>
          <option value="BTCUSDT">BTCUSDT (Bitcoin)</option>
          <option value="NAS100">NAS100</option>
          <option value="US30">US30</option>
          <option value="SPX500">SPX500</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={cn("text-[9px] font-black uppercase tracking-wider", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Entry Price</label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            placeholder="e.g. 2850.00"
            className={cn("w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none", theme === 'dark' ? "bg-white/5 border-white/10 text-white placeholder:text-white/20" : "bg-slate-50 border-slate-200")}
          />
        </div>
        <div className="space-y-2">
          <label className={cn("text-[9px] font-black uppercase tracking-wider", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Stop Loss</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="e.g. 2840.00"
            className={cn("w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none", theme === 'dark' ? "bg-white/5 border-white/10 text-white placeholder:text-white/20" : "bg-slate-50 border-slate-200")}
          />
        </div>
      </div>
      
      {calculation && (
        <div className={cn("border rounded-2xl p-6 space-y-4", theme === 'dark' ? "bg-[#00ff9c]/5 border-[#00ff9c]/20" : "bg-green-50 border-green-200")}>
          <div className="text-[10px] font-black uppercase tracking-wider text-[#00ff9c]">Calculation Result</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={cn("text-[9px] uppercase tracking-wider mb-1", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Risk Amount</div>
              <div className="text-2xl font-black text-[#00ff9c]">${calculation.riskAmount}</div>
            </div>
            <div>
              <div className={cn("text-[9px] uppercase tracking-wider mb-1", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Lot Size</div>
              <div className="text-2xl font-black">{calculation.lotSize}</div>
            </div>
            <div>
              <div className={cn("text-[9px] uppercase tracking-wider mb-1", theme === 'dark' ? "text-white/40" : "text-slate-500")}>SL Distance</div>
              <div className="text-lg font-bold">{calculation.slDistance}</div>
            </div>
            <div>
              <div className={cn("text-[9px] uppercase tracking-wider mb-1", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Pips</div>
              <div className="text-lg font-bold">{calculation.pips}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Economic Calendar Component - Fetches from real API
const EconomicCalendar: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all');
  
  // Fetch real economic calendar data from ForexFactory API
  useEffect(() => {
    const CACHE_KEY = 'tradevo_economic_calendar_cache';
    const CACHE_EXPIRY_KEY = 'tradevo_economic_calendar_expiry';
    
    const fetchEconomicCalendar = async () => {
      // Check cache first to minimize API calls
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      const now = Date.now();
      
      // Use cache if valid (cache for 4 hours)
      if (cachedData && cacheExpiry && now < parseInt(cacheExpiry)) {
        try {
          const parsed = JSON.parse(cachedData);
          setEvents(parsed);
          setIsLoading(false);
          return;
        } catch (e) {
          // Cache corrupted, fetch fresh
        }
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Use local proxy to avoid CORS issues
        let response;
        let data;
        response = await fetch('http://localhost:3005/api/economic-calendar');
        if (!response.ok) {
          throw new Error('Failed to fetch calendar data');
        }
        data = await response.json();
        // Check if we got an error message
        if (data.error || data.Error || data['Error Message']) {
          throw new Error(data.error || data.Error || data['Error Message']);
        }
        
        // Map API response - filter only HIGH impact
        const mappedEvents: EconomicEvent[] = data
          .filter((item: any) => item.impact === 'High')
          .map((item: any, index: number) => {
            const eventDate = new Date(item.date);
            const dateStr = eventDate.toISOString().split('T')[0];
            
            // Extract time
            const timeStr = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            
            const countryToFlag: Record<string, string> = {
              'USD': 'US', 'EUR': 'EU', 'GBP': 'UK', 'JPY': 'JP',
              'AUD': 'AU', 'CAD': 'CA', 'CHF': 'CH', 'NZD': 'NZ',
              'CNY': 'CN'
            };
            
            return {
              id: String(index + 1),
              title: item.title || 'Unknown Event',
              country: countryToFlag[item.country] || 'US',
              currency: item.country || 'USD',
              impact: 'high' as const,
              date: dateStr,
              time: timeStr,
              forecast: item.forecast || '',
              previous: item.previous || ''
            };
          });
        
        const sortedEvents = mappedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Cache the results for 4 hours
        localStorage.setItem(CACHE_KEY, JSON.stringify(sortedEvents));
        localStorage.setItem(CACHE_EXPIRY_KEY, String(now + 4 * 60 * 60 * 1000));
        
        setEvents(sortedEvents);
        setError(null);
      } catch (err) {
        console.error('Error fetching economic calendar:', err);
        setError('Unable to fetch live data. Showing cached events.');
        
        // Try to use expired cache as fallback
        if (cachedData) {
          try {
            setEvents(JSON.parse(cachedData));
            setIsLoading(false);
            return;
          } catch (e) {}
        }
        
        // Last resort fallback
        const fallbackEvents: EconomicEvent[] = [
          { id: '1', title: 'Core Retail Sales m/m', country: 'US', currency: 'USD', impact: 'high', date: getNextWeekday(2), time: '13:30', forecast: '0.4%', previous: '0.5%' },
          { id: '2', title: 'CPI m/m', country: 'US', currency: 'USD', impact: 'high', date: getNextWeekday(3), time: '13:30', forecast: '0.3%', previous: '0.3%' },
          { id: '3', title: 'Unemployment Claims', country: 'US', currency: 'USD', impact: 'high', date: getNextWeekday(4), time: '13:30', forecast: '220K', previous: '225K' },
        ];
        setEvents(fallbackEvents);
      } finally {
        setIsLoading(false);
      }
    };
    
    function getNextWeekday(targetDay: number): string {
      const today = new Date();
      const currentDay = today.getDay();
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0) daysUntil += 7;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntil);
      return nextDate.toISOString().split('T')[0];
    }
    
    fetchEconomicCalendar();
    
    // Only refresh every 4 hours to save API calls (max ~6 calls/day)
    const interval = setInterval(fetchEconomicCalendar, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  
  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  const currencies = ['all', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CHF'];
  
  const filteredEvents = selectedCurrency === 'all' 
    ? events 
    : events.filter(e => e.currency === selectedCurrency);
  
  const countryFlags: Record<string, string> = {
    'US': '🇺🇸', 'EU': '🇪🇺', 'UK': '🇬🇧', 'JP': '🇯🇵', 'AU': '🇦🇺', 'CH': '🇨🇭', 'CA': '🇨🇦', 'NZ': '🇳🇿'
  };

  return (
    <div className={cn("border p-8 rounded-[2rem] space-y-6 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/10" : "bg-white border-slate-200 shadow-xl")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Economic Calendar</h3>
            <p className={cn("text-[10px] uppercase tracking-wider flex items-center gap-2", theme === 'dark' ? "text-white/40" : "text-slate-400")}>
              High Impact News 🔴
              {!isLoading && !error && <span className="text-green-500">• Live</span>}
              {error && <span className="text-yellow-500">• Cached</span>}
            </p>
          </div>
        </div>
        <a 
          href="https://www.forexfactory.com/calendar" 
          target="_blank" 
          rel="noopener noreferrer"
          className={cn("text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all", theme === 'dark' ? "bg-white/5 text-white/50 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
        >
          View Full Calendar →
        </a>
      </div>
      
      {error && (
        <div className={cn("text-[10px] px-3 py-2 rounded-lg", theme === 'dark' ? "bg-yellow-500/10 text-yellow-500" : "bg-yellow-50 text-yellow-700")}>
          ⚠️ {error}
        </div>
      )}
      
      {/* Currency Filter */}
      <div className="flex gap-2 flex-wrap">
        {currencies.map(curr => (
          <button
            key={curr}
            onClick={() => setSelectedCurrency(curr)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
              selectedCurrency === curr
                ? "bg-red-500 text-white"
                : theme === 'dark' ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {curr === 'all' ? 'All' : curr}
          </button>
        ))}
      </div>
      
      {/* Events List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="text-center py-8 text-white/40">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-white/40">No high-impact events found</div>
        ) : (
          filteredEvents.map(event => {
            const eventDate = new Date(event.date);
            const isToday = new Date().toDateString() === eventDate.toDateString();
            const isTomorrow = new Date(Date.now() + 86400000).toDateString() === eventDate.toDateString();
            
            return (
              <div
                key={event.id}
                className={cn(
                  "border rounded-xl p-4 transition-all",
                  isToday ? "border-red-500/50 bg-red-500/10" : theme === 'dark' ? "border-white/10 hover:border-white/20" : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{countryFlags[event.country] || '🌍'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn("font-bold text-sm", theme === 'dark' ? "text-white" : "text-slate-900")}>{event.title}</span>
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="High Impact"></span>
                      </div>
                      <div className={cn("text-[10px] mt-1", theme === 'dark' ? "text-white/50" : "text-slate-500")}>
                        {event.currency} • {isToday ? '🔴 TODAY' : isTomorrow ? '🟡 Tomorrow' : new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {event.time} GMT
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn("text-[9px] uppercase tracking-wider mb-1", theme === 'dark' ? "text-white/40" : "text-slate-400")}>Forecast</div>
                    <div className={cn("font-mono font-bold text-sm", theme === 'dark' ? "text-white" : "text-slate-900")}>{event.forecast || '—'}</div>
                    <div className={cn("text-[9px] mt-1", theme === 'dark' ? "text-white/30" : "text-slate-400")}>Prev: {event.previous || '—'}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className={cn("text-center text-[9px] pt-2 border-t", theme === 'dark' ? "text-white/30 border-white/10" : "text-slate-400 border-slate-200")}>
        💡 Avoid trading 15 mins before and after high-impact news
      </div>
    </div>
  );
};

const TerminalDashboard: React.FC<TerminalDashboardProps> = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [dailyGoal, setDailyGoal] = useState<number>(500);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(2500);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(10000);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagManager, setShowTagManager] = useState(false);

  const [loggedTrades, setLoggedTrades] = useState<TradeLog[]>([]);
  const [initialBalance, setInitialBalance] = useState<number | null>(null);

  const [form, setForm] = useState({
    symbol: 'XAUUSD',
    assetClass: 'COMMODITIES' as AssetClass,
    type: 'LONG' as 'LONG' | 'SHORT',
    lots: '0.10',
    entry: '',
    sl: '',
    tp: '',
    analysis: '',
    date: new Date().toISOString().split('T')[0],
    screenshot: null as string | null,
    tags: [] as string[]
  });

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initTerminal = async () => {
      setIsLoading(true);
      const savedTheme = localStorage.getItem('tradevo_theme');
      
      if (savedTheme) setTheme(savedTheme as 'dark' | 'light');

      // Load custom tags from localStorage
      const savedTags = localStorage.getItem(TAGS_STORAGE_KEY);
      if (savedTags) {
        try {
          setCustomTags(JSON.parse(savedTags));
        } catch (e) {
          console.error('Error parsing tags:', e);
        }
      }

      // Load goals from localStorage
      const savedWeeklyGoal = localStorage.getItem('tradevo_weekly_goal');
      const savedMonthlyGoal = localStorage.getItem('tradevo_monthly_goal');
      if (savedWeeklyGoal) setWeeklyGoal(Number(savedWeeklyGoal));
      if (savedMonthlyGoal) setMonthlyGoal(Number(savedMonthlyGoal));

      if (isConfigured) {
        try {
          // Get current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            // Session expired or invalid - user needs to log in again
            onLogout();
            return;
          }
          
          if (session?.user) {
            setUserId(session.user.id);
            setIsSyncing(true);
            
            // Fetch user profile with initial balance
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('initial_balance')
              .eq('id', session.user.id)
              .single();
            
            if (profileError) {
              console.error('Error fetching profile:', profileError);
              // Profile doesn't exist yet - user will see initial balance setup
            } else if (profile?.initial_balance) {
              setInitialBalance(profile.initial_balance);
            }
            
            // Fetch user's trades
            const { data: trades, error: tradesError } = await supabase
              .from('trades')
              .select('*')
              .eq('user_id', session.user.id)
              .order('timestamp', { ascending: false });
            
            if (tradesError) {
              console.error('Error fetching trades:', tradesError);
              console.error('Error details:', tradesError.message, tradesError.details, tradesError.hint);
            } else if (trades && trades.length > 0) {
              console.log(`Loaded ${trades.length} trades from database`);
              setLoggedTrades(trades);
            } else {
              console.log('No trades found in database');
            }
            
            setLastSyncTime(new Date().toLocaleTimeString());
          } else {
            // No session - redirect to login
            console.log('No active session');
            onLogout();
          }
        } catch (e) {
          console.error('Error loading data:', e);
        } finally { 
          setIsSyncing(false); 
        }
      }
      setIsLoading(false);
    };
    initTerminal();
  }, []);

  const calculations = useMemo(() => {
    const entry = parseFloat(form.entry), sl = parseFloat(form.sl), tp = parseFloat(form.tp), lots = parseFloat(form.lots);
    if (!entry || !sl || !tp) return { rr: "0.00", profit: "0.00" };
    
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    const rr = risk === 0 ? "0.00" : (reward / risk).toFixed(2);
    
    let multiplier = 1;
    if (form.assetClass === 'FOREX') multiplier = 10000;
    else if (form.assetClass === 'COMMODITIES') multiplier = 100;
    else if (form.assetClass === 'FUTURES') multiplier = 10;
    else if (form.assetClass === 'CRYPTO') multiplier = 1;

    const profitValue = reward * multiplier * lots;

    return { 
      rr, 
      profit: profitValue.toFixed(2) 
    };
  }, [form.entry, form.sl, form.tp, form.lots, form.assetClass]);

  const stats = useMemo(() => {
    const totalTrades = loggedTrades.length;
    if (totalTrades === 0) return { 
      netPnl: 0, 
      winRate: 0, 
      avgWin: 0, 
      avgLoss: 0, 
      profitFactor: 0, 
      expectancy: 0, 
      bestTrade: 0, 
      worstTrade: 0,
      totalTrades: 0,
      wins: 0,
      losses: 0,
      avgRR: 0,
      maxDrawdown: 0,
      maxWinStreak: 0,
      maxLossStreak: 0
    };
    const wins = loggedTrades.filter(t => (parseFloat(t.profit) || 0) > 0);
    const losses = loggedTrades.filter(t => (parseFloat(t.profit) || 0) < 0);
    const totalProfit = loggedTrades.reduce((acc, t) => acc + (parseFloat(t.profit) || 0), 0);
    const grossProfit = wins.reduce((acc, t) => acc + (parseFloat(t.profit) || 0), 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + (parseFloat(t.profit) || 0), 0));
    const profitFactor = grossLoss === 0 ? grossProfit > 0 ? 99.9 : 0 : grossProfit / grossLoss;
    const expectancy = ( ( (wins.length / totalTrades) * (grossProfit / (wins.length || 1)) ) - ( (losses.length / totalTrades) * (grossLoss / (losses.length || 1)) ) );
    const tradeProfits = loggedTrades.map(t => parseFloat(t.profit) || 0);
    
    // Calculate average R:R
    const avgRR = loggedTrades.length > 0 
      ? loggedTrades.reduce((acc, t) => acc + (parseFloat(t.rr) || 0), 0) / loggedTrades.length 
      : 0;
    
    // Calculate max drawdown
    let peak = initialBalance || 0;
    let maxDrawdown = 0;
    let runningBalance = initialBalance || 0;
    [...loggedTrades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).forEach(t => {
      runningBalance += (parseFloat(t.profit) || 0);
      if (runningBalance > peak) peak = runningBalance;
      const drawdown = peak > 0 ? ((peak - runningBalance) / peak) * 100 : 0;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });
    
    // Calculate consecutive wins/losses
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    [...loggedTrades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).forEach(t => {
      const profit = parseFloat(t.profit) || 0;
      if (profit > 0) {
        currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
        if (currentStreak > maxWinStreak) maxWinStreak = currentStreak;
      } else if (profit < 0) {
        currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
        if (Math.abs(currentStreak) > maxLossStreak) maxLossStreak = Math.abs(currentStreak);
      }
    });

    return {
      netPnl: totalProfit,
      winRate: (wins.length / totalTrades) * 100,
      avgWin: wins.length ? grossProfit / wins.length : 0,
      avgLoss: losses.length ? grossLoss / losses.length : 0,
      profitFactor,
      expectancy,
      bestTrade: Math.max(...tradeProfits, 0),
      worstTrade: Math.min(...tradeProfits, 0),
      totalTrades,
      wins: wins.length,
      losses: losses.length,
      avgRR,
      maxDrawdown,
      maxWinStreak,
      maxLossStreak
    };
  }, [loggedTrades, initialBalance]);

  const equityCurveData = useMemo(() => {
    const base = initialBalance || 0;
    const curve = [{ name: 'Start', equity: base, date: 'Initial', tradeNum: 0 }];
    let balance = base;
    let tradeNum = 0;
    [...loggedTrades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).forEach(t => {
      tradeNum++;
      balance += (parseFloat(t.profit) || 0);
      const date = new Date(t.timestamp);
      curve.push({ 
        name: t.symbol, 
        equity: balance, 
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tradeNum 
      });
    });
    return curve;
  }, [loggedTrades, initialBalance]);

  const dayPerformanceData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const performance = days.map(day => ({ name: day, val: 0 }));
    loggedTrades.forEach(t => {
      const d = new Date(t.timestamp).getDay();
      if (d >= 1 && d <= 5) {
        performance[d - 1].val += (parseFloat(t.profit) || 0);
      }
    });
    return performance;
  }, [loggedTrades]);

  const topAssetData = useMemo(() => {
    const map: Record<string, { count: number; profit: number }> = {};
    loggedTrades.forEach(t => {
      if (!map[t.symbol]) map[t.symbol] = { count: 0, profit: 0 };
      map[t.symbol].count += 1;
      map[t.symbol].profit += (parseFloat(t.profit) || 0);
    });
    return Object.entries(map)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
  }, [loggedTrades]);

  // Filter trades by time period
  const filteredTrades = useMemo(() => {
    if (timeFilter === 'all') return loggedTrades;
    const now = new Date();
    const cutoff = new Date();
    if (timeFilter === 'week') cutoff.setDate(now.getDate() - 7);
    else if (timeFilter === 'month') cutoff.setMonth(now.getMonth() - 1);
    else if (timeFilter === 'year') cutoff.setFullYear(now.getFullYear() - 1);
    return loggedTrades.filter(t => new Date(t.timestamp) >= cutoff);
  }, [loggedTrades, timeFilter]);

  // Current streak calculation
  const currentStreak = useMemo(() => {
    if (loggedTrades.length === 0) return { type: 'none', count: 0 };
    const sorted = [...loggedTrades].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    let streak = 0;
    const firstProfit = parseFloat(sorted[0].profit) || 0;
    const isWinning = firstProfit > 0;
    for (const trade of sorted) {
      const profit = parseFloat(trade.profit) || 0;
      if ((isWinning && profit > 0) || (!isWinning && profit < 0)) streak++;
      else break;
    }
    return { type: isWinning ? 'win' : 'loss', count: streak };
  }, [loggedTrades]);

  // Best and worst trades
  const bestWorstTrades = useMemo(() => {
    if (loggedTrades.length === 0) return { best: null, worst: null };
    const sorted = [...loggedTrades].sort((a, b) => (parseFloat(b.profit) || 0) - (parseFloat(a.profit) || 0));
    return { best: sorted[0], worst: sorted[sorted.length - 1] };
  }, [loggedTrades]);

  // Monthly P&L data
  const monthlyPnLData = useMemo(() => {
    const months: Record<string, number> = {};
    loggedTrades.forEach(t => {
      const date = new Date(t.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + (parseFloat(t.profit) || 0);
    });
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
        return { name: `${monthName} ${year.slice(2)}`, value };
      });
  }, [loggedTrades]);

  // Session performance
  const sessionPerformance = useMemo(() => {
    const sessions = { LONDON: { trades: 0, profit: 0 }, NY: { trades: 0, profit: 0 }, ASIA: { trades: 0, profit: 0 }, OVERLAP: { trades: 0, profit: 0 } };
    loggedTrades.forEach(t => {
      const session = t.session || 'LONDON';
      sessions[session].trades++;
      sessions[session].profit += parseFloat(t.profit) || 0;
    });
    return Object.entries(sessions).map(([name, data]) => ({ name, ...data }));
  }, [loggedTrades]);

  // Asset class distribution
  const assetDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    loggedTrades.forEach(t => {
      dist[t.assetClass] = (dist[t.assetClass] || 0) + 1;
    });
    const colors = { FOREX: '#00ff9c', CRYPTO: '#f59e0b', FUTURES: '#3b82f6', COMMODITIES: '#ef4444' };
    return Object.entries(dist).map(([name, value]) => ({ name, value, color: colors[name as keyof typeof colors] || '#888' }));
  }, [loggedTrades]);

  // Today's, this week's, and this month's P&L for goals
  const goalProgress = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    let todayPnL = 0;
    let weekPnL = 0;
    let monthPnL = 0;
    loggedTrades.forEach(t => {
      const tradeDate = new Date(t.timestamp);
      const tradeDateStr = tradeDate.toISOString().split('T')[0];
      const profit = parseFloat(t.profit) || 0;
      if (tradeDateStr === todayStr) todayPnL += profit;
      if (tradeDate >= weekStart) weekPnL += profit;
      if (tradeDate >= monthStart) monthPnL += profit;
    });
    return { 
      todayPnL, 
      weekPnL,
      monthPnL,
      dailyProgress: Math.min((todayPnL / dailyGoal) * 100, 100),
      weeklyProgress: Math.min((weekPnL / weeklyGoal) * 100, 100),
      monthlyProgress: Math.min((monthPnL / monthlyGoal) * 100, 100)
    };
  }, [loggedTrades, dailyGoal, weeklyGoal, monthlyGoal]);

  // Tag Performance Analytics
  const tagPerformance = useMemo(() => {
    const tagStats: Record<string, { trades: number; wins: number; profit: number; avgRR: number }> = {};
    loggedTrades.forEach(t => {
      const tags = t.tags || [];
      const profit = parseFloat(t.profit) || 0;
      const rr = parseFloat(t.rr) || 0;
      const isWin = profit > 0;
      tags.forEach(tag => {
        if (!tagStats[tag]) tagStats[tag] = { trades: 0, wins: 0, profit: 0, avgRR: 0 };
        tagStats[tag].trades++;
        if (isWin) tagStats[tag].wins++;
        tagStats[tag].profit += profit;
        tagStats[tag].avgRR += rr;
      });
    });
    return Object.entries(tagStats)
      .map(([tag, data]) => ({
        tag,
        trades: data.trades,
        winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
        profit: data.profit,
        avgRR: data.trades > 0 ? data.avgRR / data.trades : 0
      }))
      .sort((a, b) => b.trades - a.trades)
      .slice(0, 10);
  }, [loggedTrades]);

  // Hourly Performance Heatmap
  const hourlyPerformance = useMemo(() => {
    const hours: Record<number, { trades: number; profit: number; wins: number }> = {};
    for (let i = 0; i < 24; i++) hours[i] = { trades: 0, profit: 0, wins: 0 };
    loggedTrades.forEach(t => {
      const hour = new Date(t.timestamp).getHours();
      hours[hour].trades++;
      hours[hour].profit += parseFloat(t.profit) || 0;
      if ((parseFloat(t.profit) || 0) > 0) hours[hour].wins++;
    });
    return Object.entries(hours).map(([hour, data]) => ({
      hour: parseInt(hour),
      label: `${hour}:00`,
      trades: data.trades,
      profit: data.profit,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0
    }));
  }, [loggedTrades]);

  // Mistake Analytics
  const mistakeAnalytics = useMemo(() => {
    const mistakes: Record<string, { count: number; totalLoss: number }> = {};
    loggedTrades.forEach(t => {
      const tradeMistakes = t.mistakes || [];
      const profit = parseFloat(t.profit) || 0;
      tradeMistakes.forEach(m => {
        if (!mistakes[m]) mistakes[m] = { count: 0, totalLoss: 0 };
        mistakes[m].count++;
        if (profit < 0) mistakes[m].totalLoss += Math.abs(profit);
      });
    });
    return Object.entries(mistakes)
      .map(([mistake, data]) => ({ mistake, count: data.count, totalLoss: data.totalLoss }))
      .sort((a, b) => b.count - a.count);
  }, [loggedTrades]);

  // Drawdown Chart Data
  const drawdownData = useMemo(() => {
    const data: { name: string; drawdown: number; equity: number }[] = [];
    let peak = initialBalance || 0;
    let balance = initialBalance || 0;
    data.push({ name: 'Start', drawdown: 0, equity: balance });
    [...loggedTrades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).forEach(t => {
      balance += parseFloat(t.profit) || 0;
      if (balance > peak) peak = balance;
      const drawdown = peak > 0 ? ((peak - balance) / peak) * 100 : 0;
      const date = new Date(t.timestamp);
      data.push({ 
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        drawdown: -drawdown, 
        equity: balance 
      });
    });
    return data;
  }, [loggedTrades, initialBalance]);

  // Real Behavioral Profile (not mock)
  const behavioralProfile = useMemo(() => {
    if (loggedTrades.length === 0) return [
      { subject: 'Discipline', A: 0, fullMark: 100 },
      { subject: 'Patience', A: 0, fullMark: 100 },
      { subject: 'Risk Mgmt', A: 0, fullMark: 100 },
      { subject: 'Consistency', A: 0, fullMark: 100 },
      { subject: 'Accuracy', A: 0, fullMark: 100 },
      { subject: 'Execution', A: 0, fullMark: 100 },
    ];

    // Calculate discipline score (following the plan - less mistakes)
    const totalMistakes = loggedTrades.reduce((acc, t) => acc + (t.mistakes?.length || 0), 0);
    const disciplineScore = Math.max(0, 100 - (totalMistakes / loggedTrades.length) * 20);

    // Patience score (not revenge trading, waiting for setups)
    const revengeTradeCount = loggedTrades.filter(t => t.mistakes?.includes('Revenge Trade')).length;
    const patienceScore = Math.max(0, 100 - (revengeTradeCount / loggedTrades.length) * 50);

    // Risk management (consistent position sizing, not over-leveraging)
    const overLeveraged = loggedTrades.filter(t => t.mistakes?.includes('Position Too Large')).length;
    const riskScore = Math.max(0, 100 - (overLeveraged / loggedTrades.length) * 50);

    // Consistency (variance in results)
    const avgProfit = stats.netPnl / loggedTrades.length;
    const variance = loggedTrades.reduce((acc, t) => acc + Math.pow((parseFloat(t.profit) || 0) - avgProfit, 2), 0) / loggedTrades.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev / 100)));

    // Accuracy (win rate based)
    const accuracyScore = stats.winRate;

    // Execution (rating based)
    const ratedTrades = loggedTrades.filter(t => t.rating !== 'N/A');
    const ratingScores = { 'A+': 100, 'A': 85, 'B': 70, 'C': 50 };
    const avgRatingScore = ratedTrades.length > 0 
      ? ratedTrades.reduce((acc, t) => acc + (ratingScores[t.rating as keyof typeof ratingScores] || 0), 0) / ratedTrades.length 
      : 50;

    return [
      { subject: 'Discipline', A: Math.round(disciplineScore), fullMark: 100 },
      { subject: 'Patience', A: Math.round(patienceScore), fullMark: 100 },
      { subject: 'Risk Mgmt', A: Math.round(riskScore), fullMark: 100 },
      { subject: 'Consistency', A: Math.round(consistencyScore), fullMark: 100 },
      { subject: 'Accuracy', A: Math.round(accuracyScore), fullMark: 100 },
      { subject: 'Execution', A: Math.round(avgRatingScore), fullMark: 100 },
    ];
  }, [loggedTrades, stats]);

  // Export trades to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Symbol', 'Asset Class', 'Type', 'Lots', 'Entry', 'SL', 'TP', 'R:R', 'Profit', 'Rating', 'Session'];
    const rows = loggedTrades.map(t => [
      t.id, t.displayDate, t.symbol, t.assetClass, t.type, t.lots, t.entry, t.sl, t.tp, t.rr, t.profit, t.rating, t.session
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradevo_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const commitTrade = async () => {
    const tradeDate = new Date(form.date);
    const now = new Date();
    if (tradeDate.toDateString() === now.toDateString()) tradeDate.setHours(now.getHours(), now.getMinutes());

    const tradeData: TradeLog = {
      id: editingId || `TRD-${Math.floor(Math.random() * 90000 + 10000)}`,
      timestamp: tradeDate.toISOString(),
      displayDate: tradeDate.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).toUpperCase(),
      symbol: form.symbol,
      assetClass: form.assetClass,
      type: form.type,
      lots: form.lots,
      entry: form.entry,
      sl: form.sl,
      tp: form.tp,
      rr: calculations.rr,
      pips: '0',
      profit: calculations.profit,
      rating: 'N/A',
      analysis: form.analysis,
      screenshot: form.screenshot,
      emotions: [],
      preMarketAnalysis: '',
      postMarketAnalysis: '',
      session: 'LONDON',
      preChecklist: false,
      tags: form.tags,
      mistakes: [],
      lessonsLearned: '',
      wouldDoDifferently: '',
      entryTime: new Date().toISOString(),
      exitTime: ''
    };

    const newTrades = editingId 
      ? loggedTrades.map(t => t.id === editingId ? { ...t, ...tradeData } : t) 
      : [tradeData, ...loggedTrades];
    
    setLoggedTrades(newTrades);
    
    // Save to Supabase with the actual user ID
    if (isConfigured && userId) {
      try {
        const { error } = await supabase.from('trades').upsert({ 
          ...tradeData, 
          user_id: userId 
        }, {
          onConflict: 'id'
        });
        
        if (error) {
          console.error('Error saving trade:', error);
          alert('Failed to save trade to database. Please check your connection and try again.');
        } else {
          console.log('Trade saved successfully:', tradeData.id);
        }
      } catch (e) {
        console.error('Error saving trade:', e);
        alert('Failed to save trade. Please try again.');
      }
    }
    setActiveTab('Trades');
    resetForm();
  };

  const resetForm = () => {
    setForm({
      symbol: 'XAUUSD', assetClass: 'COMMODITIES', type: 'LONG', lots: '0.10', entry: '', sl: '', tp: '',
      analysis: '', date: new Date().toISOString().split('T')[0], screenshot: null, tags: []
    });
    setEditingId(null);
  };

  // All available tags (default + custom)
  const allTags = useMemo(() => {
    return [...new Set([...DEFAULT_TAGS, ...customTags])].sort();
  }, [customTags]);

  // Add a new custom tag
  const addCustomTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !allTags.includes(trimmedTag)) {
      const newTags = [...customTags, trimmedTag];
      setCustomTags(newTags);
      localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(newTags));
    }
    setNewTagInput('');
  };

  // Remove a custom tag
  const removeCustomTag = (tag: string) => {
    if (DEFAULT_TAGS.includes(tag)) return; // Can't remove default tags
    const newTags = customTags.filter(t => t !== tag);
    setCustomTags(newTags);
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(newTags));
  };

  // Toggle tag in form
  const toggleFormTag = (tag: string) => {
    if (form.tags.includes(tag)) {
      setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
    } else {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
  };

  const updateJournal = async (id: string, updates: Partial<TradeLog>) => {
    const nt = loggedTrades.map(t => t.id === id ? { ...t, ...updates } : t);
    setLoggedTrades(nt);
    
    // Save to Supabase
    if (isConfigured && userId) {
      try {
        await supabase.from('trades').update(updates).eq('id', id).eq('user_id', userId);
      } catch (e) {
        console.error('Error updating trade:', e);
      }
    }
  };

  const deleteTrade = async (id: string) => {
    if (!confirm('Delete record?')) return;
    
    setLoggedTrades(loggedTrades.filter(x => x.id !== id));
    
    // Delete from Supabase
    if (isConfigured && userId) {
      try {
        await supabase.from('trades').delete().eq('id', id).eq('user_id', userId);
      } catch (e) {
        console.error('Error deleting trade:', e);
      }
    }
  };

  const handleInitialBalanceSetup = async (balance: number) => {
    setInitialBalance(balance);
    
    // Save to Supabase
    if (isConfigured && userId) {
      try {
        await supabase.from('profiles').upsert({ id: userId, initial_balance: balance });
      } catch (e) {
        console.error('Error saving initial balance:', e);
      }
    }
  };

  if (isLoading) return <LoadingScreen theme={theme} />;
  if (initialBalance === null) return <FirstTimeSetup onComplete={handleInitialBalanceSetup} theme={theme} />;

  const selectedTradeForJournal = loggedTrades.find(t => t.id === selectedTradeId);

  return (
    <div className={cn("flex h-screen w-full overflow-hidden font-inter transition-colors duration-500", theme === 'dark' ? "bg-black text-white" : "bg-[#f3f4f6] text-slate-900")}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className={cn("justify-between gap-10", theme === 'dark' ? "bg-black border-white/5" : "bg-white border-slate-200 shadow-xl")}>
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <Logo theme={theme} />
            <div className="mt-12 flex flex-col gap-2">
              {[
                { label: "Dashboard", href: "#", icon: <LayoutDashboard className="h-5 w-5" /> },
                { label: "Trades", href: "#", icon: <ArrowLeftRight className="h-5 w-5" /> },
                { label: "Journal", href: "#", icon: <BookText className="h-5 w-5" /> },
                { label: "Analysis", href: "#", icon: <Activity className="h-5 w-5" /> },
                { label: "Tools", href: "#", icon: <Zap className="h-5 w-5" /> },
              ].map((link, idx) => (
                <SidebarLink key={idx} link={link} active={activeTab === link.label} theme={theme} onClick={(e) => { e.preventDefault(); setActiveTab(link.label); setSelectedTradeId(null); }} />
              ))}
            </div>
          </div>
          <div className={cn("flex flex-col gap-4 pt-4 border-t", theme === 'dark' ? "border-white/5" : "border-slate-100")}>
            <button 
              onClick={() => {
                const newTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(newTheme);
                localStorage.setItem('tradevo_theme', newTheme);
              }} 
              className={cn("flex items-center gap-3 py-3 px-2 transition-colors", theme === 'dark' ? "text-white/40 hover:text-[#00ff9c]" : "text-slate-400 hover:text-[#00ff9c]")}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {open && <span className="text-[10px] font-black uppercase tracking-[0.2em]">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
            <button 
              onClick={onLogout} 
              className={cn("flex items-center gap-3 py-3 px-2 transition-colors hover:text-red-500", theme === 'dark' ? "text-white/40" : "text-slate-400")}
            >
              <LogOut className="h-5 w-5" />
              {open && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deauthorize</span>}
            </button>
          </div>
        </SidebarBody>
      </Sidebar>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10 pb-24 relative custom-scrollbar">
        <div className={cn("absolute top-0 right-0 w-[800px] h-[800px] blur-[150px] pointer-events-none opacity-20", theme === 'dark' ? "bg-[#00ff9c]/10" : "bg-[#00ff9c]/30")}></div>

        <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8 relative z-10", theme === 'dark' ? "border-white/5" : "border-slate-200")}>
          <div className="space-y-3">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
              {selectedTradeId ? 'Protocol' : activeTab} <span className="text-[#00ff9c]">{selectedTradeId ? 'Autopsy' : 'Terminal'}</span>
            </h1>
          </div>
          {!selectedTradeId && (
            <button onClick={() => { resetForm(); setActiveTab('LogEntry'); }} className="bg-[#00ff9c] text-black px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest text-[11px] shadow-[0_0_30px_rgba(0,255,156,0.3)] hover:scale-105 transition-all flex items-center gap-3">
              <Plus className="w-4 h-4" /> Initialize Order
            </button>
          )}
          {selectedTradeId && (
            <button onClick={() => setSelectedTradeId(null)} className={cn("px-8 py-4 rounded-xl font-black uppercase italic tracking-widest text-[10px] border transition-all", theme === 'dark' ? "bg-white/5 text-white/60 border-white/10" : "bg-white text-slate-500 shadow-sm")}>
              <ChevronLeft className="w-4 h-4 inline mr-2" /> Back
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'Dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
               
               {/* Header with Time Filter and Export */}
               <div className="flex flex-wrap items-center justify-between gap-4">
                 <div className="flex items-center gap-2">
                   {(['all', 'week', 'month', 'year'] as const).map(filter => (
                     <button
                       key={filter}
                       onClick={() => setTimeFilter(filter)}
                       className={cn(
                         "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all",
                         timeFilter === filter 
                           ? "bg-[#00ff9c] text-black" 
                           : theme === 'dark' ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                       )}
                     >
                       {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'This Year'}
                     </button>
                   ))}
                 </div>
                 <div className="flex items-center gap-2">
                   <button onClick={() => setShowGoalModal(true)} className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2 transition-all", theme === 'dark' ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-slate-100 text-slate-600")}>
                     <Target className="w-3 h-3" /> Set Goals
                   </button>
                   <button onClick={exportToCSV} className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2 transition-all", theme === 'dark' ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-slate-100 text-slate-600")}>
                     <Download className="w-3 h-3" /> Export CSV
                   </button>
                 </div>
               </div>

               {/* Main Stats Row */}
               <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <StatCard isPrimary label="Net Alpha" value={`$${stats.netPnl.toLocaleString()}`} color={stats.netPnl >= 0 ? 'text-[#00ff9c]' : 'text-red-500'} theme={theme} />
                  <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} theme={theme} />
                  <StatCard label="Avg Win" value={`$${stats.avgWin.toLocaleString()}`} color="text-[#00ff9c]" theme={theme} />
                  <StatCard label="Avg Loss" value={`-$${stats.avgLoss.toLocaleString()}`} color="text-red-500" theme={theme} />
                  <StatCard label="Equity" value={`$${((initialBalance || 0) + stats.netPnl).toLocaleString()}`} theme={theme} />
               </section>

               {/* Calendar Section */}
               <div className={cn("border rounded-[3.5rem] p-12 shadow-2xl space-y-4", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-xl")}>
                 <div className="flex flex-col gap-1 mb-4">
                   <div className="flex items-center gap-4">
                     <CalendarIcon className="w-5 h-5 text-[#00ff9c]" />
                     <span className="text-[10px] font-black uppercase tracking-[0.5em]">Alpha Performance Matrix</span>
                   </div>
                   <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 ml-9">Historical execution density across the current month cycle.</p>
                 </div>
                 <PerformanceCalendar loggedTrades={loggedTrades} theme={theme} />
               </div>

               {/* Streak, Goals, Best/Worst Row */}
               <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                 {/* Current Streak */}
                 <div className={cn("border rounded-2xl p-6 flex items-center gap-4", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-sm")}>
                   <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", currentStreak.type === 'win' ? "bg-[#00ff9c]/20" : currentStreak.type === 'loss' ? "bg-red-500/20" : "bg-white/10")}>
                     {currentStreak.type === 'win' ? <Flame className="w-6 h-6 text-[#00ff9c]" /> : currentStreak.type === 'loss' ? <TrendingDown className="w-6 h-6 text-red-500" /> : <Zap className="w-6 h-6 text-white/40" />}
                   </div>
                   <div>
                     <div className="text-[9px] font-black uppercase tracking-wider opacity-40">Current Streak</div>
                     <div className={cn("text-2xl font-black italic", currentStreak.type === 'win' ? "text-[#00ff9c]" : currentStreak.type === 'loss' ? "text-red-500" : "text-white/40")}>
                       {currentStreak.count} {currentStreak.type === 'win' ? 'Wins' : currentStreak.type === 'loss' ? 'Losses' : 'N/A'}
                     </div>
                   </div>
                 </div>

                 {/* Weekly Goal Progress */}
                 <div className={cn("border rounded-2xl p-6", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-sm")}>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-[9px] font-black uppercase tracking-wider opacity-40">Weekly Goal</span>
                     <span className={cn("text-[10px] font-black", goalProgress.weekPnL >= weeklyGoal ? "text-[#00ff9c]" : "text-white/60")}>${goalProgress.weekPnL.toFixed(0)} / ${weeklyGoal}</span>
                   </div>
                   <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                     <div className={cn("h-full rounded-full transition-all", goalProgress.weekPnL >= weeklyGoal ? "bg-[#00ff9c]" : "bg-[#00ff9c]/60")} style={{ width: `${Math.min(goalProgress.weeklyProgress, 100)}%` }} />
                   </div>
                   {goalProgress.weekPnL >= weeklyGoal && <div className="text-[8px] text-[#00ff9c] font-bold mt-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Weekly Goal Achieved!</div>}
                 </div>

                 {/* Monthly Goal Progress */}
                 <div className={cn("border rounded-2xl p-6", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-sm")}>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-[9px] font-black uppercase tracking-wider opacity-40">Monthly Goal</span>
                     <span className={cn("text-[10px] font-black", goalProgress.monthPnL >= monthlyGoal ? "text-[#00ff9c]" : "text-white/60")}>${goalProgress.monthPnL.toFixed(0)} / ${monthlyGoal}</span>
                   </div>
                   <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                     <div className={cn("h-full rounded-full transition-all", goalProgress.monthPnL >= monthlyGoal ? "bg-[#00ff9c]" : "bg-purple-500/80")} style={{ width: `${Math.min(goalProgress.monthlyProgress, 100)}%` }} />
                   </div>
                   {goalProgress.monthPnL >= monthlyGoal && <div className="text-[8px] text-purple-400 font-bold mt-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Monthly Goal Achieved!</div>}
                 </div>

                 {/* Best Trade */}
                 {bestWorstTrades.best && (
                   <div className={cn("border rounded-2xl p-6 flex items-center gap-4", theme === 'dark' ? "bg-[#050505] border-[#00ff9c]/20" : "bg-white border-green-200 shadow-sm")}>
                     <div className="w-12 h-12 rounded-xl bg-[#00ff9c]/20 flex items-center justify-center">
                       <Trophy className="w-6 h-6 text-[#00ff9c]" />
                     </div>
                     <div>
                       <div className="text-[9px] font-black uppercase tracking-wider opacity-40">Best Trade</div>
                       <div className="text-xl font-black italic text-[#00ff9c]">+${parseFloat(bestWorstTrades.best.profit).toFixed(0)}</div>
                       <div className="text-[8px] font-bold opacity-40">{bestWorstTrades.best.symbol}</div>
                     </div>
                   </div>
                 )}

                 {/* Worst Trade */}
                 {bestWorstTrades.worst && parseFloat(bestWorstTrades.worst.profit) < 0 && (
                   <div className={cn("border rounded-2xl p-6 flex items-center gap-4", theme === 'dark' ? "bg-[#050505] border-red-500/20" : "bg-white border-red-200 shadow-sm")}>
                     <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                       <AlertCircle className="w-6 h-6 text-red-500" />
                     </div>
                     <div>
                       <div className="text-[9px] font-black uppercase tracking-wider opacity-40">Worst Trade</div>
                       <div className="text-xl font-black italic text-red-500">${parseFloat(bestWorstTrades.worst.profit).toFixed(0)}</div>
                       <div className="text-[8px] font-bold opacity-40">{bestWorstTrades.worst.symbol}</div>
                     </div>
                   </div>
                 )}
               </div>

               {/* Monthly P&L Chart */}
               <div className={cn("border rounded-[2.5rem] p-8 shadow-xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200")}>
                 <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                     <BarChartIcon className="w-5 h-5 text-[#00ff9c]" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em]">Monthly Performance</span>
                   </div>
                 </div>
                 <div className="h-[200px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={monthlyPnLData}>
                       <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"} />
                       <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                       <YAxis tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                       <Tooltip content={<CustomTooltip theme={theme} />} />
                       <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                         {monthlyPnLData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.value >= 0 ? "#00ff9c" : "#ef4444"} fillOpacity={0.8} />
                         ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </div>

               {/* Asset Distribution & Session Performance Row */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Asset Distribution Pie Chart */}
                 <div className={cn("border rounded-[2.5rem] p-8 shadow-xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200")}>
                   <div className="flex items-center gap-3 mb-6">
                     <PieChartIcon className="w-5 h-5 text-[#00ff9c]" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em]">Asset Distribution</span>
                   </div>
                   <div className="h-[200px]">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={assetDistribution}
                           cx="50%"
                           cy="50%"
                           innerRadius={50}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                         >
                           {assetDistribution.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                         <Legend 
                           formatter={(value) => <span className="text-[10px] font-bold">{value}</span>}
                         />
                         <Tooltip />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                 </div>

                 {/* Session Performance */}
                 <div className={cn("border rounded-[2.5rem] p-8 shadow-xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200")}>
                   <div className="flex items-center gap-3 mb-6">
                     <Clock className="w-5 h-5 text-[#00ff9c]" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em]">Session Performance</span>
                   </div>
                   <div className="space-y-4">
                     {sessionPerformance.map(session => (
                       <div key={session.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                         <div className="flex items-center gap-3">
                           <div className={cn("w-2 h-8 rounded-full", session.profit >= 0 ? "bg-[#00ff9c]" : "bg-red-500")} />
                           <div>
                             <div className="text-sm font-black">{session.name}</div>
                             <div className="text-[9px] opacity-40">{session.trades} trades</div>
                           </div>
                         </div>
                         <div className={cn("text-lg font-black italic", session.profit >= 0 ? "text-[#00ff9c]" : "text-red-500")}>
                           {session.profit >= 0 ? '+' : ''}${session.profit.toFixed(0)}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>

               <div className="grid lg:grid-cols-12 gap-8">
                  <div className={cn("lg:col-span-8 border rounded-[3.5rem] p-12 h-[550px] relative shadow-2xl overflow-hidden", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-xl")}>
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-1">
                        <span className={cn("text-[11px] uppercase tracking-[0.6em] font-black opacity-30")}>Equity Curve</span>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/10">Portfolio growth over {loggedTrades.length} trades</p>
                        <div className="text-5xl font-black italic tracking-tighter text-[#00ff9c] mt-4">${equityCurveData[equityCurveData.length-1].equity.toLocaleString()}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase", stats.netPnl >= 0 ? "bg-[#00ff9c]/10 text-[#00ff9c]" : "bg-red-500/10 text-red-500")}>
                          {stats.netPnl >= 0 ? '+' : ''}{((stats.netPnl / (initialBalance || 1)) * 100).toFixed(2)}% ROI
                        </div>
                      </div>
                    </div>
                    <div className="h-[340px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={equityCurveData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10 }} 
                            axisLine={{ stroke: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10 }} 
                            axisLine={{ stroke: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                            tickLine={false}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            domain={['dataMin - 1000', 'dataMax + 1000']}
                          />
                          <Tooltip content={<CustomTooltip theme={theme} />} />
                          <ReferenceLine y={initialBalance || 0} stroke="#ffffff" strokeDasharray="3 3" opacity={0.2} label={{ value: 'Initial', fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                          <Line type="monotone" dataKey="equity" stroke="#00ff9c" strokeWidth={3} dot={{ fill: '#00ff9c', strokeWidth: 0, r: 3 }} activeDot={{ r: 6, fill: '#00ff9c' }} animationDuration={1500} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={cn("lg:col-span-4 border rounded-[3.5rem] p-10 h-[550px] shadow-2xl flex flex-col", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200")}>
                    <div className="flex flex-col gap-1 mb-8">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-[10px] uppercase tracking-[0.4em] font-black opacity-20")}>Recent Execution Blotter</span>
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/10">Latest standardized execution protocols.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                       {loggedTrades.length > 0 ? (
                         loggedTrades.slice(0, 10).map(trade => (
                           <div key={trade.id} onClick={() => { setSelectedTradeId(trade.id); setActiveTab('Journal'); }} className={cn("p-4 border rounded-2xl flex items-center justify-between group cursor-pointer transition-all hover:bg-[#00ff9c]/5", theme === 'dark' ? "border-white/5 bg-white/[0.01]" : "border-slate-100 bg-slate-50")}>
                              <div className="flex items-center gap-4">
                                 <div className={cn("w-1.5 h-10 rounded-full", parseFloat(trade.profit) >= 0 ? "bg-[#00ff9c]" : "bg-red-500")}></div>
                                 <div>
                                    <div className="flex items-center gap-2">
                                      <div className="text-xs font-black italic uppercase">{trade.symbol}</div>
                                      <span className="text-[7px] font-black px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/5 text-white/40">{trade.rating}</span>
                                    </div>
                                    <div className="text-[8px] font-black uppercase opacity-20">{trade.displayDate}</div>
                                 </div>
                              </div>
                              <div className={cn("text-sm font-black italic", parseFloat(trade.profit) >= 0 ? "text-[#00ff9c]" : "text-red-500")}>${trade.profit}</div>
                           </div>
                         ))
                       ) : (
                         Array.from({ length: 6 }).map((_, i) => (
                           <div key={i} className="p-4 border border-white/5 rounded-2xl flex items-center justify-between opacity-10 pointer-events-none">
                              <div className="flex items-center gap-4">
                                 <div className="w-1.5 h-10 rounded-full bg-white/20"></div>
                                 <div className="space-y-1">
                                    <div className="h-3 w-16 bg-white/20 rounded"></div>
                                    <div className="h-2 w-12 bg-white/10 rounded"></div>
                                 </div>
                              </div>
                              <div className="h-4 w-14 bg-white/20 rounded"></div>
                           </div>
                         ))
                       )}
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'Analysis' && (
            <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-24">
              {/* Top Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <AnalysisCard label="Alpha Total" value={`$${stats.netPnl.toLocaleString()}`} sub={`${loggedTrades.length} trades`} color={stats.netPnl >= 0 ? "text-[#00ff9c]" : "text-red-500"} theme={theme} />
                <AnalysisCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} theme={theme} progress={stats.winRate} />
                <AnalysisCard label="Profit Factor" value={stats.profitFactor.toFixed(2)} sub={stats.profitFactor > 1.5 ? "Excellent" : "Baseline"} color={stats.profitFactor > 1.2 ? "text-[#00ff9c]" : "text-yellow-500"} theme={theme} />
                <AnalysisCard label="Expectancy" value={`$${stats.expectancy.toFixed(0)}`} sub="Per trade" theme={theme} />
                <AnalysisCard label="Max Drawdown" value={`${stats.maxDrawdown.toFixed(1)}%`} color={stats.maxDrawdown > 10 ? "text-red-500" : "text-yellow-500"} theme={theme} />
                <AnalysisCard label="Avg R:R" value={`1:${stats.avgRR.toFixed(1)}`} color="text-[#00ff9c]" theme={theme} />
              </div>
              
              {/* Behavioral Profile & Drawdown Chart */}
              <div className="grid lg:grid-cols-12 gap-8">
                 <div className={cn("lg:col-span-4 border rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-xl")}>
                    <span className="w-full text-[9px] uppercase tracking-[0.4em] font-black opacity-30 mb-4">Real Behavioral Profile</span>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={behavioralProfile}>
                          <PolarGrid stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)"} />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 8, fontWeight: 800 }} />
                          <Radar name="Score" dataKey="A" stroke="#00ff9c" fill="#00ff9c" fillOpacity={0.4} dot={{ r: 4, fill: "#00ff9c" }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full grid grid-cols-3 gap-2 mt-4">
                      {behavioralProfile.slice(0, 3).map(item => (
                        <div key={item.subject} className="text-center">
                          <div className="text-lg font-black text-[#00ff9c]">{item.A}%</div>
                          <div className="text-[7px] uppercase opacity-40">{item.subject}</div>
                        </div>
                      ))}
                    </div>
                 </div>

                 {/* Drawdown Chart */}
                 <div className={cn("lg:col-span-8 border rounded-[3rem] p-10 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200")}>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6 block">Equity & Drawdown Analysis</span>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={drawdownData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"} />
                          <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis yAxisId="left" tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fill: 'rgba(239,68,68,0.6)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                          <Tooltip content={<CustomTooltip theme={theme} />} />
                          <Line yAxisId="left" type="monotone" dataKey="equity" stroke="#00ff9c" strokeWidth={2} dot={false} />
                          <Line yAxisId="right" type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>

              {/* Hourly Performance Heatmap */}
              <div className={cn("border rounded-[3rem] p-10 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200")}>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6 block">Time of Day Performance (24h)</span>
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyPerformance} barSize={20}>
                      <XAxis dataKey="label" tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} interval={2} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className={cn("px-3 py-2 rounded-lg border", theme === 'dark' ? "bg-black border-white/10" : "bg-white border-slate-200")}>
                                <div className="text-[10px] font-black">{data.label}</div>
                                <div className="text-[9px] opacity-60">{data.trades} trades</div>
                                <div className={cn("text-[10px] font-bold", data.profit >= 0 ? "text-[#00ff9c]" : "text-red-500")}>${data.profit.toFixed(0)}</div>
                                <div className="text-[9px] opacity-60">{data.winRate.toFixed(0)}% win rate</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                        {hourlyPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? "#00ff9c" : "#ef4444"} fillOpacity={entry.trades > 0 ? 0.7 : 0.1} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tag Performance & Day Performance */}
              <div className="grid lg:grid-cols-2 gap-8">
                 {/* Tag Performance */}
                 <div className={cn("border rounded-[3rem] p-10 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200")}>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6 block">Tag Performance Analytics</span>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {tagPerformance.length > 0 ? tagPerformance.map((tag, idx) => (
                        <div key={tag.tag} className="flex justify-between items-center p-4 border border-white/5 rounded-2xl bg-white/[0.02]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-[10px] font-bold text-purple-400">{idx+1}</div>
                            <div>
                              <div className="text-sm font-black">{tag.tag}</div>
                              <div className="text-[8px] uppercase opacity-30">{tag.trades} trades • {tag.winRate.toFixed(0)}% win • {tag.avgRR.toFixed(1)}R avg</div>
                            </div>
                          </div>
                          <div className={cn("text-sm font-black", tag.profit >= 0 ? "text-[#00ff9c]" : "text-red-500")}>${tag.profit.toFixed(0)}</div>
                        </div>
                      )) : (
                        <div className="text-center py-8 opacity-30">
                          <Tags className="w-8 h-8 mx-auto mb-2" />
                          <div className="text-[10px] font-black uppercase">No tagged trades yet</div>
                        </div>
                      )}
                    </div>
                 </div>

                 {/* Day Performance */}
                 <div className={cn("border rounded-[3rem] p-10 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200")}>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6 block">Day of Week Performance</span>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dayPerformanceData}>
                          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" tick={{fill: '#888', fontSize: 10}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fill: '#888', fontSize: 9}} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                          <Tooltip content={<CustomTooltip theme={theme} />} />
                          <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                            {dayPerformanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.val >= 0 ? "#00ff9c" : "#ef4444"} fillOpacity={0.7} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>

              {/* Mistake Analytics & Streaks */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Mistake Analytics */}
                <div className={cn("border rounded-[3rem] p-10 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-red-500/10" : "bg-white border-slate-200")}>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-6 block">Mistake Analysis</span>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto">
                    {mistakeAnalytics.length > 0 ? mistakeAnalytics.map((m, idx) => (
                      <div key={m.mistake} className="flex justify-between items-center p-4 border border-red-500/10 rounded-2xl bg-red-500/[0.02]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-[10px] font-bold text-red-500">{m.count}x</div>
                          <div className="text-sm font-black">{m.mistake}</div>
                        </div>
                        <div className="text-sm font-black text-red-500">-${m.totalLoss.toFixed(0)}</div>
                      </div>
                    )) : (
                      <div className="text-center py-8 opacity-30">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#00ff9c]" />
                        <div className="text-[10px] font-black uppercase">No mistakes logged</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Streak Stats */}
                <div className={cn("border rounded-[3rem] p-10 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200")}>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6 block">Streak Statistics</span>
                  <div className="grid grid-cols-2 gap-6">
                    <div className={cn("p-6 rounded-2xl border", theme === 'dark' ? "bg-[#00ff9c]/5 border-[#00ff9c]/20" : "bg-green-50 border-green-200")}>
                      <div className="text-[9px] uppercase opacity-50 mb-2">Best Win Streak</div>
                      <div className="text-4xl font-black text-[#00ff9c]">{stats.maxWinStreak}</div>
                      <div className="text-[9px] uppercase opacity-30">Consecutive Wins</div>
                    </div>
                    <div className={cn("p-6 rounded-2xl border", theme === 'dark' ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-200")}>
                      <div className="text-[9px] uppercase opacity-50 mb-2">Worst Loss Streak</div>
                      <div className="text-4xl font-black text-red-500">{stats.maxLossStreak}</div>
                      <div className="text-[9px] uppercase opacity-30">Consecutive Losses</div>
                    </div>
                    <div className={cn("p-6 rounded-2xl border", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                      <div className="text-[9px] uppercase opacity-50 mb-2">Current Streak</div>
                      <div className={cn("text-4xl font-black", currentStreak.type === 'win' ? "text-[#00ff9c]" : currentStreak.type === 'loss' ? "text-red-500" : "opacity-30")}>
                        {currentStreak.count}
                      </div>
                      <div className="text-[9px] uppercase opacity-30">{currentStreak.type === 'win' ? 'Wins' : currentStreak.type === 'loss' ? 'Losses' : 'N/A'}</div>
                    </div>
                    <div className={cn("p-6 rounded-2xl border", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                      <div className="text-[9px] uppercase opacity-50 mb-2">Win/Loss Ratio</div>
                      <div className="text-4xl font-black">{stats.wins}:{stats.losses}</div>
                      <div className="text-[9px] uppercase opacity-30">Total Record</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className={cn("border rounded-[3rem] p-10 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-xl")}>
                 <span className={cn("text-[10px] uppercase tracking-[0.4em] font-black mb-8 block opacity-30")}>Monthly Alpha Density Heatmap</span>
                 <PerformanceCalendar loggedTrades={loggedTrades} theme={theme} mini />
              </div>
            </motion.div>
          )}

          {activeTab === 'Trades' && (
            <motion.div key="trades" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
               <div className={cn("flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-6 gap-4", theme === 'dark' ? "border-white/5" : "border-slate-200")}>
                 <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-white/30" /><h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Full execution blotter</h2></div>
                 <div className="flex flex-wrap items-center gap-3">
                   {/* Tag Filter Dropdown */}
                   <div className="relative">
                     <button 
                       onClick={() => setShowTagManager(!showTagManager)}
                       className={cn("flex items-center gap-2 border rounded-xl px-4 py-2 text-[9px] font-black uppercase transition-all", 
                         selectedTagFilter ? "border-[#00ff9c]/50 text-[#00ff9c]" : theme === 'dark' ? "bg-white/5 border-white/10 text-white/60" : "bg-white border-slate-200 text-slate-600"
                       )}
                     >
                       <Tags className="w-3.5 h-3.5" />
                       {selectedTagFilter || 'All Tags'}
                       {selectedTagFilter && (
                         <X className="w-3 h-3 ml-1 hover:text-white" onClick={(e) => { e.stopPropagation(); setSelectedTagFilter(null); }} />
                       )}
                     </button>
                     {showTagManager && (
                       <div className={cn("absolute top-full right-0 mt-2 w-72 border rounded-2xl p-4 shadow-2xl z-50 max-h-80 overflow-y-auto", theme === 'dark' ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200")}>
                         <div className="flex items-center justify-between mb-3">
                           <span className="text-[9px] font-black uppercase tracking-wider opacity-50">Filter by Tag</span>
                           <button onClick={() => setShowTagManager(false)} className="p-1 hover:text-[#00ff9c]"><X className="w-3 h-3" /></button>
                         </div>
                         {/* Add new tag input */}
                         <div className="flex gap-2 mb-3">
                           <input
                             type="text"
                             placeholder="Add custom tag..."
                             value={newTagInput}
                             onChange={e => setNewTagInput(e.target.value)}
                             onKeyDown={e => e.key === 'Enter' && addCustomTag(newTagInput)}
                             className={cn("flex-1 border rounded-lg px-3 py-2 text-[10px] outline-none", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                           />
                           <button onClick={() => addCustomTag(newTagInput)} className="px-3 py-2 bg-[#00ff9c] text-black rounded-lg text-[9px] font-black">+</button>
                         </div>
                         <div className="flex flex-wrap gap-2">
                           <button
                             onClick={() => { setSelectedTagFilter(null); setShowTagManager(false); }}
                             className={cn("px-2 py-1 rounded-lg text-[8px] font-bold transition-all border", !selectedTagFilter ? "bg-[#00ff9c] text-black border-[#00ff9c]" : theme === 'dark' ? "border-white/10 hover:border-white/30" : "border-slate-200")}
                           >
                             All
                           </button>
                           {allTags.map(tag => (
                             <button
                               key={tag}
                               onClick={() => { setSelectedTagFilter(tag); setShowTagManager(false); }}
                               className={cn("px-2 py-1 rounded-lg text-[8px] font-bold transition-all border flex items-center gap-1", 
                                 selectedTagFilter === tag ? "bg-[#00ff9c] text-black border-[#00ff9c]" : theme === 'dark' ? "border-white/10 hover:border-[#00ff9c]/50" : "border-slate-200 hover:border-[#00ff9c]"
                               )}
                             >
                               {tag}
                               {!DEFAULT_TAGS.includes(tag) && (
                                 <X className="w-2 h-2 opacity-50 hover:opacity-100" onClick={(e) => { e.stopPropagation(); removeCustomTag(tag); }} />
                               )}
                             </button>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                   {/* Search */}
                   <div className={cn("flex items-center border rounded-xl px-4 py-2 gap-3 w-64", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm")}>
                     <Search className="w-3.5 h-3.5 text-white/20" />
                     <input type="text" placeholder="FILTER_ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-[10px] uppercase font-black w-full text-white" />
                   </div>
                 </div>
               </div>
               <div className={cn("border rounded-[2rem] overflow-hidden shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-xl")}>
                 <table className="w-full text-left border-collapse">
                   <thead className={cn("border-b", theme === 'dark' ? "border-white/5 bg-white/[0.01]" : "bg-slate-50")}>
                     <tr>{['ID', 'DATE', 'SYMBOL', 'TYPE', 'TAGS', 'R:R', 'P&L', 'RATING', 'ACTIONS'].map(h => (<th key={h} className="p-6 text-[9px] font-black uppercase tracking-[0.3em] opacity-30">{h}</th>))}</tr>
                   </thead>
                   <tbody>
                     {loggedTrades
                       .filter(t => t.id.includes(searchTerm) || t.symbol.includes(searchTerm))
                       .filter(t => !selectedTagFilter || (t.tags && t.tags.includes(selectedTagFilter)))
                       .map((trade) => (
                       <tr key={trade.id} className={cn("border-b transition-all", theme === 'dark' ? "border-white/5 hover:bg-white/[0.01]" : "hover:bg-slate-50/50")}>
                         <td className="p-6 text-[10px] font-mono opacity-30">{trade.id}</td>
                         <td className="p-6 text-[10px] font-black uppercase opacity-40">{trade.displayDate}</td>
                         <td className="p-6 text-sm font-black italic">{trade.symbol}</td>
                         <td className="p-6"><span className={cn("text-[8px] font-black uppercase px-2 py-1 rounded border", trade.type === 'LONG' ? "text-[#00ff9c] border-[#00ff9c]/20" : "text-red-500 border-red-500/20")}>{trade.type}</span></td>
                         <td className="p-6">
                           <div className="flex flex-wrap gap-1 max-w-[200px]">
                             {trade.tags && trade.tags.length > 0 ? (
                               trade.tags.slice(0, 3).map(tag => (
                                 <span key={tag} className="text-[7px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">{tag}</span>
                               ))
                             ) : (
                               <span className="text-[8px] opacity-20">—</span>
                             )}
                             {trade.tags && trade.tags.length > 3 && (
                               <span className="text-[7px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/40">+{trade.tags.length - 3}</span>
                             )}
                           </div>
                         </td>
                         <td className="p-6 text-[11px] font-mono text-[#00ff9c]">{trade.rr}R</td>
                         <td className={cn("p-6 text-[12px] font-black italic", parseFloat(trade.profit) < 0 ? "text-red-500" : "text-[#00ff9c]")}>${trade.profit}</td>
                         <td className="p-6"><span className="text-[10px] font-black uppercase bg-[#00ff9c]/10 text-[#00ff9c] px-3 py-1 rounded-full">{trade.rating}</span></td>
                         <td className="p-6">
                            <div className="flex items-center gap-3">
                              <button onClick={() => { setEditingId(trade.id); setForm({symbol: trade.symbol, assetClass: trade.assetClass, type: trade.type, lots: trade.lots, entry: trade.entry, sl: trade.sl, tp: trade.tp, analysis: trade.analysis, date: trade.timestamp.split('T')[0], screenshot: trade.screenshot, tags: trade.tags || []}); setActiveTab('LogEntry'); }} className="p-2 hover:text-[#00ff9c]"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => deleteTrade(trade.id)} className="p-2 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </motion.div>
          )}

          {activeTab === 'Journal' && !selectedTradeId && (
            <motion.div key="journal-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {loggedTrades.map(trade => (
                <div key={trade.id} onClick={() => setSelectedTradeId(trade.id)} className={cn("group border rounded-[2.5rem] p-8 hover:border-[#00ff9c]/30 cursor-pointer transition-all hover:-translate-y-2 shadow-xl relative overflow-hidden", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-md")}>
                   <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase opacity-20">{trade.id}</div>
                      <h4 className="text-2xl font-black italic uppercase tracking-tighter">{trade.symbol}</h4>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black uppercase text-[#00ff9c] bg-[#00ff9c]/10 px-3 py-1 rounded-full">{trade.rating}</span>
                      {trade.postMarketAnalysis ? <CheckCircle2 className="w-4 h-4 text-[#00ff9c]" /> : <AlertCircle className="w-4 h-4 text-yellow-500 animate-pulse" />}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className={cn("p-4 rounded-2xl border", theme === 'dark' ? "bg-white/[0.02] border-white/5" : "bg-slate-50 shadow-sm")}>
                        <div className="text-[8px] uppercase font-black opacity-30 mb-1">Alpha</div>
                        <div className={cn("text-lg font-black italic", parseFloat(trade.profit) >= 0 ? "text-[#00ff9c]" : "text-red-500")}>${trade.profit}</div>
                     </div>
                     <div className={cn("p-4 rounded-2xl border", theme === 'dark' ? "bg-white/[0.02] border-white/5" : "bg-slate-50 shadow-sm")}>
                        <div className="text-[8px] uppercase font-black opacity-30 mb-1">Session</div>
                        <div className="text-lg font-black italic opacity-40">{trade.session}</div>
                     </div>
                  </div>
                  {/* Tags Display */}
                  {trade.tags && trade.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {trade.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-[7px] font-bold px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/20">{tag}</span>
                      ))}
                      {trade.tags.length > 4 && (
                        <span className="text-[7px] font-bold px-2 py-1 rounded-full bg-white/10 text-white/40">+{trade.tags.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {selectedTradeId && selectedTradeForJournal && (
            <BehavioralJournal 
              trade={selectedTradeForJournal} 
              onUpdate={(updates) => updateJournal(selectedTradeId, updates)} 
              onDelete={() => { setLoggedTrades(loggedTrades.filter(x => x.id !== selectedTradeId)); setSelectedTradeId(null); }}
              theme={theme}
            />
          )}

          {activeTab === 'LogEntry' && (
            <motion.div key="log" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-5 gap-10 items-start pb-20">
               <div className="lg:col-span-3 space-y-10">
                  <div className={cn("border p-12 rounded-[3rem] space-y-12 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-xl")}>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3"><Target className="w-4 h-4 text-[#00ff9c]" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Order Initiation</span></div>
                        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className={cn("border rounded-xl px-5 py-2 text-[10px] font-black outline-none bg-transparent shadow-sm", theme === 'dark' ? "border-white/10" : "border-slate-200")} />
                     </div>
                     <div className="grid grid-cols-3 gap-8">
                        <div className="space-y-3">
                           <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30 ml-2">Asset Class</label>
                           <select value={form.assetClass} onChange={e => {
                             const ac = e.target.value as AssetClass;
                             setForm({...form, assetClass: ac, symbol: ASSET_PAIRS[ac][0]});
                           }} className={cn("w-full border rounded-2xl p-5 text-sm font-black italic outline-none shadow-sm", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200")}>
                              <option value="FOREX">Forex</option>
                              <option value="CRYPTO">Crypto</option>
                              <option value="FUTURES">Futures / Indices</option>
                              <option value="COMMODITIES">Commodities</option>
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30 ml-2">Symbol Pair</label>
                           <select value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value})} className={cn("w-full border rounded-2xl p-5 text-sm font-black italic outline-none shadow-sm", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200")}>
                              {ASSET_PAIRS[form.assetClass].map(p => <option key={p} value={p}>{p}</option>)}
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30 ml-2">Direction</label>
                           <div className={cn("flex rounded-2xl p-1.5 border shadow-sm", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200")}>
                              {['LONG', 'SHORT'].map(t => (<button key={t} onClick={() => setForm({...form, type: t as any})} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all", form.type === t ? (t === 'LONG' ? "bg-[#00ff9c] text-black shadow-md" : "bg-red-600 text-white shadow-md") : "opacity-30")}>{t}</button>))}
                           </div>
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-8">
                        <InputGroup label="ORDER_LOTS" value={form.lots} type="number" theme={theme} onChange={(v:any) => setForm({...form, lots: v})} />
                        <InputGroup label="ENTRY_NODE" value={form.entry} type="number" theme={theme} onChange={(v:any) => setForm({...form, entry: v})} />
                        <div className="flex gap-4">
                           <InputGroup label="STOP" value={form.sl} type="number" theme={theme} onChange={(v:any) => setForm({...form, sl: v})} />
                           <InputGroup label="TARGET" value={form.tp} type="number" theme={theme} onChange={(v:any) => setForm({...form, tp: v})} />
                        </div>
                     </div>
                  </div>
                  <div className={cn("border p-12 rounded-[3rem] space-y-10 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-xl")}>
                     <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-[#00ff9c]" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Strategic Logic</span></div>
                     <textarea value={form.analysis} onChange={e => setForm({...form, analysis: e.target.value})} placeholder="Document the edge logic..." className={cn("w-full h-40 border rounded-2xl p-6 text-sm italic outline-none resize-none shadow-sm", theme === 'dark' ? "bg-white/5 border-white/10 text-white/70" : "bg-slate-50 border-slate-200")} />
                  </div>

                  {/* Tags Section */}
                  <div className={cn("border p-12 rounded-[3rem] space-y-6 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-xl")}>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3"><Tag className="w-4 h-4 text-[#00ff9c]" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Trade Tags</span></div>
                       <span className="text-[9px] opacity-40">{form.tags.length} selected</span>
                     </div>
                     
                     {/* Selected Tags */}
                     {form.tags.length > 0 && (
                       <div className="flex flex-wrap gap-2">
                         {form.tags.map(tag => (
                           <span 
                             key={tag} 
                             onClick={() => toggleFormTag(tag)}
                             className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[9px] font-bold cursor-pointer hover:bg-purple-500/30 flex items-center gap-2"
                           >
                             {tag}
                             <X className="w-3 h-3" />
                           </span>
                         ))}
                       </div>
                     )}
                     
                     {/* Add New Tag */}
                     <div className="flex gap-2">
                       <input
                         type="text"
                         placeholder="Create new tag..."
                         value={newTagInput}
                         onChange={e => setNewTagInput(e.target.value)}
                         onKeyDown={e => {
                           if (e.key === 'Enter' && newTagInput.trim()) {
                             addCustomTag(newTagInput);
                             toggleFormTag(newTagInput.trim());
                           }
                         }}
                         className={cn("flex-1 border rounded-xl px-4 py-3 text-[10px] font-bold outline-none", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                       />
                       <button 
                         onClick={() => {
                           if (newTagInput.trim()) {
                             addCustomTag(newTagInput);
                             toggleFormTag(newTagInput.trim());
                           }
                         }}
                         className="px-4 py-3 bg-[#00ff9c] text-black rounded-xl text-[10px] font-black"
                       >
                         Add
                       </button>
                     </div>
                     
                     {/* Available Tags */}
                     <div className="space-y-3">
                       <span className="text-[8px] font-black uppercase tracking-wider opacity-30">Quick Tags</span>
                       <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                         {allTags.filter(tag => !form.tags.includes(tag)).map(tag => (
                           <button
                             key={tag}
                             onClick={() => toggleFormTag(tag)}
                             className={cn("px-3 py-1.5 rounded-full text-[8px] font-bold transition-all border hover:border-purple-500/50 hover:text-purple-400", 
                               theme === 'dark' ? "border-white/10 text-white/50" : "border-slate-200 text-slate-500"
                             )}
                           >
                             + {tag}
                           </button>
                         ))}
                       </div>
                     </div>
                  </div>
               </div>
               <div className="lg:col-span-2 space-y-10 sticky top-10">
                  <div className={cn("border-2 p-10 rounded-[3rem] space-y-10 shadow-2xl border-[#00ff9c]/20", theme === 'dark' ? "bg-[#050505]" : "bg-white shadow-2xl")}>
                     <div className="space-y-8">
                        <div className="flex items-center gap-3 text-[#00ff9c]"><TrendingUp className="w-5 h-5" /><span className="text-[11px] font-black uppercase tracking-[0.5em]">Prediction Model</span></div>
                        <div className="grid grid-cols-2 gap-8">
                           <SummaryDetail label="EST_ALPHA" value={`$${calculations.profit}`} highlight theme={theme} />
                           <SummaryDetail label="RATIO_RR" value={`1:${calculations.rr}`} theme={theme} />
                        </div>
                     </div>
                     <button onClick={commitTrade} className="w-full bg-[#00ff9c] text-black py-6 rounded-2xl font-black uppercase italic tracking-[0.3em] text-[12px] hover:shadow-[0_0_50px_rgba(0,255,156,0.3)] hover:scale-[1.02] transition-all">
                        Commit Protocol
                     </button>
                  </div>
               </div>
            </motion.div>
          )}

          {/* Tools Tab */}
          {activeTab === 'Tools' && (
            <motion.div key="tools" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Market Hours */}
                <MarketHours theme={theme} />
                
                {/* Position Size Calculator */}
                <PositionSizeCalculator theme={theme} />
                
                {/* Economic Calendar */}
                <EconomicCalendar theme={theme} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Goal Setting Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn("w-full max-w-md border rounded-3xl p-8 space-y-6", theme === 'dark' ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200")}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-[#00ff9c]" />
                  <span className="text-lg font-black uppercase tracking-tight">Set Goals</span>
                </div>
                <button onClick={() => setShowGoalModal(false)} className="p-2 hover:text-[#00ff9c]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider opacity-50">Weekly Profit Goal ($)</label>
                  <input
                    type="number"
                    value={weeklyGoal}
                    onChange={e => setWeeklyGoal(Number(e.target.value))}
                    className={cn("w-full border rounded-xl p-4 text-2xl font-black text-[#00ff9c] outline-none", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider opacity-50">Monthly Profit Goal ($)</label>
                  <input
                    type="number"
                    value={monthlyGoal}
                    onChange={e => setMonthlyGoal(Number(e.target.value))}
                    className={cn("w-full border rounded-xl p-4 text-2xl font-black text-purple-400 outline-none", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  localStorage.setItem('tradevo_weekly_goal', String(weeklyGoal));
                  localStorage.setItem('tradevo_monthly_goal', String(monthlyGoal));
                  setShowGoalModal(false);
                }}
                className="w-full bg-[#00ff9c] text-black py-4 rounded-xl font-black uppercase tracking-widest text-[11px]"
              >
                Save Goals
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-components
const BehavioralJournal = ({ trade, onUpdate, onDelete, theme }: any) => {
  const [localTrade, setLocalTrade] = useState(trade);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRating = (r: TradeRating) => {
    const nt = { ...localTrade, rating: r };
    setLocalTrade(nt);
    onUpdate(nt);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const nt = { ...localTrade, screenshot: reader.result as string };
        setLocalTrade(nt);
        onUpdate(nt);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-12 gap-10 pb-20">
      <div className="lg:col-span-8 space-y-8">
        <div className={cn("border rounded-[3rem] p-10 flex justify-between items-center shadow-2xl relative overflow-hidden", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-xl")}>
          <div className="grid grid-cols-4 gap-12">
             <DossierItem label="EXEC_ID" value={trade.id} mono theme={theme} />
             <DossierItem label="ALPHA_RESULT" value={`$${trade.profit}`} color={parseFloat(trade.profit) >= 0 ? 'text-[#00ff9c]' : 'text-red-500'} theme={theme} />
             <DossierItem label="RISK_RR" value={`1:${trade.rr}`} theme={theme} />
             <DossierItem label="RATING" value={localTrade.rating} theme={theme} />
          </div>
        </div>
        
        <div className={cn("border p-10 rounded-[3rem] space-y-8 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-md")}>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><Star className="w-4 h-4 text-[#00ff9c]" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Setup Quality Rating</span></div>
              <div className="flex gap-2">
                 {['A+', 'A', 'B', 'C'].map(r => (
                   <button key={r} onClick={() => handleRating(r as TradeRating)} className={cn("w-10 h-10 rounded-xl font-black text-[10px] border transition-all", localTrade.rating === r ? "bg-[#00ff9c] border-[#00ff9c] text-black shadow-lg" : "opacity-30 hover:opacity-100")}>{r}</button>
                 ))}
              </div>
           </div>
        </div>

        <div className={cn("border p-10 rounded-[3rem] space-y-6 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-md")}>
           <div className="flex items-center justify-between"><div className="flex items-center gap-3"><ImageIcon className="w-4 h-4 text-[#00ff9c]" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Execution Evidence</span></div><button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 rounded-xl text-[9px] font-black uppercase border opacity-50 hover:opacity-100">Upload Screenshot</button><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" /></div>
           {localTrade.screenshot ? <div className="relative group overflow-hidden rounded-3xl border border-white/5 shadow-2xl"><img src={localTrade.screenshot} className="w-full h-auto" /><button onClick={() => { setLocalTrade({...localTrade, screenshot: null}); onUpdate({...localTrade, screenshot: null}); }} className="absolute top-4 right-4 bg-red-600 p-2 rounded-full text-white shadow-xl opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button></div> : <div className="h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 opacity-10 font-black uppercase tracking-[0.5em]">No evidence attached.</div>}
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <JournalSection title="Pre-Market Psychology" value={localTrade.preMarketAnalysis} theme={theme} onChange={(v:any) => { setLocalTrade({...localTrade, preMarketAnalysis: v}); onUpdate({...localTrade, preMarketAnalysis: v}); }} />
          <JournalSection title="Post-Execution Autopsy" value={localTrade.postMarketAnalysis} theme={theme} onChange={(v:any) => { setLocalTrade({...localTrade, postMarketAnalysis: v}); onUpdate({...localTrade, postMarketAnalysis: v}); }} />
        </div>

        {/* Lessons Learned Section */}
        <div className={cn("border p-10 rounded-[3rem] space-y-6 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-md")}>
          <div className="flex items-center gap-3"><BookText className="w-4 h-4 text-[#00ff9c]" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Key Lessons Learned</span></div>
          <textarea 
            value={localTrade.lessonsLearned || ''} 
            onChange={e => { setLocalTrade({...localTrade, lessonsLearned: e.target.value}); onUpdate({...localTrade, lessonsLearned: e.target.value}); }} 
            placeholder="What did you learn from this trade?" 
            className={cn("w-full h-28 border rounded-2xl p-5 text-sm italic outline-none resize-none", theme === 'dark' ? "bg-white/5 border-white/10 text-white/70" : "bg-slate-50 border-slate-200")} 
          />
        </div>

        {/* What Would You Do Differently */}
        <div className={cn("border p-10 rounded-[3rem] space-y-6 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-md")}>
          <div className="flex items-center gap-3"><TrendingUp className="w-4 h-4 text-yellow-500" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">What Would You Do Differently?</span></div>
          <textarea 
            value={localTrade.wouldDoDifferently || ''} 
            onChange={e => { setLocalTrade({...localTrade, wouldDoDifferently: e.target.value}); onUpdate({...localTrade, wouldDoDifferently: e.target.value}); }} 
            placeholder="If you could replay this trade, what changes would you make?" 
            className={cn("w-full h-28 border rounded-2xl p-5 text-sm italic outline-none resize-none", theme === 'dark' ? "bg-white/5 border-white/10 text-white/70" : "bg-slate-50 border-slate-200")} 
          />
        </div>
      </div>
      <div className="lg:col-span-4 space-y-8">
        {/* Trade Tags Display */}
        {trade.tags && trade.tags.length > 0 && (
          <div className={cn("border p-8 rounded-[3rem] space-y-4 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-md")}>
            <div className="flex items-center gap-3"><Tag className="w-4 h-4 text-purple-400" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Trade Tags</span></div>
            <div className="flex flex-wrap gap-2">
              {trade.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[9px] font-bold">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Mistakes Section */}
        <div className={cn("border p-8 rounded-[3rem] space-y-6 shadow-2xl", theme === 'dark' ? "bg-red-500/[0.02] border-red-500/20" : "bg-white border-slate-200 shadow-xl")}>
          <div className="flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-500" /><span className="text-[11px] font-black uppercase tracking-widest text-red-500">Trade Mistakes</span></div>
          <div className="space-y-4">
            <label className="text-[9px] uppercase tracking-widest font-black opacity-30">Select Any Mistakes Made</label>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {MISTAKE_CATEGORIES.map(m => (
                <button 
                  key={m} 
                  onClick={() => {
                    const mistakes = localTrade.mistakes || [];
                    const next = mistakes.includes(m) ? mistakes.filter((x: string) => x !== m) : [...mistakes, m];
                    setLocalTrade({...localTrade, mistakes: next});
                    onUpdate({...localTrade, mistakes: next});
                  }} 
                  className={cn("py-2.5 px-4 rounded-xl border text-[9px] font-black uppercase transition-all text-left", 
                    (localTrade.mistakes || []).includes(m) ? "bg-red-500/15 border-red-500/40 text-red-500" : "opacity-30 hover:opacity-60"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={cn("border p-10 rounded-[3rem] space-y-10 shadow-2xl", theme === 'dark' ? "bg-[#00ff9c]/[0.02] border-[#00ff9c]/20" : "bg-white border-slate-200 shadow-xl")}>
          <div className="flex items-center gap-3"><Brain className="w-5 h-5 text-[#00ff9c]" /><span className="text-[11px] font-black uppercase tracking-widest text-[#00ff9c]">Cognitive Assessment</span></div>
          <div className="space-y-8">
             <div className="space-y-4">
                <label className="text-[9px] uppercase tracking-widest font-black opacity-30">Dominant Emotions</label>
                <div className="grid grid-cols-2 gap-2">
                   {['Disciplined', 'Greed', 'Fear', 'FOMO', 'Calm', 'Boredom'].map(e => (
                     <button key={e} onClick={() => {
                        const next = localTrade.emotions.includes(e) ? localTrade.emotions.filter((x:any) => x !== e) : [...localTrade.emotions, e];
                        setLocalTrade({...localTrade, emotions: next});
                        onUpdate({...localTrade, emotions: next});
                     }} className={cn("py-3 rounded-xl border text-[9px] font-black uppercase transition-all", localTrade.emotions.includes(e) ? "bg-[#00ff9c]/15 border-[#00ff9c]/40 text-[#00ff9c]" : "opacity-20")}>{e}</button>
                   ))}
                </div>
             </div>
             <div onClick={() => { setLocalTrade({...localTrade, preChecklist: !localTrade.preChecklist}); onUpdate({...localTrade, preChecklist: !localTrade.preChecklist}); }} className="flex items-center justify-between border p-5 rounded-xl cursor-pointer transition-all"><span className="text-[10px] font-black uppercase opacity-40">Systemic Adherence</span><div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", localTrade.preChecklist ? 'bg-[#00ff9c] border-[#00ff9c]' : 'opacity-20')}>{localTrade.preChecklist && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}</div></div>
          </div>
        </div>
        <button onClick={onDelete} className="w-full py-4 rounded-2xl text-[10px] font-black uppercase border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl">Purge Dossier</button>
      </div>
    </motion.div>
  );
};

const AnalysisCard = ({ label, value, sub, color = "text-white", progress, theme }: any) => (
  <div className={cn("border p-8 rounded-[2rem] shadow-xl relative overflow-hidden group transition-all", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-100 shadow-sm")}>
    <div className="text-[8px] uppercase tracking-[0.4em] font-black mb-1 opacity-40">{label}</div>
    <div className={cn("text-3xl font-black italic tracking-tighter mb-2", color === "text-white" && theme !== "dark" ? "text-slate-900" : color)}>{value}</div>
    {sub && <div className="text-[9px] font-black uppercase tracking-widest opacity-20">{sub}</div>}
    {progress !== undefined && <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5"><div className="h-full bg-blue-500/40" style={{ width: `${progress}%` }}></div></div>}
  </div>
);

const PerformanceCalendar = ({ loggedTrades, theme, mini = false }: { loggedTrades: TradeLog[], theme: string, mini?: boolean }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = (new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 6) % 7;
  const dailyPnL = useMemo(() => {
    const map: Record<string, { pnl: number; trades: number }> = {};
    loggedTrades.forEach(t => {
      const d = new Date(t.timestamp).toISOString().split('T')[0];
      if (!map[d]) map[d] = { pnl: 0, trades: 0 };
      map[d].pnl += (parseFloat(t.profit) || 0);
      map[d].trades += 1;
    });
    return map;
  }, [loggedTrades]);

  const today = new Date();
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentMonth.getMonth() && 
           today.getFullYear() === currentMonth.getFullYear();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
         <div className={cn("font-black italic uppercase tracking-tighter", mini ? "text-lg" : "text-3xl")}>{currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}</div>
         <div className="flex gap-2">
           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className={cn("p-2 rounded-lg border transition-all hover:border-[#00ff9c]/50 hover:text-[#00ff9c]", theme === 'dark' ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}><ChevronLeft className="w-4 h-4" /></button>
           <button onClick={() => setCurrentMonth(new Date())} className={cn("px-3 py-2 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all hover:border-[#00ff9c]/50 hover:text-[#00ff9c]", theme === 'dark' ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>Today</button>
           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className={cn("p-2 rounded-lg border transition-all hover:border-[#00ff9c]/50 hover:text-[#00ff9c]", theme === 'dark' ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}><ChevronRight className="w-4 h-4" /></button>
         </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className={cn("text-center font-black uppercase tracking-wider py-2", mini ? "text-[7px]" : "text-[9px]", theme === 'dark' ? "text-white/30" : "text-slate-400")}>{d}</div>)}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`p-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dayData = dailyPnL[dateStr];
          const pnl = dayData?.pnl || 0;
          const trades = dayData?.trades || 0;
          const todayHighlight = isToday(d);
          
          return (
            <div 
              key={d} 
              className={cn(
                "relative rounded-xl border flex flex-col items-center justify-center group transition-all cursor-default",
                mini ? "h-14" : "h-24",
                todayHighlight && "ring-2 ring-[#00ff9c] ring-offset-2 ring-offset-black",
                pnl > 0 
                  ? "bg-[#00ff9c]/10 border-[#00ff9c]/30 hover:border-[#00ff9c]/60" 
                  : pnl < 0 
                    ? "bg-red-500/10 border-red-500/30 hover:border-red-500/60" 
                    : theme === 'dark' 
                      ? "bg-white/[0.02] border-white/10 hover:border-white/20" 
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
              )}
            >
               <span className={cn(
                 "font-black absolute top-2 left-2",
                 mini ? "text-[8px]" : "text-[10px]",
                 todayHighlight ? "text-[#00ff9c]" : "opacity-40"
               )}>{d}</span>
               
               {trades > 0 && (
                 <div className="flex flex-col items-center justify-center mt-1">
                   <span className={cn(
                     "font-black italic",
                     mini ? "text-[9px]" : "text-sm",
                     pnl > 0 ? "text-[#00ff9c]" : "text-red-500"
                   )}>
                     {pnl > 0 ? '+' : ''}${Math.abs(pnl).toFixed(0)}
                   </span>
                   {!mini && (
                     <span className={cn(
                       "text-[8px] font-bold uppercase mt-0.5",
                       theme === 'dark' ? "text-white/30" : "text-slate-400"
                     )}>
                       {trades} trade{trades > 1 ? 's' : ''}
                     </span>
                   )}
                 </div>
               )}
               
               {trades === 0 && !mini && (
                 <span className={cn("text-[8px] font-bold uppercase", theme === 'dark' ? "text-white/10" : "text-slate-300")}>—</span>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const JournalSection = ({ title, value, onChange, theme }: any) => (
  <div className={cn("border p-8 rounded-[2.5rem] space-y-4 shadow-xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-md")}>
    <label className="text-[9px] uppercase tracking-widest font-black opacity-40">{title}</label>
    <textarea value={value} onChange={e => onChange(e.target.value)} className={cn("w-full h-32 border rounded-2xl p-6 text-sm italic outline-none resize-none", theme === 'dark' ? "bg-white/[0.01] border-white/5 text-white/60 shadow-sm" : "bg-slate-50 border-slate-100 shadow-sm")} />
  </div>
);

const DossierItem = ({ label, value, mono = false, color = 'text-white', theme }: any) => (
  <div className="space-y-1">
    <div className="text-[9px] uppercase tracking-widest font-black opacity-20">{label}</div>
    <div className={cn("text-lg font-black italic truncate", mono ? "font-mono" : "", color === 'text-white' && theme !== 'dark' ? 'text-slate-900' : color)}>{value}</div>
  </div>
);

const InputGroup = ({ label, value, onChange, type = "text", theme }: any) => (
  <div className="space-y-3 flex-1">
    <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30 ml-2">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className={cn("w-full border rounded-2xl p-5 text-xl font-black italic outline-none transition-all shadow-sm", theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-[#00ff9c]" : "bg-white border-slate-200 shadow-sm focus:border-[#00ff9c]")} />
  </div>
);

const SummaryDetail = ({ label, value, highlight = false, theme }: any) => (
  <div className="space-y-1">
    <div className="text-[9px] font-black uppercase tracking-widest opacity-20">{label}</div>
    <div className={cn("text-3xl font-black italic tracking-tighter", highlight ? "text-[#00ff9c]" : theme === 'dark' ? "text-white" : "text-slate-900")}>{value}</div>
  </div>
);

const CustomTooltip = ({ active, payload, theme }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={cn("border p-4 rounded-xl shadow-2xl backdrop-blur-md", theme === 'dark' ? "bg-black/90 border-[#00ff9c]/30" : "bg-white border-slate-200")}>
        <p className="text-[9px] uppercase font-black opacity-40 mb-1">{data.date}</p>
        <p className="text-[10px] uppercase font-bold opacity-60 mb-2">{data.name}</p>
        <p className="text-xl font-black italic text-[#00ff9c]">${Number(payload[0].value).toLocaleString()}</p>
        {data.tradeNum > 0 && <p className="text-[8px] uppercase opacity-30 mt-1">Trade #{data.tradeNum}</p>}
      </div>
    );
  }
  return null;
};

const LoadingScreen = ({ theme }: { theme: string }) => <div className={cn("h-screen w-full flex flex-col items-center justify-center gap-6", theme === 'dark' ? "bg-black" : "bg-[#f3f4f6]")}><div className="w-16 h-16 border-4 border-[#00ff9c] border-t-transparent rounded-full animate-spin"></div><p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#00ff9c]">Establishing Connection...</p></div>;

const FirstTimeSetup = ({ onComplete, theme }: any) => {
  const [val, setVal] = useState('50000');
  return (<div className={cn("h-screen w-full flex flex-col items-center justify-center p-6", theme === 'dark' ? "bg-black text-white" : "bg-white text-slate-900")}><div className="max-w-md w-full space-y-12 text-center"><h2 className="text-5xl font-black uppercase italic tracking-tighter">Terminal <span className="text-[#00ff9c]">Initiation</span></h2><div className={cn("space-y-8 border p-12 rounded-[3.5rem] shadow-2xl", theme === 'dark' ? "border-white/10" : "border-slate-200")}><div className="space-y-2 text-left"><label className="text-[10px] uppercase font-black opacity-30 ml-4">Initial Capital ($)</label><input type="number" value={val} onChange={e => setVal(e.target.value)} className={cn("w-full border rounded-2xl p-6 text-5xl font-black italic text-[#00ff9c] outline-none text-center", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200")} /></div><button onClick={() => onComplete(Number(val))} className="w-full bg-[#00ff9c] text-black py-6 rounded-2xl font-black uppercase italic tracking-widest text-[11px] shadow-[0_0_40px_rgba(0,255,156,0.3)]">Establish Session</button></div></div></div>);
};

const StatCard = ({ label, value, color, theme, isPrimary }: any) => (
  <div className={cn(
    "border p-8 rounded-[2.5rem] space-y-4 shadow-xl transition-all cursor-default group",
    theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-sm",
    isPrimary && theme === 'dark' ? "border-[#00ff9c]/40 shadow-[0_0_20px_rgba(0,255,156,0.1)]" : "",
    isPrimary && theme !== 'dark' ? "border-[#00ff9c]/60 ring-2 ring-[#00ff9c]/10" : ""
  )}>
    <span className={cn("text-[10px] uppercase tracking-[0.4em] font-black opacity-30 group-hover:opacity-100 transition-opacity", theme === 'dark' ? "text-white" : "text-slate-900")}>{label}</span>
    <div className={cn("text-3xl font-black italic tracking-tighter leading-none", color || (theme === 'dark' ? 'text-white' : 'text-slate-900'))}>{value}</div>
  </div>
);

const Logo = ({ theme }: { theme: string }) => (<div className="relative z-20 flex items-center space-x-4 py-3 px-3"><div className="w-8 h-8 border-2 border-[#00ff9c] flex items-center justify-center rounded-xl"><div className="w-2.5 h-2.5 bg-[#00ff9c] animate-pulse"></div></div><span className={cn("text-2xl font-bold tracking-tighter uppercase italic", theme === 'dark' ? "text-white" : "text-slate-900")}>Tradevo</span></div>);

export default TerminalDashboard;
