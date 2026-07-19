import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Zap, ShoppingBag, Gift, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  desc: string;
  bgGradient: string;
  accentIcon: any;
  actionText: string;
  targetTab: 'pay' | 'mart' | 'social';
}

interface BannerCarouselProps {
  onActionClick: (tab: 'pay' | 'mart' | 'social') => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ onActionClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const banners: Banner[] = [
    {
      id: 1,
      title: 'Alvon True 5G Unleashed',
      subtitle: 'Unlimited Data • Ultra-Low Latency',
      badge: 'SPEED KING',
      desc: 'Experience pure 5G speed! Recharge for 84 days with our Blue-Core Premium pack at just $49.00 and get Alvon Prime benefits.',
      bgGradient: 'from-rose-600 to-rose-700',
      accentIcon: Zap,
      actionText: 'Recharge Now',
      targetTab: 'pay',
    },
    {
      id: 2,
      title: 'Alvon Mart Super Saver Week',
      subtitle: 'Flat 45% Off • 2-Hour Delivery',
      badge: 'MEGA SALE',
      desc: 'Order fresh groceries, daily organic essentials, and gourmet ingredients. Use coupon code ALVONMART at checkout.',
      bgGradient: 'from-slate-900 to-slate-950',
      accentIcon: ShoppingBag,
      actionText: 'Browse Stores',
      targetTab: 'mart',
    },
    {
      id: 3,
      title: 'Alvon Pay Cashbacks',
      subtitle: 'Zero Fee Bank Transfers',
      badge: 'DOUBLE CASHBACK',
      desc: 'Transfer money to any UPI or Mobile Number. Earn up to 200 Alvon Coins and scratch cards with assured brand rewards.',
      bgGradient: 'from-blue-600 to-indigo-700',
      accentIcon: Gift,
      actionText: 'Send Money',
      targetTab: 'pay',
    },
    {
      id: 4,
      title: 'Join Alvon Creator Hub',
      subtitle: 'Share Stories & Win iPad Pro',
      badge: 'CREATOR SPOTLIGHT',
      desc: 'Post your aesthetic daily moments on Alvon Social with #MyAlvon. The top 5 trending posts of the week win premium gadgets!',
      bgGradient: 'from-slate-800 to-slate-900',
      accentIcon: Star,
      actionText: 'Post Story',
      targetTab: 'social',
    },
  ];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  }, [banners.length]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  // Auto scroll banners
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [handleNext]);

  const activeBanner = banners[currentIndex];
  const IconComponent = activeBanner.accentIcon;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-100 shadow-sm" id="offers-carousel">
      
      <div className={`relative h-64 sm:h-72 w-full bg-gradient-to-r ${activeBanner.bgGradient} overflow-hidden flex flex-col justify-center px-6 sm:px-12 py-8 text-white transition-all duration-700`}>
        {/* Dynamic decorative backdrop particles */}
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-5 pointer-events-none bg-radial-gradient from-white to-transparent" />

        {/* Banner content */}
        <div className="max-w-xl relative z-10 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 bg-white/20 backdrop-blur-md text-white rounded-lg uppercase tracking-wider border border-white/10 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-yellow-300 animate-spin-slow" />
              <span>{activeBanner.badge}</span>
            </span>
            <span className="text-xs font-medium text-white/80 font-display hidden sm:inline">
              {activeBanner.subtitle}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight leading-tight">
            {activeBanner.title}
          </h2>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg hidden md:block">
            {activeBanner.desc}
          </p>
          <p className="text-xs text-white/90 leading-relaxed md:hidden line-clamp-2">
            {activeBanner.desc}
          </p>

          <div className="pt-2 flex items-center space-x-4">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onActionClick(activeBanner.targetTab)}
              className="px-6 py-2 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center space-x-2"
            >
              <IconComponent className="w-4 h-4 text-rose-600" />
              <span>{activeBanner.actionText}</span>
            </motion.button>
            
            <span className="text-[11px] text-white/70 font-mono hidden sm:block">
              Promo ID: #00{activeBanner.id} • Terms apply
            </span>
          </div>
        </div>

        {/* Carousel buttons */}
        <div className="absolute right-4 bottom-4 flex items-center space-x-2 z-20">
          <button
            onClick={handlePrev}
            className="p-2 bg-black/25 hover:bg-white hover:text-slate-900 rounded-xl transition-all text-white border border-white/10"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 bg-black/25 hover:bg-white hover:text-slate-900 rounded-xl transition-all text-white border border-white/10"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Dots */}
        <div className="absolute left-6 bottom-4 sm:left-12 flex space-x-2 z-20">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
