import React, { useState, useEffect } from 'react';
import { 
  Search, UserPlus, BookOpen, ArrowUpRight, ArrowDownLeft, FileDown, 
  Send, DollarSign, Calendar, MessageSquare, Trash2, ArrowLeft, Check, Sparkles, 
  AlertCircle, Loader2, Cloud, CloudOff, RefreshCw, LogIn, TrendingUp, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { jsPDF } from 'jspdf';
import { ActiveTab } from '../types';
import { db, auth } from '../lib/firebaseClient';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore';

interface KhataTransaction {
  id: string;
  amount: number;
  type: 'gave' | 'got'; // gave = Debit (red), got = Credit (green)
  description: string;
  date: string;
}

interface KhataCustomer {
  id: string;
  name: string;
  phone: string;
  businessName?: string;
  transactions: KhataTransaction[];
  userId?: string;
  updatedAt?: string;
}

const DEFAULT_CUSTOMERS: KhataCustomer[] = [
  {
    id: 'c1',
    name: 'Rajesh Kumar',
    phone: '9876543201',
    businessName: 'Rajesh Hardware & Paints',
    transactions: [
      { id: 't1', amount: 5000, type: 'gave', description: 'Bought paint rollers & enamel', date: '2026-07-10' },
      { id: 't2', amount: 2000, type: 'got', description: 'Partial UPI Advance payment', date: '2026-07-12' },
      { id: 't3', amount: 1500, type: 'gave', description: 'Screws & Drill bits supply', date: '2026-07-15' },
    ]
  },
  {
    id: 'c2',
    name: 'Suman Sharma',
    phone: '9123456789',
    businessName: 'Suman Cosmetics Hub',
    transactions: [
      { id: 't4', amount: 3500, type: 'gave', description: 'Wholesale bridal make-up kit', date: '2026-07-05' },
      { id: 't5', amount: 3500, type: 'got', description: 'Paid via Alvon Pay QR Code', date: '2026-07-06' },
    ]
  },
  {
    id: 'c3',
    name: 'Vijay Verma',
    phone: '9988776655',
    businessName: 'Verma Ji Sweet Palace',
    transactions: [
      { id: 't6', amount: 1200, type: 'got', description: 'Catering deposit advance', date: '2026-07-16' },
    ]
  }
];

interface AlvonKhataProps {
  onTabChange: (tab: ActiveTab) => void;
  onPreFillPay?: (phone: string, amount: string) => void;
}

export const AlvonKhata: React.FC<AlvonKhataProps> = ({ onTabChange, onPreFillPay }) => {
  // Authentication status
  const [fbUser, setFbUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Core Ledger State
  const [customers, setCustomers] = useState<KhataCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Form states for adding customer
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustBusiness, setNewCustBusiness] = useState('');

  // Form states for adding ledger transaction
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txType, setTxType] = useState<'gave' | 'got'>('gave');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Track Auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFbUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize customers: listen to Firestore if logged in, else fallback to localStorage
  useEffect(() => {
    if (authLoading) return;

    if (!fbUser) {
      // Local fallback
      const saved = localStorage.getItem('alvon_khata_customers');
      if (saved) {
        setCustomers(JSON.parse(saved));
      } else {
        // First time load with defaults
        setCustomers(DEFAULT_CUSTOMERS);
        localStorage.setItem('alvon_khata_customers', JSON.stringify(DEFAULT_CUSTOMERS));
      }
      return;
    }

    // Set up real-time listener for current user's ledger documents
    setSyncing(true);
    const q = query(
      collection(db, 'khata_customers'),
      where('userId', '==', fbUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData: KhataCustomer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        docsData.push({
          id: data.id || doc.id,
          name: data.name || '',
          phone: data.phone || '',
          businessName: data.businessName || '',
          transactions: data.transactions || [],
          userId: data.userId,
          updatedAt: data.updatedAt
        });
      });

      // Sort by updatedAt descending
      docsData.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      });

      setCustomers(docsData);
      setSyncing(false);
    }, (error) => {
      console.error("Firestore synchronizer error:", error);
      setSyncing(false);
    });

    return () => unsubscribe();
  }, [fbUser, authLoading]);

  // Active customer helper
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Compute stats
  const getCustomerNetBalance = (cust: KhataCustomer) => {
    return cust.transactions.reduce((sum, tx) => {
      // type === 'gave' (You Gave / Debit): customer owes us money (positive: we collect)
      // type === 'got' (You Got / Credit): customer paid us (decreases what they owe)
      return tx.type === 'gave' ? sum + tx.amount : sum - tx.amount;
    }, 0);
  };

  const totalYouWillGet = customers
    .map(c => getCustomerNetBalance(c))
    .filter(bal => bal > 0)
    .reduce((sum, bal) => sum + bal, 0);

  const totalYouWillGive = Math.abs(
    customers
      .map(c => getCustomerNetBalance(c))
      .filter(bal => bal < 0)
      .reduce((sum, bal) => sum + bal, 0)
  );

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.businessName && c.businessName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phone.includes(searchQuery);
    return matchesSearch;
  });

  // Action: Add customer to Ledger
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const newId = 'cust_' + Date.now();
    const newCust: KhataCustomer = {
      id: newId,
      name: newCustName,
      phone: newCustPhone,
      businessName: newCustBusiness || undefined,
      transactions: [],
      updatedAt: new Date().toISOString()
    };

    if (fbUser) {
      newCust.userId = fbUser.uid;
      try {
        setSyncing(true);
        await setDoc(doc(db, 'khata_customers', newId), newCust);
        setSelectedCustomerId(newId);
      } catch (err) {
        console.error("Error creating customer in cloud:", err);
        alert("Could not sync new customer to the cloud database.");
      } finally {
        setSyncing(false);
      }
    } else {
      const updated = [newCust, ...customers];
      setCustomers(updated);
      localStorage.setItem('alvon_khata_customers', JSON.stringify(updated));
      setSelectedCustomerId(newId);
    }

    setNewCustName('');
    setNewCustPhone('');
    setNewCustBusiness('');
    setShowAddModal(false);
  };

  // Action: Add Ledger Transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(txAmount);
    if (isNaN(amount) || amount <= 0 || !selectedCustomerId || !selectedCustomer) return;

    const newTx: KhataTransaction = {
      id: 'tx_' + Date.now(),
      amount,
      type: txType,
      description: txDesc || (txType === 'gave' ? 'Gave Credit' : 'Got Payment'),
      date: txDate
    };

    const updatedTransactions = [newTx, ...selectedCustomer.transactions];

    if (fbUser) {
      try {
        setSyncing(true);
        await setDoc(doc(db, 'khata_customers', selectedCustomerId), {
          ...selectedCustomer,
          transactions: updatedTransactions,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error saving ledger transaction in cloud:", err);
        alert("Error syncing transaction details with Firestore.");
      } finally {
        setSyncing(false);
      }
    } else {
      const updated = customers.map(c => {
        if (c.id === selectedCustomerId) {
          return { ...c, transactions: updatedTransactions, updatedAt: new Date().toISOString() };
        }
        return c;
      });
      setCustomers(updated);
      localStorage.setItem('alvon_khata_customers', JSON.stringify(updated));
    }

    setTxAmount('');
    setTxDesc('');
  };

  // Action: Delete Transaction
  const handleDeleteTransaction = async (txId: string) => {
    if (!selectedCustomer) return;
    if (!confirm("Are you sure you want to delete this ledger transaction?")) return;

    const updatedTransactions = selectedCustomer.transactions.filter(t => t.id !== txId);

    if (fbUser) {
      try {
        setSyncing(true);
        await setDoc(doc(db, 'khata_customers', selectedCustomerId), {
          ...selectedCustomer,
          transactions: updatedTransactions,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error deleting ledger transaction in cloud:", err);
        alert("Error removing transaction from Firestore cloud.");
      } finally {
        setSyncing(false);
      }
    } else {
      const updated = customers.map(c => {
        if (c.id === selectedCustomerId) {
          return { ...c, transactions: updatedTransactions, updatedAt: new Date().toISOString() };
        }
        return c;
      });
      setCustomers(updated);
      localStorage.setItem('alvon_khata_customers', JSON.stringify(updated));
    }
  };

  // Action: Delete Customer Account
  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Deleting this customer will erase all their ledger records forever. Continue?")) return;

    if (fbUser) {
      try {
        setSyncing(true);
        await deleteDoc(doc(db, 'khata_customers', id));
        if (selectedCustomerId === id) {
          setSelectedCustomerId(null);
        }
      } catch (err) {
        console.error("Error deleting customer in cloud:", err);
        alert("Error deleting customer from Firestore.");
      } finally {
        setSyncing(false);
      }
    } else {
      const updated = customers.filter(c => c.id !== id);
      setCustomers(updated);
      localStorage.setItem('alvon_khata_customers', JSON.stringify(updated));
      if (selectedCustomerId === id) {
        setSelectedCustomerId(null);
      }
    }
  };

  // Seed Data Trigger: Populate default sandbox customers in current user session/cloud
  const handleSeedDemoData = async () => {
    if (!confirm("Would you like to import standard merchant demo ledgers to test statement downloads and balancing?")) return;

    if (fbUser) {
      try {
        setSyncing(true);
        for (const demo of DEFAULT_CUSTOMERS) {
          const docId = `demo_${demo.id}_${fbUser.uid}`;
          await setDoc(doc(db, 'khata_customers', docId), {
            ...demo,
            id: docId,
            userId: fbUser.uid,
            updatedAt: new Date().toISOString()
          });
        }
        alert("Successfully synced sandbox demo ledgers to your Alvon account!");
      } catch (err) {
        console.error("Error seeding default data:", err);
        alert("Failed to seed default database records.");
      } finally {
        setSyncing(false);
      }
    } else {
      setCustomers(DEFAULT_CUSTOMERS);
      localStorage.setItem('alvon_khata_customers', JSON.stringify(DEFAULT_CUSTOMERS));
      alert("Demo data loaded into local sandbox session successfully.");
    }
  };

  // Beautiful high-fidelity PDF Statement Generator using jsPDF
  const generateCustomerStatement = (cust: KhataCustomer) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Top Header Accents (Alvon corporate red and slate borders)
      doc.setFillColor(225, 29, 72); // Alvon Rose Red Accent
      doc.rect(0, 0, 210, 8, 'F');
      
      doc.setFillColor(15, 23, 42); // Sleek slate grey accent
      doc.rect(0, 8, 210, 3, 'F');

      // Title & Branding
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text("ALVON KHATA STATEMENT", 20, 25);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Automated Business Ledger & Cashbook • Alvon Care Super App", 20, 31);
      doc.text(`Statement Created: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, 36);

      // Horizontal separator line
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 41, 190, 41);

      // Customer Info Box
      doc.setFillColor(248, 250, 252);
      doc.rect(20, 46, 170, 34, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(20, 46, 170, 34, 'D');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text("CUSTOMER ACCOUNT METADATA:", 25, 53);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text(`Client Name: ${cust.name}`, 25, 60);
      doc.text(`Phone Number: +91 ${cust.phone}`, 25, 66);
      if (cust.businessName) {
        doc.text(`Enterprise: ${cust.businessName}`, 25, 72);
      } else {
        doc.text("Enterprise: General Customer", 25, 72);
      }

      // Net Account Standing Inside Box
      const balance = getCustomerNetBalance(cust);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("ACCOUNT STANDING:", 115, 53);
      
      if (balance > 0) {
        doc.setTextColor(225, 29, 72); // Red (Client owes us)
        doc.setFontSize(14.5);
        doc.text(`₹${balance.toLocaleString()}`, 115, 62);
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text("PENDING COLLECTION (DEBIT)", 115, 67);
      } else if (balance < 0) {
        doc.setTextColor(16, 185, 129); // Green (We owe them)
        doc.setFontSize(14.5);
        doc.text(`₹${Math.abs(balance).toLocaleString()}`, 115, 62);
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text("ADVANCE DEPOSIT (CREDIT)", 115, 67);
      } else {
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(14.5);
        doc.text("₹0.00", 115, 62);
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text("FULLY SETTLED & BALANCED", 115, 67);
      }

      // Ledger Table Header
      let currentY = 90;
      doc.setFillColor(15, 23, 42);
      doc.rect(20, currentY, 170, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Date", 24, currentY + 5.5);
      doc.text("Narration / Description", 52, currentY + 5.5);
      doc.text("You Gave (Debit -)", 122, currentY + 5.5);
      doc.text("You Got (Credit +)", 158, currentY + 5.5);

      // Ledger Table Rows
      currentY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      
      cust.transactions.forEach((tx) => {
        // Alternating background stripes
        doc.setFillColor(255, 255, 255);
        doc.rect(20, currentY, 170, 8, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.line(20, currentY + 8, 190, currentY + 8);

        doc.setFontSize(8.5);
        doc.text(tx.date, 24, currentY + 5.5);
        doc.text(tx.description, 52, currentY + 5.5);

        if (tx.type === 'gave') {
          doc.setTextColor(225, 29, 72);
          doc.text(`₹${tx.amount.toLocaleString()}`, 122, currentY + 5.5);
        } else {
          doc.setTextColor(16, 185, 129);
          doc.text(`₹${tx.amount.toLocaleString()}`, 158, currentY + 5.5);
        }
        
        doc.setTextColor(51, 65, 85);
        currentY += 8;
      });

      // Signature & Legal/Digital verification Footer
      currentY = Math.max(currentY + 15, 185);
      doc.setDrawColor(226, 232, 240);
      doc.line(20, currentY, 190, currentY);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Alvon Khata Business Merchant Portal • India Digital Cash Ledger", 20, currentY + 5.5);
      doc.text("This is a secured, automated digital document. No manual signature or physical seal required.", 20, currentY + 10);

      // Save PDF
      doc.save(`AlvonKhata_${cust.name.replace(/\s+/g, '_')}_Statement.pdf`);
    } catch (err) {
      console.error("PDF compiling error:", err);
      alert("Error building the digital PDF statement ledger sheet.");
    }
  };

  const handleRequestPayment = (cust: KhataCustomer) => {
    const balance = getCustomerNetBalance(cust);
    if (balance <= 0) {
      alert(`${cust.name} has no outstanding balance to collect.`);
      return;
    }

    if (onPreFillPay) {
      onPreFillPay(cust.phone, balance.toString());
      alert(`Ledger request of ₹${balance} preloaded for +91 ${cust.phone} into Alvon Pay. Redirecting...`);
      onTabChange('pay');
    } else {
      alert(`Payment request linked!\nRecipient: +91 ${cust.phone}\nDue: ₹${balance}\nUPI/Netbanking checkout QR code generated successfully.`);
    }
  };

  return (
    <div className="space-y-6" id="alvon-khata-container">
      {/* Cloud Status Banner */}
      {!authLoading && (
        <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          fbUser 
            ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300'
            : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              fbUser ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
            }`}>
              {fbUser ? <Cloud className="w-5 h-5 animate-pulse" /> : <CloudOff className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-bold font-sans">
                {fbUser ? "Cloud Sync Enabled" : "Offline Sandbox Mode"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {fbUser 
                  ? `Your ledgers are syncing in real-time with Google Cloud Firestore (UID: ${fbUser.uid.substring(0, 8)}...)`
                  : "Records are stored in local storage. Log in to prevent data loss and enable cross-device sync."
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            {customers.length === 0 && (
              <button
                onClick={handleSeedDemoData}
                className="px-3 py-1.5 bg-rose-600/10 dark:bg-rose-500/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-xl transition-all"
              >
                Import Demo Ledger
              </button>
            )}

            {!fbUser ? (
              <button
                onClick={() => onTabChange('profile')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-xl flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In Cloud</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-100/50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Firestore Synced</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Ledger Cards & Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10 border border-emerald-200/40 dark:border-emerald-800/20 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider font-mono">You Will Get</span>
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-3">₹{totalYouWillGet.toLocaleString()}</h3>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-500 font-medium mt-1">Pending payments to collect from clients</p>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-rose-50 to-rose-100/30 dark:from-rose-950/20 dark:to-rose-900/10 border border-rose-200/40 dark:border-rose-800/20 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider font-mono">You Will Give</span>
            <div className="p-1.5 bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 rounded-lg">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono mt-3">₹{totalYouWillGive.toLocaleString()}</h3>
          <p className="text-[10px] text-rose-600/80 dark:text-rose-500 font-medium mt-1">Advances received or balances to refund</p>
        </GlassCard>

        <GlassCard className="bg-slate-900 dark:bg-slate-950 text-white border-slate-800 dark:border-slate-800 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Active Customers</span>
            <span className="bg-rose-500 text-white text-[9px] px-2.5 py-0.5 font-bold rounded-full font-mono">{customers.length}</span>
          </div>
          <div>
            <h4 className="text-sm font-bold mt-4 font-display flex items-center space-x-1.5 text-rose-400">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>Alvon Khata Business Ledger</span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">100% Secure backup with automated PDF audit statements</p>
          </div>
        </GlassCard>
      </div>

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column - Customers list panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 w-4 h-4 text-slate-400 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 text-xs font-medium text-slate-800 dark:text-slate-100 transition-all"
              />
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all shrink-0 flex items-center justify-center cursor-pointer"
              title="Add New Customer"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Customer list container */}
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((cust) => {
                const bal = getCustomerNetBalance(cust);
                const isSelected = selectedCustomerId === cust.id;
                return (
                  <button
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'bg-white dark:bg-slate-900 border-rose-500/60 shadow-md ring-2 ring-rose-500/5' 
                        : 'bg-white/75 dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:bg-white dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="min-w-0 flex items-start gap-2.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                        bal > 0 ? 'bg-rose-600' : bal < 0 ? 'bg-emerald-600' : 'bg-slate-500'
                      }`}>
                        {cust.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">{cust.name}</h5>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                          {cust.businessName || `+91 ${cust.phone}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right pl-3 shrink-0">
                      {bal > 0 ? (
                        <div>
                          <p className="text-xs font-black text-rose-600 font-mono">₹{bal.toLocaleString()}</p>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-rose-500 font-mono">You Get</span>
                        </div>
                      ) : bal < 0 ? (
                        <div>
                          <p className="text-xs font-black text-emerald-600 font-mono">₹{Math.abs(bal).toLocaleString()}</p>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500 font-mono">You Give</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-black text-slate-400 font-mono">₹0</p>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 font-mono">Settled</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="bg-white/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl p-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
                <BookOpen className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-bold">No customers found</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-[10px] text-rose-600 font-extrabold underline hover:text-rose-700 cursor-pointer"
                >
                  Create New Ledger
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Customer ledger bookkeeping space (8 cols) */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedCustomer ? (
              <motion.div
                key={selectedCustomer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Active Customer profile bar */}
                <GlassCard className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                      🏢
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedCustomer.name}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-mono">
                        +91 {selectedCustomer.phone} {selectedCustomer.businessName && `• ${selectedCustomer.businessName}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions (Request Payment, PDF, Delete) */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    {getCustomerNetBalance(selectedCustomer) > 0 && (
                      <button
                        onClick={() => handleRequestPayment(selectedCustomer)}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Request Payment</span>
                      </button>
                    )}

                    <button
                      onClick={() => generateCustomerStatement(selectedCustomer)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                      title="Download PDF Ledger Report"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Statement</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"
                      title="Delete Customer Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>

                {/* Grid split: Add entry form (red/green) & Transaction lists */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Ledger Form entry panel (5 cols) */}
                  <div className="md:col-span-5">
                    <GlassCard className="bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 space-y-4">
                      <h5 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-50 dark:border-slate-800 pb-2 flex items-center space-x-1">
                        <span>📝 Add New Entry</span>
                      </h5>

                      <form onSubmit={handleAddTransaction} className="space-y-3">
                        {/* Transaction Type selection tabs */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setTxType('gave')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                              txType === 'gave'
                                ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-500 text-rose-700 dark:text-rose-400 font-extrabold ring-2 ring-rose-500/5'
                                : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                            <span>You Gave</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setTxType('got')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                              txType === 'got'
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-extrabold ring-2 ring-emerald-500/5'
                                : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                            <span>You Got</span>
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Amount (INR)</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-2 text-xs font-bold text-slate-500 font-mono">₹</span>
                            <input
                              type="number"
                              required
                              value={txAmount}
                              onChange={(e) => setTxAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-slate-400 text-slate-800 dark:text-slate-100 font-mono text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Description / Bill Notes</label>
                          <input
                            type="text"
                            value={txDesc}
                            onChange={(e) => setTxDesc(e.target.value)}
                            placeholder="e.g. Raw materials supply..."
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-slate-400 text-slate-800 dark:text-slate-100 text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Entry Date</label>
                          <input
                            type="date"
                            required
                            value={txDate}
                            onChange={(e) => setTxDate(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-slate-400 text-slate-800 dark:text-slate-100 text-xs font-bold font-mono"
                          />
                        </div>

                        <button
                          type="submit"
                          className={`w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-sm cursor-pointer ${
                            txType === 'gave' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          Save Transaction
                        </button>
                      </form>
                    </GlassCard>
                  </div>

                  {/* Transaction historical list table (7 cols) */}
                  <div className="md:col-span-7">
                    <GlassCard className="bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full min-h-[300px]">
                      <div className="space-y-4">
                        <h5 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-50 dark:border-slate-800 pb-2">
                          📋 Transaction History
                        </h5>

                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {selectedCustomer.transactions && selectedCustomer.transactions.length > 0 ? (
                            selectedCustomer.transactions.map((tx) => (
                              <div
                                key={tx.id}
                                className="p-2.5 bg-slate-50/50 dark:bg-slate-850/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                              >
                                <div>
                                  <p className="font-bold text-slate-700 dark:text-slate-300 leading-tight">{tx.description}</p>
                                  <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                                    <Calendar className="w-2.5 h-2.5" />
                                    <span>{tx.date}</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 shrink-0">
                                  {tx.type === 'gave' ? (
                                    <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400">- ₹{tx.amount.toLocaleString()}</span>
                                  ) : (
                                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">+ ₹{tx.amount.toLocaleString()}</span>
                                  )}

                                  <button
                                    onClick={() => handleDeleteTransaction(tx.id)}
                                    className="p-1 hover:text-rose-600 rounded text-slate-300 dark:text-slate-700 hover:dark:text-rose-500 cursor-pointer"
                                    title="Delete Entry"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-12 text-center text-slate-400 dark:text-slate-600 space-y-1">
                              <BookOpen className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-700" />
                              <p className="text-xs">No transactions recorded yet.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100/50 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500">
                        <span>Showing {selectedCustomer.transactions ? selectedCustomer.transactions.length : 0} entries</span>
                        <button
                          onClick={() => generateCustomerStatement(selectedCustomer)}
                          className="text-rose-600 hover:underline font-bold cursor-pointer"
                        >
                          Generate PDF Statement
                        </button>
                      </div>
                    </GlassCard>
                  </div>

                </div>

              </motion.div>
            ) : (
              <div className="h-full min-h-[350px] bg-white/40 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-600 p-8 space-y-3">
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-2xl shadow-sm">
                  📚
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">No Customer Selected</h4>
                  <p className="text-xs mt-1">Select a business partner from the left panel to balance ledgers, record credits, or generate PDF summaries.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Add New Customer Dialog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 dark:bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 z-10 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <UserPlus className="w-4 h-4 text-rose-500" />
                <span>Create Khata Ledger</span>
              </h4>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-rose-500 text-xs font-bold text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-xs font-bold text-slate-400 dark:text-slate-600 font-mono">+91</span>
                  <input
                    type="tel"
                    required
                    placeholder="Enter 10-digit number"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full pl-11 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-rose-500 text-xs font-bold font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Business Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Verma Kirana Store"
                  value={newCustBusiness}
                  onChange={(e) => setNewCustBusiness(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-rose-500 text-xs font-medium text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Confirm & Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
