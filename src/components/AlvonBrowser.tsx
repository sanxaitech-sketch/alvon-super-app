import React, { useState, useEffect } from 'react';
import { 
  Search, Globe, ArrowLeft, ArrowRight, RotateCw, Home, Sparkles, 
  ExternalLink, ArrowUpRight, Cpu, Wallet, ShoppingBag, Users, HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';

interface AlvonBrowserProps {
  onTabChange: (tab: any) => void;
}

interface WebResult {
  title: string;
  uri: string;
}

export const AlvonBrowser: React.FC<AlvonBrowserProps> = ({ onTabChange }) => {
  const [url, setUrl] = useState('https://search.alvon.net');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [history, setHistory] = useState<string[]>(['https://search.alvon.net']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [webSources, setWebSources] = useState<WebResult[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick navigation bookmarks
  const bookmarks = [
    { name: 'Alvon Search', url: 'https://search.alvon.net', icon: Globe, isInternal: false },
    { name: 'Alvon Pay Portal', tab: 'pay', icon: Wallet, isInternal: true, desc: 'Send money, recharge 5G' },
    { name: 'Alvon Mart Store', tab: 'mart', icon: ShoppingBag, isInternal: true, desc: 'Order groceries & electronics' },
    { name: 'Alvon Social Feed', tab: 'social', icon: Users, isInternal: true, desc: 'Stories, posts & chat' },
    { name: 'Wikipedia', url: 'https://en.wikipedia.org', icon: Globe, isInternal: false },
    { name: 'E-Mitra Portal', url: 'https://emitra.rajasthan.gov.in', icon: Cpu, isInternal: false, desc: 'Government online services' }
  ];

  // Internal app features keywords matching
  const [internalMatch, setInternalMatch] = useState<{
    tab: string;
    title: string;
    desc: string;
    icon: any;
  } | null>(null);

  // Analyze query for super-app internal matches
  useEffect(() => {
    if (!currentQuery) {
      setInternalMatch(null);
      return;
    }

    const q = currentQuery.toLowerCase();
    if (q.includes('pay') || q.includes('recharge') || q.includes('money') || q.includes('transfer') || q.includes('send') || q.includes('wallet') || q.includes('bank')) {
      setInternalMatch({
        tab: 'pay',
        title: 'Alvon Pay Payment Hub',
        desc: 'Recharge your 5G cellular plan, send money instantly, or view transactions.',
        icon: Wallet
      });
    } else if (q.includes('mart') || q.includes('shop') || q.includes('buy') || q.includes('grocery') || q.includes('router') || q.includes('avocado') || q.includes('electronics') || q.includes('order')) {
      setInternalMatch({
        tab: 'mart',
        title: 'Alvon Mart Shopping Store',
        desc: 'Browse exclusive cellular devices, routers, fresh organic groceries, and more with instant delivery.',
        icon: ShoppingBag
      });
    } else if (q.includes('social') || q.includes('post') || q.includes('story') || q.includes('feed') || q.includes('friend') || q.includes('community')) {
      setInternalMatch({
        tab: 'social',
        title: 'Alvon Social Community network',
        desc: 'Post stories, like posts, and interact with the Alvon community timeline.',
        icon: Users
      });
    } else if (q.includes('care') || q.includes('support') || q.includes('help') || q.includes('chat') || q.includes('bot') || q.includes('alvoncare')) {
      setInternalMatch({
        tab: 'profile',
        title: 'AlvonCare AI Chat Bot Support',
        desc: 'Access standard 24/7 client support for transactions, telecom plan, and order delivery.',
        icon: HelpCircle
      });
    } else if (q.includes('smart') || q.includes('hub') || q.includes('tool') || q.includes('pdf') || q.includes('calculator') || q.includes('gst') || q.includes('age')) {
      setInternalMatch({
        tab: 'smarthub',
        title: 'Alvon Smart Hub App Store',
        desc: 'Open the App Store for creator and E-mitra utilities (GST Calculator, PDF converter, Age Calculator).',
        icon: Cpu
      });
    } else {
      setInternalMatch(null);
    }
  }, [currentQuery]);

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setSearchResult(null);
    setWebSources([]);
    setCurrentQuery(searchQuery);

    const searchUrl = `https://search.alvon.net/search?q=${encodeURIComponent(searchQuery)}`;
    setUrl(searchUrl);
    
    // Add to history
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, searchUrl]);
    setHistoryIndex(nextHistory.length);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch search results from server.');
      }

      const data = await res.json();
      setSearchResult(data.text);
      setWebSources(data.groundingMetadata || data.groundingChunks || []);
      setIsDemo(!!data.isDemo);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToUrl = (targetUrl: string) => {
    setUrl(targetUrl);
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, targetUrl]);
    setHistoryIndex(nextHistory.length);
    
    // Reset search results if navigating away from search
    if (!targetUrl.startsWith('https://search.alvon.net/search')) {
      setSearchResult(null);
      setWebSources([]);
      setCurrentQuery('');
      setSearchQuery('');
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const prevUrl = history[prevIndex];
      setUrl(prevUrl);
      if (prevUrl === 'https://search.alvon.net') {
        setSearchResult(null);
        setCurrentQuery('');
        setSearchQuery('');
      }
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextUrl = history[nextIndex];
      setUrl(nextUrl);
    }
  };

  const handleRefresh = () => {
    if (currentQuery) {
      handleSearchSubmit();
    } else {
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="space-y-6" id="alvon-browser-section">
      
      {/* Dynamic Browser frame and controls */}
      <GlassCard className="bg-white/80 p-0 overflow-hidden border border-slate-100/80 shadow-md rounded-2xl" hoverEffect={false}>
        
        {/* Browser Header Bar */}
        <div className="bg-slate-50 border-b border-slate-200/40 p-3.5 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleBack}
              disabled={historyIndex === 0}
              className={`p-2 rounded-xl border border-slate-200/50 transition-all ${
                historyIndex === 0 ? 'text-slate-300 bg-slate-50' : 'text-slate-600 hover:bg-slate-100/60 bg-white shadow-sm'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleForward}
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded-xl border border-slate-200/50 transition-all ${
                historyIndex >= history.length - 1 ? 'text-slate-300 bg-slate-50' : 'text-slate-600 hover:bg-slate-100/60 bg-white shadow-sm'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={handleRefresh}
              className="p-2 rounded-xl border border-slate-200/50 text-slate-600 hover:bg-slate-100/60 bg-white shadow-sm transition-all"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => navigateToUrl('https://search.alvon.net')}
              className="p-2 rounded-xl border border-slate-200/50 text-slate-600 hover:bg-slate-100/60 bg-white shadow-sm transition-all"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* URL bar */}
          <div className="w-full flex items-center bg-white border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs text-slate-500 font-mono shadow-inner select-none truncate">
            <Globe className="w-3.5 h-3.5 text-rose-500 mr-2 shrink-0" />
            <span className="text-slate-800 font-medium truncate">{url}</span>
          </div>

          {/* Connected state badge */}
          <div className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-bold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>ALVON PROXY</span>
          </div>
        </div>

        {/* Browser viewport area */}
        <div className="p-6 bg-slate-50/40 min-h-[500px]">
          
          {url === 'https://search.alvon.net' ? (
            /* Home Search portal */
            <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center space-y-8">
              
              {/* Alvon Search Logo */}
              <div className="text-center space-y-1.5">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-4xl">🔴</span>
                  <h2 className="text-3xl font-black tracking-tighter font-display text-slate-800">
                    Alvon<span className="text-blue-600">Search</span>
                  </h2>
                  <span className="text-4xl">🔵</span>
                </div>
                <p className="text-xs font-mono font-bold text-rose-500 uppercase tracking-widest leading-none">
                  AI-Powered Global Engine
                </p>
              </div>

              {/* Central Search Bar */}
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask anything, find web results, or open super app features..."
                  className="w-full pl-12 pr-28 py-3.5 bg-white border border-slate-200 shadow-sm rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-sm font-medium transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-5 py-2 bg-gradient-to-r from-rose-600 to-blue-600 hover:from-rose-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow"
                >
                  Search
                </button>
              </form>

              {/* Bookmark Grid */}
              <div className="w-full space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Quick Shortcuts</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {bookmarks.map((b, idx) => {
                    const Icon = b.icon;
                    return (
                      <div 
                        key={idx}
                        onClick={() => {
                          if (b.isInternal) {
                            onTabChange(b.tab);
                          } else if (b.url) {
                            navigateToUrl(b.url);
                          }
                        }}
                        className="p-3.5 bg-white hover:bg-rose-50/20 border border-slate-100 hover:border-rose-200 rounded-xl cursor-pointer transition-all shadow-sm flex flex-col justify-between h-24"
                      >
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-lg bg-slate-50 text-rose-600">
                            <Icon className="w-4 h-4" />
                          </div>
                          {b.isInternal ? (
                            <span className="bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono">SuperApp</span>
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight truncate">{b.name}</p>
                          {b.desc && <p className="text-[9px] text-slate-400 truncate mt-0.5">{b.desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            /* Search results view */
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Top search bar inline */}
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search query..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 text-xs font-medium transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-xl transition-all"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </form>

              {/* Dynamic Search Results Output */}
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-16 flex flex-col items-center justify-center space-y-3"
                  >
                    <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-mono text-slate-400 font-bold animate-pulse">ALVON AI SEARCH ENGINE GROUNDING RETRIEVING...</p>
                  </motion.div>
                ) : error ? (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl flex items-start space-x-2.5"
                  >
                    <HelpCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Search Failure</p>
                      <p className="text-[11px] mt-0.5">{error}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="results"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* 1. INTERNAL APP FEATURE MATCH (SUPER APP SPECIAL SHORTCUT CARD) */}
                    {internalMatch && (
                      <GlassCard className="bg-gradient-to-r from-rose-50 to-blue-50/40 p-4 border border-rose-200/50 shadow-sm" hoverEffect={true}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-600 to-blue-600 text-white shadow-sm">
                              <internalMatch.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[9px] bg-rose-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">Alvon SuperApp Shortcut</span>
                              <h4 className="text-sm font-bold text-slate-800 mt-0.5">{internalMatch.title}</h4>
                            </div>
                          </div>
                          <button
                            onClick={() => onTabChange(internalMatch.tab)}
                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-sm"
                          >
                            Open Now
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 ml-14 leading-relaxed">{internalMatch.desc}</p>
                      </GlassCard>
                    )}

                    {/* 2. GEMINI AI OVERVIEW / ANSWER BOX */}
                    {searchResult && (
                      <div className="relative">
                        {/* Elegant glowing gradient outline */}
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-rose-500 via-white to-blue-500 rounded-2xl -z-10 blur-sm opacity-60"></div>
                        
                        <GlassCard className="bg-white/95 p-5 border border-slate-100" hoverEffect={false}>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center space-x-2 text-rose-600">
                              <Sparkles className="w-4 h-4 animate-pulse" />
                              <span className="text-xs font-bold font-display uppercase tracking-tight">Alvon AI Overview</span>
                            </div>
                            {isDemo && (
                              <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-mono font-bold">
                                DEMO MODE
                              </span>
                            )}
                          </div>
                          
                          {/* Answer text */}
                          <div className="mt-4 text-xs text-slate-600 leading-relaxed space-y-3 font-medium whitespace-pre-wrap">
                            {searchResult}
                          </div>

                          {/* Grounding Web Sources Links */}
                          {webSources.length > 0 && (
                            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                                Web Reference Sources
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {webSources.map((source, sIdx) => (
                                  <a
                                    key={sIdx}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    referrerPolicy="no-referrer"
                                    className="px-3 py-1.5 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 text-[10px] text-slate-600 hover:text-rose-600 rounded-lg flex items-center space-x-1.5 transition-all max-w-[240px]"
                                  >
                                    <span className="truncate max-w-[160px] font-bold">{source.title || 'Source'}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </GlassCard>
                      </div>
                    )}

                    {/* Standard browser search items if any */}
                    {!searchResult && !internalMatch && !loading && (
                      <div className="text-center py-10 text-slate-400">
                        <Globe className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs">Type your query in the search box to begin web search grounding.</p>
                      </div>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

        </div>
      </GlassCard>
    </div>
  );
};
