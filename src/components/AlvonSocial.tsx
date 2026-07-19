import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { 
  Heart, MessageCircle, Share2, Send, Sparkles, Image, Smile, Clock, 
  Award, Camera, Filter, Compass, Search, Grid, Plus, X, Volume2, ShieldCheck,
  Flame, CheckCircle, Sliders
} from 'lucide-react';
import { Post } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { AlvonImage } from './AlvonImage';
import { AlvonChat } from './AlvonChat';

interface AlvonSocialProps {
  posts: Post[];
  onLikePost: (postId: string) => void;
  onAddPost: (content: string, image?: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
}

// Preset visual images for fast photo sharing (representing beautiful scenes in India)
const PRESET_PHOTOS = [
  { id: 'p_cp', name: 'Connaught Place, Delhi', url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5', icon: '🏙️' },
  { id: 'p_taj', name: 'Taj Sunrise, Agra', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523', icon: '🕌' },
  { id: 'p_tech', name: 'Alvon Silicon Lab, Bengaluru', url: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a50b', icon: '💻' },
  { id: 'p_munnar', name: 'Tea Estate, Munnar', url: 'https://images.unsplash.com/photo-1555597673-b21d5c935865', icon: '🍃' },
  { id: 'p_food', name: 'Samosa Platter, Mumbai', url: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78', icon: '🥟' },
  { id: 'p_himalaya', name: 'Himachal Snow Range', url: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33', icon: '🏔️' }
];

// Active mock stories data
const STORIES = [
  { id: 's_me', name: 'Your Story', avatar: 'ME', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', viewed: false },
  { id: 's_alex', name: 'Alex Rivera 📶', avatar: 'AR', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7', viewed: false },
  { id: 's_chloe', name: 'Chloe Simmons 🥑', avatar: 'CS', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', viewed: false },
  { id: 's_sharma', name: 'Sharma Ji 🛒', avatar: 'SK', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', viewed: false },
  { id: 's_rewards', name: 'True5G Perks 🪙', avatar: '5G', image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040', viewed: false }
];

export const AlvonSocial: React.FC<AlvonSocialProps> = ({
  posts,
  onLikePost,
  onAddPost,
  onAddComment,
}) => {
  // Navigation: Toggle between Social Feed (Instagram Style) and Active Chats (WhatsApp Style)
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'chats'>('feed');

  // Input creation states
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'normal' | 'retro' | 'cyberpunk' | 'emerald' | 'mono'>('normal');
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  
  // Interactive double-tap feedback states
  const [heartAnimPostId, setHeartAnimPostId] = useState<string | null>(null);

  // Active Story viewer states
  const [activeStory, setActiveStory] = useState<typeof STORIES[0] | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // Auto-advance stories
  useEffect(() => {
    if (!activeStory) {
      setStoryProgress(0);
      return;
    }

    setStoryProgress(0);
    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setActiveStory(null);
          return 100;
        }
        return prev + 1;
      });
    }, 40); // 4 seconds total story view time

    return () => clearInterval(interval);
  }, [activeStory]);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    // Concat filter metadata if any, or pass photo with filter applied
    let finalPhoto = selectedPhotoUrl;
    if (finalPhoto && activeFilter !== 'normal') {
      // Pass customized class string with photo url for style binding
      finalPhoto = `${finalPhoto}#filter-${activeFilter}`;
    }

    onAddPost(newPostContent, finalPhoto);
    setNewPostContent('');
    setSelectedPhotoUrl('');
    setActiveFilter('normal');
    
    // Simulate reward feedback
    alert('Awesome! You earned +10 Alvon Coins for contributing a photo story to the community!');
  };

  const handleCommentSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    onAddComment(postId, commentText);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  // Double-tap like handling
  const handleDoubleTap = (postId: string) => {
    onLikePost(postId);
    setHeartAnimPostId(postId);
    setTimeout(() => {
      setHeartAnimPostId(null);
    }, 800);
  };

  // Helper to resolve legacy post icons (📶, 🥑) into rich high-res visuals for Instagram style
  const resolvePostImage = (imgStr: string | undefined): string => {
    if (!imgStr) return '';
    if (imgStr.startsWith('http')) {
      return imgStr.split('#')[0]; // strip filter hash if present
    }
    // Map legacy icons
    if (imgStr === '📶') return 'https://images.unsplash.com/photo-1596422846543-75c6fc18a50b';
    if (imgStr === '🥑') return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
    return 'https://images.unsplash.com/photo-1587474260584-136574528ed5';
  };

  // Retrieve filter class based on parsed image string
  const getFilterClass = (imgStr: string | undefined): string => {
    if (!imgStr) return '';
    if (imgStr.includes('#filter-retro')) return 'sepia contrast-125 saturate-110';
    if (imgStr.includes('#filter-cyberpunk')) return 'hue-rotate-90 saturate-200 contrast-110';
    if (imgStr.includes('#filter-emerald')) return 'grayscale-30 brightness-95 contrast-120 saturate-150 sepia-25 hue-rotate-180';
    if (imgStr.includes('#filter-mono')) return 'grayscale contrast-125';
    return '';
  };

  // Sidebar trending tags
  const trendingTags = [
    { tag: '#AlvonTrue5G', posts: '14.5k posts', trend: '+140% today' },
    { tag: '#AlvonMartSale', posts: '9.2k posts', trend: 'Trending' },
    { tag: '#MyAlvonLife', posts: '8.1k posts', trend: '+300% weekly' },
    { tag: '#EasyPayCoins', posts: '5.4k posts', trend: 'Hot' },
  ];

  const handleLocalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedPhotoUrl(url);
    }
  };

  return (
    <div className="space-y-6" id="alvon-social-root">
      
      {/* Premium Multi-View Ecosystem Switcher Tab */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner border border-slate-200/50">
          <button
            onClick={() => setActiveSubTab('feed')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-tight flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'feed'
                ? 'bg-white text-rose-600 shadow-md shadow-rose-600/5'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>📸 Alvon Social Feed</span>
            <span className="bg-rose-100 text-rose-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">INSTA</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('chats')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-tight flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'chats'
                ? 'bg-white text-emerald-600 shadow-md shadow-emerald-600/5'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>💬 Alvon Chat Rooms</span>
            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">WA</span>
          </button>
        </div>
      </div>

      {/* Main Switch View Rendering */}
      {activeSubTab === 'chats' ? (
        <AlvonChat />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Main Social Timeline Feed (Col span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Instagram-Style Stories Carousel */}
            <GlassCard className="p-4 overflow-hidden border-slate-100/80">
              <span className="text-[10px] font-extrabold text-slate-400 font-mono tracking-widest uppercase block mb-3.5">
                VERIFIED ALVON STORIES
              </span>
              
              <div className="flex space-x-4 overflow-x-auto pb-1.5 no-scrollbar">
                {STORIES.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => setActiveStory(story)}
                    className="flex flex-col items-center space-y-1 shrink-0 group focus:outline-none cursor-pointer"
                  >
                    {/* Ring Container */}
                    <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 transition-transform group-hover:scale-105 active:scale-95 duration-150">
                      <div className="p-0.5 rounded-full bg-white">
                        <div className="w-13 h-13 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-rose-600 border border-slate-100 shadow-inner">
                          {story.avatar}
                        </div>
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-bold text-slate-600 max-w-[70px] truncate">
                      {story.name}
                    </span>
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* 2. Visual Photo Sharing Creator Composer */}
            <GlassCard className="p-5 border-slate-100/80">
              <form onSubmit={handlePostSubmit} className="space-y-4">
                
                {/* Header info */}
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center font-black text-xs text-rose-700 shrink-0">
                    ME
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-extrabold text-rose-600 uppercase">SHARE A DIGITAL MOMENT</span>
                    <input
                      type="text"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Write a beautiful caption for your visual memory... #AlvonLife"
                      className="w-full text-xs font-bold text-slate-800 bg-transparent border-b border-slate-100 py-1 focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>
                </div>

                {/* Horizontal Image Preset Selectors */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 font-mono block">
                    Choose Scenic Indian Preset Photo:
                  </span>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_PHOTOS.map((photo) => (
                      <button
                        type="button"
                        key={photo.id}
                        onClick={() => setSelectedPhotoUrl(photo.url)}
                        className={`p-1 rounded-xl border text-center transition-all cursor-pointer relative overflow-hidden group ${
                          selectedPhotoUrl === photo.url 
                            ? 'border-rose-600 bg-rose-50/50 shadow' 
                            : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full h-10 rounded-lg overflow-hidden bg-slate-100">
                          <img src={photo.url} alt={photo.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-600 block mt-1 truncate">
                          {photo.icon} {photo.name.split(',')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom local file upload utility */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-slate-100/80">
                  <div className="flex items-center space-x-4">
                    
                    {/* File chooser */}
                    <label className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-colors text-[11px] font-bold">
                      <Camera className="w-4 h-4 text-rose-500" />
                      <span>Upload My Photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLocalPhotoUpload} 
                        className="hidden" 
                      />
                    </label>

                    {/* Filter Slider indicator if photo is active */}
                    {selectedPhotoUrl && (
                      <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500">Filter:</span>
                        <select
                          value={activeFilter}
                          onChange={(e) => setActiveFilter(e.target.value as any)}
                          className="bg-transparent text-[10px] font-black text-rose-600 focus:outline-none uppercase cursor-pointer"
                        >
                          <option value="normal">Normal</option>
                          <option value="retro">Warm Sepia</option>
                          <option value="cyberpunk">Cyberpunk</option>
                          <option value="emerald">Emerald</option>
                          <option value="mono">Black/White</option>
                        </select>
                      </div>
                    )}

                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-lg shadow-rose-600/10 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post to Timeline</span>
                  </button>
                </div>

                {/* Selected Photo Filter Preview Area */}
                {selectedPhotoUrl && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-white">
                      <img 
                        src={selectedPhotoUrl} 
                        alt="composer preview" 
                        className={`w-full h-full object-cover ${
                          activeFilter === 'retro' ? 'sepia contrast-125' :
                          activeFilter === 'cyberpunk' ? 'hue-rotate-90 saturate-200' :
                          activeFilter === 'emerald' ? 'grayscale-30 brightness-95 saturate-150 sepia-25 hue-rotate-180' :
                          activeFilter === 'mono' ? 'grayscale contrast-125' : ''
                        }`} 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black text-slate-800">Preview Layout (Instagram Shape)</p>
                      <p className="text-[9px] text-slate-400 font-medium">This photo will load progress-optimized for ultra-high speed on 5G.</p>
                      <button 
                        type="button" 
                        onClick={() => setSelectedPhotoUrl('')}
                        className="text-[9px] font-extrabold text-rose-500 hover:underline mt-1 cursor-pointer block"
                      >
                        Remove selected image
                      </button>
                    </div>
                  </div>
                )}

              </form>
            </GlassCard>

            {/* 3. Timeline Posts - Instagram Visual Feed */}
            <div className="space-y-6">
              {posts.map((post) => {
                const imageSrc = resolvePostImage(post.image);
                const isSelectedComments = activeCommentsPostId === post.id;
                const isHeartPopping = heartAnimPostId === post.id;

                return (
                  <GlassCard key={post.id} className="bg-white/95 p-0 overflow-hidden border-slate-100/80" hoverEffect={false}>
                    
                    {/* User profile header */}
                    <div className="p-4 flex items-center justify-between border-b border-slate-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-rose-600 shadow-inner">
                          {post.avatar}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h6 className="text-xs font-black text-slate-800 leading-tight">{post.author}</h6>
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
                            📍 Delhi, India • {post.time}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 bg-rose-50 px-2 py-0.8 rounded-full text-rose-700 border border-rose-100/50">
                        <Flame className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-[8px] font-extrabold font-mono uppercase tracking-wider">MOMENT</span>
                      </div>
                    </div>

                    {/* Instagram Photo Element with Double-Tap to Like */}
                    {imageSrc && (
                      <div 
                        onDoubleClick={() => handleDoubleTap(post.id)}
                        className="relative w-full overflow-hidden select-none cursor-pointer group bg-slate-50"
                      >
                        <AlvonImage 
                          src={imageSrc} 
                          alt={post.content} 
                          aspectRatio="1/1"
                          className={`w-full ${getFilterClass(post.image)}`} 
                        />

                        {/* Floating Double-Tap Popping Heart Indicator */}
                        <AnimatePresence>
                          {isHeartPopping && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.3 }}
                              animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.2, 0.9, 1] }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.7, ease: "easeOut" }}
                              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                            >
                              <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl opacity-90 filter drop-shadow-[0_10px_10px_rgba(225,29,72,0.5)]" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* Interactive Double Tap Hint on Hover */}
                        <div className="absolute top-2.5 left-2.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-wider font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          ⚡ Double-Tap Photo to Like
                        </div>
                      </div>
                    )}

                    {/* Visual Caption Box */}
                    <div className="p-4 space-y-3.5">
                      
                      {/* Action buttons bar */}
                      <div className="flex items-center space-x-4 text-slate-700">
                        <button
                          onClick={() => onLikePost(post.id)}
                          className={`hover:scale-110 active:scale-90 transition-transform ${post.liked ? 'text-rose-600' : 'hover:text-rose-600'}`}
                        >
                          <Heart className={`w-6 h-6 ${post.liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => setActiveCommentsPostId(isSelectedComments ? null : post.id)}
                          className={`hover:scale-110 active:scale-90 transition-transform ${isSelectedComments ? 'text-blue-500' : 'hover:text-blue-500'}`}
                        >
                          <MessageCircle className="w-6 h-6" />
                        </button>

                        <button
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(`Check out Alvon Story by ${post.author}`);
                              alert('Share link copied to clipboard!');
                            }
                          }}
                          className="hover:scale-110 active:scale-90 transition-transform hover:text-emerald-500"
                        >
                          <Share2 className="w-5.5 h-5.5" />
                        </button>
                      </div>

                      {/* Likes count */}
                      <p className="text-xs font-black text-slate-800">
                        {post.likes.toLocaleString()} likes
                      </p>

                      {/* Content with highlighted hashtags */}
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-line">
                        <span className="font-black text-slate-900 mr-1.5">{post.author}</span>
                        {post.content.split(' ').map((word, idx) => {
                          if (word.startsWith('#')) {
                            return <span key={idx} className="text-rose-600 font-bold font-mono mr-1">{word}</span>;
                          }
                          return word + ' ';
                        })}
                      </p>

                      {/* Toggle-comment teaser link */}
                      {post.comments.length > 0 && (
                        <button
                          onClick={() => setActiveCommentsPostId(isSelectedComments ? null : post.id)}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 block cursor-pointer"
                        >
                          View all {post.comments.length} comments
                        </button>
                      )}

                      {/* Expandable Integrated Comment Box */}
                      {isSelectedComments && (
                        <div className="pt-3.5 border-t border-slate-100/60 space-y-3.5">
                          <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                            {post.comments.map((comment, index) => (
                              <div key={index} className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100/50 flex items-start space-x-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-black text-[9px] text-slate-700 shrink-0 mt-0.5">
                                  {comment.author.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="font-extrabold text-slate-800 text-[11px] block">{comment.author}</span>
                                  <p className="text-slate-600 mt-0.5 leading-normal font-medium">{comment.text}</p>
                                </div>
                              </div>
                            ))}

                            {post.comments.length === 0 && (
                              <p className="text-[10px] text-slate-400 text-center py-2 font-mono">No comments yet. Write the first one!</p>
                            )}
                          </div>

                          {/* Quick write input form */}
                          <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex items-center space-x-2 pt-1">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                              placeholder="Add a verified comment..."
                              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder-slate-400"
                              required
                            />
                            <button
                              type="submit"
                              className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all cursor-pointer shadow"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      )}

                    </div>

                  </GlassCard>
                );
              })}
            </div>

          </div>

          {/* Right Column: Trending Topics & Rewards Sidebar (Col span 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Trending Hashtags */}
            <GlassCard className="bg-white/95 p-6" hoverEffect={false}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-display">Trending on Alvon</span>
                <span className="text-[10px] text-rose-500 font-bold cursor-pointer hover:underline">See all</span>
              </div>

              <div className="space-y-4">
                {trendingTags.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-rose-600 font-mono">{t.tag}</p>
                      <p className="text-[10px] text-slate-400 font-sans">{t.posts}</p>
                    </div>
                    <span className="text-[9px] font-extrabold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-sans">
                      {t.trend}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Creator guidelines reward widget */}
            <GlassCard className="bg-slate-50 border border-slate-100/80 p-5" hoverEffect={false}>
              <div className="flex items-center space-x-1.5">
                <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Creator Program</h5>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-2 font-display">Alvon Influencer Stars 🌟</p>
              <p className="text-[11px] text-slate-500 leading-normal mt-1">
                Build a community. For every 100 likes on your posts, earn <strong>100 Alvon Coins</strong>, redeemable for physical gifts in Alvon Mart!
              </p>
              <div className="h-[1px] bg-slate-200/50 my-3.5" />
              <button 
                onClick={() => alert('Simulated Registration in Influencer program successful!')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Apply to Creator Program
              </button>
            </GlassCard>

          </div>

        </div>
      )}

      {/* 4. Active Story Viewer Full-screen Modal Overlay */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex flex-col justify-between p-4 md:p-6"
          >
            
            {/* Top progress indicator timers */}
            <div className="w-full max-w-lg mx-auto space-y-3.5">
              <div className="flex space-x-1.5">
                <div className="h-1 flex-1 bg-white/20 rounded overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-40" 
                    style={{ width: `${storyProgress}%` }}
                  />
                </div>
              </div>

              {/* Story Author Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center font-black text-xs">
                    {activeStory.avatar}
                  </div>
                  <div>
                    <span className="text-xs font-black block">{activeStory.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono block">Alvon Live Moments</span>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveStory(null)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Core Story Graphic Viewport */}
            <div className="flex-1 flex items-center justify-center max-w-lg mx-auto my-4 w-full h-[60vh] rounded-2xl overflow-hidden relative border border-white/5 shadow-2xl">
              <img 
                src={activeStory.image} 
                alt={activeStory.name} 
                className="w-full h-full object-cover rounded-2xl" 
                referrerPolicy="no-referrer"
              />
              
              {/* Soft overlay graphics */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white p-2.5">
                <span className="bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                  @AlvonNetwork
                </span>
                <p className="text-xs font-bold mt-1.5">Enjoying lightning fast recharges and secure payments with standard-certified Alvon speed! 📶🔋</p>
              </div>
            </div>

            {/* Bottom response input */}
            <div className="w-full max-w-lg mx-auto pt-2 pb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={`Reply to ${activeStory.name.split(' ')[0]}...`}
                  className="flex-1 px-4 py-2.5 bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder-slate-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      alert('Story reply sent in real-time!');
                      setActiveStory(null);
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    alert('Story reply sent!');
                    setActiveStory(null);
                  }}
                  className="px-4 py-2.5 bg-rose-600 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
