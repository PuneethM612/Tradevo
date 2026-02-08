
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
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { supabase, isConfigured } from '../lib/supabase';
import { 
  CartesianGrid, 
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
  ReferenceLine
} from 'recharts';

interface TerminalDashboardProps {
  onLogout: () => void;
}

type AssetClass = 'FOREX' | 'CRYPTO' | 'FUTURES' | 'GOLD';
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
}

const STORAGE_KEY = 'tradevo_terminal_data_v9';
const SETTINGS_KEY = 'tradevo_terminal_settings_v9';

const ASSET_PAIRS: Record<AssetClass, string[]> = {
  FOREX: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'EURGBP', 'NZDUSD'],
  CRYPTO: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT'],
  FUTURES: ['NAS100', 'US30', 'SPX500', 'GER40', 'UK100'],
  GOLD: ['XAUUSD', 'XAGUSD']
};

const RADAR_MOCK_DATA = [
  { subject: 'Discipline', A: 120, fullMark: 150 },
  { subject: 'Patience', A: 98, fullMark: 150 },
  { subject: 'Risk Mgmt', A: 140, fullMark: 150 },
  { subject: 'Timing', A: 70, fullMark: 150 },
  { subject: 'Focus', A: 110, fullMark: 150 },
  { subject: 'Consistency', A: 130, fullMark: 150 },
];

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

  const [loggedTrades, setLoggedTrades] = useState<TradeLog[]>([]);
  const [initialBalance, setInitialBalance] = useState<number | null>(null);

  const [form, setForm] = useState({
    symbol: 'XAUUSD',
    assetClass: 'GOLD' as AssetClass,
    type: 'LONG' as 'LONG' | 'SHORT',
    lots: '0.10',
    entry: '',
    sl: '',
    tp: '',
    analysis: '',
    date: new Date().toISOString().split('T')[0],
    screenshot: null as string | null
  });

  useEffect(() => {
    const initTerminal = async () => {
      setIsLoading(true);
      const savedTheme = localStorage.getItem('tradevo_theme');
      const savedTrades = localStorage.getItem(STORAGE_KEY);
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      
      if (savedTheme) setTheme(savedTheme as 'dark' | 'light');
      if (savedTrades) {
        try { setLoggedTrades(JSON.parse(savedTrades)); } catch (e) {}
      }
      if (savedSettings) {
        try { setInitialBalance(JSON.parse(savedSettings).initialBalance); } catch (e) {}
      }

      if (isConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setIsSyncing(true);
            const { data: profile } = await supabase.from('profiles').select('initial_balance').eq('id', session.user.id).single();
            if (profile?.initial_balance) setInitialBalance(profile.initial_balance);
            const { data: trades } = await supabase.from('trades').select('*').order('timestamp', { ascending: false });
            if (trades && trades.length > 0) setLoggedTrades(trades);
            setLastSyncTime(new Date().toLocaleTimeString());
          }
        } catch (e) {} finally { setIsSyncing(false); }
      }
      setIsLoading(false);
    };
    initTerminal();
  }, []);

  const calculations = useMemo(() => {
    const entry = parseFloat(form.entry), sl = parseFloat(form.sl), tp = parseFloat(form.tp), lots = parseFloat(form.lots);
    if (!entry || !sl || !tp) return { rr: "0.00", pips: "0", profit: "0.00" };
    
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    const rr = risk === 0 ? "0.00" : (reward / risk).toFixed(2);
    
    let multiplier = 1;
    if (form.assetClass === 'FOREX') multiplier = 10000;
    else if (form.assetClass === 'GOLD') multiplier = 100;
    else if (form.assetClass === 'FUTURES') multiplier = 10;
    else if (form.assetClass === 'CRYPTO') multiplier = 1;

    const profitValue = reward * multiplier * lots;
    const pipsValue = (reward * multiplier).toFixed(1);

    return { 
      rr, 
      pips: pipsValue, 
      profit: profitValue.toFixed(2) 
    };
  }, [form.entry, form.sl, form.tp, form.lots, form.assetClass]);

  const stats = useMemo(() => {
    const totalTrades = loggedTrades.length;
    if (totalTrades === 0) return { netPnl: 0, winRate: 0, avgWin: 0, avgLoss: 0, profitFactor: 0, expectancy: 0, bestTrade: 0, worstTrade: 0 };
    const wins = loggedTrades.filter(t => (parseFloat(t.profit) || 0) > 0);
    const losses = loggedTrades.filter(t => (parseFloat(t.profit) || 0) < 0);
    const totalProfit = loggedTrades.reduce((acc, t) => acc + (parseFloat(t.profit) || 0), 0);
    const grossProfit = wins.reduce((acc, t) => acc + (parseFloat(t.profit) || 0), 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + (parseFloat(t.profit) || 0), 0));
    const profitFactor = grossLoss === 0 ? grossProfit > 0 ? 99.9 : 0 : grossProfit / grossLoss;
    const expectancy = ( ( (wins.length / totalTrades) * (grossProfit / (wins.length || 1)) ) - ( (losses.length / totalTrades) * (grossLoss / (losses.length || 1)) ) );
    const tradeProfits = loggedTrades.map(t => parseFloat(t.profit) || 0);

    return {
      netPnl: totalProfit,
      winRate: (wins.length / totalTrades) * 100,
      avgWin: wins.length ? grossProfit / wins.length : 0,
      avgLoss: losses.length ? grossLoss / losses.length : 0,
      profitFactor,
      expectancy,
      bestTrade: Math.max(...tradeProfits, 0),
      worstTrade: Math.min(...tradeProfits, 0)
    };
  }, [loggedTrades]);

  const equityCurveData = useMemo(() => {
    const base = initialBalance || 0;
    const curve = [{ name: 'START', equity: base }];
    let balance = base;
    [...loggedTrades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).forEach(t => {
      balance += (parseFloat(t.profit) || 0);
      curve.push({ name: t.id, equity: balance });
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
      pips: calculations.pips,
      profit: calculations.profit,
      rating: 'N/A',
      analysis: form.analysis,
      screenshot: form.screenshot,
      emotions: [],
      preMarketAnalysis: '',
      postMarketAnalysis: '',
      session: 'LONDON',
      preChecklist: false
    };

    const newTrades = editingId 
      ? loggedTrades.map(t => t.id === editingId ? { ...t, ...tradeData } : t) 
      : [tradeData, ...loggedTrades];
    
    setLoggedTrades(newTrades);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTrades));
    if (isConfigured) {
      await supabase.from('trades').upsert(newTrades.map(t => ({ ...t, user_id: 'auto' })));
    }
    setActiveTab('Trades');
    resetForm();
  };

  const resetForm = () => {
    setForm({
      symbol: 'XAUUSD', assetClass: 'GOLD', type: 'LONG', lots: '0.10', entry: '', sl: '', tp: '',
      analysis: '', date: new Date().toISOString().split('T')[0], screenshot: null
    });
    setEditingId(null);
  };

  const updateJournal = (id: string, updates: Partial<TradeLog>) => {
    const nt = loggedTrades.map(t => t.id === id ? { ...t, ...updates } : t);
    setLoggedTrades(nt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nt));
  };

  if (isLoading) return <LoadingScreen theme={theme} />;
  if (initialBalance === null) return <FirstTimeSetup onComplete={(b) => { setInitialBalance(b); localStorage.setItem(SETTINGS_KEY, JSON.stringify({initialBalance: b})); }} theme={theme} />;

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
              ].map((link, idx) => (
                <SidebarLink key={idx} link={link} active={activeTab === link.label} theme={theme} onClick={(e) => { e.preventDefault(); setActiveTab(link.label); setSelectedTradeId(null); }} />
              ))}
            </div>
          </div>
          <div className={cn("flex flex-col gap-4 pt-4 border-t", theme === 'dark' ? "border-white/5" : "border-slate-100")}>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center gap-3 py-3 px-2 text-white/40 hover:text-[#00ff9c]">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {open && <span className="text-[10px] font-black uppercase tracking-[0.2em]">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
            <button onClick={onLogout} className="flex items-center gap-3 py-3 px-2 text-white/40 hover:text-red-500">
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
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
               <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <StatCard isPrimary label="Net Alpha" value={`$${stats.netPnl.toLocaleString()}`} color={stats.netPnl >= 0 ? 'text-[#00ff9c]' : 'text-red-500'} theme={theme} />
                  <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} theme={theme} />
                  <StatCard label="Avg Win" value={`$${stats.avgWin.toLocaleString()}`} color="text-[#00ff9c]" theme={theme} />
                  <StatCard label="Avg Loss" value={`-$${stats.avgLoss.toLocaleString()}`} color="text-red-500" theme={theme} />
                  <StatCard label="Equity" value={`$${((initialBalance || 0) + stats.netPnl).toLocaleString()}`} theme={theme} />
               </section>

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

               <div className="grid lg:grid-cols-12 gap-8">
                  <div className={cn("lg:col-span-8 border rounded-[3.5rem] p-12 h-[550px] relative shadow-2xl overflow-hidden", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-xl")}>
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-1">
                        <span className={cn("text-[11px] uppercase tracking-[0.6em] font-black opacity-30")}>Acceleration Path</span>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/10">Quantified equity growth and capital efficiency trajectory.</p>
                        <div className="text-5xl font-black italic tracking-tighter text-[#00ff9c] mt-4">${equityCurveData[equityCurveData.length-1].equity.toLocaleString()}</div>
                      </div>
                      <div className="px-4 py-2 border border-white/5 bg-white/5 rounded-lg">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40 italic">Timeline: All Activity</span>
                      </div>
                    </div>
                    <div className="h-[340px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={equityCurveData}>
                          <CartesianGrid vertical={false} stroke={theme === 'dark' ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.05)"} />
                          <Tooltip content={<CustomTooltip theme={theme} />} />
                          <ReferenceLine y={initialBalance || 0} stroke="#ffffff" strokeDasharray="3 3" opacity={0.1} />
                          <Line type="monotone" dataKey="equity" stroke="#00ff9c" strokeWidth={5} dot={false} animationDuration={2000} />
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <AnalysisCard label="Alpha Total" value={`$${stats.netPnl.toLocaleString()}`} sub={`${loggedTrades.length} trades total`} color={stats.netPnl >= 0 ? "text-[#00ff9c]" : "text-red-500"} theme={theme} />
                <AnalysisCard label="Success Prob" value={`${stats.winRate.toFixed(1)}%`} theme={theme} progress={stats.winRate} />
                <AnalysisCard label="Profit Factor" value={stats.profitFactor.toFixed(2)} sub={stats.profitFactor > 1.5 ? "Institutional Grade" : "Baseline"} color={stats.profitFactor > 1.2 ? "text-[#00ff9c]" : "text-yellow-500"} theme={theme} />
                <AnalysisCard label="Exp Alpha" value={`$${stats.expectancy.toFixed(2)}`} sub="Per execution delta" theme={theme} />
              </div>
              
              <div className="grid lg:grid-cols-12 gap-8">
                 <div className={cn("lg:col-span-4 border rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-xl")}>
                    <span className="w-full text-[9px] uppercase tracking-[0.4em] font-black opacity-30 mb-4">Behavioral Profile Matrix</span>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={RADAR_MOCK_DATA}>
                          <PolarGrid stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)"} />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 8, fontWeight: 800 }} />
                          <Radar name="Operator" dataKey="A" stroke="#00ff9c" fill="#00ff9c" fillOpacity={0.4} dot={{ r: 4, fill: "#00ff9c" }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>

                 <div className={cn("lg:col-span-8 border rounded-[3rem] p-10 shadow-2xl h-[400px]", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200")}>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-8 block">Behavioral Distribution (Days)</span>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dayPerformanceData}>
                          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" tick={{fill: '#888', fontSize: 10}} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                            {dayPerformanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.val >= 0 ? "#00ff9c" : "#ef4444"} fillOpacity={0.6} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                 <div className={cn("border rounded-[3rem] p-10 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200")}>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-8 block">Dominant Assets</span>
                    <div className="space-y-4">
                       {topAssetData.map(([symbol, data], idx) => (
                         <div key={symbol} className="flex justify-between items-center p-4 border border-white/5 rounded-2xl bg-white/[0.02]">
                           <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-500">{idx+1}</div><div><div className="text-sm font-black italic">{symbol}</div><div className="text-[8px] uppercase opacity-20">{data.count} Executions</div></div></div>
                           <div className={cn("text-sm font-black", data.profit >= 0 ? "text-[#00ff9c]" : "text-red-500")}>${data.profit.toFixed(2)}</div>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className={cn("border rounded-[3rem] p-10 shadow-2xl flex flex-col justify-center", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-sm")}>
                      <span className={cn("text-[10px] uppercase tracking-[0.4em] font-black opacity-30 mb-6")}>Alpha Prob Distribution</span>
                      <div className="h-6 w-full bg-white/5 rounded-full overflow-hidden flex">
                        <div className="h-full bg-[#00ff9c]" style={{ width: `${stats.winRate}%` }}></div>
                        <div className="h-full bg-red-500" style={{ width: `${100 - stats.winRate}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-6">
                         <div className="text-2xl font-black text-[#00ff9c]">{stats.winRate.toFixed(1)}% <span className="text-[9px] uppercase opacity-20 ml-2">Success Rate</span></div>
                         <div className="text-2xl font-black text-red-500">{(100 - stats.winRate).toFixed(1)}% <span className="text-[9px] uppercase opacity-20 ml-2">Attrition Rate</span></div>
                      </div>
                    </div>
              </div>

              <div className={cn("border rounded-[3rem] p-10 shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-xl")}>
                 <span className={cn("text-[10px] uppercase tracking-[0.4em] font-black mb-8 block opacity-30")}>Monthly Alpha Density Heatmap</span>
                 <PerformanceCalendar loggedTrades={loggedTrades} theme={theme} mini />
              </div>
            </motion.div>
          )}

          {activeTab === 'Trades' && (
            <motion.div key="trades" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
               <div className={cn("flex items-center justify-between border-b pb-6", theme === 'dark' ? "border-white/5" : "border-slate-200")}>
                 <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-white/30" /><h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Full execution blotter</h2></div>
                 <div className={cn("flex items-center border rounded-xl px-4 py-2 gap-3 w-64", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm")}>
                   <Search className="w-3.5 h-3.5 text-white/20" />
                   <input type="text" placeholder="FILTER_ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-[10px] uppercase font-black w-full text-white" />
                 </div>
               </div>
               <div className={cn("border rounded-[2rem] overflow-hidden shadow-2xl", theme === 'dark' ? "bg-[#050505] border-white/5" : "bg-white border-slate-200 shadow-xl")}>
                 <table className="w-full text-left border-collapse">
                   <thead className={cn("border-b", theme === 'dark' ? "border-white/5 bg-white/[0.01]" : "bg-slate-50")}>
                     <tr>{['ID', 'DATE', 'SYMBOL', 'TYPE', 'MOVE', 'ALPHA', 'RATING', 'ACTIONS'].map(h => (<th key={h} className="p-6 text-[9px] font-black uppercase tracking-[0.3em] opacity-30">{h}</th>))}</tr>
                   </thead>
                   <tbody>
                     {loggedTrades.filter(t => t.id.includes(searchTerm) || t.symbol.includes(searchTerm)).map((trade) => (
                       <tr key={trade.id} className={cn("border-b transition-all", theme === 'dark' ? "border-white/5 hover:bg-white/[0.01]" : "hover:bg-slate-50/50")}>
                         <td className="p-6 text-[10px] font-mono opacity-30">{trade.id}</td>
                         <td className="p-6 text-[10px] font-black uppercase opacity-40">{trade.displayDate}</td>
                         <td className="p-6 text-sm font-black italic">{trade.symbol}</td>
                         <td className="p-6"><span className={cn("text-[8px] font-black uppercase px-2 py-1 rounded border", trade.type === 'LONG' ? "text-[#00ff9c] border-[#00ff9c]/20" : "text-red-500 border-red-500/20")}>{trade.type}</span></td>
                         <td className="p-6 text-[11px] font-mono opacity-30">{trade.pips}</td>
                         <td className={cn("p-6 text-[12px] font-black italic", parseFloat(trade.profit) < 0 ? "text-red-500" : "text-[#00ff9c]")}>${trade.profit}</td>
                         <td className="p-6"><span className="text-[10px] font-black uppercase bg-[#00ff9c]/10 text-[#00ff9c] px-3 py-1 rounded-full">{trade.rating}</span></td>
                         <td className="p-6">
                            <div className="flex items-center gap-3">
                              <button onClick={() => { setEditingId(trade.id); setForm({symbol: trade.symbol, assetClass: trade.assetClass, type: trade.type, lots: trade.lots, entry: trade.entry, sl: trade.sl, tp: trade.tp, analysis: trade.analysis, date: trade.timestamp.split('T')[0], screenshot: trade.screenshot}); setActiveTab('LogEntry'); }} className="p-2 hover:text-[#00ff9c]"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => { if(confirm('Delete record?')) setLoggedTrades(loggedTrades.filter(x => x.id !== trade.id)) }} className="p-2 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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
                              <option value="FOREX">Forex (Pips)</option>
                              <option value="CRYPTO">Crypto (Coins)</option>
                              <option value="FUTURES">Futures (Points)</option>
                              <option value="GOLD">Gold (Ticks)</option>
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
                     <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.02] space-y-2 shadow-inner">
                        <div className="text-[8px] font-black uppercase opacity-20">Calculated Move</div>
                        <div className="text-xl font-mono text-[#00ff9c]">{calculations.pips} {form.assetClass === 'FOREX' ? 'Pips' : form.assetClass === 'GOLD' ? 'Ticks' : 'Points'}</div>
                     </div>
                     <button onClick={commitTrade} className="w-full bg-[#00ff9c] text-black py-6 rounded-2xl font-black uppercase italic tracking-[0.3em] text-[12px] hover:shadow-[0_0_50px_rgba(0,255,156,0.3)] hover:scale-[1.02] transition-all">
                        Commit Protocol
                     </button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
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
      </div>
      <div className="lg:col-span-4 space-y-8">
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
    const map: Record<string, number> = {};
    loggedTrades.forEach(t => {
      const d = new Date(t.timestamp).toISOString().split('T')[0];
      map[d] = (map[d] || 0) + (parseFloat(t.profit) || 0);
    });
    return map;
  }, [loggedTrades]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
         <div className={cn("font-black italic uppercase tracking-tighter", mini ? "text-lg" : "text-3xl")}>{currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}</div>
         <div className="flex gap-2"><button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:text-[#00ff9c]"><ChevronLeft className="w-4 h-4" /></button><button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:text-[#00ff9c]"><ChevronRight className="w-4 h-4" /></button></div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <div key={d} className="text-center text-[8px] font-black opacity-20">{d}</div>)}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`p-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const pnl = dailyPnL[dateStr] || 0;
          return (
            <div key={d} className={cn("relative rounded-lg border flex flex-col items-center justify-center group transition-all shadow-sm", mini ? "h-12" : "h-20", pnl > 0 ? "bg-[#00ff9c]/5 border-[#00ff9c]/20" : pnl < 0 ? "bg-red-500/5 border-red-500/20" : "bg-white/[0.01] border-white/5")}>
               <span className="text-[7px] font-black absolute top-1 left-1 opacity-20">{d}</span>
               {pnl !== 0 && (
                 <span className={cn("font-black italic mt-1", mini ? "text-[8px]" : "text-[10px]", pnl > 0 ? "text-[#00ff9c]" : "text-red-500")}>
                   {pnl > 0 ? '+' : ''}${Math.abs(pnl).toFixed(0)}
                 </span>
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
  if (active && payload && payload.length) return (<div className={cn("border p-6 rounded-2xl shadow-2xl backdrop-blur-md", theme === 'dark' ? "bg-black border-[#00ff9c]/20" : "bg-white border-slate-200")}><p className="text-[10px] uppercase font-black opacity-30 mb-2">{payload[0].payload.name}</p><p className="text-2xl font-black italic text-[#00ff9c]">${Number(payload[0].value).toLocaleString()}</p></div>);
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
