'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket, useAuth, useChat } from '../providers';

interface Message {
  _id: string;
  conversation: string;
  sender: string;
  senderName: string;
  text: string;
  attachmentUrl?: string | null;
  createdAt: string;
}

interface Conversation {
  _id: string;
  customerName: string;
  customerAge: number;
  customerGender: string;
  agent: any | null;
  preferredSpecialty: 'herbal' | 'medical' | 'mental_health';
  preferredGender: 'male' | 'female' | 'any';
  status: 'pending' | 'active' | 'closed';
  lastMessageAt: string;
  referenceNumber?: string;
}

export default function ChatWidget() {
  const { socket, isConnected } = useSocket();
  const { user, token } = useAuth();
  const { isChatOpen, setChatOpen, chatTab, setChatTab } = useChat();

  // Map to global context state
  const activeTab = chatTab;
  const setActiveTab = setChatTab;

  // Lobby form states
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [specialty, setSpecialty] = useState<'herbal' | 'mental_health'>('herbal');
  const [prefGender, setPrefGender] = useState<'male' | 'female'>('male');

  // Room states
  const [room, setRoom] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [initiating, setInitiating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Seeding/Facts for Loading Screen
  const wellnessFacts = [
    "Himalayan Shilajit contains over 84 ionic trace minerals and is rich in Fulvic Acid for cellular energy.",
    "KSM-66 Ashwagandha is clinical-grade and proven to lower cortisol levels by up to 27%.",
    "Lemon Myrtle Sleep Tea stimulates soothing nervous system responses.",
    "Organic Eucalyptus honey elixirs provide physical throat coating protection."
  ];
  const [factIndex, setFactIndex] = useState(0);

  // Checkout states
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutCity, setCheckoutCity] = useState('');
  const [checkoutState, setCheckoutState] = useState('');
  const [checkoutPostcode, setCheckoutPostcode] = useState('');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Promo code & discounts inside checkout
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const [redeemedPoints, setRedeemedPoints] = useState(0);
  const [checkoutError, setCheckoutError] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any>(null);

  const productPrice = 29.99; // Flagship Adivance Capsule cost
  const shippingCost = productPrice - discountValue >= 50 ? 0 : 5.00;
  const subtotal = productPrice;
  const loyaltyPointsValue = user ? (user.loyaltyPoints || 0) * 0.10 : 0;
  const finalTotal = Math.max(0, Number((productPrice - discountValue - redeemedPoints * 0.10 + shippingCost).toFixed(2)));

  useEffect(() => {
    let interval: any;
    if (room && room.status === 'pending') {
      interval = setInterval(() => {
        setFactIndex(prev => (prev + 1) % wellnessFacts.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [room]);

  useEffect(() => {
    if (room && socket) {
      socket.emit('join-room', { roomId: room._id });
    }
  }, [room?._id, socket]);

  // Shared message poller ref so we can trigger immediate refetch
  const pollMessagesNow = useRef<(() => void) | null>(null);
  const roomClosedRef = useRef<string | null>(null);

  const handleRoomClosedByAdvisor = (roomId: string) => {
    if (roomClosedRef.current === roomId) return;
    roomClosedRef.current = roomId;

    setRoom(null);
    setMessages([]);
    setChatOpen(false); // Close the widget as requested
    setActiveTab('chat');
    alert('Consultation closed by matched advisor.');
  };

  useEffect(() => {
    let interval: any;
    if (room && room.status !== 'closed') {
      const pollRoomStatus = () => {
        fetch(`/api/chats/rooms/${room._id}`)
          .then(res => res.json())
          .then(data => {
            if (data && data._id === room._id) {
              const currentAgentId = room.agent && typeof room.agent === 'object' ? room.agent._id : room.agent;
              const newAgentId = data.agent && typeof data.agent === 'object' ? data.agent._id : data.agent;
              
              if (data.status !== room.status || currentAgentId !== newAgentId) {
                if (data.status === 'closed') {
                  handleRoomClosedByAdvisor(room._id);
                } else {
                  setRoom(data);
                }
              }
            }
          })
          .catch(console.error);
      };

      pollRoomStatus();
      interval = setInterval(pollRoomStatus, 2000);
    }
    return () => clearInterval(interval);
  }, [room?._id, room?.status, room?.agent]);

  useEffect(() => {
    let interval: any;
    if (room && room.status === 'active') {
      const pollMessages = () => {
        fetch(`/api/chats/rooms/${room._id}/messages`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setMessages(prev => {
                const newMsgs = data.filter(dm => !prev.some(pm => pm._id === dm._id));
                if (newMsgs.length > 0) {
                  return [...prev, ...newMsgs];
                }
                return prev;
              });
            }
          })
          .catch(console.error);
      };

      // Store ref so send function can trigger immediate re-poll
      pollMessagesNow.current = pollMessages;

      pollMessages();
      interval = setInterval(pollMessages, 1500);
    } else {
      pollMessagesNow.current = null;
    }
    return () => clearInterval(interval);
  }, [room?._id, room?.status]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentTyping, activeTab]);

  useEffect(() => {
    if (socket && room) {
      socket.on('recv-msg', (newMsg: Message) => {
        if (newMsg.conversation === room._id) {
          setMessages(prev => [...prev, newMsg]);
        }
      });

      socket.on('user-typing', ({ userId, isTyping }: { userId: string, isTyping: boolean }) => {
        const agentId = room.agent && typeof room.agent === 'object' ? room.agent._id : room.agent;
        if (agentId && userId === agentId) {
          setAgentTyping(isTyping);
        }
      });

      socket.on('chat-assigned', (updatedRoom: Conversation) => {
        if (updatedRoom._id === room._id) {
          setRoom(updatedRoom);
        }
      });

      socket.on('chat-closed', (closedRoom: Conversation) => {
        if (closedRoom._id === room._id) {
          handleRoomClosedByAdvisor(room._id);
        }
      });

      return () => {
        socket.off('recv-msg');
        socket.off('user-typing');
        socket.off('chat-assigned');
        socket.off('chat-closed');
      };
    }
  }, [socket, room]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!age || Number(age) < 18 || Number(age) > 120) {
      setErrorMessage('Consultation is only available for individuals aged 18 and older.');
      return;
    }
    setInitiating(true);

    try {
      const res = await fetch('/api/chats/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerAge: Number(age),
          customerGender: gender,
          preferredSpecialty: specialty,
          preferredGender: specialty === 'mental_health' ? 'female' : prefGender
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Matching initiation failed.');
      setRoom(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to support queue.');
    } finally {
      setInitiating(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || msgInput;
    if (!textToSend.trim() || !room) return;

    if (!customText) setMsgInput('');
    handleTyping(false);

    // Optimistic: show message immediately before server confirms
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      _id: tempId,
      conversation: room._id,
      sender: 'anonymous-customer',
      senderName: 'Anonymous Customer',
      text: textToSend,
      attachmentUrl: null,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/chats/rooms/${room._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'anonymous-customer',
          senderName: 'Anonymous Customer',
          text: textToSend,
          attachmentUrl: null
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Replace optimistic message with real one from server
        setMessages(prev => prev.map(m => m._id === tempId ? data : m));
        // Immediately trigger a re-poll so other side sees it ASAP
        setTimeout(() => { pollMessagesNow.current?.(); }, 300);
      } else {
        // Remove optimistic on error
        setMessages(prev => prev.filter(m => m._id !== tempId));
      }
    } catch (err) {
      console.error('Failed to send message via HTTP:', err);
      // Remove optimistic message
      setMessages(prev => prev.filter(m => m._id !== tempId));
      if (socket) {
        socket.emit('send-msg', {
          roomId: room._id,
          senderId: 'anonymous-customer',
          senderName: 'Anonymous Customer',
          text: textToSend,
          attachmentUrl: null
        });
      }
    }
  };

  const simulateAttachment = () => {
    if (!room) return;
    const filename = prompt('Enter symptom image filename (e.g. fatigue.jpg):', 'fatigue_chart.jpg');
    if (!filename) return;

    fetch(`/api/chats/rooms/${room._id}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename })
    })
      .then(res => res.json())
      .then(async (data) => {
        const textToSend = `Uploaded symptom image: ${filename}`;
        try {
          const resMsg = await fetch(`/api/chats/rooms/${room._id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender: 'anonymous-customer',
              senderName: 'Anonymous Customer',
              text: textToSend,
              attachmentUrl: data.fileUrl
            })
          });
          const msgData = await resMsg.json();
          if (resMsg.ok) {
            setMessages(prev => {
              if (prev.some(m => m._id === msgData._id)) return prev;
              return [...prev, msgData];
            });
          }
        } catch (err) {
          console.error('Failed to send attachment message via HTTP:', err);
          if (socket) {
            socket.emit('send-msg', {
              roomId: room._id,
              senderId: 'anonymous-customer',
              senderName: 'Anonymous Customer',
              text: textToSend,
              attachmentUrl: data.fileUrl
            });
          }
        }
      })
      .catch(console.error);
  };

  const handleTyping = (typingState: boolean) => {
    if (!room || !socket) return;
    setIsTyping(typingState);
    socket.emit('typing', {
      roomId: room._id,
      userId: 'anonymous-customer',
      name: 'Anonymous Customer',
      isTyping: typingState
    });
  };

  const handleCloseChat = async () => {
    if (!room) return;
    if (!confirm('Are you sure you want to end this consultation?')) return;

    try {
      const res = await fetch(`/api/chats/rooms/${room._id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setRoom(null);
        setMessages([]);
        setActiveTab('chat');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Checkout handling
  const applyPromoCode = async () => {
    setCheckoutError('');
    if (!promoInput) return;
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, subtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.message || 'Invalid promo code');
        return;
      }
      setAppliedPromo(data.code);
      setDiscountPercent(data.discountPercent);
      setDiscountValue(data.discountValue);
    } catch (e) {
      setCheckoutError('Validation failed.');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    if (!checkoutName || !checkoutEmail || !checkoutPhone || !checkoutAddress || !checkoutCity) {
      setCheckoutError('Please fill in all shipping details.');
      return;
    }
    if (!cardNumber || !cardExpiry || !cardCvv) {
      setCheckoutError('Please fill in valid card payment details.');
      return;
    }
    setSubmittingOrder(true);

    try {
      const orderBody = {
        customerName: checkoutName,
        customerEmail: checkoutEmail,
        customerPhone: checkoutPhone,
        addressLine1: checkoutAddress,
        suburb: checkoutCity,
        state: checkoutState || 'Global',
        postcode: checkoutPostcode || '00000',
        items: [
          {
            productId: 'prod-adivance',
            name: 'Adivance Capsule',
            quantity: 1,
            price: productPrice
          }
        ],
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: finalTotal,
        redeemedPoints: redeemedPoints,
        customerId: user ? user.id : null
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderBody)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order.');

      setLastPlacedOrder(data);
      setActiveTab('success');
      
      // Auto send order confirmation message inside active chat if open
      if (room && room.status === 'active') {
        handleSendMessage(undefined, `Placed order successfully! Order Ref: ${data._id}. Total Amount Paid: $${finalTotal}`);
      }

      // Reset states
      setCheckoutName('');
      setCheckoutEmail('');
      setCheckoutPhone('');
      setCheckoutAddress('');
      setCheckoutCity('');
      setCheckoutState('');
      setCheckoutPostcode('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setAppliedPromo('');
      setDiscountValue(0);
      setRedeemedPoints(0);
    } catch (err: any) {
      setCheckoutError(err.message || 'Order failed.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Pre-fill fields if user is logged in
  useEffect(() => {
    if (user) {
      setCheckoutName(user.name);
      setCheckoutEmail(user.email);
    }
  }, [user]);

  if (!isChatOpen) {
    // Floating bubble trigger button
    return (
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-tr from-emerald-600 to-yellow-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border border-yellow-400/20 cursor-pointer group"
      >
        <span className="text-2xl group-hover:rotate-12 transition-transform">💬</span>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 text-[9px] text-black font-extrabold items-center justify-center">1</span>
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between text-slate-800 animate-slide-up">
      
      {/* Light Theme Header */}
      <header className="bg-gradient-to-r from-emerald-800 to-emerald-950 px-6 py-4 flex justify-between items-center text-white border-b border-emerald-900/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight text-white leading-tight">Health Consultant</h3>
            <p className="text-[10px] text-emerald-300 font-medium mt-0.5">Nexoveda Advisor Workspace</p>
          </div>
        </div>
        <button
          onClick={() => setChatOpen(false)}
          className="text-white/70 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
        >
          ✕
        </button>
      </header>

      {/* Tabs Menu inside Chat room (only when active session exists) */}
      {room && room.status === 'active' && (
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex gap-2 text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'chat' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            💬 Advisor Chat
          </button>
          <button
            onClick={() => setActiveTab('checkout')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
              activeTab === 'checkout' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🛒 Order Adivance ($29.99)
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow overflow-y-auto bg-slate-50 flex flex-col">
        
        {/* TAB 1: Chat flow */}
        {activeTab === 'chat' && (
          <div className="flex-grow flex flex-col justify-between p-4">
            
            {/* Lobby View */}
            {!room && (
              <div className="space-y-4 py-2">
                <div className="text-center space-y-1.5 mb-6">
                  <span className="text-3xl block">💬</span>
                  <h4 className="text-base font-black text-slate-800">Start Consultation</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Connect instantly with certified wellness specialists to discuss your stamina, fatigue, or recovery symptoms.
                  </p>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2.5 rounded-xl text-xs font-semibold">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <form onSubmit={handleStartChat} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Consultation Type *
                    </label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value as 'herbal' | 'mental_health')}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none text-slate-800 font-medium"
                    >
                      <option value="herbal">Herbal Product Consultation</option>
                      <option value="mental_health">Mental Health Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Your Age *
                    </label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 24"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:outline-none text-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Your Gender *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none text-slate-800 font-medium"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  {specialty === 'herbal' && (
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Advisor Gender Preference *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['male', 'female'] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setPrefGender(g)}
                            className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                              prefGender === g
                                ? 'bg-yellow-500 text-black border-yellow-500 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={initiating}
                    className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl transition-all text-xs cursor-pointer shadow-md disabled:opacity-50 mt-2"
                  >
                    {initiating ? 'Matching...' : 'Initiate Secure Consultation 🔒'}
                  </button>
                </form>
              </div>
            )}

            {/* Connecting/Loading Queue View */}
            {room && room.status === 'pending' && (
              <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6 py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-800 border-t-transparent"></div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Connecting to Advisor...</h4>
                  <p className="text-[10px] text-emerald-600">Matching in lobby queue...</p>
                  {room.referenceNumber && (
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      Ref No: <span className="font-bold">{room.referenceNumber}</span>
                    </p>
                  )}
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl max-w-xs shadow-sm">
                  <span className="font-bold text-emerald-800 text-[10px] block mb-1">💡 Nexoveda Health Fact:</span>
                  <p className="text-[10px] text-slate-600 italic">"{wellnessFacts[factIndex]}"</p>
                </div>

                <button
                  onClick={handleCloseChat}
                  className="text-xs text-red-500 hover:text-red-600 underline font-semibold cursor-pointer"
                >
                  Cancel Connection
                </button>
              </div>
            )}

            {/* Active Message room view */}
            {room && room.status === 'active' && (
              <div className="flex-grow flex flex-col justify-between h-[450px]">
                
                {/* Active Advisor header */}
                <div className="flex justify-between items-center bg-white border border-slate-200/60 p-3 rounded-2xl mb-3 shadow-sm text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {room.agent && typeof room.agent === 'object' && room.agent.name ? room.agent.name[0] : '👨‍⚕'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 leading-tight">
                        {room.agent && typeof room.agent === 'object' && room.agent.name ? room.agent.name : 'Wellness Specialist'}
                      </p>
                      <span className="text-[9px] text-emerald-600 capitalize">Online</span>
                      {room.referenceNumber && (
                        <span className="text-[9px] text-slate-400 block font-mono">Ref: {room.referenceNumber}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleCloseChat}
                    className="text-red-500 hover:text-red-600 font-bold text-[11px] cursor-pointer"
                  >
                    End Chat
                  </button>
                </div>

                {/* Messages Box */}
                <div className="flex-grow overflow-y-auto space-y-3 p-3 bg-white border border-slate-200/50 rounded-2xl max-h-[200px]">
                  {messages.length === 0 && (
                    <p className="text-[11px] text-slate-400 text-center py-6">
                      Describe your conditions or dosage queries to start clinical consultation.
                    </p>
                  )}

                  {messages.map((m) => {
                    const isMe = m.sender === 'anonymous-customer';
                    return (
                      <div key={m._id} className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                        <div className={`p-2.5 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                          isMe ? 'bg-yellow-500 text-black font-semibold' : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          <p>{m.text}</p>
                          {m.attachmentUrl && (
                            <a href={m.attachmentUrl} target="_blank" className="block mt-1.5 font-bold underline text-[9px]">
                              📄 View Symptom Attachment
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {agentTyping && (
                    <div className="text-[9px] text-emerald-600 italic font-medium animate-pulse">
                      Advisor is typing...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* In-Chat product promo banner */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-2.5 flex items-center justify-between my-2 shadow-sm">
                  <div className="text-[10px] text-slate-700">
                    <p className="font-extrabold text-black">Adivance Vitality Capsule</p>
                    <p className="mt-0.5">$29.99 (60 caps) • Purity verified</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('checkout')}
                    className="bg-emerald-800 hover:bg-emerald-700 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Order Now 🛒
                  </button>
                </div>

                {/* Message controls input */}
                <form onSubmit={handleSendMessage} className="flex gap-1.5 pt-2">
                  <button
                    type="button"
                    onClick={simulateAttachment}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2.5 border border-slate-200 rounded-xl text-xs cursor-pointer"
                    title="Attach photo log"
                  >
                    📎
                  </button>
                  <input
                    type="text"
                    value={msgInput}
                    onChange={(e) => {
                      setMsgInput(e.target.value);
                      if (e.target.value.length > 0 && !isTyping) handleTyping(true);
                      else if (e.target.value.length === 0 && isTyping) handleTyping(false);
                    }}
                    onBlur={() => handleTyping(false)}
                    placeholder="Describe symptoms or request checkout..."
                    className="flex-grow bg-white border border-slate-200 rounded-xl px-3 text-xs focus:border-emerald-600 focus:outline-none text-slate-800 font-medium"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold px-4 rounded-xl text-xs cursor-pointer"
                  >
                    Send
                  </button>
                </form>

              </div>
            )}

          </div>
        )}

        {/* TAB 2: Checkout / Payment form */}
        {activeTab === 'checkout' && (
          <form onSubmit={handlePlaceOrder} className="p-4 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h4 className="font-bold text-slate-800">Direct In-App Checkout</h4>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className="text-emerald-800 hover:underline font-bold text-[10px]"
              >
                ← Back to Chat
              </button>
            </div>

            {checkoutError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-2 rounded-xl text-[10px] font-bold">
                ⚠️ {checkoutError}
              </div>
            )}

            {/* Cart summary */}
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Adivance Capsule (x1)</span>
                <span>$29.99</span>
              </div>
              
              {appliedPromo && (
                <div className="flex justify-between text-emerald-600 font-medium text-[10px]">
                  <span>Promo Discount ({appliedPromo} -{discountPercent}%)</span>
                  <span>-${discountValue}</span>
                </div>
              )}

              {redeemedPoints > 0 && (
                <div className="flex justify-between text-yellow-600 font-medium text-[10px]">
                  <span>Redeemed Loyalty Points ({redeemedPoints} pts)</span>
                  <span>-${(redeemedPoints * 0.10).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Shipping Cost</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-extrabold text-sm border-t border-slate-200 pt-1.5 text-black">
                <span>Total Amount</span>
                <span>${finalTotal}</span>
              </div>
            </div>

            {/* Promo code & loyalty points redemption */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-500 mb-1">Coupon Code</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME15"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    className="bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded-lg hover:bg-slate-300 text-[10px]"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {user && user.loyaltyPoints > 0 && (
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-500 mb-1">Loyalty Points ({(user.loyaltyPoints || 0).toFixed(2)} pts)</label>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <input
                      type="checkbox"
                      id="redeemCheckbox"
                      checked={redeemedPoints > 0}
                      onChange={(e) => setRedeemedPoints(e.target.checked ? Math.min(100, Math.floor(user.loyaltyPoints)) : 0)}
                      className="rounded text-emerald-800 focus:ring-emerald-500"
                    />
                    <label htmlFor="redeemCheckbox" className="text-[10px] text-slate-600 font-semibold cursor-pointer">Redeem max pts</label>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Details */}
            <div className="space-y-2.5">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">Shipping Address</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Phone Number *"
                    value={checkoutPhone}
                    onChange={(e) => setCheckoutPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Street Address *"
                    value={checkoutAddress}
                    onChange={(e) => setCheckoutAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="City *"
                  value={checkoutCity}
                  onChange={(e) => setCheckoutCity(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={checkoutState}
                  onChange={(e) => setCheckoutState(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Postcode"
                  value={checkoutPostcode}
                  onChange={(e) => setCheckoutPostcode(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Credit Card Payment */}
            <div className="space-y-2.5">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">Credit Card Details (Payment)</span>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Card Number *"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY *"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="password"
                    required
                    placeholder="CVV / CVC *"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingOrder}
              className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {submittingOrder ? 'Processing Payment...' : `Pay & Place Order - $${finalTotal} 💳`}
            </button>
          </form>
        )}

        {/* TAB 3: Success order placed view */}
        {activeTab === 'success' && (
          <div className="p-8 text-center flex-grow flex flex-col items-center justify-center space-y-6">
            <span className="text-5xl block animate-bounce">🎉</span>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-emerald-800">Order Placed Successfully!</h4>
              {lastPlacedOrder && (
                <p className="text-[10px] text-slate-500">
                  Order Reference ID: <br />
                  <span className="font-mono font-bold text-slate-800">{lastPlacedOrder._id}</span>
                </p>
              )}
              <p className="text-xs text-slate-600 max-w-xs leading-normal">
                Your payment was processed securely. A confirmation has been sent to your email. You can track this in your dashboard profile.
              </p>
            </div>

            <button
              onClick={() => {
                setActiveTab('chat');
              }}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Back to Advisor Chat
            </button>
          </div>
        )}

      </div>

      {/* Light Theme Footer info */}
      <footer className="bg-slate-100 border-t border-slate-200 px-6 py-3 text-center text-[10px] text-slate-400">
        © 2026 Nexoveda. Secure SSL Encryption Consultation.
      </footer>
    </div>
  );
}
