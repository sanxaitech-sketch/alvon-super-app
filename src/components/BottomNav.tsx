import React from 'react';
import { Home, Cpu, BookOpen, Lock } from 'lucide-react';
import { ActiveTab } from '../types';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home, color: 'text-rose-500' },
    { id: 'smarthub' as ActiveTab, label: 'Smart Tools', icon: Cpu, color: 'text-cyan-500' },
    { id: 'khata' as ActiveTab, label: 'Khata', icon: BookOpen, color: 'text-rose-600' },
    { id: 'vault' as ActiveTab, label: 'Secure Vault', icon: Lock, color: 'text-emerald-500' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-850 px-2 py-2 z-40 flex justify-around items-center shadow-lg pb-safe-bottom">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center justify-center flex-1 py-1 relative focus:outline-none cursor-pointer"
          >
            {/* Soft indicator dot or ring for active tab */}
            {isActive && (
              <motion.div
                layoutId="bottom-nav-active"
                className="absolute -top-1 w-10 h-0.5 bg-rose-600 rounded-full"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}

            <div className={`p-1.5 rounded-xl transition-all ${
              isActive 
                ? 'bg-slate-100 dark:bg-slate-800 text-rose-600' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}>
              <Icon className={`w-5.5 h-5.5 ${isActive ? tab.color : 'text-slate-500 dark:text-slate-400'}`} />
            </div>

            <span className={`text-[10px] mt-0.5 font-medium ${
              isActive ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
