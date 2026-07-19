import React, { useState, useMemo } from 'react';
import { GlassCard } from './GlassCard';
import { ShoppingCart, Search, Trash2, Tag, Star, Plus, Minus, Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { UserProfile, Product, CartItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AlvonMartProps {
  user: UserProfile;
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateCartQuantity: (productId: string, qty: number) => void;
  onCheckout: () => boolean;
}

export const AlvonMart: React.FC<AlvonMartProps> = ({
  user,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQuantity,
  onCheckout,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  // Rich list of real-looking catalog items
  const products: Product[] = [
    { id: 'm1', name: 'Alvon GigaRouter Pro 5G', price: 79.99, category: 'electronics', image: '📡', rating: 4.8, tag: 'Bestseller' },
    { id: 'm2', name: 'Alvon Studio SoundBuds Air', price: 49.99, category: 'electronics', image: '🎧', rating: 4.6, tag: 'New' },
    { id: 'm3', name: 'Organic Royal Basmati Rice 5kg', price: 14.99, category: 'grocery', image: '🌾', rating: 4.7 },
    { id: 'm4', name: 'Fresh Hass Avocados Pack (4pcs)', price: 6.99, category: 'grocery', image: '🥑', rating: 4.9, tag: 'Organic' },
    { id: 'm5', name: 'Alvon Athletics Sports Tee', price: 24.99, category: 'fashion', image: '👕', rating: 4.4 },
    { id: 'm6', name: 'Cobalt Premium Leather Watch Strap', price: 19.99, category: 'fashion', image: '⌚', rating: 4.5 },
    { id: 'm7', name: 'Alvon Shield Daily Multivitamins', price: 12.49, category: 'health', image: '💊', rating: 4.8, tag: 'Hot' },
    { id: 'm8', name: 'Lavender Spa Reed Diffuser', price: 15.99, category: 'health', image: '🕯️', rating: 4.3 },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const handleCheckoutSubmit = () => {
    if (cart.length === 0) return;
    setCheckoutStatus('loading');
    setTimeout(() => {
      const success = onCheckout();
      if (success) {
        setCheckoutStatus('success');
        setStatusMsg('Order placed! Deducted from wallet, gained +15% Alvon Coins cashback!');
      } else {
        setCheckoutStatus('error');
        setStatusMsg('Insufficient funds in your Alvon Pay wallet.');
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md relative">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within Alvon Mart catalog..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 text-xs font-medium transition-all"
          />
        </div>

        {/* Categories selector */}
        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-1 no-scrollbar">
          {['all', 'electronics', 'grocery', 'fashion', 'health'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-100/80 hover:border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Products (left) and Cart (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Catalog (Col span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((p) => (
              <GlassCard key={p.id} className="bg-white/70 p-4 flex flex-col justify-between border border-slate-100/80" hoverEffect={true}>
                <div>
                  <div className="relative w-full h-36 bg-slate-50 rounded-xl flex items-center justify-center text-5xl mb-4 border border-slate-100/50 group-hover:scale-102 transition-transform duration-300">
                    <span>{p.image}</span>
                    {p.tag && (
                      <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center space-x-1 shadow-sm">
                        <Tag className="w-2.5 h-2.5" />
                        <span>{p.tag}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider font-mono">{p.category}</span>
                      <h5 className="text-sm font-bold text-slate-800 line-clamp-1 mt-0.5">{p.name}</h5>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100/40">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                      <span className="text-[10px] font-bold text-amber-800 font-mono">{p.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900 font-mono">${p.price}</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAddToCart(p)}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
                  >
                    <span>Add +</span>
                  </motion.button>
                </div>
              </GlassCard>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400 font-display">
                <p className="text-lg font-bold">No Products Found</p>
                <p className="text-xs mt-1">Try another search or category filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Shopping Cart Drawer/Box (Col span 1) */}
        <div className="lg:col-span-1">
          <GlassCard className="bg-slate-900 text-white border-slate-800 p-6 sticky top-24 shadow-sm" hoverEffect={false}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2.5">
                <ShoppingCart className="w-4 h-4 text-rose-400" />
                <h4 className="text-base font-bold font-display">My Alvon Cart</h4>
              </div>
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
                {cart.reduce((a, b) => a + b.quantity, 0)} Items
              </span>
            </div>

            <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto no-scrollbar pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3 max-w-[60%]">
                    <span className="text-2xl">{item.product.image}</span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold leading-tight truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">${item.product.price} each</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateCartQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-mono text-white">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateCartQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="py-12 text-center text-slate-500 font-display">
                  <ShoppingCart className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                  <p className="text-xs font-bold">Your cart is empty</p>
                  <p className="text-[10px] mt-0.5">Explore the catalog to add premium products.</p>
                </div>
              )}
            </div>

            {/* Cart summary calculations */}
            {cart.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Estimated Delivery</span>
                  <span className="text-rose-400 font-bold uppercase text-[9px] tracking-wider">FREE • 2 HOURS</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-slate-800 pt-2.5">
                  <span className="font-display">Total Bill</span>
                  <span className="font-mono text-rose-400 text-base">${cartTotal.toFixed(2)}</span>
                </div>

                <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 text-[10px] text-rose-300 leading-relaxed flex items-start space-x-1.5">
                  <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    Get approx. <span className="font-bold font-mono">{(cartTotal * 0.15).toFixed(0)} Alvon Coins</span> reward callback upon successful checkout.
                  </span>
                </div>

                <button
                  onClick={handleCheckoutSubmit}
                  disabled={checkoutStatus === 'loading'}
                  className="w-full mt-2 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  {checkoutStatus === 'loading' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay with Alvon Wallet</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Checkout Alert Status */}
            <AnimatePresence>
              {checkoutStatus !== 'idle' && checkoutStatus !== 'loading' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-4 p-3 rounded-xl flex items-start space-x-2 ${
                    checkoutStatus === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}
                >
                  {checkoutStatus === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-bold">{checkoutStatus === 'success' ? 'Order Success!' : 'Transaction Error'}</p>
                    <p className="text-[11px] leading-relaxed mt-0.5">{statusMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
