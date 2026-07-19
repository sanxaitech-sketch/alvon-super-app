import React, { useState } from 'react';
import { Search, Bell, Coins, Wallet, Sparkles, LogOut, Check, Sun, Moon } from 'lucide-react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  user: UserProfile;
  activeTab: string;
  onTabChange: (tab: any) => void;
  onSearch: (query: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  onTabChange,
  onSearch,
  theme,
  onToggleTheme,
  onSignOut,
}) => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी', short: 'हिं' },
    { code: 'mr', label: 'मराठी', short: 'म' }
  ];

  const currentLanguage = languages.find(l => l.code === (i18n.language || 'en')) || languages[0];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const notifications = [
    { id: 1, title: 'Alvon Coins Received!', desc: '+50 Coins for using Alvon Pay', time: '10m ago', read: false },
    { id: 2, title: 'Mega Mart Sale Live 🛒', desc: 'Get 45% off on Electronics today only.', time: '2h ago', read: false },
    { id: 3, title: 'Recharge Successful', desc: 'Data limit reset. Enjoy 5G speed.', time: '1d ago', read: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100/80 dark:border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-all duration-300 text-slate-900 dark:text-slate-100">
      
      {/* Brand Logo - Clean Minimalism Accent */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('home')}>
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-rose-600 text-white font-extrabold text-lg font-display shadow-sm">
          A
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full flex items-center justify-center text-[7px] font-bold text-white border border-white">
            ★
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold font-display tracking-tight flex items-center leading-none">
            <span className="text-rose-600">My</span>
            <span className="text-slate-900 dark:text-white ml-1">Alvon</span>
          </h1>
          <div className="flex items-center space-x-1 mt-0.5">
            <span className="text-[9px] text-slate-400 font-mono tracking-wider font-bold uppercase">Super App</span>
            <span className="text-[8px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50 px-1 py-0.2 rounded font-extrabold font-mono flex items-center space-x-0.5">
              <span>🇮🇳</span>
              <span className="hidden sm:inline">🇮🇳 MADE IN INDIA</span>
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Search bar - Fits Pay, Mart, Social search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
        <Search className="absolute left-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={`Search Alvon ${activeTab === 'pay' ? 'Recharges & Pay' : activeTab === 'mart' ? 'Products & Grocery' : activeTab === 'social' ? 'Posts & Trends' : 'Services'}...`}
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50/70 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-850 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 border border-slate-200/50 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all"
        />
      </div>

      {/* Quick Stats & Action Items */}
      <div className="flex items-center space-x-3">

        {/* Premium Theme Toggle */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleTheme}
          className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all border border-slate-100 dark:border-slate-700 cursor-pointer flex items-center justify-center shadow-xs"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </motion.button>

        {/* Language Selection Dropdown */}
        <div className="relative">
          <motion.button 
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowLangMenu(!showLangMenu);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 rounded-xl cursor-pointer transition-all duration-300 text-slate-700 dark:text-slate-300"
          >
            <span className="text-xs">🌐</span>
            <span className="text-xs font-bold font-mono tracking-tight">{currentLanguage.short}</span>
          </motion.button>

          <AnimatePresence>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden py-1 z-50"
              >
                {languages.map((lng) => (
                  <button
                    key={lng.code}
                    onClick={() => {
                      i18n.changeLanguage(lng.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                      i18n.language === lng.code ? 'text-rose-600 bg-rose-50/30' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{lng.label}</span>
                    {i18n.language === lng.code && <Check className="w-3.5 h-3.5 text-rose-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Alvon Coins badge */}
        <motion.div 
          whileHover={{ y: -1 }}
          onClick={() => onTabChange('profile')}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 rounded-xl cursor-pointer transition-all duration-300 text-slate-700 dark:text-slate-300 shadow-xs"
        >
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold font-mono">{user.alvonCoins}</span>
          <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-1 rounded">Coins</span>
        </motion.div>

        {/* Alvon Wallet badge */}
        <motion.div 
          whileHover={{ y: -1 }}
          onClick={() => onTabChange('pay')}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 rounded-xl cursor-pointer transition-all duration-300 text-slate-700 dark:text-slate-300 shadow-xs"
        >
          <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold font-mono">${user.walletBalance.toFixed(2)}</span>
        </motion.div>

        {/* Notifications Button */}
        <div className="relative">
          <motion.button 
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors border border-slate-100 dark:border-slate-700 relative cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full" />
          </motion.button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Notifications</span>
                  <span className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-50 dark:border-slate-700 last:border-0 flex space-x-3 transition-colors cursor-pointer">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-rose-500" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{notif.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">{notif.desc}</p>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Avatar with drop-down */}
        <div className="relative">
          <motion.div 
            whileHover={{ y: -1 }}
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2 cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700"
          >
            <div className="w-6.5 h-6.5 rounded-lg bg-rose-100 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center font-bold text-[10px] text-rose-700 dark:text-rose-400">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <span className="hidden lg:inline text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">{user.name}</span>
          </motion.div>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-br from-rose-500/10 to-blue-500/10">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-tight">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{user.phone}</p>
                  <div className="mt-2 flex items-center space-x-2 bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm p-1.5 rounded-lg border border-white/80 dark:border-slate-700/80">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold tracking-tight">{user.activePlan}</span>
                  </div>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => { onTabChange('profile'); setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Manage Profile & Services
                  </button>
                  <button 
                    onClick={() => { onTabChange('pay'); setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Alvon Pay Transactions
                  </button>
                  <button 
                    onClick={() => { onTabChange('mart'); setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Order History
                  </button>
                  <div className="h-[1px] bg-slate-100 dark:bg-slate-700 my-1" />
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onSignOut) {
                        onSignOut();
                      } else {
                        alert('Log out simulated successfully!');
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </header>
  );
};
