import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { 
  Wallet, Phone, Send, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  Sparkles, AlertCircle, RefreshCw, QrCode, CreditCard, Coins, 
  Search, X, ChevronRight, Info, CheckCircle2 
} from 'lucide-react';
import { UserProfile, Transaction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface AlvonPayProps {
  user: UserProfile;
  transactions: Transaction[];
  onRecharge: (amount: number, planName: string) => boolean;
  onTransfer: (amount: number, recipient: string) => boolean;
  initialPhone?: string;
  initialOperator?: string;
  initialRecipient?: string;
  initialAmount?: string;
  onSyncUser?: (updatedUser: UserProfile, newTransactions?: Transaction[]) => void;
}

export const AlvonPay: React.FC<AlvonPayProps> = ({
  user,
  transactions,
  onRecharge,
  onTransfer,
  initialPhone = '',
  initialOperator = 'Jio',
  initialRecipient = '',
  initialAmount = '',
  onSyncUser,
}) => {
  const { t } = useTranslation();
  const [rechargePhone, setRechargePhone] = useState(initialPhone);
  const [rechargeOperator, setRechargeOperator] = useState(initialOperator);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [transferRecipient, setTransferRecipient] = useState(initialRecipient);
  const [transferAmount, setTransferAmount] = useState(initialAmount);

  // Razorpay Add Money state
  const [addAmount, setAddAmount] = useState('500');
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletStatus, setWalletStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [walletMessage, setWalletMessage] = useState('');

  // 1000-Level Commission Split Explorer state
  const [isSplitExplorerOpen, setIsSplitExplorerOpen] = useState(false);
  const [activeSplits, setActiveSplits] = useState<any[]>([]);
  const [activeRechargeDetails, setActiveRechargeDetails] = useState<any>(null);
  const [searchSplitQuery, setSearchSplitQuery] = useState('');

  const [rechargeStatus, setRechargeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [transferStatus, setTransferStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Sync props reactively if they change from external Khata trigger
  useEffect(() => {
    if (initialRecipient) {
      setTransferRecipient(initialRecipient);
    }
    if (initialAmount) {
      setTransferAmount(initialAmount);
    }
  }, [initialRecipient, initialAmount]);

  useEffect(() => {
    if (initialPhone) {
      setRechargePhone(initialPhone);
    }
    if (initialOperator) {
      setRechargeOperator(initialOperator);
    }
  }, [initialPhone, initialOperator]);

  const plans = [
    { name: 'Alvon True 5G Daily', data: '1.5 GB/day', validity: '28 Days', price: 199, coinsReward: 20 },
    { name: 'Alvon Super Saver Giga', data: '2.0 GB/day', validity: '84 Days', price: 499, coinsReward: 60 },
    { name: 'Alvon Ultra Streamer Pack', data: '3.0 GB/day + OTT', validity: '30 Days', price: 299, coinsReward: 40 },
  ];

  // Load script helper for real Razorpay
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Wallet Add Money with Razorpay
  const handleAddMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(addAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWalletStatus('error');
      setWalletMessage('Please enter a valid positive amount.');
      return;
    }

    setWalletLoading(true);
    setWalletStatus('idle');

    try {
      // 1. Create Order on Backend
      const orderRes = await fetch('/api/wallet/add-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'jane-alvon', amount: amountNum })
      });
      const orderData = await orderRes.json();

      if (orderData.error) {
        throw new Error(orderData.error);
      }

      setRazorpayOrder(orderData);

      // 2. Open payment modal (simulated or real)
      if (orderData.isSimulated) {
        setIsRazorpayModalOpen(true);
        setWalletLoading(false);
      } else {
        // Real Razorpay implementation
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error('Failed to load Razorpay checkout SDK.');
        }

        const options = {
          key: orderData.keyId,
          amount: Math.round(orderData.amount * 100),
          currency: orderData.currency,
          name: 'Alvon Super App',
          description: 'Wallet Top-up (Alvon Pay)',
          order_id: orderData.orderId,
          handler: async function (response: any) {
            setWalletLoading(true);
            try {
              const verifyRes = await fetch('/api/wallet/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: 'jane-alvon',
                  amount: orderData.amount,
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  isSimulated: false
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setWalletStatus('success');
                setWalletMessage(`₹${orderData.amount} added to your wallet successfully via Razorpay!`);
                if (onSyncUser) onSyncUser(verifyData.user);
              } else {
                throw new Error(verifyData.error || 'Payment verification failed.');
              }
            } catch (err: any) {
              setWalletStatus('error');
              setWalletMessage(err.message || 'Verification failed.');
            } finally {
              setWalletLoading(false);
            }
          },
          prefill: {
            name: user.name,
            phone: user.phone.replace(/\D/g, '').slice(-10)
          },
          theme: { color: '#E11D48' }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setWalletLoading(false);
      }
    } catch (err: any) {
      setWalletLoading(false);
      setWalletStatus('error');
      setWalletMessage(err.message || 'Failed to start payment checkout.');
    }
  };

  // Simulated Razorpay Checkout Success Callback
  const handleSimulatedPaymentSuccess = async () => {
    setIsRazorpayModalOpen(false);
    setWalletLoading(true);

    try {
      const verifyRes = await fetch('/api/wallet/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'jane-alvon',
          amount: razorpayOrder.amount,
          orderId: razorpayOrder.orderId,
          paymentId: `pay_mock_${Math.random().toString(36).substring(2, 15)}`,
          signature: 'mock_signature_approved',
          isSimulated: true
        })
      });
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setWalletStatus('success');
        setWalletMessage(`₹${razorpayOrder.amount} added to your wallet successfully (Simulated Razorpay)!`);
        if (onSyncUser) onSyncUser(verifyData.user);
      } else {
        throw new Error(verifyData.error || 'Payment verification failed.');
      }
    } catch (err: any) {
      setWalletStatus('error');
      setWalletMessage(err.message || 'Failed to process simulated payment.');
    } finally {
      setWalletLoading(false);
    }
  };

  // Handle BBPS Mobile Recharge Submit via API
  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargePhone || rechargePhone.length < 10) {
      setRechargeStatus('error');
      setStatusMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    setRechargeStatus('loading');
    setStatusMessage('');

    try {
      const plan = plans[selectedPlan];
      const res = await fetch('/api/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'jane-alvon',
          phone: rechargePhone,
          operator: rechargeOperator,
          planName: plan.name,
          amount: plan.price
        })
      });
      const data = await res.json();

      if (data.success) {
        setRechargeStatus('success');
        setStatusMessage(`Successfully recharged ₹${plan.price} plan to ${rechargePhone}!`);
        setRechargePhone('');

        if (onSyncUser) onSyncUser(data.user);
      } else {
        setRechargeStatus('error');
        setStatusMessage(data.error || 'Insufficient funds in your Alvon Pay wallet.');
      }
    } catch (err: any) {
      setRechargeStatus('error');
      setStatusMessage('Network error occurred during recharge.');
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);
    if (!transferRecipient) {
      setTransferStatus('error');
      setStatusMessage('Please specify a valid recipient name or phone.');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setTransferStatus('error');
      setStatusMessage('Please enter a valid transfer amount.');
      return;
    }

    setTransferStatus('loading');
    setTimeout(() => {
      const success = onTransfer(amountNum, transferRecipient);
      if (success) {
        setTransferStatus('success');
        setStatusMessage(`Transferred ₹${amountNum.toFixed(2)} to ${transferRecipient} successfully!`);
        setTransferRecipient('');
        setTransferAmount('');
      } else {
        setTransferStatus('error');
        setStatusMessage('Insufficient funds in your Alvon Pay wallet.');
      }
    }, 1000);
  };

  // Filter 1000-level commission splits by level or name
  const filteredSplits = activeSplits.filter(split => {
    const q = searchSplitQuery.toLowerCase();
    return split.level.toString().includes(q) || split.name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Overview Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Wallet Balance Card - Deep Indigo Slate Premium */}
        <GlassCard className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-slate-850 p-6 flex flex-col justify-between" hoverEffect={false}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{t('wallet_balance')}</span>
              <h3 className="text-3xl sm:text-4xl font-bold text-white font-display tracking-tight flex items-baseline">
                ₹{user.walletBalance.toFixed(2)}
                <span className="text-[10px] text-emerald-400 font-bold ml-3 bg-emerald-950/50 border border-emerald-900 px-2 py-0.5 rounded">{t('active_wallet')}</span>
              </h3>
              <p className="text-slate-400 text-xs font-medium pt-1">
                {t('equivalent_to')} <strong className="text-rose-400 font-mono font-bold">{(user.walletBalance * 1000).toLocaleString()}</strong> Alvon Coins ({t('wallet_rate')})
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-4 justify-between items-center text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('secured_gateway')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400 font-mono">{t('wallet_rate')}</span>
            </div>
          </div>
        </GlassCard>

        {/* Quick Alvon Coins Stats Card */}
        <GlassCard className="bg-white border border-slate-100 p-6 flex flex-col justify-between" hoverEffect={true}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{t('my_coins')}</span>
              <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-100">{t('gold_club')}</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-black text-slate-900 font-display">{user.alvonCoins.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider ml-1">Coins</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              {t('coins_desc')}
            </p>
          </div>
          <button 
            onClick={() => alert('Redeem Store: ₹100 Mobile Voucher = 100,000 Alvon Coins. Simulating rewards!')}
            className="w-full mt-4 py-2 bg-slate-950 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{t('redeem_rewards')}</span>
          </button>
        </GlassCard>

      </div>

      {/* Main Grid: Adding Money & Recharge & Transfer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mobile Recharge Form (BBPS Integration) */}
        <GlassCard className="bg-white lg:col-span-2 border border-slate-100/80 p-6">
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 font-display">{t('bbps_title')}</h4>
              <p className="text-xs text-slate-500">{t('bbps_subtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleRechargeSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{t('mobile_number')}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-xs font-bold text-slate-400 font-mono">+91</span>
                  <input
                    type="tel"
                    value={rechargePhone}
                    onChange={(e) => setRechargePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder={t('enter_mobile')}
                    className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{t('select_operator')}</label>
                <select
                  value={rechargeOperator}
                  onChange={(e) => setRechargeOperator(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-bold text-slate-700 cursor-pointer"
                >
                  <option value="Jio">Jio 5G True Unlimited</option>
                  <option value="Airtel">Airtel Truly Unlimited 5G</option>
                  <option value="Vi">Vodafone Idea (Vi)</option>
                  <option value="BSNL">BSNL Fiber & Mobile</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">{t('select_plan')}</label>
              <div className="space-y-2.5">
                {plans.map((plan, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedPlan(i)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                      selectedPlan === i
                        ? 'border-blue-600 bg-blue-50/20 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                        <span>{plan.name}</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-extrabold uppercase">
                          +{Math.round(plan.price * 5).toLocaleString()} Coins Reward
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {plan.data} • {plan.validity} Validity
                      </p>
                    </div>
                    <span className="text-sm font-black text-blue-700 font-mono">₹{plan.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={rechargeStatus === 'loading'}
              className="w-full py-3 bg-slate-950 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
            >
              {rechargeStatus === 'loading' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('invoking_bbps')}</span>
                </>
              ) : (
                <>
                  <span>{t('pay_recharge')}</span>
                </>
              )}
            </button>
          </form>

          {/* Recharge Feedback */}
          <AnimatePresence>
            {rechargeStatus !== 'idle' && rechargeStatus !== 'loading' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-4 p-3.5 rounded-xl flex items-start space-x-2.5 ${
                  rechargeStatus === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-100'
                    : 'bg-rose-50 text-rose-900 border border-rose-100'
                }`}
              >
                {rechargeStatus === 'success' ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-xs font-bold">{rechargeStatus === 'success' ? 'Recharge Successful!' : 'Recharge Failed'}</p>
                  <p className="text-[11px] font-medium leading-relaxed mt-0.5">{statusMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Razorpay Wallet Money Add Section */}
        <GlassCard className="bg-white border border-slate-100/80 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 font-display">Add Wallet Cash</h4>
                <p className="text-xs text-slate-500">Fast Razorpay Gateway checkout</p>
              </div>
            </div>

            <form onSubmit={handleAddMoneySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Amount to Add (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-sm font-bold text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Quick preselects */}
              <div className="flex gap-1.5">
                {['200', '500', '1000', '2000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddAmount(amt)}
                    className="flex-1 py-1.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-500 rounded-lg text-xs font-bold text-slate-600 transition-all cursor-pointer"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={walletLoading}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm mt-3"
              >
                {walletLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Launching Razorpay...</span>
                  </>
                ) : (
                  <>
                    <span>Add Money via Razorpay</span>
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {walletStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-4 p-3 rounded-xl flex items-start space-x-2 ${
                    walletStatus === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                      : 'bg-rose-50 text-rose-800 border border-rose-100'
                  }`}
                >
                  {walletStatus === 'success' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-bold">{walletStatus === 'success' ? 'Top-up Successful!' : 'Top-up Failed'}</p>
                    <p className="text-[10px] font-medium leading-relaxed mt-0.5">{walletMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100/30 text-[10px] text-slate-600 leading-normal flex items-start space-x-1.5 mt-4">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
            <span>
              Transactions are processed directly through Razorpay API ensuring Zero-loss encryption.
            </span>
          </div>
        </GlassCard>

      </div>

      {/* Transaction History Ledger Activity */}
      <GlassCard className="bg-white/80 border border-slate-100/80 p-6" hoverEffect={false}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-display">{t('ledger_activity')}</h4>
            <p className="text-[11px] text-slate-500">{t('ledger_subtitle')}</p>
          </div>
          <button 
            onClick={() => alert('Exporting transaction ledger to PDF...')}
            className="text-xs font-bold text-rose-600 hover:text-rose-800"
          >
            {t('download_pdf')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-2">{t('txn_id')}</th>
                <th className="py-3 px-2">{t('details')}</th>
                <th className="py-3 px-2">{t('date')}</th>
                <th className="py-3 px-2 text-right">{t('amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 font-mono text-[11px]">{t('no_history')}</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-2 font-mono text-[10px] text-slate-400">{tx.id}</td>
                    <td className="py-3 px-2 flex items-center space-x-2.5">
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.type === 'credit' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{tx.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono capitalize">{tx.category}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-500">{tx.date}</td>
                    <td className={`py-3 px-2 text-right font-mono font-bold text-sm ${
                      tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* MODAL 1: Simulated Razorpay Gateway Interface Popup */}
      <AnimatePresence>
        {isRazorpayModalOpen && (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
            >
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">💳</span>
                  <div>
                    <h5 className="font-extrabold text-sm tracking-wide uppercase font-mono text-rose-400">Razorpay Checkout</h5>
                    <p className="text-[10px] text-slate-400 font-medium">Securing payment flow on Alvon Pay</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsRazorpayModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 flex-1">
                <div className="p-4 bg-rose-50/30 rounded-xl border border-rose-100/30 text-center space-y-1.5">
                  <span className="text-2xl">⚡</span>
                  <p className="text-xs font-bold text-slate-700">Simulating Razorpay Payment Order</p>
                  <p className="text-[11px] text-slate-500 font-medium">Order ID: <code className="font-mono text-rose-600 font-bold">{razorpayOrder?.orderId}</code></p>
                  <h3 className="text-2xl font-black text-rose-600 font-mono mt-1">₹{razorpayOrder?.amount}</h3>
                </div>

                <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                  <div className="flex justify-between">
                    <span>Account Name:</span>
                    <span className="font-bold text-slate-700">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact Phone:</span>
                    <span className="font-bold text-slate-700">{user.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beneficiary:</span>
                    <span className="font-bold text-rose-600">Alvon Pay Wallet</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <button
                    onClick={() => setIsRazorpayModalOpen(false)}
                    className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    Cancel Payment
                  </button>
                  <button
                    onClick={handleSimulatedPaymentSuccess}
                    className="py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center shadow-md flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Payment</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4.5 border-t border-slate-100 text-[10px] text-slate-400 font-medium text-center flex items-center justify-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>PCI-DSS Level 1 Encrypted Client Session</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



    </div>
  );
};
