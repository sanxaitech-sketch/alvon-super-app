import React, { useState, useEffect } from 'react';
import { UserProfile, Product, CartItem, Post, Transaction, ActiveTab } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Categories } from './components/Categories';
import { BannerCarousel } from './components/BannerCarousel';
import { AlvonPay } from './components/AlvonPay';
import { AlvonMart } from './components/AlvonMart';
import { AlvonSocial } from './components/AlvonSocial';
import { AlvonKhata } from './components/AlvonKhata';
import { GlassCard } from './components/GlassCard';
import { LegalModal } from './components/LegalModal';
import { MegaDashboard } from './components/MegaDashboard';
import { auth } from './lib/firebaseClient';
import { AlvonAuth } from './components/AlvonAuth';
import { AlvonVault } from './components/AlvonVault';
import { 
  Sparkles, Wallet, Send, ShoppingBag, ArrowRight, ShieldCheck, 
  Smartphone, Zap, HelpCircle, Gift, ArrowUpRight, ArrowDownLeft, Sliders, CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Dynamic routing / Lazy loading for sub-sections
const AlvonBrowser = React.lazy(() => import('./components/AlvonBrowser').then(module => ({ default: module.AlvonBrowser })));
const AlvonSmartHub = React.lazy(() => import('./components/AlvonSmartHub').then(module => ({ default: module.AlvonSmartHub })));
const AlvonLearning = React.lazy(() => import('./components/AlvonLearning').then(module => ({ default: module.AlvonLearning })));
const AlvonMap = React.lazy(() => import('./components/AlvonMap').then(module => ({ default: module.AlvonMap })));

export default function App() {
  // Global Shared User Profile State
  const [user, setUser] = useState<UserProfile>({
    name: 'Jane Alvon User',
    phone: '+1 (555) 492-0199',
    walletBalance: 148.50,
    alvonCoins: 380,
    activePlan: 'Alvon Premium 5G - Unlimited Calls',
    dataUsed: 0.6,
    dataLimit: 2.0,
    daysRemaining: 24,
  });

  // Active view tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Smart Recharge states
  const [rechargePhone, setRechargePhone] = useState('9876543210');
  const [rechargeOperator, setRechargeOperator] = useState('Jio');

  // Prefilled transfer details from Khata payment requests
  const [prefillRecipient, setPrefillRecipient] = useState('');
  const [prefillAmount, setPrefillAmount] = useState('');

  const handlePreFillPay = (phone: string, amount: string) => {
    setPrefillRecipient(phone);
    setPrefillAmount(amount);
  };
  
  // Global Theme Mode State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
  
  // Firebase Auth user states
  const [fbUser, setFbUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Toggle theme mode
  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Sync theme changes with DOM documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle Firebase Auth Sign-out
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setFbUser(null);
      // Reset profile data to guest defaults
      setUser({
        name: 'Jane Alvon User',
        phone: '+1 (555) 492-0199',
        walletBalance: 148.50,
        alvonCoins: 380,
        activePlan: 'Alvon Premium 5G - Unlimited Calls',
        dataUsed: 0.6,
        dataLimit: 2.0,
        daysRemaining: 24,
      });
      setTransactions([
        { id: 'TXN-90210', title: 'Alvon Super Saver Recharge', type: 'debit', amount: 49.99, date: '2026-07-17', category: 'recharge' },
        { id: 'TXN-88123', title: 'Alvon Coins Reward Cash', type: 'credit', amount: 15.00, date: '2026-07-16', category: 'reward' },
        { id: 'TXN-73412', title: 'Refund Alvon Mart Cancelled Item', type: 'credit', amount: 24.99, date: '2026-07-15', category: 'refund' },
      ]);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // Sync with Firestore database / API on load and Auth state change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setFbUser(firebaseUser);
      setAuthLoading(false);

      const targetUserId = firebaseUser ? firebaseUser.uid : 'jane-alvon';
      const fallbackName = firebaseUser ? (firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Verified Alvon User") : "Jane Alvon User";
      const fallbackPhone = firebaseUser ? (firebaseUser.phoneNumber || "9876543210") : "+1 (555) 492-0199";

      setUser(prev => ({
        ...prev,
        name: fallbackName,
        phone: fallbackPhone,
      }));

      fetch(`/api/user/get-or-create?userId=${targetUserId}&name=${encodeURIComponent(fallbackName)}&phone=${encodeURIComponent(fallbackPhone)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setUser({
              name: data.name || fallbackName,
              phone: data.phone || fallbackPhone,
              walletBalance: data.walletBalance ?? 2500,
              alvonCoins: data.alvonCoins ?? 12000,
              activePlan: data.activePlan || "Alvon True 5G Daily",
              dataUsed: data.dataUsed ?? 0.6,
              dataLimit: data.dataLimit ?? 2.0,
              daysRemaining: data.daysRemaining ?? 24
            });
          }
        })
        .catch((err) => console.error("Error loading user profile:", err));

      fetch(`/api/transactions?userId=${targetUserId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setTransactions(data.map((tx: any) => ({
              id: tx.id,
              title: tx.title,
              type: tx.type,
              amount: tx.amount,
              date: tx.timestamp ? tx.timestamp.split("T")[0] : tx.date || new Date().toISOString().split("T")[0],
              category: tx.category
            })));
          }
        })
        .catch((err) => console.error("Error loading transactions:", err));
    });

    return () => unsubscribe();
  }, []);

  // Legal modal states
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy' | 'compliance'>('terms');

  const handleOpenLegal = (tab: 'terms' | 'privacy' | 'compliance') => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  // Interactive items searching query (passed to sub-components if needed)
  const [searchQuery, setSearchQuery] = useState('');

  // Transactions ledger history
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'TXN-90210', title: 'Alvon Super Saver Recharge', type: 'debit', amount: 49.99, date: '2026-07-17', category: 'recharge' },
    { id: 'TXN-88123', title: 'Alvon Coins Reward Cash', type: 'credit', amount: 15.00, date: '2026-07-16', category: 'reward' },
    { id: 'TXN-73412', title: 'Refund Alvon Mart Cancelled Item', type: 'credit', amount: 24.99, date: '2026-07-15', category: 'refund' },
  ]);

  // Alvon Mart shopping cart basket state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Alvon Social community timeline posts state
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'p1',
      author: 'Alex Rivera',
      avatar: 'AR',
      time: '15m ago',
      content: 'Just set up my new Alvon GigaRouter Pro 5G. Reached download speeds of over 1.2 Gbps in the middle of Seattle! This speed is absolutely game-changing 🚀📶 #AlvonTrue5G #SuperApp',
      image: '📶',
      likes: 142,
      commentsCount: 3,
      liked: false,
      comments: [
        { author: 'Samantha K', text: 'Thats incredible! How much is the router?' },
        { author: 'Jane Alvon User', text: 'Insane speed Alex, congrats!' }
      ]
    },
    {
      id: 'p2',
      author: 'Chloe Simmons',
      avatar: 'CS',
      time: '2h ago',
      content: 'Highly recommend Alvon Mart! Ordered fresh avocados, organic honey, and some groceries this morning. Delivered straight to my apartment in 35 minutes! 🥑🍯 #AlvonMart #FreshDelivery',
      image: '🥑',
      likes: 95,
      commentsCount: 1,
      liked: false,
      comments: [
        { author: 'David Beckham', text: 'Delivery is insanely fast!' }
      ]
    }
  ]);

  // Handle Search Callback
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSyncUser = (updatedUser: any, newTxns?: any[]) => {
    setUser({
      name: updatedUser.name || "Jane Alvon User",
      phone: updatedUser.phone || "9876543210",
      walletBalance: updatedUser.walletBalance ?? 2500,
      alvonCoins: updatedUser.alvonCoins ?? 12000,
      activePlan: updatedUser.activePlan || "Alvon True 5G Daily",
      dataUsed: updatedUser.dataUsed ?? 0.6,
      dataLimit: updatedUser.dataLimit ?? 2.0,
      daysRemaining: updatedUser.daysRemaining ?? 24
    });
    if (newTxns && Array.isArray(newTxns)) {
      setTransactions(newTxns);
    } else {
      fetch("/api/transactions?userId=jane-alvon")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setTransactions(data.map((tx: any) => ({
              id: tx.id,
              title: tx.title,
              type: tx.type,
              amount: tx.amount,
              date: tx.timestamp ? tx.timestamp.split("T")[0] : tx.date || new Date().toISOString().split("T")[0],
              category: tx.category
            })));
          }
        });
    }
  };

  const handleUpdateUser = (updatedFields: Partial<UserProfile>) => {
    setUser((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  // Callback to change tab (useful from inside banners or header)
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // PAY LOGIC: Mobile Recharge
  const handleRecharge = (amount: number, planName: string): boolean => {
    if (user.walletBalance < amount) return false;

    setUser((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance - amount,
      alvonCoins: prev.alvonCoins + (amount > 30 ? 60 : 20),
      activePlan: planName,
      dataUsed: 0, // Reset data quota
      daysRemaining: 30, // Reset validity
    }));

    const newTx: Transaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      title: `Plan Recharge: ${planName}`,
      type: 'debit',
      amount,
      date: new Date().toISOString().split('T')[0],
      category: 'recharge',
    };

    setTransactions((prev) => [newTx, ...prev]);
    return true;
  };

  // PAY LOGIC: Send/Transfer cash
  const handleTransfer = (amount: number, recipient: string): boolean => {
    if (user.walletBalance < amount) return false;

    setUser((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance - amount,
      alvonCoins: prev.alvonCoins + 10, // Small contribution reward
    }));

    const newTx: Transaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      title: `Sent to ${recipient}`,
      type: 'debit',
      amount,
      date: new Date().toISOString().split('T')[0],
      category: 'transfer',
    };

    setTransactions((prev) => [newTx, ...prev]);
    return true;
  };

  // MART LOGIC: Add to Basket
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // MART LOGIC: Remove item completely
  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // MART LOGIC: Increase/decrease quantity
  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // MART LOGIC: Checkout & pay
  const handleCheckout = (): boolean => {
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    if (user.walletBalance < total) return false;

    setUser((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance - total,
      alvonCoins: prev.alvonCoins + Math.round(total * 0.15), // 15% cashback coins
    }));

    const newTx: Transaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      title: 'Alvon Mart Superstore',
      type: 'debit',
      amount: total,
      date: new Date().toISOString().split('T')[0],
      category: 'shopping',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setCart([]); // Empty basket
    return true;
  };

  // SOCIAL LOGIC: Toggle Post Liking with nice feedback
  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            liked: !p.liked,
            likes: p.liked ? p.likes - 1 : p.likes + 1,
          };
        }
        return p;
      })
    );
  };

  // SOCIAL LOGIC: Post user update
  const handleAddPost = (content: string, image?: string) => {
    const newPost: Post = {
      id: `p-${Date.now()}`,
      author: user.name,
      avatar: user.name.substring(0, 2).toUpperCase(),
      time: 'Just now',
      content,
      image,
      likes: 0,
      commentsCount: 0,
      liked: false,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    // Reward user with 10 Coins
    setUser((prev) => ({
      ...prev,
      alvonCoins: prev.alvonCoins + 10,
    }));
  };

  // SOCIAL LOGIC: Add a comment in real-time
  const handleAddComment = (postId: string, commentText: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...p.comments, { author: user.name, text: commentText }],
          };
        }
        return p;
      })
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-6">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600 mb-4" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono tracking-wider">SECURELY LOADING SYSTEM AUTHENTICATION CREDENTIALS...</p>
      </div>
    );
  }

  if (!fbUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <AlvonAuth />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24 lg:pb-0 transition-colors duration-300" id="main-super-app">
      
      {/* Header component */}
      <Header 
        user={user} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        onSearch={handleSearch} 
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSignOut={handleSignOut}
      />

      {/* Main responsive grid: Sidebar on desktop, main container centered */}
      <div className="flex w-full max-w-7xl mx-auto">
        
        {/* Sidebar Component */}
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} user={user} onOpenLegal={handleOpenLegal} />

        {/* Content Panel */}
        <main className="flex-1 px-4 lg:px-8 py-6 max-w-full overflow-hidden space-y-6">
          
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home-dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="max-w-md mx-auto py-8"
              >
                <GlassCard className="bg-white/90 dark:bg-slate-900/95 p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-3xl flex flex-col items-center text-center space-y-6">
                  {/* Profile Picture */}
                  <div className="relative">
                    {fbUser.photoURL ? (
                      <img 
                        src={fbUser.photoURL} 
                        alt={fbUser.displayName || user.name} 
                        className="w-24 h-24 rounded-full border-4 border-rose-500/30 object-cover shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-blue-600 p-1 shadow-md">
                        <div className="w-full h-full bg-white dark:bg-slate-950 rounded-full flex items-center justify-center font-black text-3xl text-slate-800 dark:text-slate-100 font-display uppercase">
                          {(fbUser.displayName || user.name || "U").substring(0, 2)}
                        </div>
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 font-display">
                      {fbUser.displayName || user.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
                      {fbUser.email || "No email connected"}
                    </p>
                    {fbUser.phoneNumber && (
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        {fbUser.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div className="w-full border-t border-slate-100 dark:border-slate-800/80 pt-6 flex flex-col space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-left">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block mb-1">
                        Security Status
                      </span>
                      <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Authenticated Entry Verified</span>
                      </p>
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wider font-mono"
                    >
                      Logout Account
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'smarthub' && (
              <motion.div
                key="smarthub-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <React.Suspense fallback={<div className="py-20 text-center text-slate-400 font-mono text-xs font-bold animate-pulse">LOADING ALVON SMART TOOLS...</div>}>
                  <AlvonSmartHub />
                </React.Suspense>
              </motion.div>
            )}

            {activeTab === 'khata' && (
              <motion.div
                key="khata-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <AlvonKhata 
                  onTabChange={handleTabChange} 
                  onPreFillPay={handlePreFillPay}
                />
              </motion.div>
            )}

            {activeTab === 'vault' && (
              <motion.div
                key="vault-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <AlvonVault onTabChange={handleTabChange} />
              </motion.div>
            )}
          </AnimatePresence>

        </main>

      </div>

      {/* Fixed Bottom Navigation for mobile screens */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Regulatory Legal desk modal */}
      <LegalModal 
        isOpen={legalModalOpen} 
        onClose={() => setLegalModalOpen(false)} 
        initialTab={legalModalTab} 
      />

    </div>
  );
}
