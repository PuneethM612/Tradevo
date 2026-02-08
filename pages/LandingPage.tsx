
import React, { useEffect, useRef, useState } from 'react';
// Fix: Verified and ensured correct named imports from react-router-dom
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { TextHoverEffect } from '../components/ui/text-hover-effect';
import { DotBackground } from '../components/ui/dot-background';
import { FloatingNav } from '../components/ui/floating-navbar';
import { EncryptedText } from '../components/ui/encrypted-text';
import { HoverBorderGradient } from '../components/ui/hover-border-gradient';
import { LayoutGrid, ShieldCheck, Zap, BarChart3, Database, Activity } from 'lucide-react';

const useIntersectionObserver = (options: IntersectionObserverInit) => {
  const [elements, setElements] = useState<Element[]>([]);
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observer.current = new IntersectionObserver((observedEntries) => {
      setEntries(observedEntries);
    }, options);
    const { current: currentObserver } = observer;
    elements.forEach((element) => {
      currentObserver.observe(element);
    });
    return () => currentObserver.disconnect();
  }, [elements, options]);

  return [setElements, entries] as const;
};

const LandingPage: React.FC = () => {
  const { hash } = useLocation();
  const [setRevealElements, entries] = useIntersectionObserver({ threshold: 0.1 });

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash]);

  useEffect(() => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('reveal-active');
    });
  }, [entries]);

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    setRevealElements(Array.from(reveals));
  }, [setRevealElements]);

  const navItems = [
    { name: "Platform", link: "#hero", icon: <LayoutGrid className="h-4 w-4" /> },
    { name: "Intelligence", link: "#features", icon: <Zap className="h-4 w-4" /> },
    { name: "Log Sync", link: "#analytics", icon: <Database className="h-4 w-4" /> },
    { name: "Stats Core", link: "#methodology", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <main className="flex flex-col w-full bg-black scroll-smooth">
      <FloatingNav navItems={navItems} />
      
      <section id="hero" className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black">
        <DotBackground className="h-full">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,156,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center reveal transition-all duration-1000 transform opacity-0 translate-y-12">
            <div className="inline-flex items-center gap-3 mb-4 px-5 py-2 border border-[#00ff9c]/40 bg-black/60 rounded-sm backdrop-blur-sm shadow-[0_0_20px_rgba(0,255,156,0.1)]">
              <div className="w-2 h-2 rounded-full bg-[#00ff9c] animate-pulse"></div>
              <span className="text-[#00ff9c] text-[11px] font-bold tracking-[0.5em] uppercase">Operator Terminal Activated</span>
            </div>
            
            <div className="h-[20rem] md:h-[30rem] w-full flex items-center justify-center -mt-8 md:-mt-16">
              <TextHoverEffect text="TRADEVO" />
            </div>
            
            <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto -mt-10 md:-mt-20 mb-14 leading-relaxed font-light tracking-wide italic">
              Engineered for high-frequency discipline. Quantify your edge with institutional-grade diagnostics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <HoverBorderGradient
                as={Link}
                to="/signup"
                containerClassName="rounded-sm"
                className="bg-black text-white flex items-center justify-center px-16 h-16 text-lg font-bold tracking-widest uppercase"
              >
                Initialize
              </HoverBorderGradient>
              
              <HoverBorderGradient
                as={Link}
                to="/login"
                containerClassName="rounded-sm"
                className="bg-black text-white/70 hover:text-white flex items-center justify-center px-16 h-16 text-lg font-bold tracking-widest uppercase border border-white/10"
              >
                Login
              </HoverBorderGradient>
            </div>
          </div>
        </DotBackground>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/20">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Scroll to Deploy</span>
          <div className="w-px h-16 bg-gradient-to-b from-[#00ff9c] to-transparent"></div>
        </div>
      </section>

      <section id="features" className="relative min-h-screen w-full flex items-center bg-black border-y border-white/5 overflow-hidden">
        <DotBackground className="min-h-screen flex items-center" dotColor="#202020">
          <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center w-full">
            <div className="space-y-12 reveal transition-all duration-1000 transform opacity-0 -translate-x-12 delay-200">
              <div className="inline-block px-4 py-1 border border-[#00ff9c]/20 bg-[#00ff9c]/5 text-[#00ff9c] text-[10px] font-bold tracking-[0.5em] uppercase">Core Infrastructure · Visual · Intelligence</div>
              <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9]">
                <EncryptedText 
                  text="Visual Intelligence" 
                  revealedClassName="text-white"
                  encryptedClassName="text-[#00ff9c]/40"
                  revealDelayMs={40}
                />
              </h2>
              <p className="text-white/50 text-xl font-light leading-relaxed max-w-lg italic">
                The <span className="text-white">Tradevo dashboard</span> gives you a focused, real-time view of your trading performance. Monitor win rate, P&L, execution quality, session behavior, and emotional patterns — all from one control center designed for review, not reaction.
              </p>
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                  <div className="text-3xl font-bold italic text-white tracking-tighter">0.1 MS</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Ultra-Low Latency Sync</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold italic text-[#00ff9c] tracking-tighter">100%</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">High Data Reliability</div>
                </div>
              </div>
            </div>
            
            <div className="reveal transition-all duration-1000 transform opacity-0 translate-x-12 delay-500">
              <div className="relative p-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl group">
                 <img 
                   src="https://cdn.prod.website-files.com/688223fb2d6a052d34e51263/688360c625f7f01603723a97_Frame%202147227072.avif" 
                   alt="Main Dashboard" 
                   className="w-full h-auto rounded-lg grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-[1.02]"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              <div className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-sm">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ff9c] mb-2">Main Dashboard</h4>
                 <p className="text-white/40 text-xs italic">A single source of truth for your trading activity. Understand what’s working, what isn’t, and why — across sessions, days, and setups.</p>
              </div>
            </div>
          </div>
        </DotBackground>
      </section>

      <section id="analytics" className="relative py-32 px-6 bg-black border-b border-white/5">
        <DotBackground className="py-20" dotColor="#151515">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7 reveal transition-all duration-1000 transform opacity-0 -translate-y-8">
                <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                  <img 
                    src="https://cdn.prod.website-files.com/688223fb2d6a052d34e51263/689b6bfe5d6d7699bb30e433_Frame%202147227640.avif" 
                    alt="Log Trade Interface" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="lg:col-span-5 space-y-8 reveal transition-all duration-1000 transform opacity-0 translate-y-8 delay-300">
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#00ff9c]/60">Trade Log Interface</div>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter">
                    <EncryptedText text="Log Trade" revealDelayMs={60} />
                  </h3>
                </div>
                <p className="text-white/40 text-lg leading-relaxed italic">
                  Capture every execution detail with precision. Record symbol, position size, entry, exit, stop loss, take profit, risk, and rule adherence to create a complete execution record for every trade.
                </p>
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4">Post-Trade Review System</div>
                  <ul className="space-y-5">
                    {[
                      'Execution & Rule Compliance Tracking',
                      'Emotional State Tagging',
                      'Structured Post-Trade Reflection'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-4 text-white/60 text-[11px] font-bold uppercase tracking-[0.3em]">
                        <div className="w-1.5 h-1.5 bg-[#00ff9c] shadow-[0_0_8px_#00ff9c]"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DotBackground>
      </section>

      <section id="methodology" className="relative py-32 px-6 bg-[#050505] overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#00ff9c]/[0.02] -skew-x-12 translate-x-20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-8 order-2 lg:order-1 reveal transition-all duration-1000 transform opacity-0 -translate-x-12">
              <div className="flex items-center gap-3">
                 <Activity className="w-6 h-6 text-[#00ff9c]" />
                 <span className="text-[10px] text-[#00ff9c] font-black uppercase tracking-[0.5em]">Statistics Core</span>
              </div>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                <EncryptedText text="Performance Intelligence Engine" revealDelayMs={30} />
              </h2>
              <p className="text-white/40 text-lg leading-relaxed italic">
                Generate structured performance reports filtered by date range, trading session, setup type, and execution quality. Tradevo helps you identify patterns in behavior — not just numbers.
              </p>
              <div className="pt-6">
                <HoverBorderGradient
                  as={Link}
                  to="/signup"
                  containerClassName="rounded-sm"
                  className="bg-black text-[#00ff9c] border border-[#00ff9c]/30 flex items-center justify-center px-8 h-12 text-xs font-bold tracking-widest uppercase"
                >
                  View Sample Reports
                </HoverBorderGradient>
              </div>
            </div>
            
            <div className="lg:col-span-7 order-1 lg:order-2 reveal transition-all duration-1000 transform opacity-0 translate-x-12 delay-400">
               <div className="relative group">
                  <div className="absolute -inset-1 bg-[#00ff9c]/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="relative rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                    <img 
                      src="https://cdn.prod.website-files.com/688223fb2d6a052d34e51263/688361a0104ac3b4423b354e_Frame%202147227071.avif" 
                      alt="Statistics Overview" 
                      className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 border border-white/10 rounded-sm">
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Statistics Overview</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/5 bg-black relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-4 grayscale opacity-40">
            <div className="w-5 h-5 border-2 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white"></div>
            </div>
            <span className="text-base font-black tracking-tighter uppercase italic">Tradevo</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-bold">&copy; 2026 TRADEVO SYSTEMS. ALL RIGHTS RESERVED.</div>
          <div className="flex space-x-12 text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">
            <a href="#" className="hover:text-[#00ff9c] transition-colors">Risk Disclosure</a>
            <a href="#" className="hover:text-[#00ff9c] transition-colors">System Protocol</a>
          </div>
        </div>
      </footer>
      <style>{`
        .reveal { transition: all 1s cubic-bezier(0.17, 0.55, 0.55, 1); }
        .reveal-active { opacity: 1 !important; transform: translate(0, 0) scale(1) !important; }
      `}</style>
    </main>
  );
};

export default LandingPage;
