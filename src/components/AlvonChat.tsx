import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, Video, Send, Search, CheckCheck, Check, Paperclip, Smile, MoreVertical, 
  User, ShieldCheck, Sparkles, MessageCircle, Mic, Image, Info, Menu, X, ArrowLeft,
  CircleDot
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { rtdb, ref, onValue, push, set, update } from '../lib/firebaseRTDB';

interface Message {
  id: string;
  sender: 'me' | 'alvon_bot' | 'sharma_ji' | 'chloe_s' | 'alex_r' | 'system';
  text: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  };
}

interface ChatContact {
  id: string;
  meta: {
    name: string;
    avatar: string;
    role: string;
    phone: string;
    verified: boolean;
    status: 'online' | 'offline' | 'away' | 'typing';
  };
  messages: { [msgId: string]: Message };
}

export const AlvonChat: React.FC = () => {
  const [chats, setChats] = useState<{ [key: string]: ChatContact }>({});
  const [activeChatId, setActiveChatId] = useState<string>('alvon_bot');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserStatus, setCurrentUserStatus] = useState<'online' | 'away' | 'offline'>('online');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to RTDB database updates
  useEffect(() => {
    const chatsRef = ref(rtdb, 'chats');
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      if (snapshot.exists()) {
        setChats(snapshot.val());
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatId, isTyping]);

  const activeChat = chats[activeChatId];
  const activeMessages = activeChat 
    ? (Object.values(activeChat.messages) as Message[]).sort((a, b) => a.timestamp - b.timestamp)
    : [];

  // Toggle user's own status
  const handleUserStatusChange = (status: 'online' | 'away' | 'offline') => {
    setCurrentUserStatus(status);
    set(ref(rtdb, `presence/me`), { status, lastActive: Date.now() });
  };

  // Helper to format timestamps nicely
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Quick replies list
  const quickReplies = [
    "Namaste! 🙏",
    "Thank you! 👍",
    "Where is my order? 📦",
    "Completed Alvon Recharge! 📶",
    "Outstanding Speed! ⚡"
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMessage: Omit<Message, 'id'> = {
      sender: 'me',
      text: textToSend,
      timestamp: Date.now(),
      status: 'sent'
    };

    // Push message to RTDB
    const chatsMsgRef = ref(rtdb, `chats/${activeChatId}/messages`);
    const { key: msgKey } = push(chatsMsgRef, newMessage);

    setMessageText('');

    // Update status to delivered, then read quickly to simulate fast network
    setTimeout(() => {
      update(ref(rtdb, `chats/${activeChatId}/messages/${msgKey}`), { status: 'delivered' });
    }, 400);

    setTimeout(() => {
      update(ref(rtdb, `chats/${activeChatId}/messages/${msgKey}`), { status: 'read' });
    }, 1000);

    // AI bot / response simulator trigger
    if (activeChatId === 'alvon_bot') {
      simulateAIBotResponse(textToSend);
    } else if (activeChatId === 'sharma_ji') {
      simulateSharmaJiResponse();
    } else if (activeChatId === 'chloe_s') {
      simulateChloeResponse();
    }
  };

  // Dynamic chatbot integration with real AI fallback
  const simulateAIBotResponse = async (userPrompt: string) => {
    // Set bot status to "typing" in RTDB
    update(ref(rtdb, `chats/alvon_bot/meta`), { status: 'typing' });

    try {
      // Call our server-side API handler
      const response = await fetch('/api/learning/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userPrompt, persona: 'gemini' })
      });

      const data = await response.json();
      let responseText = data.text;

      // Filter out markdown thinking blocks for cleaner chat bubble looks
      if (responseText.includes('</think>')) {
        responseText = responseText.split('</think>').pop()?.trim() || responseText;
      }

      // Quick delay to feel natural
      setTimeout(() => {
        push(ref(rtdb, 'chats/alvon_bot/messages'), {
          sender: 'alvon_bot',
          text: responseText,
          timestamp: Date.now(),
          status: 'read'
        });
        update(ref(rtdb, `chats/alvon_bot/meta`), { status: 'online' });
      }, 1500);

    } catch (e) {
      console.error('Error fetching real-time AI response:', e);
      // Fallback response
      setTimeout(() => {
        push(ref(rtdb, 'chats/alvon_bot/messages'), {
          sender: 'alvon_bot',
          text: `Namaste! I received your query about "${userPrompt}". I am currently operating on Alvon's local high-speed edge nodes. Recharge your Alvon True5G plan or connect to our fiber node for premium assistance!`,
          timestamp: Date.now(),
          status: 'read'
        });
        update(ref(rtdb, `chats/alvon_bot/meta`), { status: 'online' });
      }, 2000);
    }
  };

  // Simulate Partner shop responses
  const simulateSharmaJiResponse = () => {
    update(ref(rtdb, `chats/sharma_ji/meta`), { status: 'typing' });
    setTimeout(() => {
      push(ref(rtdb, 'chats/sharma_ji/messages'), {
        sender: 'sharma_ji',
        text: 'Hanji, your order is loaded on the electric three-wheeler! The delivery partner (Ramesh) is arriving. He has your verified Alvon Mart bag. Please check your OTP once he arrives! 🙏',
        timestamp: Date.now(),
        status: 'read'
      });
      update(ref(rtdb, `chats/sharma_ji/meta`), { status: 'online' });
    }, 2500);
  };

  // Simulate Chloe Simmons response
  const simulateChloeResponse = () => {
    update(ref(rtdb, `chats/chloe_s/meta`), { status: 'typing' });
    setTimeout(() => {
      push(ref(rtdb, 'chats/chloe_s/messages'), {
        sender: 'chloe_s',
        text: 'That is awesome! Keep up the good vibes. I am going to write a review of the Alvon Mart fresh avocados tomorrow. See ya! 🥑✨',
        timestamp: Date.now(),
        status: 'away'
      });
      update(ref(rtdb, `chats/chloe_s/meta`), { status: 'away' });
    }, 2000);
  };

  const simulateAttachment = (type: 'image' | 'file') => {
    const attachment = type === 'image' 
      ? { type, url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', name: 'Fresh Salad Dish' }
      : { type, url: '#', name: 'Alvon_Invoice_TXN_882.pdf' };

    const newMsg = {
      sender: 'me' as const,
      text: type === 'image' ? '📸 Sent a photo' : '📄 Sent a document',
      timestamp: Date.now(),
      status: 'sent' as const,
      attachment
    };

    push(ref(rtdb, `chats/${activeChatId}/messages`), newMsg);
    alert(`Simulated attaching ${type}! Message uploaded to Real-time database.`);
  };

  // Filter contacts by search query
  const filteredChatContacts = (Object.entries(chats) as [string, ChatContact][]).filter(([id, chat]) => {
    const query = searchQuery.toLowerCase();
    return (
      chat.meta.name.toLowerCase().includes(query) ||
      chat.meta.role.toLowerCase().includes(query) ||
      (chat.meta.phone && chat.meta.phone.includes(query))
    );
  });

  return (
    <div className="space-y-6" id="alvon-chats-section">
      
      {/* Banner Intro */}
      <GlassCard className="p-4 bg-gradient-to-r from-emerald-900 via-teal-850 to-slate-900 text-white border-none flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <span className="inline-block bg-emerald-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
            REAL-TIME DATABASE SYNC
          </span>
          <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center justify-center md:justify-start space-x-2">
            <span>💬</span>
            <span>Alvon Chat - WhatsApp Ecosystem</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-xl font-medium">
            Connect instantly with customer care bots, local Kirana stores, and friends. Enjoy 1-to-1 secure messages, real-time typing notifications, dynamic presence indicators, and attachments.
          </p>
        </div>

        {/* Current status picker */}
        <div className="flex items-center space-x-2 bg-black/20 p-1.5 rounded-xl border border-white/10 shrink-0">
          <span className="text-[10px] font-bold text-slate-300 font-mono pl-1">MY STATUS:</span>
          <div className="flex gap-1">
            {[
              { id: 'online', label: 'Online', color: 'bg-emerald-500' },
              { id: 'away', label: 'Away', color: 'bg-amber-500' },
              { id: 'offline', label: 'Invisible', color: 'bg-slate-400' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleUserStatusChange(item.id as any)}
                className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all flex items-center space-x-1 cursor-pointer ${
                  currentUserStatus === item.id ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Main chat window layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
        
        {/* Left column - Chat Sidebar (Col span 4) */}
        <div className={`md:col-span-4 space-y-4 ${mobileSidebarOpen ? 'block' : 'hidden md:block'}`}>
          <GlassCard className="p-0 overflow-hidden flex flex-col h-[520px] border-slate-100">
            
            {/* Sidebar Search */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 font-mono tracking-widest uppercase">
                  ACTIVE CONVERSATIONS
                </span>
                <span className="flex items-center text-[10px] font-bold text-emerald-600 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  RTDB SYNCED
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chats or phone numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 bg-white text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Contacts list */}
            <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
              {filteredChatContacts.map(([id, contact]) => {
                const isActive = activeChatId === id;
                const msgs = (Object.values(contact.messages) as Message[]).sort((a, b) => b.timestamp - a.timestamp);
                const lastMsg = msgs[0];

                return (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveChatId(id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full p-4 text-left flex items-start space-x-3 transition-all cursor-pointer ${
                      isActive ? 'bg-emerald-50/50 border-l-4 border-l-emerald-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Avatar with Status Circle */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-sm text-emerald-700 shadow-inner">
                        {contact.meta.avatar}
                      </div>
                      
                      {/* Presence pill */}
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        contact.meta.status === 'online' ? 'bg-emerald-500' :
                        contact.meta.status === 'away' ? 'bg-amber-500' :
                        contact.meta.status === 'typing' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'
                      }`} />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 min-w-0">
                          <h4 className="text-xs font-black text-slate-800 truncate">
                            {contact.meta.name}
                          </h4>
                          {contact.meta.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {lastMsg ? formatTime(lastMsg.timestamp) : ''}
                        </span>
                      </div>

                      <p className="text-[10px] font-semibold text-emerald-600 font-mono tracking-wider uppercase">
                        {contact.meta.role}
                      </p>

                      <p className={`text-xs truncate font-medium ${
                        contact.meta.status === 'typing' ? 'text-indigo-600 font-black animate-pulse' : 'text-slate-500'
                      }`}>
                        {contact.meta.status === 'typing' ? '✍️ typing...' : (lastMsg ? lastMsg.text : 'No messages yet')}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredChatContacts.length === 0 && (
                <div className="p-8 text-center text-slate-400 font-mono text-xs font-bold leading-normal">
                  No active chats found. Try searching for "Bot" or "Sharma".
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right column - Main Chat View (Col span 8) */}
        <div className={`md:col-span-8 ${!mobileSidebarOpen ? 'block' : 'hidden md:block'}`}>
          {activeChat ? (
            <GlassCard className="p-0 overflow-hidden flex flex-col h-[520px] border-slate-100 relative">
              
              {/* Chat View Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Mobile Back button */}
                  <button 
                    onClick={() => setMobileSidebarOpen(true)}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 md:hidden cursor-pointer mr-1"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-extrabold text-sm text-emerald-700 shadow-inner">
                      {activeChat.meta.avatar}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      activeChat.meta.status === 'online' ? 'bg-emerald-500' :
                      activeChat.meta.status === 'away' ? 'bg-amber-500' :
                      activeChat.meta.status === 'typing' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'
                    }`} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-1">
                      <h3 className="text-sm font-black text-slate-800 truncate">
                        {activeChat.meta.name}
                      </h3>
                      {activeChat.meta.verified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {activeChat.meta.status === 'typing' ? 'typing...' : 
                       (activeChat.meta.status === 'online' ? 'Active now' : 
                        (activeChat.meta.status === 'away' ? 'Away' : 'Offline'))} • {activeChat.meta.phone}
                    </span>
                  </div>
                </div>

                {/* Call utilities */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button 
                    onClick={() => alert(`Simulating voice call to ${activeChat.meta.name}...`)}
                    className="p-2 hover:bg-slate-100 text-slate-600 hover:text-emerald-600 rounded-xl transition-colors cursor-pointer"
                    title="Voice Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => alert(`Simulating video call to ${activeChat.meta.name}...`)}
                    className="p-2 hover:bg-slate-100 text-slate-600 hover:text-emerald-600 rounded-xl transition-colors cursor-pointer"
                    title="Video Call"
                  >
                    <Video className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    onClick={() => alert(`Contact Info:\nName: ${activeChat.meta.name}\nPhone: ${activeChat.meta.phone}\nRole: ${activeChat.meta.role}`)}
                    className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors cursor-pointer"
                    title="Info"
                  >
                    <Info className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Chat messages viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
                {activeMessages.map((msg) => {
                  const isMe = msg.sender === 'me';
                  const isSys = msg.sender === 'system';

                  if (isSys) {
                    return (
                      <div key={msg.id} className="flex justify-center my-1.5">
                        <span className="bg-slate-200/75 backdrop-blur text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-2xl p-3.5 shadow-sm space-y-1 ${
                        isMe 
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                      }`}>
                        {/* Text / content */}
                        <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>

                        {/* Attachments rendering */}
                        {msg.attachment && (
                          <div className="mt-2.5 p-2 bg-black/5 rounded-xl border border-black/10 flex items-center space-x-2">
                            {msg.attachment.type === 'image' ? (
                              <div className="w-12 h-12 rounded bg-slate-200 overflow-hidden">
                                <img src={msg.attachment.url} alt={msg.attachment.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded bg-rose-50 flex items-center justify-center text-rose-600 text-xs font-bold">
                                PDF
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black truncate text-slate-800">
                                {msg.attachment.name}
                              </p>
                              <span className="text-[8px] opacity-60">Verified Document Attachment</span>
                            </div>
                          </div>
                        )}

                        {/* Timestamp & Status checks */}
                        <div className="flex items-center justify-end space-x-1 text-[9px] opacity-70 font-mono pt-0.5">
                          <span>{formatTime(msg.timestamp)}</span>
                          {isMe && (
                            <span>
                              {msg.status === 'read' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                              ) : msg.status === 'delivered' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-slate-300" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-300" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Simulated Typing Bubbles */}
                {activeChat.meta.status === 'typing' && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3.5 shadow-sm flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Row */}
              <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 overflow-x-auto flex space-x-1.5 scrollbar-thin">
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(reply)}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black rounded-full transition-all shrink-0 cursor-pointer"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Message Typing Panel */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center space-x-2.5">
                {/* Media Attachment popup */}
                <div className="flex items-center space-x-1.5">
                  <button 
                    onClick={() => simulateAttachment('image')}
                    className="p-2 hover:bg-slate-200 text-slate-500 hover:text-emerald-600 rounded-xl transition-colors cursor-pointer"
                    title="Send Image"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => simulateAttachment('file')}
                    className="p-2 hover:bg-slate-200 text-slate-500 hover:text-emerald-600 rounded-xl transition-colors cursor-pointer"
                    title="Attach File"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>

                {/* Input Text Box */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(messageText);
                  }}
                  className="flex-1 flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200"
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type secure Real-time message..."
                    className="flex-1 bg-transparent text-xs font-bold focus:outline-none placeholder-slate-400"
                  />
                  <button 
                    type="button" 
                    onClick={() => alert('Emoji keyboard simulated! Try typing your emojis.')}
                    className="text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    <Smile className="w-4.5 h-4.5" />
                  </button>
                </form>

                {/* Mic / Send Button */}
                {messageText.trim() ? (
                  <button
                    onClick={() => handleSendMessage(messageText)}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/10 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => alert('Simulated starting audio recording... Speak into your mic!')}
                    className="p-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl transition-all cursor-pointer"
                    title="Voice message"
                  >
                    <Mic className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>

            </GlassCard>
          ) : (
            <GlassCard className="h-[520px] flex flex-col items-center justify-center text-center p-8 border-slate-100">
              <MessageCircle className="w-12 h-12 text-slate-300 animate-bounce mb-3" />
              <h3 className="text-sm font-black text-slate-800">Select an Alvon Chat</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Pick a contact from the active list to communicate instantly via real-time logic.
              </p>
            </GlassCard>
          )}
        </div>

      </div>

    </div>
  );
};
