import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Sparkles, Brain, Download, Send, Cpu, ChevronRight, 
  ChevronDown, Bookmark, FileText, ArrowLeft, Check, AlertCircle, RefreshCw, Star
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { GlassCard } from './GlassCard';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  persona: 'gemini' | 'deepseek' | 'gpt';
  timestamp: string;
}

interface Book {
  id: string;
  title: string;
  category: string;
  author: string;
  rating: number;
  description: string;
  icon: string;
  color: string;
  chapters: { title: string; content: string }[];
}

const BOOKS_DATA: Book[] = [
  {
    id: 'upsc_polity',
    title: 'UPSC Civil Services: Indian Polity & Constitution Notes',
    category: 'UPSC & Civics',
    author: 'Dr. R. K. Sharma, IAS (Retd.)',
    rating: 4.9,
    description: 'A comprehensive study guide detailing the Preamble, Fundamental Rights, Directive Principles, and the federal structure of the Indian democratic framework.',
    icon: '🏛️',
    color: 'from-orange-500 to-amber-600',
    chapters: [
      {
        title: 'Chapter 1: Historical Underpinnings & Preamble',
        content: 'The Indian Constitution is unique in its spirit and content. Although drafted with inspiration from global democracies (Government of India Act 1935, British Constitutional system, and US Bill of Rights), it is thoroughly customized to address India’s pluralistic society. The Preamble serves as the prefix to the Constitution, establishing India as a Sovereign, Socialist, Secular, Democratic Republic. It pledges to secure justice, liberty, equality for all citizens, and to promote fraternity.'
      },
      {
        title: 'Chapter 2: Fundamental Rights (Articles 12-35)',
        content: 'Part III of the Constitution guarantees six fundamental rights to all citizens, which are justiciable in nature. These include the Right to Equality (Articles 14-18), Right to Freedom (Articles 19-22), Right against Exploitation (Articles 23-24), Right to Freedom of Religion (Articles 25-28), Cultural and Educational Rights (Articles 29-30), and the Right to Constitutional Remedies (Article 32) - famously described by Dr. B.R. Ambedkar as the heart and soul of the Constitution.'
      },
      {
        title: 'Chapter 3: Federalism & Decentralization (The Panchayati Raj)',
        content: 'The 73rd and 74th Constitutional Amendment Acts of 1992 institutionalized the third-tier of local governance: Panchayats (rural) and Municipalities (urban). This landmark devolution of power is the world’s largest experiment in local democracy, ensuring political representation, rural development, and direct participation of citizens at the grass-roots level.'
      }
    ]
  },
  {
    id: 'vedic_maths',
    title: 'Vedic Mathematics: Mental Speed-Math Shortcuts',
    category: 'Vedic Maths & Science',
    author: 'Acharya Vignesh Shastri',
    rating: 4.8,
    description: 'Unlock 16 ancient mental arithmetic sutras to perform rapid multiplications, squares, cube roots, and complex algebra in seconds without pen or paper.',
    icon: '🧮',
    color: 'from-rose-500 to-pink-600',
    chapters: [
      {
        title: 'Chapter 1: Ekadhikena Purvena (One More than the Previous)',
        content: 'This sutra is incredibly helpful for finding the square of numbers ending in 5. \n\nFormula: To square a number like N5, the answer ends in 25, and the starting part is N × (N + 1).\n\nExample: To square 75:\n1. Split the number: 7 | 5\n2. Multiply the previous digit (7) by "one more than itself" (7 + 1 = 8): 7 × 8 = 56.\n3. Append 25 at the end: Result is 5625! This is direct, instant, and requires zero standard multiplication lines.'
      },
      {
        title: 'Chapter 2: Nikhilam Navatashcaramam Dashatah (All from 9 and Last from 10)',
        content: 'This sutra is a powerful mental trick for rapid multiplication of numbers close to a base (like 10, 100, 1000).\n\nExample: Multiply 93 by 97 (Base 100):\n1. Write down deviations from 100: 93 is -7, 97 is -3.\n2. Cross-subtract: 93 - 3 = 90 (or 97 - 7 = 90). This forms the left part: 90.\n3. Multiply deviations: (-7) × (-3) = 21. This forms the right part: 21.\n4. Merge the two parts: 9021. Simple, bulletproof, and extremely fast!'
      },
      {
        title: 'Chapter 3: Urdhva-Tiryagbhyam (Vertically and Crosswise)',
        content: 'The general multiplication formula applicable to all numbers. It involves multiplying digits vertically and crosswise, adding carry-overs progressively. It collapses standard multi-line multiplications into a single unified row, reducing working-memory load during exams.'
      }
    ]
  },
  {
    id: 'startup_india',
    title: 'Aatmanirbhar Entrepreneurship: The Indian Business Blueprint',
    category: 'Business & Finance',
    author: 'Sunil Nair & Alvon Business Council',
    rating: 4.7,
    description: 'A practical, localized handbook for bootstrapping and scaling MSMEs in India, understanding GST compliance, UPI digital retail pipelines, and raising government seed funds.',
    icon: '📈',
    color: 'from-emerald-500 to-teal-600',
    chapters: [
      {
        title: 'Chapter 1: Finding Your Product-Market Fit in Tier-2/3 India',
        content: 'The next wave of digital consumption and retail growth in India is occurring outside the major metro areas. Creating value in Tier-2 and Tier-3 towns requires affordable pricing (sachet-sized packaging), local language support, and heavy reliance on trust. Modern business models leverage existing local networks (like Kirana stores) to distribute products instead of heavy capital setups.'
      },
      {
        title: 'Chapter 2: Leveraging UPI & India Stack as an Infrastructure',
        content: 'Unified Payments Interface (UPI) has democratized finance. By building your commerce pipeline on top of the India Stack (Aadhaar e-KYC, DigiLocker, Account Aggregators), you can reduce customer onboarding overheads from thousands of rupees to near zero. Digital credit ledgers make underwriting simpler, enabling small businesses to qualify for invoice financing effortlessly.'
      },
      {
        title: 'Chapter 3: Government MSME Schemes & Tax Compliance',
        content: 'The Startup India Initiative, Stand-Up India, and Mudra loans offer collateral-free credit limits, income tax exemptions, and specialized patents and legal compliance fast-tracks. Registering under the MSME Udyam portal unlocks lower interest rates on bank credit, protection against delayed payments, and priority sector lending allocations.'
      }
    ]
  },
  {
    id: 'web_typescript',
    title: 'TypeScript Next-Gen Web Development',
    category: 'Technology & Code',
    author: 'Alvon Dev Team Academic Series',
    rating: 4.9,
    description: 'Master advanced React architecture with Vite, strict compile-time types, API proxy routes, and performance optimization for heavy-density super apps.',
    icon: '💻',
    color: 'from-blue-500 to-indigo-600',
    chapters: [
      {
        title: 'Chapter 1: Strict Typing & Generic Constraints',
        content: 'TypeScript enforces safety by removing runtime surprises. Utilizing generic constraints like `<T extends object>` ensures helper functions process object states reliably. Always avoid using the `any` keyword; instead, utilize `unknown` with narrowers, discriminated unions, and mapped types to construct bulletproof interfaces.'
      },
      {
        title: 'Chapter 2: State Optimization & Hook Stabilization',
        content: 'In complex single-page apps, stabilizing callbacks is vital to prevent component tree re-renders. Use `useCallback` and `useMemo` with primitive dependency arrays. Always clean up subscriptions, interval timers, and signal controllers inside the `useEffect` cleanup hook return block to guard against memory leaks.'
      },
      {
        title: 'Chapter 3: Server-Side API Proxy Gateways',
        content: 'To prevent API keys and third-party secrets from being exposed to the browser, always configure backend routes (like `/api/*`) as secure proxies. Let the client make request-payload calls to the server. The server can safely append process.env secret variables and invoke target models securely.'
      }
    ]
  }
];

