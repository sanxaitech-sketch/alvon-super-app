export interface UserProfile {
  name: string;
  phone: string;
  walletBalance: number;
  alvonCoins: number;
  activePlan: string;
  dataUsed: number; // in GB
  dataLimit: number; // in GB
  daysRemaining: number;
  isPremium?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'electronics' | 'grocery' | 'fashion' | 'health';
  image: string;
  rating: number;
  tag?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Post {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  liked: boolean;
  comments: { author: string; text: string }[];
}

export interface Transaction {
  id: string;
  title: string;
  type: 'credit' | 'debit';
  amount: number;
  date: string;
  category: string;
}

export type ActiveTab = 'home' | 'pay' | 'mart' | 'social' | 'profile' | 'browser' | 'smarthub' | 'khata' | 'learning' | 'map' | 'vault';
