import React from 'react';
import { Wallet, ShoppingBag, Users, Coins, HelpCircle, Sparkles, AppWindow, Globe, Cpu, BookOpen, GraduationCap, Map } from 'lucide-react';
import { ActiveTab } from '../types';
import { motion } from 'motion/react';

interface CategoriesProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Categories: React.FC<CategoriesProps> = ({
  activeTab,
  onTabChange,
}) => {
  const categories = [
    {
      id: 'home' as ActiveTab,
      label: 'Home Feed',
      desc: 'All-in-one',
      icon: AppWindow,
      gradient: 'from-rose-500 to-rose-600',
      shadowColor: 'shadow-rose-500/20',
      textColor: 'text-rose-600',
    },
    {
      id: 'learning' as ActiveTab,
      label: 'AI & Learning',
      desc: 'Multi-AI & Books',
      icon: GraduationCap,
      gradient: 'from-rose-600 to-rose-700',
      shadowColor: 'shadow-rose-600/20',
      textColor: 'text-rose-600',
    },
    {
      id: 'map' as ActiveTab,
      label: 'Alvon Map',
      desc: 'GPS & CSC Locator',
      icon: Map,
      gradient: 'from-rose-600 to-indigo-600',
      shadowColor: 'shadow-rose-600/20',
      textColor: 'text-rose-600',
    },
    {
      id: 'pay' as ActiveTab,
      label: 'Alvon Pay',
      desc: 'Recharge & UPI',
      icon: Wallet,
      gradient: 'from-blue-600 to-indigo-600',
      shadowColor: 'shadow-blue-600/20',
      textColor: 'text-blue-700',
    },
    {
      id: 'khata' as ActiveTab,
      label: 'Alvon Khata',
      desc: 'Digital Ledger',
      icon: BookOpen,
      gradient: 'from-rose-600 to-pink-600',
      shadowColor: 'shadow-rose-600/20',
      textColor: 'text-rose-600',
    },
    {
      id: 'browser' as ActiveTab,
      label: 'Alvon Search',
      desc: 'AI Web Browser',
      icon: Globe,
      gradient: 'from-cyan-500 to-blue-600',
      shadowColor: 'shadow-cyan-500/20',
      textColor: 'text-cyan-700',
    },
    {
      id: 'smarthub' as ActiveTab,
      label: 'Smart Hub',
      desc: '100+ E-mitra Tools',
      icon: Cpu,
      gradient: 'from-rose-500 to-indigo-600',
      shadowColor: 'shadow-rose-500/20',
      textColor: 'text-rose-700',
    },
    {
      id: 'mart' as ActiveTab,
      label: 'Alvon Mart',
      desc: 'Grocery & Shop',
      icon: ShoppingBag,
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/20',
      textColor: 'text-emerald-700',
    },
    {
      id: 'social' as ActiveTab,
      label: 'Alvon Social',
      desc: 'Stories & Chat',
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
      shadowColor: 'shadow-purple-500/20',
      textColor: 'text-purple-700',
    },
    {
      id: 'profile' as ActiveTab,
      label: 'Alvon Care',
      desc: 'Support & Help',
      icon: HelpCircle,
      gradient: 'from-orange-500 to-amber-600',
      shadowColor: 'shadow-orange-500/20',
      textColor: 'text-orange-700',
    },
  ];

  return (
    <div className="w-full space-y-3" id="scrollable-categories">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-display">
            Quick Hub
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Swipe for more →</span>
      </div>

      {/* Horizontal Scroll container with no visible scrollbars */}
      <div className="flex items-center space-x-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar scroll-smooth">
        {categories.map((cat, index) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;

          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(cat.id)}
              className={`flex-none w-36 sm:w-40 flex items-center p-3 rounded-xl bg-white border cursor-pointer transition-all ${
                isActive
                  ? 'border-rose-600 bg-rose-50/10'
                  : 'border-slate-100 hover:border-slate-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3 w-full">
                {/* Visual Icon with clean flat background */}
                <div className={`w-9 h-9 rounded-xl ${
                  isActive ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-600 border border-slate-100'
                } flex items-center justify-center shrink-0 transition-colors`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                {/* Details */}
                <div className="text-left overflow-hidden">
                  <p className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-rose-600' : 'text-slate-800'}`}>
                    {cat.label}
                  </p>
                  <p className="text-[9px] text-slate-400 leading-none mt-1 font-mono truncate">
                    {cat.desc}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
