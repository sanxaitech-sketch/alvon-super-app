import React from 'react';
import { Home, Cpu, BookOpen, Shield } from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  user: UserProfile;
  onOpenLegal?: (tab: 'terms' | 'privacy' | 'compliance') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  user,
  onOpenLegal,
}) => {
  const navItems = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home, badge: null, color: 'text-rose-500' },
    { id: 'smarthub' as ActiveTab, label: 'Smart Tools', icon: Cpu, badge: 'OFFLINE', color: 'text-rose-600' },
    { id: 'khata' as ActiveTab, label: 'Alvon Khata', icon: BookOpen, badge: 'SYNC', color: 'text-rose-600' },
    { id: 'vault' as ActiveTab, label: 'Secure Vault', icon: Shield, badge: 'PIN', color: 'text-rose-500' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border-r border-slate-100 dark:border-slate-800 min-h-[calc(100vh-73px)] sticky top-[73px] p-5 shrink-0 select-none justify-between">
      
      {/* Primary Navigation */}
      <div className="space-y-6">
        <div className="px-3">
          <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">Main Services</span>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all relative overflow-hidden cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {/* Background active pill with solid crimson brand color */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-rose-600 -z-10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : `${item.color} group-hover:scale-105 duration-200`
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-sans shrink-0 border ${
                    isActive 
                      ? 'bg-white/20 text-white border-transparent' 
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100/50 dark:border-rose-900/50'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Support & Profile Summary */}
      <div className="space-y-4 pt-4 border-t border-slate-100/80 dark:border-slate-800">
        <div className="text-center space-y-1.5 text-slate-400 dark:text-slate-500">
          <span className="text-[9px] font-mono block">Alvon Super App © 2026</span>
          {onOpenLegal && (
            <div className="flex items-center justify-center space-x-2 text-[9px] font-bold text-rose-600 dark:text-rose-400">
              <button onClick={() => onOpenLegal('terms')} className="hover:underline cursor-pointer">Terms</button>
              <span className="text-slate-300 dark:text-slate-700 font-normal">•</span>
              <button onClick={() => onOpenLegal('privacy')} className="hover:underline cursor-pointer">Privacy</button>
              <span className="text-slate-300 dark:text-slate-700 font-normal">•</span>
              <button onClick={() => onOpenLegal('compliance')} className="hover:underline cursor-pointer">Compliance</button>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
};