export const AlvonLearning: React.FC = () => {
  // Navigation & Sub-mode states
  const [activeSubMode, setActiveSubMode] = useState<'chat' | 'library'>('chat');
  
  // Multi-AI Chat states
  const [selectedPersona, setSelectedPersona] = useState<'gemini' | 'deepseek' | 'gpt'>('gemini');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Namaste! Welcome to Alvon AI Hub. I am configured with multiple AI personalities to aid your studies, preparation, and coding. How can I help you today?',
      persona: 'gemini',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // E-Books states
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [searchBookQuery, setSearchBookQuery] = useState('');
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);
  const [bookMarkedChapters, setBookMarkedChapters] = useState<string[]>([]); // bookId-chapterIndex

  // Scroll to bottom on new chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  // Quick Starter Prompts
  const STARTER_PROMPTS = [
    { label: 'UPSC Polity Prep', text: 'Explain the fundamental rights in the Indian Constitution briefly for UPSC preparation.', persona: 'gemini' as const },
    { label: 'Vedic Math Trick', text: 'Give me a fast Vedic Math trick to multiply numbers near 100 with step-by-step reasoning.', persona: 'deepseek' as const },
    { label: 'Optimize TypeScript', text: 'Write a typescript debounce function and explain the optimization pattern.', persona: 'gpt' as const }
  ];

  // Call the backend endpoint `/api/learning/chat`
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      persona: selectedPersona,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/learning/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, persona: selectedPersona })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text,
        persona: selectedPersona,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: '⚠️ An error occurred while communicating with the AI. Please verify your connection or try again. (If using live AI, ensure your Gemini API Key is stored correctly in Settings > Secrets).',
        persona: selectedPersona,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Parse response content to extract `<think>` reasoning block for DeepSeek persona
  const parseThinkBlock = (text: string) => {
    const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
    const match = text.match(thinkRegex);
    
    if (match) {
      const reasoning = match[1].trim();
      const answer = text.replace(thinkRegex, '').trim();
      return { reasoning, answer };
    }
    
    return { reasoning: null, answer: text };
  };

  // Generate and Download PDF of a Book using jsPDF
  const handleDownloadPDF = (book: Book) => {
    setDownloadProgress(book.id);
    
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        
        // Premium Title Header Design
        doc.setFillColor(243, 244, 246);
        doc.rect(0, 0, 210, 45, 'F');
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(225, 29, 72); // Rose primary color
        doc.text("ALVON KNOWLEDGE HUB", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Premium Digital Education Series | Made in India Initiative", 14, 28);
        doc.text(`Author: ${book.author}`, 14, 34);
        doc.text(`Category: ${book.category} | Rated ${book.rating}/5.0`, 14, 39);
        
        // Draw a dividing line
        doc.setLineWidth(0.5);
        doc.setDrawColor(225, 29, 72);
        doc.line(14, 45, 196, 45);
        
        // Book Title
        doc.setFontSize(16);
        doc.setTextColor(17, 24, 39);
        doc.text(book.title, 14, 58);
        
        // Book Intro
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81);
        const splitIntro = doc.splitTextToSize(book.description, 180);
        doc.text(splitIntro, 14, 66);
        
        let yOffset = 85;
        
        // Add Chapters
        book.chapters.forEach((chapter, index) => {
          if (yOffset > 240) {
            doc.addPage();
            yOffset = 25;
          }
          
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(13);
          doc.setTextColor(17, 24, 39);
          doc.text(chapter.title, 14, yOffset);
          yOffset += 7;
          
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(10.5);
          doc.setTextColor(55, 65, 81);
          
          const splitContent = doc.splitTextToSize(chapter.content, 182);
          doc.text(splitContent, 14, yOffset);
          yOffset += (splitContent.length * 5.5) + 12;
        });
        
        // Footer on all pages
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFont('Helvetica', 'oblique');
          doc.setFontSize(8.5);
          doc.setTextColor(150);
          doc.text(`Page ${i} of ${pageCount} | Generated securely via Alvon AI & Learning Core`, 14, 287);
        }
        
        doc.save(`Alvon_Hub_${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      } catch (err) {
        console.error('PDF Generation failed:', err);
      } finally {
        setDownloadProgress(null);
      }
    }, 1200);
  };

  // Toggle chapter bookmark
  const toggleBookmark = (bookId: string, chapterIdx: number) => {
    const key = `${bookId}-${chapterIdx}`;
    setBookMarkedChapters(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Filter books list based on search query
  const filteredBooks = BOOKS_DATA.filter(book => 
    book.title.toLowerCase().includes(searchBookQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchBookQuery.toLowerCase()) ||
    book.description.toLowerCase().includes(searchBookQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="alvon-learning-section">
      
      {/* 1. Header Hero Banner */}
      <GlassCard className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white border-none flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <span className="bg-rose-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
              MADE IN INDIA
            </span>
            <span className="bg-cyan-600/30 text-cyan-300 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider font-mono flex items-center space-x-1 border border-cyan-500/20">
              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
              <span>MULTIPLE AI ENGINES</span>
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight flex items-center justify-center md:justify-start space-x-2">
            <span>📚</span>
            <span>Alvon AI Hub & E-Library</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl font-medium">
            Empowering India's digital knowledge landscape. Consult our specialist Multi-AI chatbots, master mental Speed-Math tricks, prepare for exams, or download premium study material as offline PDFs instantly.
          </p>
        </div>
        
        {/* Sub-navigation pill selector */}
        <div className="bg-white/5 backdrop-blur-md p-1.5 rounded-xl flex space-x-1.5 border border-white/10 w-full md:w-auto shrink-0">
          <button
            onClick={() => { setActiveSubMode('chat'); setSelectedBook(null); }}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-lg text-xs font-black tracking-tight flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeSubMode === 'chat' 
                ? 'bg-rose-600 text-white shadow-md' 
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Multi-AI Chat</span>
          </button>
          <button
            onClick={() => setActiveSubMode('library')}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-lg text-xs font-black tracking-tight flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeSubMode === 'library' 
                ? 'bg-rose-600 text-white shadow-md' 
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>E-Books Library</span>
          </button>
        </div>
      </GlassCard>

      {/* 2. Interactive AI Chat Mode */}
      {activeSubMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Persona Selection Panel */}
          <div className="lg:col-span-4 space-y-4">
            <GlassCard className="p-4 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-400 font-mono tracking-wider uppercase">
                Select Active AI Engine
              </h3>
              
              <div className="space-y-3">
                {/* Gemini Engine */}
                <button
                  onClick={() => setSelectedPersona('gemini')}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                    selectedPersona === 'gemini'
                      ? 'bg-blue-50/70 border-blue-200 shadow-md shadow-blue-500/5'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedPersona === 'gemini' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-800">Alvon Gemini 3.5</span>
                      <span className="text-[9px] bg-blue-100 text-blue-700 font-extrabold px-1.5 py-0.2 rounded font-mono uppercase">Standard</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Optimized for rapid conceptual summaries, exam structure, and general study guides.
                    </p>
                  </div>
                </button>

                {/* DeepSeek Reasoning Engine */}
                <button
                  onClick={() => setSelectedPersona('deepseek')}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                    selectedPersona === 'deepseek'
                      ? 'bg-rose-50/70 border-rose-200 shadow-md shadow-rose-500/5'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedPersona === 'deepseek' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Brain className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-800">DeepSeek R1 Core</span>
                      <span className="text-[9px] bg-rose-100 text-rose-700 font-extrabold px-1.5 py-0.2 rounded font-mono uppercase">Reasoning</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Simulates rigorous step-by-step logic, UPSC-style analytical arguments, and coding theory.
                    </p>
                  </div>
                </button>

                {/* GPT Engine */}
                <button
                  onClick={() => setSelectedPersona('gpt')}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                    selectedPersona === 'gpt'
                      ? 'bg-cyan-50/70 border-cyan-200 shadow-md shadow-cyan-500/5'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedPersona === 'gpt' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-800">Alvon GPT-4o</span>
                      <span className="text-[9px] bg-cyan-100 text-cyan-700 font-extrabold px-1.5 py-0.2 rounded font-mono uppercase">Specialist</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Exceptional performance for advanced software engineering, syntax structure, and legal briefs.
                    </p>
                  </div>
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Toggle any model to observe how system instructions dynamically reformat the answer. Under real configuration, the Gemini API is processed securely server-side.
                </p>
              </div>
            </GlassCard>

            {/* Quick Starters list */}
            <GlassCard className="p-4 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-400 font-mono tracking-wider uppercase">
                Quick Starter Queries
              </h4>
              <div className="flex flex-col gap-2">
                {STARTER_PROMPTS.map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedPersona(starter.persona);
                      handleSendMessage(starter.text);
                    }}
                    className="p-2.5 text-left rounded-lg bg-white border border-slate-100 hover:border-rose-400 hover:bg-rose-50/20 text-[11px] font-bold text-slate-700 flex items-center justify-between group transition-all cursor-pointer"
                  >
                    <span className="truncate mr-2">{starter.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Chat Conversational Workspace */}
          <div className="lg:col-span-8">
            <GlassCard className="p-0 border-none shadow-xl overflow-hidden flex flex-col h-[520px]">
              
              {/* Chat Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full animate-ping ${
                    selectedPersona === 'deepseek' ? 'bg-rose-600' : selectedPersona === 'gpt' ? 'bg-cyan-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <h4 className="text-xs font-black text-slate-800 flex items-center space-x-1.5">
                      <span>Conversing with</span>
                      <span className="text-rose-600 font-extrabold">
                        {selectedPersona === 'gemini' ? 'Alvon Gemini 3.5' : selectedPersona === 'deepseek' ? 'DeepSeek R1 Core' : 'Alvon GPT-4o'}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Server-routed API Session | UTC 2026-07-18
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setMessages([
                    {
                      id: 'welcome',
                      sender: 'ai',
                      text: 'Welcome back! Chat history cleared. Ask me anything to begin.',
                      persona: selectedPersona,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ])}
                  className="px-2.5 py-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-600 text-[10px] font-black rounded-lg transition-all flex items-center space-x-1 cursor-pointer border border-slate-100"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear Chat</span>
                </button>
              </div>

              {/* Chat History Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg) => {
                  const isAI = msg.sender === 'ai';
                  const parsed = parseThinkBlock(msg.text);
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} space-y-1.5`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-mono text-slate-400">
                          {isAI ? (msg.persona === 'deepseek' ? '🧠 DEEPSEEK R1' : msg.persona === 'gpt' ? '💻 GPT-4O' : '✨ GEMINI') : 'YOU'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">• {msg.timestamp}</span>
                      </div>

                      <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-medium leading-relaxed shadow-sm ${
                        isAI 
                          ? 'bg-white text-slate-800 border border-slate-100' 
                          : 'bg-rose-600 text-white rounded-br-none'
                      }`}>
                        
                        {/* Render reasoning step if DeepSeek output has think block */}
                        {isAI && parsed.reasoning && (
                          <ThinkProcess reasoning={parsed.reasoning} />
                        )}

                        {/* Text Response Body */}
                        <p className="whitespace-pre-line font-sans tracking-tight">
                          {parsed.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Loading Indicator */}
                {isChatLoading && (
                  <div className="flex flex-col items-start space-y-1.5 animate-pulse">
                    <span className="text-[10px] font-mono text-slate-400">
                      AI is formulating response...
                    </span>
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center space-x-2.5 shadow-sm max-w-[50%]">
                      <div className="flex space-x-1">
                        <div className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-400">Thinking...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                  placeholder={`Ask ${selectedPersona === 'gemini' ? 'Gemini 3.5' : selectedPersona === 'deepseek' ? 'DeepSeek R1 (Deep Reasoning)' : 'GPT-4o'} anything...`}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  disabled={isChatLoading}
                />
                <button
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={isChatLoading || !inputMessage.trim()}
                  className="p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-md shadow-rose-600/10 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* 3. E-Books Digital Library Mode */}
      {activeSubMode === 'library' && (
        <div className="space-y-6">
          
          {/* Active Book Reader Overlay Viewer */}
          <AnimatePresence>
            {selectedBook && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-6 overflow-hidden relative"
              >
                {/* Back button to return to catalog */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <button
                    onClick={() => { setSelectedBook(null); setCurrentChapterIndex(0); }}
                    className="flex items-center space-x-2 text-xs font-black text-rose-600 hover:text-rose-700 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Bookshelf</span>
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black font-mono text-slate-500 uppercase">
                      Category: {selectedBook.category}
                    </span>
                    <button
                      onClick={() => toggleBookmark(selectedBook.id, currentChapterIndex)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        bookMarkedChapters.includes(`${selectedBook.id}-${currentChapterIndex}`)
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : 'border-slate-100 text-slate-400 hover:text-slate-600'
                      }`}
                      title="Bookmark Chapter"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(selectedBook)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadProgress === selectedBook.id ? 'Compiling PDF...' : 'Download PDF'}</span>
                    </button>
                  </div>
                </div>

                {/* Reader Workspace Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Chapter Selector Rail */}
                  <div className="md:col-span-4 space-y-2.5">
                    <h4 className="text-xs font-black font-mono text-slate-400 tracking-wider uppercase">
                      Chapters List
                    </h4>
                    <div className="flex flex-col gap-2">
                      {selectedBook.chapters.map((ch, idx) => {
                        const isCurrent = idx === currentChapterIndex;
                        const isMarked = bookMarkedChapters.includes(`${selectedBook.id}-${idx}`);
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentChapterIndex(idx)}
                            className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                              isCurrent
                                ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-sm'
                                : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <span className="truncate pr-2">{ch.title.split(':')[0]}</span>
                            <div className="flex items-center space-x-1 shrink-0">
                              {isMarked && <Bookmark className="w-3 h-3 text-rose-600 fill-rose-600" />}
                              <ChevronRight className={`w-3.5 h-3.5 ${isCurrent ? 'text-rose-600 translate-x-0.5' : 'text-slate-400'}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl space-y-2">
                      <div className="flex items-center space-x-2 text-orange-800">
                        <span className="text-base">🇮🇳</span>
                        <h5 className="text-[11px] font-black uppercase tracking-wider font-mono">UPSC / IIT-JEE Companion</h5>
                      </div>
                      <p className="text-[10px] text-orange-700 leading-relaxed font-medium">
                        These chapters have been formatted directly for preparation. Use our Multi-AI chat on the left to clarify queries about this chapter!
                      </p>
                    </div>
                  </div>

                  {/* Chapter Content Typography Panel */}
                  <div className="md:col-span-8 bg-slate-50 border border-slate-100 p-6 rounded-2xl min-h-[300px] flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="text-base font-black text-slate-800 font-display border-b border-slate-200/60 pb-3">
                        {selectedBook.chapters[currentChapterIndex].title}
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans font-medium">
                        {selectedBook.chapters[currentChapterIndex].content}
                      </p>
                    </div>

                    {/* Pagination buttons */}
                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-4 mt-6">
                      <button
                        onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentChapterIndex === 0}
                        className="px-4 py-2 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-xs font-black text-slate-600 transition-all cursor-pointer"
                      >
                        Previous Chapter
                      </button>
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        Chapter {currentChapterIndex + 1} of {selectedBook.chapters.length}
                      </span>
                      <button
                        onClick={() => setCurrentChapterIndex(prev => Math.min(selectedBook.chapters.length - 1, prev + 1))}
                        disabled={currentChapterIndex === selectedBook.chapters.length - 1}
                        className="px-4 py-2 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-xs font-black text-slate-600 transition-all cursor-pointer"
                      >
                        Next Chapter
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Book catalog section */}
          {!selectedBook && (
            <div className="space-y-6">
              
              {/* Filter / Search Shelf */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800 font-display">
                    Explore Curated Study Guides & Textbook Summaries
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Select a text to open the high-fidelity immersive textbook reader.
                  </p>
                </div>
                
                <input
                  type="text"
                  placeholder="Search educational e-books..."
                  value={searchBookQuery}
                  onChange={(e) => setSearchBookQuery(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 text-xs font-bold border border-slate-100 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              {/* Books Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBooks.map((book) => (
                  <GlassCard 
                    key={book.id} 
                    className="p-5 flex flex-col justify-between hover:shadow-lg transition-all border-slate-100"
                  >
                    <div className="space-y-3.5">
                      {/* Book header details */}
                      <div className="flex items-center justify-between">
                        <span className="bg-rose-50 text-rose-600 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                          {book.category}
                        </span>
                        
                        <div className="flex items-center space-x-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-100">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span className="text-[10px] font-extrabold font-mono">{book.rating}</span>
                        </div>
                      </div>

                      {/* Title & icon */}
                      <div className="flex items-start space-x-3.5">
                        <div className={`p-3 bg-gradient-to-br ${book.color} text-white text-2xl rounded-xl shadow-md shrink-0`}>
                          {book.icon}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-800 leading-tight">
                            {book.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            By {book.author}
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        {book.description}
                      </p>
                    </div>

                    {/* Book catalog buttons */}
                    <div className="flex items-center gap-2 border-t border-slate-100 pt-4 mt-4">
                      <button
                        onClick={() => setSelectedBook(book)}
                        className="flex-1 py-2.5 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 text-slate-700 hover:text-rose-600 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Book</span>
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(book)}
                        disabled={downloadProgress === book.id}
                        className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-rose-600/10 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadProgress === book.id ? 'Compiling...' : 'Download PDF'}</span>
                      </button>
                    </div>

                  </GlassCard>
                ))}
              </div>

              {filteredBooks.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs font-bold font-mono">
                  No e-books match your search query. Please try searching for 'UPSC', 'Vedic', 'Startup', or 'TypeScript'.
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

// Collapsible collapsible element simulating the R1 step-by-step thinking container
const ThinkProcess: React.FC<{ reasoning: string }> = ({ reasoning }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-3.5 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden text-slate-600">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 flex items-center justify-between text-[11px] font-black font-mono tracking-wider uppercase text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <Brain className="w-3.5 h-3.5 text-rose-600" />
          <span>DeepSeek R1 Reasoning Process</span>
        </div>
        <div>
          {isOpen ? <ChevronDown className="w-4 h-4 rotate-180 transition-transform" /> : <ChevronDown className="w-4 h-4 transition-transform" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-slate-100 text-[10px] font-mono text-slate-500 bg-slate-50/50 leading-relaxed whitespace-pre-line border-l-2 border-l-rose-500">
          {reasoning}
        </div>
      )}
    </div>
  );
};
