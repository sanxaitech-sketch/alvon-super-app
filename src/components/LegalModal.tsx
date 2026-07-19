import React from 'react';
import { X, ShieldCheck, FileText, Scale, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from './GlassCard';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'terms' | 'privacy' | 'compliance';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, initialTab }) => {
  const [activeSubTab, setActiveSubTab] = React.useState<'terms' | 'privacy' | 'compliance'>(initialTab);

  React.useEffect(() => {
    setActiveSubTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'terms' as const, label: 'Terms & Conditions', icon: FileText },
    { id: 'privacy' as const, label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'compliance' as const, label: 'Legal Compliance', icon: Scale },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" id="legal-modal-overlay">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white border border-slate-200/80 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden z-10 flex flex-col h-[550px]"
      >
        {/* Header bar (Red & Blue thematic accent) */}
        <div className="h-1 bg-gradient-to-r from-rose-600 via-rose-500 to-blue-600" />
        
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚖️</span>
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-display">Alvon Regulatory & Legal Desk</h3>
              <p className="text-[10px] text-slate-400 font-mono">Verified Compliance Department</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inner layout split */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Tab navigation bar */}
          <div className="w-1/3 border-r border-slate-100 bg-slate-50/50 p-3.5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2.5 ${
                      active 
                        ? 'bg-rose-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[10px] text-blue-700 font-mono leading-normal">
              <p className="font-bold">TRAI Standards</p>
              <p className="mt-1">Complies with federal telecommunications & payment regulation policies.</p>
            </div>
          </div>

          {/* Right Text body panel */}
          <div className="w-2/3 p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed font-medium">
            
            {activeSubTab === 'terms' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-rose-600 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-800">Terms & Conditions of Service</h4>
                </div>
                <p className="font-mono text-[10px] text-slate-400">Last updated: July 18, 2026</p>
                
                <p>
                  Welcome to <strong>Alvon Super App</strong>. By accessing our services, creating an account, sending digital wallets payments, or buying goods from Alvon Mart, you agree to be legally bound by these terms.
                </p>

                <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mt-3">1. Scope of Telecommunication Services</h5>
                <p>
                  Alvon facilitates telecommunication plans, recharge queries, and payment processing as an independent utility aggregator. All active network packages, cellular plans, and spectral allocations are provided through licensed partners and telecom operators.
                </p>

                <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mt-3">2. Smart Recharge & Billing Policy</h5>
                <p>
                  Payments made through Alvon Pay wallet balances are subject to validation checks. Real-time telecom recharges processed on Airtel, Jio, Vi, and BSNL operate under standard carrier terms. Alvon is not liable for network carrier downtime or carrier-side spectrum outages.
                </p>

                <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mt-3">3. Limitation of Liability</h5>
                <p>
                  Alvon, its directors, and technical engineers shall not be responsible for indirect, incidental, or consequential losses stemming from network plan selections or commercial transactions.
                </p>
              </div>
            )}

            {activeSubTab === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-rose-600 border-b border-slate-100 pb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-800">Data Protection & Privacy Policy</h4>
                </div>
                <p className="font-mono text-[10px] text-slate-400">Last updated: July 18, 2026</p>

                <p>
                  At Alvon, we prioritize safeguarding user privacy. This policy outlines how we capture, encrypt, and secure your personal account metadata, phone numbers, and transactional ledgers.
                </p>

                <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mt-3">1. Encryption and Security standards</h5>
                <p>
                  All database records, transaction hashes, and payment tokens are sealed with AES-256 secure socket layer key algorithms. Cellular numbers entered for recharges are masked from third-party networks.
                </p>

                <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mt-3">2. Cookies & In-App Tracking</h5>
                <p>
                  We utilize lightweight, browser cookies and session storage to verify your account session and maintain your Alvon Mart shopping cart basket. We do not sell user interaction trends to advertising companies.
                </p>

                <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mt-3">3. External SDK Grounding</h5>
                <p>
                  The search queries entered into Alvon Browser use Google Search Grounding to generate responses. Only the strict textual query is shared to perform grounding. No personal user email or metadata is leaked.
                </p>
              </div>
            )}

            {activeSubTab === 'compliance' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-rose-600 border-b border-slate-100 pb-2">
                  <Scale className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-800">Legal Compliance & Regulatory Framework</h4>
                </div>
                <p className="font-mono text-[10px] text-slate-400">Last updated: July 18, 2026</p>

                <p>
                  Alvon Super App operates under complete statutory guidelines, aligning with the Telecom Regulatory Authority (TRAI) and national fintech codes.
                </p>

                <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mt-3">1. Legal Status of Telecom Status Balances</h5>
                <p>
                  Since Alvon is not a licensed telecom carrier directly, we maintain extreme regulatory fidelity by not mocking or simulating private carrier data balances without explicit user authorization or legal infrastructure. Instead, the <strong>Alvon Smart Recharge</strong> module serves as an open gateway for plan evaluations across major partner providers (Airtel, Jio, Vi, BSNL).
                </p>

                <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mt-3">2. Anti-Money Laundering (AML) Compliance</h5>
                <p>
                  All digital wallet transactions processed via Alvon Pay are audited periodically. Large money transfers and immediate coin conversions require standard KYC checks to prevent illegal capital shifts.
                </p>

                <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mt-3">3. Grievance Redressal</h5>
                <p>
                  Users may register complaints or request transaction refunds under Section 43A of the Regulatory Act. Contact our AI support staff under AlvonCare in the profile menu for immediate action.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Footer bar of Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span>Alvon Group Securities © 2026</span>
          <div className="flex space-x-3 font-bold text-rose-600">
            <span className="hover:underline cursor-pointer" onClick={() => setActiveSubTab('terms')}>Terms</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer" onClick={() => setActiveSubTab('privacy')}>Privacy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer" onClick={() => setActiveSubTab('compliance')}>Compliance</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
