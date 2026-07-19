import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, AlertCircle } from 'lucide-react';

interface AlvonImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: '1/1' | '16/9' | '4/3' | '3/2' | 'auto';
  priority?: boolean; // If true, disable lazy loading and load immediately
}

export const AlvonImage: React.FC<AlvonImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = '1/1',
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Set up IntersectionObserver for lazy loading
  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before the image enters viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, shouldLoad]);

  // Handle aspect ratios with Tailwind classes
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '1/1': return 'aspect-square';
      case '16/9': return 'aspect-video';
      case '4/3': return 'aspect-[4/3]';
      case '3/2': return 'aspect-[3/2]';
      default: return 'h-auto w-full';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-slate-100 ${getAspectClass()} ${className}`}
      id={`alvon-img-wrapper-${Math.random().toString(36).substring(2, 6)}`}
    >
      {/* Blurred Low-res / Progressive Placeholder */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-slate-100"
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-shimmer" 
                 style={{
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 1.5s infinite linear'
                 }} 
            />
            
            {/* Micro Blurred Graphic or Icon */}
            <div className="relative z-10 flex flex-col items-center space-y-1.5 opacity-40">
              <ImageIcon className="w-6 h-6 text-slate-400" />
              <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">ALVON OPTIMIZED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4 text-center">
          <AlertCircle className="w-5 h-5 text-rose-500 mb-1" />
          <span className="text-[10px] font-bold font-mono">Failed to load media</span>
        </div>
      )}

      {/* Actual Image Tag */}
      {shouldLoad && !hasError && (
        <motion.img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ 
            opacity: isLoaded ? 1 : 0, 
            filter: isLoaded ? 'blur(0px)' : 'blur(10px)' 
          }}
          transition={{ duration: 0.4 }}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isLoaded ? 'scale-100' : 'scale-105'
          }`}
          referrerPolicy="no-referrer"
          {...props}
        />
      )}

      {/* Performance Optimization Badge (Demo Indicator for high fidelity) */}
      <span className="absolute bottom-1.5 right-1.5 z-20 bg-slate-900/70 backdrop-blur-md text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider font-mono opacity-0 hover:opacity-100 transition-opacity duration-200">
        Optimized: Progressive Webp
      </span>
    </div>
  );
};
