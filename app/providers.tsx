'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// --- AUTH CONTEXT ---
interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'agent' | 'admin';
  specialty?: 'herbal' | 'medical' | null;
  gender?: 'male' | 'female' | null;
  status: 'online' | 'offline' | 'busy';
  avatarUrl?: string;
  loyaltyPoints: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

// --- CART CONTEXT ---
export interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    discountPercent?: number;
  };
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  promoCode: string;
  discountPercent: number;
  shippingCost: number;
  shippingType: 'standard' | 'express';
  setShippingType: (type: 'standard' | 'express') => void;
  redeemedPoints: number;
  setRedeemedPoints: (points: number) => void;
  total: number;
  applyPromo: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromo: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

// --- SOCKET CONTEXT ---
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
}

// --- CHAT WIDGET CONTEXT ---
interface ChatContextType {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  chatTab: 'chat' | 'checkout' | 'success';
  setChatTab: (tab: 'chat' | 'checkout' | 'success') => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
}

// --- PROVIDERS COMPONENT ---
export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [shippingType, setShippingType] = useState<'standard' | 'express'>('standard');
  const [redeemedPoints, setRedeemedPoints] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [chatTab, setChatTab] = useState<'chat' | 'checkout' | 'success'>('chat');

  // Load Auth & Cart from LocalStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('nexoveda_token');
    const storedUser = localStorage.getItem('nexoveda_user');
    const storedCart = localStorage.getItem('nexoveda_cart');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        setCart([]);
      }
    }
    setLoading(false);
  }, []);

  // Sync Cart to LocalStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('nexoveda_cart', JSON.stringify(cart));
    }
  }, [cart, loading]);

  // Auth Operations
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('nexoveda_token', newToken);
    localStorage.setItem('nexoveda_user', JSON.stringify(newUser));
  };

  const logout = () => {
    if (user && user.role === 'agent') {
      // Toggle agent offline in DB before logout
      fetch('/api/agents/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'offline' })
      }).catch(console.error);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('nexoveda_token');
    localStorage.removeItem('nexoveda_user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('nexoveda_user', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  // Cart Operations
  const addToCart = (product: any, quantity: number = 1) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product._id === product._id);
      if (exists) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode('');
    setDiscountPercent(0);
    setRedeemedPoints(0);
  };

  // Calculations (India localization: Standard Post vs Express Courier)
  const baseSubtotal = cart.reduce((sum, item) => {
    const price = item.product.price;
    const discountFactor = 1 - (item.product.discountPercent || 0) / 100;
    return sum + price * discountFactor * item.quantity;
  }, 0);

  const subtotal = Number(baseSubtotal.toFixed(2));
  const discount = Number((subtotal * (discountPercent / 100)).toFixed(2));

  // shipping: USD (Standard: $5.00, free for subtotal >= $50.00; Express: $10.00)
  const shippingCost = cart.length === 0 ? 0 : 
    shippingType === 'express' ? 10.00 : 
    subtotal >= 50.00 ? 0 : 5.00;

  // loyalty points calculations: 1 point = $0.10 discount. Cannot exceed subtotal - discount or customer balance
  const maxRedeemableVal = Math.max(0, subtotal - discount);
  const redeemedVal = Math.min(maxRedeemableVal, redeemedPoints * 0.10);
  
  const total = Number(Math.max(0, subtotal - discount - redeemedVal + shippingCost).toFixed(2));

  const applyPromo = async (code: string) => {
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (res.ok) {
        setPromoCode(data.code);
        setDiscountPercent(data.discountPercent);
        return { success: true, message: `Promo applied: ${data.discountPercent}% off!` };
      } else {
        return { success: false, message: data.message || 'Invalid code' };
      }
    } catch (e) {
      return { success: false, message: 'Server connection error.' };
    }
  };

  const removePromo = () => {
    setPromoCode('');
    setDiscountPercent(0);
  };

  // Socket.io Connection (Auto-Connect)
  useEffect(() => {
    const socketUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const newSocket = io(socketUrl, {
      autoConnect: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 Socket Connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 Socket Disconnected');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Register socket when user changes (without disconnecting anonymous users)
  useEffect(() => {
    if (socket && isConnected) {
      if (user) {
        socket.emit('register-socket', { userId: user.id, role: user.role });
      }
    }
  }, [socket, user, isConnected]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, loading }}>
      <CartContext.Provider
        value={{
          cart,
          addToCart,
          removeFromCart,
          updateQuantity,
          clearCart,
          subtotal,
          discount,
          promoCode,
          discountPercent,
          shippingCost,
          shippingType,
          setShippingType,
          redeemedPoints,
          setRedeemedPoints,
          total,
          applyPromo,
          removePromo
        }}
      >
        <SocketContext.Provider value={{ socket, isConnected }}>
          <ChatContext.Provider value={{ isChatOpen, setChatOpen, chatTab, setChatTab }}>
            {children}
          </ChatContext.Provider>
        </SocketContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}
