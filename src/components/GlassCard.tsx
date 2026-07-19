import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  id,
  children,
  className = '',
  hoverEffect = true,
  delay = 0,
}) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={hoverEffect ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={`bg-white/70 backdrop-blur-md border border-slate-100/80 rounded-2xl p-6 shadow-sm relative overflow-hidden ${className}`}
    >
      {/* Glossy highlight line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};
