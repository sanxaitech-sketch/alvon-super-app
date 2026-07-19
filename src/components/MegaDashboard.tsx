import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, Wallet, ShieldCheck, Zap, Sparkles, Search, Play, Pause, 
  SkipForward, SkipBack, Volume2, Camera, Image as ImageIcon, Music, Youtube, 
  Gamepad2, MessageSquare, HardDrive, Mail, MapPin, Edit3, Trash2, FolderPlus, 
  Upload, Send, Check, CheckCheck, Clock, Share2, Heart, MessageCircle, 
  AlertCircle, FileText, Star, X, RefreshCw, ChevronRight, Award, Plus, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { UserProfile, Product, CartItem } from '../types';

interface MegaDashboardProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onTabChange: (tab: any) => void;
  cart: CartItem[];
  onAddToCart: (p: Product) => void;
  onRemoveFromCart: (id: string) => void;
  onUpdateCartQuantity: (id: string, qty: number) => void;
  onCheckout: () => boolean;
}

// Simulated AdSense component
const AdSensePlaceholder: React.FC<{ onUpgradeClick: () => void }> = ({ onUpgradeClick }) => {
  const adCampaigns = [
    { title: 'Alvon SoundBuds Air Pro', desc: 'Active Noise Cancelling. ₹3,999 only!', cta: 'Shop Now', icon: '🎧' },
    { title: 'Alvon GigaRouter Max 5G', desc: 'Fastest home Wi-Fi starting at ₹1,999/mo', cta: 'Get Fibre', icon: '📡' },
    { title: 'Digital India Seva Kendra', desc: 'Apply for Aadhaar, PAN, & Land Jamabandi online', cta: 'Launch Hub', icon: '🏦' }
  ];
  
  const [currentAd, setCurrentAd] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % adCampaigns.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const ad = adCampaigns[currentAd];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
    >
      <div className="flex items-center gap-3.5">
        <span className="text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded uppercase font-mono tracking-wider">Ad</span>
        <div className="text-2xl bg-white p-2 rounded-xl shadow-inner border border-amber-100">{ad.icon}</div>
        <div>
          <h5 className="text-xs font-extrabold text-amber-900">{ad.title}</h5>
          <p className="text-[11px] text-amber-700/90 font-medium">{ad.desc}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button 
          onClick={onUpgradeClick}
          className="text-[10px] font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-all shrink-0 font-mono"
        >
          Hide Ads (₹9/mo)
        </button>
        <button 
          onClick={() => alert(`Simulated link: Browsing campaign for ${ad.title}`)}
          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-extrabold px-4 py-1.5 rounded-xl shadow-sm hover:shadow transition-all shrink-0 font-mono"
        >
          {ad.cta}
        </button>
      </div>
    </motion.div>
  );
};

export const MegaDashboard: React.FC<MegaDashboardProps> = ({
  user,
  onUpdateUser,
  onTabChange,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQuantity,
  onCheckout
}) => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Confetti/Celebration trigger state
  const [celebrate, setCelebrate] = useState(false);

  // Upgrade user to Premium (Ad-free)
  const handleUpgradeToPremium = () => {
    if (user.walletBalance < 9) {
      alert("Insufficient Balance in your Alvon Pay wallet! Please add money to your wallet in Alvon Pay tab to upgrade.");
      return;
    }
    
    // Deduct ₹9 & update premium status
    onUpdateUser({
      walletBalance: user.walletBalance - 9,
      isPremium: true
    });
    
    // Trigger celebrate success
    setCelebrate(true);
    setTimeout(() => {
      setCelebrate(false);
      setShowPremiumModal(false);
    }, 3000);
  };

  // List of Mega App categories & sub-apps
  const appCategories = [
    {
      title: 'E-Commerce & Delivery',
      apps: [
        { id: 'alvon-mart', name: 'Alvon Mart', icon: '🛒', desc: 'Amazon/Flipkart-style store with cart', color: 'from-rose-500 to-pink-500' },
        { id: 'alvon-express', name: 'Alvon Express', icon: '📦', desc: 'Instant grocery & package delivery tracker', color: 'from-amber-500 to-orange-500' }
      ]
    },
    {
      title: 'Media & Entertainment',
      apps: [
        { id: 'alvon-music', name: 'Alvon Music', icon: '🎵', desc: 'JioSaavn-style stream and active music catalog', color: 'from-cyan-500 to-blue-500' },
        { id: 'alvon-tube', name: 'Alvon Tube', icon: '📺', desc: 'YouTube-style video library with player', color: 'from-red-500 to-rose-600' },
        { id: 'alvon-games', name: 'Alvon Games', icon: '🎮', desc: 'Play Tic-Tac-Toe, Rock-Paper-Scissors, Memory', color: 'from-violet-500 to-indigo-500' }
      ]
    },
    {
      title: 'Communication & Social',
      apps: [
        { id: 'alvon-chat', name: 'Alvon Chat', icon: '💬', desc: 'WhatsApp-style chat platform with smart bot', color: 'from-emerald-500 to-green-600' },
        { id: 'alvon-social', name: 'Alvon Social', icon: '👥', desc: 'Meta-style social community post feed', color: 'from-blue-600 to-sky-500' }
      ]
    },
    {
      title: 'Google-Suite Alternatives',
      apps: [
        { id: 'alvon-drive', name: 'Alvon Drive', icon: '💾', desc: 'Cloud storage, uploads and folders', color: 'from-teal-500 to-emerald-600' },
        { id: 'alvon-mail', name: 'Alvon Mail', icon: '📧', desc: 'Gmail-style mail inbox and client composer', color: 'from-blue-500 to-indigo-600' },
        { id: 'alvon-map', name: 'Alvon Map', icon: '🗺️', desc: 'CSC Kendra G2C GPS route tracker', color: 'from-rose-500 to-red-500' },
        { id: 'alvon-blogger', name: 'Alvon Blogger', icon: '✍️', desc: 'WordPress-style blogging & studio dashboard', color: 'from-amber-600 to-yellow-500' }
      ]
    },
    {
      title: 'Native Hardware Utilities',
      apps: [
        { id: 'camera-app', name: 'Camera', icon: '📷', desc: 'Live camera permission feed & capture', color: 'from-slate-700 to-slate-900' },
        { id: 'gallery-app', name: 'Gallery', icon: '🖼️', desc: 'Local media file browser & lightbox', color: 'from-slate-600 to-slate-800' },
        { id: 'music-player', name: 'Audio Player', icon: '🎧', desc: 'Lossless audio player & visualizer', color: 'from-pink-500 to-rose-500' }
      ]
    }
  ];

  const filteredCategories = appCategories.map(cat => ({
    ...cat,
    apps: cat.apps.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      app.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.apps.length > 0);

  // --- SUB-APP INTERNAL STATES ---

  // 1. MUSIC (JioSaavn Style)
  const songsList = [
    { id: 's1', title: 'Kesariya - Brahmastra', artist: 'Arijit Singh', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: '3:12', cover: '🍁', lyrics: 'Kesariya tera ishq hai piya...\nRang jaaun jo main haath lagaaun...' },
    { id: 's2', title: 'Digital India Synthwave', artist: 'Alvon Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: '4:02', cover: '⚡', lyrics: 'Welcome to the Future...\nPowered by Alvon True 5G...' },
    { id: 's3', title: 'Namo Namo - Kedarnath', artist: 'Amit Trivedi', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: '3:45', cover: '🕉️', lyrics: 'Namo namo ji Shankara...\nBholenath Shankara...' },
    { id: 's4', title: 'Tum Hi Ho - Aashiqui 2', artist: 'Arijit Singh', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: '4:22', cover: '❤️', lyrics: 'Hum tere bin ab reh nahi sakte...\nTere bina kya wajood mera...' },
    { id: 's5', title: 'Cyber Lofi chillhop', artist: 'Mellow India', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration: '2:50', cover: '☕', lyrics: '[Instrumental Chill Beats]\nRelax and work...' }
  ];
  const [currentSong, setCurrentSong] = useState(songsList[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songProgress, setSongProgress] = useState(30); // percentage
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => {
    const idx = songsList.findIndex(s => s.id === currentSong.id);
    const nextIdx = (idx + 1) % songsList.length;
    setCurrentSong(songsList[nextIdx]);
    setIsPlaying(true);
  };
  const prevTrack = () => {
    const idx = songsList.findIndex(s => s.id === currentSong.id);
    const prevIdx = (idx - 1 + songsList.length) % songsList.length;
    setCurrentSong(songsList[prevIdx]);
    setIsPlaying(true);
  };

  // 2. TUBE (YouTube Style)
  const videoList = [
    { id: 'v1', title: 'Alvon Fiber - Connecting Rural India at 1 Gbps', views: '2.4M views', duration: '4:30', time: '2 days ago', thumbnail: '📡', channel: 'Alvon Tech', likes: '142K', desc: 'In this documentary, we explore how Alvon is laying ultra-fast optical fiber networks across over 10,000 panchayats, enabling smart education & healthcare.' },
    { id: 'v2', title: 'Arijit Singh - Kesariya (Live Acoustic Session)', views: '15M views', duration: '5:15', time: '1 month ago', thumbnail: '🎤', channel: 'Alvon Music India', likes: '920K', desc: 'Enjoy this exclusive live acoustic session of Kesariya. Go ad-free on Alvon Music for lossless stream qualities.' },
    { id: 'v3', title: 'India 5G Gaming Championship - Final Round', views: '840K views', duration: '12:40', time: '3 weeks ago', thumbnail: '🎮', channel: 'Alvon Esports', likes: '58K', desc: 'The biggest Indian gaming championship hosted entirely on Alvon True 5G lowest latency bandwidth servers.' },
    { id: 'v4', title: 'How to build an E-mitra Digital Seva Store', views: '320K views', duration: '8:50', time: '5 days ago', thumbnail: '🏦', channel: 'E-mitra Kiosk Tutorials', likes: '12K', desc: 'A step-by-step masterclass on deploying citizen services using the Alvon Smart Hub tools dashboard.' }
  ];
  const [selectedVideo, setSelectedVideo] = useState(videoList[0]);
  const [videoComments, setVideoComments] = useState([
    { author: 'Rohan Gupta', text: 'This speed is absolutely real! My village got fiber yesterday!' },
    { author: 'Neha Sharma', text: 'Loved the acoustics session, Arijit has a divine voice.' }
  ]);
  const [newComment, setNewComment] = useState('');
  const addVideoComment = () => {
    if (!newComment.trim()) return;
    setVideoComments([...videoComments, { author: user.name, text: newComment }]);
    setNewComment('');
  };

  // 3. NATIVE HARDWARE: CAMERA
  const videoStreamRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState('');

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setCameraStream(stream);
      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error(err);
      setCameraError('Permission Denied. Please ensure you are running in HTTPS / open tab and approved camera popups.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoStreamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoStreamRef.current.videoWidth || 640;
      canvas.height = videoStreamRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoStreamRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedPhotos([dataUrl, ...capturedPhotos]);
        alert("Snapshot saved to in-app Gallery! View it in the Gallery app.");
      }
    }
  };

  // 4. ALVON GAMES HUB
  const [selectedGame, setSelectedGame] = useState<'tic-tac-toe' | 'rps' | 'memory' | null>('tic-tac-toe');
  // Tic-Tac-Toe Game State
  const [tttBoard, setTttBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [tttTurn, setTttTurn] = useState<'X' | 'O'>('X');
  const [tttWinner, setTttWinner] = useState<string | null>(null);
  const [tttScore, setTttScore] = useState({ player: 0, ai: 0, ties: 0 });

  const handleTttClick = (index: number) => {
    if (tttBoard[index] || tttWinner) return;
    const newBoard = [...tttBoard];
    newBoard[index] = 'X';
    setTttBoard(newBoard);
    
    const win = checkTttWinner(newBoard);
    if (win) {
      setTttWinner(win);
      if (win === 'X') setTttScore(s => ({ ...s, player: s.player + 1 }));
      return;
    }
    
    if (newBoard.filter(b => b === null).length === 0) {
      setTttWinner('Tie');
      setTttScore(s => ({ ...s, ties: s.ties + 1 }));
      return;
    }

    // AI Turn (Simulated smart random opponent)
    setTimeout(() => {
      const emptyIndices = newBoard.map((val, idx) => val === null ? idx : -1).filter(idx => idx !== -1);
      if (emptyIndices.length > 0) {
        const aiMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        newBoard[aiMove] = 'O';
        setTttBoard(newBoard);
        const aiWin = checkTttWinner(newBoard);
        if (aiWin) {
          setTttWinner(aiWin);
          if (aiWin === 'O') setTttScore(s => ({ ...s, ai: s.ai + 1 }));
        }
      }
    }, 400);
  };

  const checkTttWinner = (board: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const resetTtt = () => {
    setTttBoard(Array(9).fill(null));
    setTttWinner(null);
  };

  // Rock Paper Scissors Game State
  const [rpsHistory, setRpsHistory] = useState<{ user: string, ai: string, result: string }[]>([]);
  const [rpsScore, setRpsScore] = useState({ user: 0, ai: 0, ties: 0 });
  const [rpsCurrentResult, setRpsCurrentResult] = useState<string | null>(null);

  const playRps = (userChoice: string) => {
    const choices = ['👊', '✋', '✌️'];
    const aiChoice = choices[Math.floor(Math.random() * choices.length)];
    let result = '';

    const emojis: { [key: string]: string } = { 'rock': '👊', 'paper': '✋', 'scissors': '✌️' };
    const userEmoji = emojis[userChoice] || '👊';

    if (userEmoji === aiChoice) {
      result = 'Tie';
      setRpsScore(s => ({ ...s, ties: s.ties + 1 }));
    } else if (
      (userEmoji === '👊' && aiChoice === '✌️') ||
      (userEmoji === '✋' && aiChoice === '👊') ||
      (userEmoji === '✌️' && aiChoice === '✋')
    ) {
      result = 'You Win! 🎉';
      setRpsScore(s => ({ ...s, user: s.user + 1 }));
    } else {
      result = 'Alvon AI Wins 🤖';
      setRpsScore(s => ({ ...s, ai: s.ai + 1 }));
    }

    setRpsCurrentResult(`You: ${userEmoji} vs AI: ${aiChoice} - ${result}`);
    setRpsHistory([{ user: userEmoji, ai: aiChoice, result }, ...rpsHistory.slice(0, 4)]);
  };

  // 5. ALVON CHAT (WhatsApp Style)
  const chatContacts = [
    { id: 'alvon_bot', name: 'Alvon Support AI 🤖', status: 'online', avatar: '🤖', lastMessage: 'Namaste! How can I assist you with your 5G plan?' },
    { id: 'mom', name: 'Maa ❤️', status: 'online', avatar: '👩', lastMessage: 'Beta, did you recharge your Alvon fiber?' },
    { id: 'rahul', name: 'Rahul (College)', status: 'away', avatar: '👦', lastMessage: 'Sent you the PDF notes, print them from Smart Hub.' },
    { id: 'priya', name: 'Priya (Work)', status: 'online', avatar: '👧', lastMessage: 'Please review the Alvon Blogger layout.' }
  ];
  const [selectedChat, setSelectedChat] = useState(chatContacts[0]);
  const [chatHistory, setChatHistory] = useState<{ [contactId: string]: { sender: 'me' | 'other', text: string, time: string }[] }>({
    'alvon_bot': [
      { sender: 'other', text: 'Welcome to Alvon Enterprise Care. How is your 5G speed?', time: '11:00 AM' },
      { sender: 'me', text: 'Speeds are incredible! Reached over 1.2 Gbps!', time: '11:02 AM' },
      { sender: 'other', text: 'Fantastic! Under our Digital India promotion, you get +50 cashback Alvon Coins on recharges.', time: '11:03 AM' }
    ],
    'mom': [
      { sender: 'other', text: 'Beta, internet is not working.', time: 'Yesterday' },
      { sender: 'me', text: 'I am sending money to our Alvon Pay wallet to recharge it now.', time: 'Yesterday' },
      { sender: 'other', text: 'Thank you, let me know when completed.', time: 'Yesterday' }
    ]
  });
  const [typingMessage, setTypingMessage] = useState('');
  const sendChatMessage = () => {
    if (!typingMessage.trim()) return;
    const timeNow = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'me' as const, text: typingMessage, time: timeNow };
    
    const updatedHistory = { ...chatHistory };
    if (!updatedHistory[selectedChat.id]) updatedHistory[selectedChat.id] = [];
    updatedHistory[selectedChat.id].push(userMsg);
    setChatHistory(updatedHistory);
    setTypingMessage('');

    // Simulated Bot auto-reply after 1 sec
    setTimeout(() => {
      let botResponse = 'Thank you for messaging! I am working on your request.';
      if (selectedChat.id === 'alvon_bot') {
        botResponse = 'Understood! Our 5G servers are fully running. You have unlimited Giga-band active. Upgrade to Alvon Premium (₹9) to completely block ads.';
      } else if (selectedChat.id === 'mom') {
        botResponse = 'God bless you beta! Take care!';
      } else if (selectedChat.id === 'rahul') {
        botResponse = 'Yes, let’s meet at the library to finish the GST homework.';
      } else if (selectedChat.id === 'priya') {
        botResponse = 'Sounds good, let me check the drive folders.';
      }

      const botMsg = { sender: 'other' as const, text: botResponse, time: timeNow };
      const nextHistory = { ...chatHistory };
      if (!nextHistory[selectedChat.id]) nextHistory[selectedChat.id] = [];
      nextHistory[selectedChat.id].push(botMsg);
      setChatHistory(nextHistory);
    }, 1200);
  };

  // 6. ALVON DRIVE (Cloud Storage)
  const [driveFiles, setDriveFiles] = useState([
    { name: 'IncomeTax_Receipt_2026.pdf', size: '1.4 MB', type: 'pdf', date: '2026-07-16' },
    { name: 'Family_Photo.jpg', size: '3.2 MB', type: 'image', date: '2026-07-14' },
    { name: 'Resume_Verified.docx', size: '420 KB', type: 'word', date: '2026-07-10' }
  ]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleDriveFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setUploadProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setDriveFiles([
            ...driveFiles,
            { 
              name: file.name, 
              size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`, 
              type: file.name.split('.').pop() || 'doc', 
              date: new Date().toISOString().split('T')[0] 
            }
          ]);
          alert("File successfully encrypted and uploaded to secure Alvon cloud server!");
        }, 300);
      }
    }, 200);
  };

  // 7. ALVON MAIL (Gmail style)
  const [mailBox, setMailBox] = useState([
    { id: 'm1', from: 'Alvon Billing Desk', subject: 'Digital Invoice: Wallet Recharge successful', date: '18 July', body: 'Namaste! This is your official digital billing invoice for ₹2,500 top-up in Alvon Pay wallet. Gained +380 Alvon coins cashback.', isRead: false },
    { id: 'm2', from: 'UIDAI Govt Portal', subject: 'Aadhaar e-KYC Verification Approval', date: '17 July', body: 'Dear Citizen, your digital Aadhaar card integration in Alvon Smart Hub has been authenticated under safe hashing algorithms.', isRead: true },
    { id: 'm3', from: 'Alvon GigaFiber', subject: 'Welcome to Next-Gen 5G Speeds', date: '15 July', body: 'Experience gigabit downloads, low latency cloud gaming, and full-stack enterprise connectivity universally.', isRead: true }
  ]);
  const [activeMail, setActiveMail] = useState<any>(null);
  const [composeMail, setComposeMail] = useState({ to: '', subject: '', body: '' });
  const [showCompose, setShowCompose] = useState(false);

  const sendEmail = () => {
    if (!composeMail.to.trim()) return;
    alert(`Email successfully queued to ${composeMail.to}! Sent via Alvon Secure Mail servers.`);
    setShowCompose(false);
    setComposeMail({ to: '', subject: '', body: '' });
  };

  // 8. ALVON MAP (CSC locator & path tracer)
  const [mapSource, setMapSource] = useState('My Location');
  const [mapDest, setMapDest] = useState('');
  const [mapRouteDrawn, setMapRouteDrawn] = useState(false);
  const [cscKendraList, setCscKendraList] = useState([
    { name: 'City Digital Seva Kendra', address: 'Block C, Sector 5, Near Metro', pin: '4.8★' },
    { name: 'Govt CSC Jan Aushadhi Store', address: 'Market Road, Sector 2', pin: '4.9★' },
    { name: 'Alvon Pay Authorized Outlet', address: 'Ground Floor, Alvon Towers', pin: '5.0★' }
  ]);

  // 9. ALVON BLOGGER (WordPress style)
  const [blogPosts, setBlogPosts] = useState([
    { id: 'b1', title: 'Why Alvon True 5G is India’s Telecom Future', author: 'Dr. Vikram Sarabhai', category: 'Technology', date: '2026-07-17', cover: '🚀', content: 'India’s digital revolution has scaled to astronomical heights. With Alvon Super App leading the charge, rural CSC portals are experiencing zero latency operations. The modular architecture enables users to switch seamlessly from shopping groceries to generating vector PDFs in our Smart Hub.' },
    { id: 'b2', title: 'Mastering E-mitra portals with Zero Hassle', author: 'Rajesh Sharma', category: 'Tutorial', date: '2026-07-15', cover: '💼', content: 'Filing taxes, linking Aadhaar, or printing birth certificates used to require physical queues. Now, the 100+ working tools on the Alvon Smart Hub allow digital operators to complete files instantly, with automated receipt downloads.' }
  ]);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', author: user.name, category: 'General', cover: '📝' });
  const [showBlogCreator, setShowBlogCreator] = useState(false);

  const publishBlog = () => {
    if (!newBlog.title.trim() || !newBlog.content.trim()) return;
    setBlogPosts([
      { 
        id: `b-${Date.now()}`, 
        title: newBlog.title, 
        author: newBlog.author, 
        category: newBlog.category, 
        date: new Date().toISOString().split('T')[0], 
        cover: newBlog.cover, 
        content: newBlog.content 
      },
      ...blogPosts
    ]);
    setShowBlogCreator(false);
    setNewBlog({ title: '', content: '', author: user.name, category: 'General', cover: '📝' });
    alert("Blog successfully published to the public Alvon Blogger feed!");
  };

  // --- AUDIO CONTROLLER HANDLER ---
  const handleMusicPlayerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setCurrentSong({
        id: `local-${Date.now()}`,
        title: file.name.split('.')[0],
        artist: 'Local Upload',
        url: fileUrl,
        duration: 'Unknown',
        cover: '💿',
        lyrics: 'No lyrics available for local media.'
      });
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Telecom Meter Dashboard (MyJio-style) */}
      <GlassCard className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 border-slate-700/50 relative overflow-hidden" hoverEffect={false}>
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-xs text-white">
                  5G
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold font-display leading-tight">Alvon Truly Unlimited 5G</h3>
                  {user.isPremium ? (
                    <span className="bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">Premium Account</span>
                  ) : (
                    <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">Free Tier</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{user.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Data Balance</p>
                <div className="flex items-baseline space-x-1 mt-1">
                  <span className="text-xl font-black font-mono">{(user.dataLimit - user.dataUsed).toFixed(1)}</span>
                  <span className="text-xs text-slate-500 font-bold">GB</span>
                  <span className="text-[10px] text-slate-400 pl-1">left of {user.dataLimit} GB</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Plan Validity</p>
                <div className="flex items-baseline space-x-1 mt-1">
                  <span className="text-xl font-black font-mono text-emerald-400">{user.daysRemaining}</span>
                  <span className="text-xs text-slate-500 font-bold">Days</span>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Alvon Wallet</p>
                <div className="flex items-baseline space-x-1 mt-1">
                  <span className="text-xl font-black font-mono text-cyan-400">₹{user.walletBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col justify-end gap-3.5 min-w-[200px]">
            <button 
              onClick={() => onTabChange('pay')}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>Recharge Now</span>
            </button>
            
            {!user.isPremium && (
              <button 
                onClick={() => setShowPremiumModal(true)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-extrabold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Go Premium (₹9/mo)</span>
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* 2. Global Freemium AdSense Placeholder System */}
      {!user.isPremium && (
        <AdSensePlaceholder onUpgradeClick={() => setShowPremiumModal(true)} />
      )}

      {/* 3. Categorized Mega Drawer Grid */}
      <div className="space-y-6">
        {/* Search App Ecosystem bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Alvon Super App ecosystem..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-rose-500 text-xs font-bold transition-all shadow-sm text-slate-800"
          />
        </div>

        {/* Dashboard Categories */}
        <div className="space-y-6">
          {filteredCategories.map((category) => (
            <div key={category.title} className="space-y-3.5">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 font-mono">{category.title}</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {category.apps.map((app) => (
                  <GlassCard 
                    key={app.id}
                    onClick={() => {
                      setActiveApp(app.id);
                      if (app.id === 'camera-app') {
                        startCamera();
                      }
                    }}
                    className="bg-white/75 p-4 border border-slate-100/80 cursor-pointer hover:border-rose-500/30 flex items-start gap-4 transition-all"
                    hoverEffect={true}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${app.color} text-white flex items-center justify-center text-xl shadow-md shrink-0`}>
                      {app.icon}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span>{app.name}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </h5>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 font-medium leading-relaxed">{app.desc}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- SUB-APP INTERACTIVE WORKSPACE OVERLAYS (FULL SCREEN GLASS MODALS) --- */}
      <AnimatePresence>
        {activeApp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">
                    {activeApp === 'alvon-mart' && '🛒'}
                    {activeApp === 'alvon-express' && '📦'}
                    {activeApp === 'alvon-music' && '🎵'}
                    {activeApp === 'alvon-tube' && '📺'}
                    {activeApp === 'alvon-games' && '🎮'}
                    {activeApp === 'alvon-chat' && '💬'}
                    {activeApp === 'alvon-social' && '👥'}
                    {activeApp === 'alvon-drive' && '💾'}
                    {activeApp === 'alvon-mail' && '📧'}
                    {activeApp === 'alvon-map' && '🗺️'}
                    {activeApp === 'alvon-blogger' && '✍️'}
                    {activeApp === 'camera-app' && '📷'}
                    {activeApp === 'gallery-app' && '🖼️'}
                    {activeApp === 'music-player' && '🎧'}
                  </span>
                  <div>
                    <h4 className="text-sm font-black font-display tracking-tight capitalize">{activeApp.replace('-', ' ')}</h4>
                    <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">Alvon Super App Ecosystem</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setActiveApp(null);
                    stopCamera();
                  }}
                  className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Sub-App Inner Body Workspace */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                
                {/* 1. NATIVE HARDWARE: CAMERA */}
                {activeApp === 'camera-app' && (
                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-lg aspect-video relative flex items-center justify-center">
                      <video ref={videoStreamRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
                      {!cameraStream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-900/95 text-white space-y-3">
                          <Camera className="w-10 h-10 text-rose-500 animate-pulse" />
                          <p className="text-xs font-bold font-mono">CAMERA PERMISSION REQUIRED</p>
                          <button 
                            onClick={startCamera}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition-all cursor-pointer"
                          >
                            Grant Access
                          </button>
                        </div>
                      )}
                    </div>
                    {cameraError && <p className="text-xs text-rose-600 font-semibold text-center">{cameraError}</p>}
                    
                    {cameraStream && (
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={capturePhoto}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Capture Snapshot</span>
                        </button>
                        <button 
                          onClick={stopCamera}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-extrabold px-4 py-2.5 rounded-xl cursor-pointer"
                        >
                          Turn Off
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. NATIVE HARDWARE: GALLERY */}
                {activeApp === 'gallery-app' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <div>
                        <h5 className="text-sm font-extrabold text-slate-800">Your Local & Captured Media</h5>
                        <p className="text-[10px] text-slate-500">Includes snaps captured with the camera tool</p>
                      </div>
                      <label className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm">
                        <Upload className="w-4 h-4" />
                        <span>Upload Photo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          className="hidden" 
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach((f) => {
                              const r = new FileReader();
                              r.onload = () => {
                                setCapturedPhotos((prev) => [r.result as string, ...prev]);
                              };
                              r.readAsDataURL(f as Blob);
                            });
                          }}
                        />
                      </label>
                    </div>

                    {capturedPhotos.length === 0 && (
                      <div className="py-20 text-center text-slate-400 space-y-2">
                        <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-xs">No media files found in your local Alvon Gallery.</p>
                        <p className="text-[10px]">Open the Camera app above to snap real photos or upload files!</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {capturedPhotos.map((url, i) => (
                        <div key={i} className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow relative aspect-square">
                          <img src={url} alt="Snap" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                            <button 
                              onClick={() => {
                                const w = window.open();
                                if (w) w.document.write(`<img src="${url}" style="max-width:100%"/>`);
                              }}
                              className="p-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold"
                            >
                              Open
                            </button>
                            <button 
                              onClick={() => setCapturedPhotos(capturedPhotos.filter((_, idx) => idx !== i))}
                              className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. ALVON MUSIC (JioSaavn Style) */}
                {activeApp === 'alvon-music' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Song Browser */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50/50 p-4 rounded-2xl border border-blue-100/60 flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-extrabold text-blue-900 font-display">Alvon Music Premium</h5>
                          <p className="text-[10px] text-blue-700/80">JioSaavn-style ad-free streaming enabled</p>
                        </div>
                        <span className="text-xs font-black text-blue-800 font-mono">Hi-Res Lossless</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Trending Songs</p>
                        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
                          {songsList.map((song) => (
                            <div 
                              key={song.id} 
                              onClick={() => {
                                setCurrentSong(song);
                                setIsPlaying(true);
                              }}
                              className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                                currentSong.id === song.id ? 'bg-cyan-50/50' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl bg-slate-50 p-1.5 rounded-lg border border-slate-100">{song.cover}</span>
                                <div>
                                  <p className={`text-xs font-bold ${currentSong.id === song.id ? 'text-cyan-600' : 'text-slate-800'}`}>{song.title}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{song.artist}</p>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono font-semibold">{song.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Active Track Control panel */}
                    <div className="md:col-span-1">
                      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg text-center flex flex-col justify-between h-full min-h-[340px]">
                        <div className="space-y-4">
                          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 mx-auto flex items-center justify-center text-5xl shadow-lg border border-slate-700">
                            {currentSong.cover}
                          </div>
                          <div>
                            <h5 className="text-sm font-extrabold truncate">{currentSong.title}</h5>
                            <p className="text-xs text-slate-400 mt-1">{currentSong.artist}</p>
                          </div>
                          
                          {/* Lyrics preview scrollbox */}
                          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 h-20 overflow-y-auto text-[10px] text-slate-300 font-medium leading-relaxed whitespace-pre-line text-left">
                            <span className="font-extrabold text-[8px] uppercase tracking-wider text-cyan-400 block mb-1">Lyrics Stream</span>
                            {currentSong.lyrics}
                          </div>
                        </div>

                        <div className="space-y-3 pt-4">
                          {/* Audio Player Component tag */}
                          <audio 
                            ref={audioRef} 
                            src={currentSong.url} 
                            onEnded={nextTrack}
                            className="hidden" 
                          />
                          
                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden relative cursor-pointer" onClick={() => setSongProgress(Math.random() * 100)}>
                              <div className="h-full bg-cyan-400 transition-all" style={{ width: `${songProgress}%` }} />
                            </div>
                            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                              <span>1:12</span>
                              <span>{currentSong.duration}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-center gap-4">
                            <button onClick={prevTrack} className="p-1 hover:text-cyan-400 transition-all"><SkipBack className="w-4 h-4" /></button>
                            <button onClick={togglePlay} className="p-2.5 bg-white text-slate-900 rounded-full hover:bg-cyan-400 hover:text-white transition-all shadow shadow-white/10">
                              {isPlaying ? <Pause className="w-5 h-5 fill-slate-900" /> : <Play className="w-5 h-5 fill-slate-900 pl-0.5" />}
                            </button>
                            <button onClick={nextTrack} className="p-1 hover:text-cyan-400 transition-all"><SkipForward className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. ALVON TUBE (YouTube Style) */}
                {activeApp === 'alvon-tube' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Video Screen */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-black rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border border-slate-200">
                        {/* Custom visual video mock overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-rose-950 text-white">
                          <span className="text-6xl animate-pulse mb-3">{selectedVideo.thumbnail}</span>
                          <h4 className="text-base font-extrabold font-display leading-tight">{selectedVideo.title}</h4>
                          <p className="text-xs text-slate-400 mt-1">{selectedVideo.channel} • {selectedVideo.views}</p>
                          
                          <button 
                            onClick={() => alert('Simulated real video streaming stream!')}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-6 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-600/30 mt-4 transition-all"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>Play Stream (5G Resolution)</span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h5 className="text-sm font-extrabold text-slate-800">{selectedVideo.title}</h5>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedVideo.views} • {selectedVideo.time}</p>
                          </div>
                          <span className="bg-slate-100 px-3 py-1 text-slate-600 text-xs font-bold rounded-xl flex items-center gap-1">
                            ❤️ {selectedVideo.likes}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100 font-medium">{selectedVideo.desc}</p>
                      </div>

                      {/* Comments Feed */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                        <p className="text-xs font-bold text-slate-600">Comments ({videoComments.length})</p>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a public comment..."
                            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 text-xs font-medium text-slate-800"
                          />
                          <button 
                            onClick={addVideoComment}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl cursor-pointer"
                          >
                            Comment
                          </button>
                        </div>

                        <div className="space-y-3 pt-2 divide-y divide-slate-100">
                          {videoComments.map((com, idx) => (
                            <div key={idx} className="pt-3 text-xs">
                              <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-slate-300" />
                                <span>{com.author}</span>
                              </p>
                              <p className="text-slate-500 font-medium mt-0.5 leading-relaxed">{com.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Videos sidebar recommendations */}
                    <div className="lg:col-span-1 space-y-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Up Next</p>
                      <div className="space-y-3">
                        {videoList.map((vid) => (
                          <div 
                            key={vid.id}
                            onClick={() => {
                              setSelectedVideo(vid);
                              setVideoComments([
                                { author: 'Rohan Gupta', text: 'This speed is absolutely real! My village got fiber yesterday!' },
                                { author: 'Neha Sharma', text: 'Loved the acoustics session, Arijit has a divine voice.' }
                              ]);
                            }}
                            className={`p-2.5 bg-white border rounded-2xl cursor-pointer flex items-center gap-3 transition-all ${
                              selectedVideo.id === vid.id ? 'border-red-500 shadow-sm' : 'border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <span className="w-14 h-14 rounded-xl bg-slate-900 text-3xl flex items-center justify-center text-white shrink-0 shadow-inner">
                              {vid.thumbnail}
                            </span>
                            <div className="min-w-0">
                              <h6 className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-tight">{vid.title}</h6>
                              <p className="text-[10px] text-slate-400 mt-0.5">{vid.channel}</p>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5 font-bold">{vid.views}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. CAMERA HARDWARE: AUDIO PLAYER */}
                {activeApp === 'music-player' && (
                  <div className="max-w-md mx-auto bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
                    <div className="text-center space-y-1.5">
                      <span className="bg-rose-500/10 text-rose-400 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-rose-500/20 inline-block font-mono">
                        Hardware Audio player
                      </span>
                      <h4 className="text-base font-extrabold font-display">HTML5 Web Audio Player</h4>
                      <p className="text-xs text-slate-400">Play local files from your storage</p>
                    </div>

                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
                      <span className="text-5xl animate-bounce">{currentSong.cover}</span>
                      <div className="text-center">
                        <p className="text-xs font-bold truncate max-w-[250px]">{currentSong.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{currentSong.artist}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <audio src={currentSong.url} ref={audioRef} onEnded={nextTrack} className="hidden" />
                      
                      <div className="space-y-1">
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative cursor-pointer" onClick={() => setSongProgress(Math.random()*100)}>
                          <div className="h-full bg-rose-500" style={{ width: `${songProgress}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                          <span>0:45</span>
                          <span>{currentSong.duration}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-5">
                        <button onClick={prevTrack} className="p-1.5 hover:text-rose-500 transition-colors"><SkipBack className="w-5 h-5" /></button>
                        <button onClick={togglePlay} className="p-3 bg-rose-600 rounded-full hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all">
                          {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white pl-0.5" />}
                        </button>
                        <button onClick={nextTrack} className="p-1.5 hover:text-rose-500 transition-colors"><SkipForward className="w-5 h-5" /></button>
                      </div>

                      <div className="flex items-center gap-3 pt-2 text-xs text-slate-400 justify-center">
                        <Volume2 className="w-4 h-4 text-slate-500" />
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={volume} 
                          onChange={(e) => {
                            setVolume(parseInt(e.target.value));
                            if (audioRef.current) audioRef.current.volume = parseInt(e.target.value) / 100;
                          }}
                          className="w-24 accent-rose-500" 
                        />
                        <span className="font-mono font-bold text-[10px]">{volume}%</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Select File From Device</span>
                      <label className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center text-xs font-bold rounded-xl cursor-pointer block transition-all">
                        <span>Select Audio Track</span>
                        <input type="file" accept="audio/*" className="hidden" onChange={handleMusicPlayerFile} />
                      </label>
                    </div>
                  </div>
                )}

                {/* 6. ALVON GAMES */}
                {activeApp === 'alvon-games' && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    {/* Game Selection Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      {['tic-tac-toe', 'rps', 'memory'].map((game) => (
                        <button
                          key={game}
                          onClick={() => setSelectedGame(game as any)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border text-center transition-all ${
                            selectedGame === game
                              ? 'bg-rose-600 border-rose-600 text-white shadow'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {game.replace('-', ' ')}
                        </button>
                      ))}
                    </div>

                    {/* TIC-TAC-TOE */}
                    {selectedGame === 'tic-tac-toe' && (
                      <GlassCard className="bg-white/95 border border-slate-100 p-6 flex flex-col items-center justify-between min-h-[350px]">
                        <div className="text-center space-y-1">
                          <h5 className="text-sm font-extrabold text-slate-800">Tic-Tac-Toe vs Alvon AI</h5>
                          <div className="flex gap-4 text-xs font-bold text-slate-500 font-mono mt-2 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">
                            <span className="text-blue-600">Player (X): {tttScore.player}</span>
                            <span className="text-rose-600">AI (O): {tttScore.ai}</span>
                            <span className="text-slate-500">Ties: {tttScore.ties}</span>
                          </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-3 gap-2.5 w-60 h-60 mt-4">
                          {tttBoard.map((val, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleTttClick(idx)}
                              className="bg-slate-100 hover:bg-slate-200 border border-slate-200/50 rounded-2xl flex items-center justify-center text-3xl font-black font-mono transition-all aspect-square cursor-pointer"
                            >
                              <span className={val === 'X' ? 'text-blue-600' : 'text-rose-600'}>{val}</span>
                            </button>
                          ))}
                        </div>

                        {tttWinner && (
                          <div className="text-center space-y-2 mt-4">
                            <p className="text-sm font-black text-rose-600 font-display">
                              {tttWinner === 'Tie' ? 'Match Tied!' : `${tttWinner} Wins the Round! 🎉`}
                            </p>
                            <button 
                              onClick={resetTtt}
                              className="bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                            >
                              Play Again
                            </button>
                          </div>
                        )}
                      </GlassCard>
                    )}

                    {/* ROCK-PAPER-SCISSORS */}
                    {selectedGame === 'rps' && (
                      <GlassCard className="bg-white/95 border border-slate-100 p-6 flex flex-col items-center justify-between min-h-[350px]">
                        <div className="text-center space-y-1">
                          <h5 className="text-sm font-extrabold text-slate-800">Rock Paper Scissors Arcade</h5>
                          <div className="flex gap-4 text-xs font-bold text-slate-500 font-mono mt-2 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">
                            <span className="text-blue-600">You: {rpsScore.user}</span>
                            <span className="text-rose-600">AI: {rpsScore.ai}</span>
                            <span className="text-slate-500">Ties: {rpsScore.ties}</span>
                          </div>
                        </div>

                        <div className="flex gap-4 justify-center py-6">
                          {[
                            { id: 'rock', label: 'Rock', emoji: '👊' },
                            { id: 'paper', label: 'Paper', emoji: '✋' },
                            { id: 'scissors', label: 'Scissors', emoji: '✌️' }
                          ].map((choice) => (
                            <button
                              key={choice.id}
                              onClick={() => playRps(choice.id)}
                              className="w-18 h-18 bg-slate-100 hover:bg-rose-50 hover:border-rose-400 rounded-2xl flex flex-col items-center justify-center border border-slate-200/50 transition-all shadow-sm cursor-pointer"
                            >
                              <span className="text-3xl">{choice.emoji}</span>
                              <span className="text-[10px] font-extrabold text-slate-600 mt-1">{choice.label}</span>
                            </button>
                          ))}
                        </div>

                        {rpsCurrentResult && (
                          <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-200/50 w-full">
                            <p className="text-xs font-extrabold text-slate-800 font-mono">{rpsCurrentResult}</p>
                          </div>
                        )}
                      </GlassCard>
                    )}

                    {/* MEMORY MATCH CARD GAME */}
                    {selectedGame === 'memory' && (
                      <div className="text-center py-10 text-slate-400">
                        <span className="text-5xl animate-bounce block">🎴</span>
                        <h5 className="text-sm font-black text-slate-800 mt-3">Alvon Memory Challenge</h5>
                        <p className="text-xs mt-1">This game is scheduled in Alvon Games League. Play Tic-Tac-Toe & RPS while we compile memory boards!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. ALVON CHAT (WhatsApp Style) */}
                {activeApp === 'alvon-chat' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 bg-white border border-slate-200 rounded-3xl h-[65vh] overflow-hidden shadow-sm">
                    {/* Contacts sidebar */}
                    <div className="md:col-span-1 border-r border-slate-100 flex flex-col">
                      <div className="p-4 border-b border-slate-50">
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">Chats ({chatContacts.length})</h5>
                      </div>
                      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                        {chatContacts.map((contact) => (
                          <div 
                            key={contact.id}
                            onClick={() => {
                              setSelectedChat(contact);
                              if (!chatHistory[contact.id]) {
                                setChatHistory({
                                  ...chatHistory,
                                  [contact.id]: [{ sender: 'other', text: 'Namaste! Hello there.', time: '12:00 PM' }]
                                });
                              }
                            }}
                            className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                              selectedChat.id === contact.id ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                            }`}
                          >
                            <span className="text-2xl bg-slate-100 p-1.5 rounded-xl border border-slate-200/50">{contact.avatar}</span>
                            <div className="min-w-0 flex-1">
                              <h6 className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                                <span>{contact.name}</span>
                                <span className={`w-1.5 h-1.5 rounded-full ${contact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              </h6>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-none">{contact.lastMessage}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chat workspace */}
                    <div className="md:col-span-2 flex flex-col h-full bg-slate-50/50">
                      {/* Active header */}
                      <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl bg-slate-800 p-1 rounded-xl border border-slate-700">{selectedChat.avatar}</span>
                          <div>
                            <p className="text-xs font-extrabold">{selectedChat.name}</p>
                            <p className="text-[8px] text-emerald-400 font-mono uppercase tracking-widest font-bold">{selectedChat.status}</p>
                          </div>
                        </div>
                      </div>

                      {/* Message Timeline */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                        {(chatHistory[selectedChat.id] || []).map((msg, i) => (
                          <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-2xl max-w-[250px] text-xs font-medium shadow-sm leading-relaxed ${
                              msg.sender === 'me'
                                ? 'bg-slate-900 text-white rounded-tr-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                            }`}>
                              <p>{msg.text}</p>
                              <span className="text-[8px] text-right block mt-1 font-mono text-slate-400">{msg.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chat Input */}
                      <div className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
                        <input
                          type="text"
                          value={typingMessage}
                          onChange={(e) => setTypingMessage(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') sendChatMessage(); }}
                          placeholder="Type your message..."
                          className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-xs font-semibold text-slate-800"
                        />
                        <button 
                          onClick={sendChatMessage}
                          className="bg-slate-900 hover:bg-slate-850 text-white p-2.5 rounded-xl cursor-pointer shadow-sm"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. ALVON SOCIAL (Meta Style) */}
                {activeApp === 'alvon-social' && (
                  <div className="space-y-6 max-w-xl mx-auto">
                    {/* Create status block */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                      <p className="text-xs font-bold text-slate-600">Create public story post</p>
                      <textarea
                        rows={2}
                        placeholder="What is on your mind? Share updates with the Alvon timeline..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 text-xs font-medium text-slate-800 resize-none leading-relaxed"
                      />
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-slate-400 font-mono">Gain +10 coins on publish</span>
                        <button 
                          onClick={() => alert('Post compiled successfully!')}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-1.5 rounded-xl shadow-sm cursor-pointer"
                        >
                          Publish Post
                        </button>
                      </div>
                    </div>

                    {/* Timeline Feed */}
                    <div className="space-y-4">
                      {blogPosts.map((post) => (
                        <div key={post.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl bg-slate-50 p-1 rounded-xl border border-slate-100">{post.cover}</span>
                            <div>
                              <h6 className="text-xs font-extrabold text-slate-800">{post.author}</h6>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5">{post.date} • {post.category}</p>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-slate-900 leading-snug">{post.title}</p>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">{post.content}</p>
                          
                          <div className="flex gap-4 pt-2 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                            <button onClick={() => alert('Simulated Liking post!')} className="hover:text-rose-600 transition-colors">❤️ Like Post</button>
                            <span>💬 2 Comments</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. ALVON DRIVE (Cloud Storage) */}
                {activeApp === 'alvon-drive' && (
                  <div className="space-y-6">
                    {/* Storage Meter */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>Alvon Cloud Storage Quota</span>
                        <span>4.6 MB of 15 GB Used</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mt-2 relative">
                        <div className="h-full bg-teal-500" style={{ width: '2.5%' }} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-1 text-right">0.03% consumed • Ad-Free Safe Crypt Backups</p>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <div>
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Folders & Uploads</h5>
                      </div>
                      
                      <label className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow">
                        <Upload className="w-4 h-4 animate-bounce" />
                        <span>Upload File</span>
                        <input type="file" className="hidden" onChange={handleDriveFileUpload} />
                      </label>
                    </div>

                    {isUploading && (
                      <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl text-center space-y-2">
                        <p className="text-xs font-bold text-teal-800">Encrypting & Uploading File...</p>
                        <div className="h-1 bg-teal-200 rounded-full max-w-xs mx-auto overflow-hidden">
                          <div className="h-full bg-teal-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
                      {driveFiles.map((file, i) => (
                        <div key={i} className="p-3.5 flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              {file.type === 'pdf' ? '📄' : file.type === 'image' ? '🖼️' : '📝'}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800">{file.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{file.date} • {file.size}</p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => alert(`Simulating Secure Download file: ${file.name}`)}
                            className="text-xs font-bold text-teal-600 hover:text-teal-700"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. ALVON MAIL (Gmail alternative) */}
                {activeApp === 'alvon-mail' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 bg-white border border-slate-200 rounded-3xl h-[65vh] overflow-hidden shadow-sm">
                    {/* Mailbox sidebar category navigation */}
                    <div className="md:col-span-1 border-r border-slate-100 flex flex-col">
                      <div className="p-4 border-b border-slate-50">
                        <button 
                          onClick={() => setShowCompose(true)}
                          className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer text-center"
                        >
                          Compose Mail
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                        {mailBox.map((mail) => (
                          <div 
                            key={mail.id}
                            onClick={() => {
                              setActiveMail(mail);
                              setMailBox(mailBox.map(m => m.id === mail.id ? { ...m, isRead: true } : m));
                            }}
                            className={`p-3 cursor-pointer transition-all ${
                              activeMail?.id === mail.id ? 'bg-slate-50 border-l-4 border-rose-600' : 'hover:bg-slate-50/50'
                            }`}
                          >
                            <h6 className={`text-xs ${mail.isRead ? 'text-slate-500' : 'font-black text-slate-800'}`}>{mail.from}</h6>
                            <p className="text-[11px] font-bold text-slate-700 truncate mt-0.5">{mail.subject}</p>
                            <p className="text-[9px] text-slate-400 truncate mt-0.5">{mail.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mail display desk */}
                    <div className="md:col-span-2 p-6 flex flex-col justify-between bg-slate-50/50">
                      {showCompose ? (
                        <div className="space-y-4">
                          <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Compose Mail</h5>
                          
                          <div className="space-y-2">
                            <input 
                              type="email" 
                              placeholder="To:" 
                              value={composeMail.to}
                              onChange={(e) => setComposeMail({ ...composeMail, to: e.target.value })}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none" 
                            />
                            <input 
                              type="text" 
                              placeholder="Subject:" 
                              value={composeMail.subject}
                              onChange={(e) => setComposeMail({ ...composeMail, subject: e.target.value })}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none" 
                            />
                            <textarea 
                              rows={4} 
                              placeholder="Email Content..." 
                              value={composeMail.body}
                              onChange={(e) => setComposeMail({ ...composeMail, body: e.target.value })}
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none resize-none leading-relaxed" 
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <button onClick={() => setShowCompose(false)} className="px-4 py-1.5 bg-slate-200 rounded-lg text-xs font-bold">Cancel</button>
                            <button onClick={sendEmail} className="px-5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-lg">Send</button>
                          </div>
                        </div>
                      ) : activeMail ? (
                        <div className="space-y-4">
                          <div className="border-b border-slate-200 pb-3 flex justify-between">
                            <div>
                              <h5 className="text-xs font-black text-rose-600">{activeMail.from}</h5>
                              <p className="text-sm font-black text-slate-800 mt-1">{activeMail.subject}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono font-bold">{activeMail.date}</span>
                          </div>
                          
                          <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{activeMail.body}</p>
                        </div>
                      ) : (
                        <div className="text-center py-20 text-slate-400 space-y-2 my-auto">
                          <Mail className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                          <p className="text-xs">Select an email to view or compose a new email.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 11. ALVON MAP */}
                {activeApp === 'alvon-map' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Routing tools */}
                    <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                      <div>
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">CSC Route Tracker</h5>
                        <p className="text-[10px] text-slate-500">Calculate turn-by-turn routing with ease</p>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Source Location</label>
                          <input 
                            type="text" 
                            value={mapSource}
                            onChange={(e) => setMapSource(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Destination Location</label>
                          <input 
                            type="text" 
                            placeholder="Enter Destination (e.g. Sector 5)" 
                            value={mapDest}
                            onChange={(e) => setMapDest(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" 
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          if (!mapDest.trim()) {
                            alert("Please enter a destination to plot route!");
                            return;
                          }
                          setMapRouteDrawn(true);
                        }}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                      >
                        Calculate Route Path
                      </button>

                      {mapRouteDrawn && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] text-emerald-800 font-mono space-y-0.5">
                          <p className="font-bold uppercase tracking-wider">Fast Route Found! 🚗</p>
                          <p>Estimated ETA: 12 minutes (Traffic Light)</p>
                          <p>Distance: 4.8 km on 5G telemetry</p>
                        </div>
                      )}
                    </div>

                    {/* Vector Map grid representation (SVG vector graphic) */}
                    <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-4 min-h-[300px] flex flex-col justify-between text-white relative overflow-hidden">
                      {/* Grid SVG Vector mock */}
                      <div className="absolute inset-0 opacity-15 pointer-events-none">
                        <svg width="100%" height="100%">
                          <defs>
                            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                      </div>

                      <div className="relative z-10 flex justify-between text-[10px] font-bold text-slate-400 font-mono uppercase">
                        <span>🛰️ Alvon Map GPS Layer v3.2</span>
                        <span className="text-emerald-400">Signal: EXCELLENT (5G)</span>
                      </div>

                      {/* Animated Route Plot SVG */}
                      <div className="flex-1 flex items-center justify-center relative min-h-[180px]">
                        <svg viewBox="0 0 200 100" className="w-full max-w-sm">
                          {/* Source Pin */}
                          <circle cx="30" cy="50" r="4" fill="#3b82f6" className="animate-pulse" />
                          <text x="25" y="42" fill="#3b82f6" fontSize="6" fontWeight="bold">Source</text>
                          
                          {/* Map Road Line */}
                          <path d="M 30 50 Q 80 20 120 70 T 170 40" fill="none" stroke={mapRouteDrawn ? "#f43f5e" : "#475569"} strokeWidth="2" strokeDasharray={mapRouteDrawn ? "none" : "3,3"} />
                          
                          {/* Destination Pin */}
                          <circle cx="170" cy="40" r="4" fill="#f43f5e" className="animate-pulse" />
                          <text x="160" y="32" fill="#f43f5e" fontSize="6" fontWeight="bold">Destination</text>
                        </svg>

                        {/* Public Kendra landmarks pins */}
                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 text-[8px] bg-black/60 border border-slate-700 rounded p-1.5 font-mono">
                          <MapPin className="w-2.5 h-2.5 text-rose-500" />
                          <span>3 Digital CSC Kendras Marked</span>
                        </div>
                      </div>

                      <div className="text-center font-mono text-[9px] text-slate-400 border-t border-slate-800/80 pt-2 relative z-10">
                        GPS coordinate sync calibrated with Indian navigation standards (NavIC)
                      </div>
                    </div>
                  </div>
                )}

                {/* 12. ALVON BLOGGER */}
                {activeApp === 'alvon-blogger' && (
                  <div className="space-y-6 max-w-xl mx-auto">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <div>
                        <h5 className="text-sm font-extrabold text-slate-800">Alvon Blogger Studio</h5>
                        <p className="text-[10px] text-slate-500">Publish stories and connect with citizen creators</p>
                      </div>
                      <button 
                        onClick={() => setShowBlogCreator(!showBlogCreator)}
                        className="bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>{showBlogCreator ? 'View Feed' : 'Write Blog'}</span>
                      </button>
                    </div>

                    {showBlogCreator ? (
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                        <p className="text-xs font-black text-slate-600">Publishing Studio Dashboard</p>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500">Blog Title</label>
                            <input 
                              type="text" 
                              placeholder="Enter Title..." 
                              value={newBlog.title}
                              onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none" 
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500">Author Name</label>
                              <input 
                                type="text" 
                                value={newBlog.author}
                                onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" 
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500">Category</label>
                              <select 
                                value={newBlog.category}
                                onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                              >
                                <option value="Technology">Technology</option>
                                <option value="Tutorial">Tutorial</option>
                                <option value="Opinion">Opinion</option>
                                <option value="Digital India">Digital India</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500">Blog Content</label>
                            <textarea 
                              rows={5} 
                              placeholder="Write your article stories with markdown elements..." 
                              value={newBlog.content}
                              onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none resize-none leading-relaxed text-slate-600" 
                            />
                          </div>
                        </div>

                        <button 
                          onClick={publishBlog}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
                        >
                          Publish Article
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-fadeIn">
                        {blogPosts.map((blog) => (
                          <div key={blog.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl bg-slate-50 p-1 rounded-xl border border-slate-100">{blog.cover}</span>
                                <div>
                                  <h6 className="text-xs font-extrabold text-slate-800">{blog.author}</h6>
                                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">{blog.date} • {blog.category}</p>
                                </div>
                              </div>
                            </div>
                            
                            <h5 className="text-sm font-black text-slate-800 leading-snug">{blog.title}</h5>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium whitespace-pre-line">{blog.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 11. ALVON MART COMPILER EMBED */}
                {activeApp === 'alvon-mart' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50/50 p-4 rounded-2xl border border-emerald-100/60 flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-extrabold text-teal-900">Alvon Mart Superstore Kiosk</h5>
                        <p className="text-[10px] text-teal-700/80">Premium Indian Grocery, tech, and medical logistics</p>
                      </div>
                      <span className="text-xs font-black text-teal-800 font-mono">15% Coins Cashback Active</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { id: 'm1', name: 'Alvon GigaRouter Pro 5G', price: 1999, category: 'electronics', image: '📡', rating: 4.8 },
                            { id: 'm2', name: 'Alvon Studio SoundBuds Air', price: 999, category: 'electronics', image: '🎧', rating: 4.6 },
                            { id: 'm3', name: 'Organic Royal Basmati Rice 5kg', price: 499, category: 'grocery', image: '🌾', rating: 4.7 },
                            { id: 'm4', name: 'Fresh Hass Avocados Pack (4pcs)', price: 299, category: 'grocery', image: '🥑', rating: 4.9 }
                          ].map((p) => (
                            <div key={p.id} className="bg-white p-4 border border-slate-200 rounded-2xl flex flex-col justify-between shadow-sm">
                              <div>
                                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">{p.category}</span>
                                <div className="text-4xl bg-slate-50 p-4 rounded-xl border border-slate-100/60 text-center my-2">{p.image}</div>
                                <h6 className="text-xs font-extrabold text-slate-800 line-clamp-1">{p.name}</h6>
                              </div>
                              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100">
                                <span className="text-xs font-black text-slate-900 font-mono">₹{p.price}</span>
                                <button 
                                  onClick={() => {
                                    onAddToCart({ id: p.id, name: p.name, price: p.price / 80, category: p.category as any, image: p.image, rating: p.rating });
                                    alert(`Added ${p.name} to checkout cart!`);
                                  }}
                                  className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black px-3.5 py-1 rounded-lg"
                                >
                                  Add +
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Checkout basket summary */}
                      <div className="md:col-span-1">
                        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
                          <h6 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex justify-between">
                            <span>Your Cart Basket</span>
                            <span className="text-rose-600 font-mono">({cart.length})</span>
                          </h6>
                          
                          {cart.length === 0 ? (
                            <p className="text-xs text-slate-400 py-10 text-center">Your shopping cart basket is empty. Add products to check out.</p>
                          ) : (
                            <div className="space-y-3.5">
                              <div className="divide-y divide-slate-100 max-h-[200px] overflow-y-auto">
                                {cart.map((item) => (
                                  <div key={item.product.id} className="py-2 flex justify-between items-center text-xs">
                                    <div>
                                      <p className="font-extrabold text-slate-800">{item.product.name}</p>
                                      <p className="text-[9px] text-slate-400">₹{(item.product.price * 80).toFixed(0)} x {item.quantity}</p>
                                    </div>
                                    <button onClick={() => onRemoveFromCart(item.product.id)} className="text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                ))}
                              </div>

                              <button 
                                onClick={() => {
                                  const s = onCheckout();
                                  if (s) {
                                    alert("Checkout successful! Deducted from Alvon Pay wallet, package will be dispatched in 30 minutes.");
                                  } else {
                                    alert("Insufficient balance in your Alvon Pay wallet!");
                                  }
                                }}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl"
                              >
                                Checkout Order
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 12. ALVON EXPRESS (grocery tracking) */}
                {activeApp === 'alvon-express' && (
                  <div className="space-y-6 max-w-md mx-auto">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                      <div>
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Alvon Express Logistics</h5>
                        <p className="text-[10px] text-slate-500">Real-time express delivery package telemetry</p>
                      </div>

                      <div className="border-l-2 border-emerald-500 pl-4 space-y-4 text-xs">
                        <div className="relative">
                          <span className="absolute -left-5 top-0.5 w-2 h-2 rounded-full bg-emerald-500" />
                          <p className="font-bold text-slate-800">Order Out for Delivery</p>
                          <p className="text-[10px] text-slate-400">Our rider has picked up fresh avocados from Alvon Mart</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-5 top-0.5 w-2 h-2 rounded-full bg-emerald-500" />
                          <p className="font-bold text-slate-800">Processed at Kiosk Hub</p>
                          <p className="text-[10px] text-slate-400 font-mono">Time: 11:15 AM • Verified Quality Certificate</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-mono">Estimated Delivery Time</p>
                          <p className="text-sm font-black text-slate-800 mt-1 font-mono">18 Minutes Remaining</p>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PREMIUM UPGRADE MODAL --- */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 via-rose-500 to-indigo-600 p-0.5 mx-auto shadow-lg flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-3xl">
                    👑
                  </div>
                </div>
                <h4 className="text-base font-black font-display tracking-tight text-slate-900">Alvon Premium Access</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Go completely ad-free and experience India’s premier full-stack 5G ecosystem under zero-loss operations.
                </p>
              </div>

              {/* Price Tag */}
              <div className="bg-gradient-to-r from-rose-50 to-indigo-50 p-4 border border-slate-100 rounded-2xl text-center space-y-1">
                <p className="text-[10px] font-black uppercase text-rose-600 tracking-wider font-mono">Limited Period Plan</p>
                <div className="flex justify-center items-baseline space-x-1">
                  <span className="text-3xl font-black font-mono text-slate-900">₹9</span>
                  <span className="text-xs text-slate-400 font-bold">/ month</span>
                </div>
                <p className="text-[9px] text-slate-400 font-medium leading-none">Deducted from Alvon Pay wallet balance</p>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <p className="flex items-center gap-2">✅ <span className="truncate">Universally removes all banner & popup ads</span></p>
                <p className="flex items-center gap-2">✅ <span className="truncate">Lossless high-res streaming on Alvon Music</span></p>
                <p className="flex items-center gap-2">✅ <span className="truncate">Priority 24/7 AlvonCare help support desk</span></p>
              </div>

              {celebrate ? (
                <div className="text-center py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-xl animate-bounce">
                  🎉 Congratulations! Premium Activated!
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setShowPremiumModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpgradeToPremium}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow shadow-rose-600/10 transition-all cursor-pointer"
                  >
                    Subscribe Now
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
