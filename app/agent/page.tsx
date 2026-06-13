'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useAuth, useSocket } from '../providers';
import { useRouter } from 'next/navigation';

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
  preferredSpecialty: 'herbal' | 'medical';
  preferredGender: 'male' | 'female' | 'any';
  status: 'pending' | 'active' | 'closed';
  lastMessageAt: string;
}

export default function AgentPage() {
  const { user, token, refreshUser, loading: authLoading } = useAuth();
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  const [status, setStatus] = useState<'online' | 'offline' | 'busy'>('offline');
  const [rooms, setRooms] = useState<Conversation[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Active chat state
  const [activeRoom, setActiveRoom] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [clientTyping, setClientTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollMessagesNow = useRef<(() => void) | null>(null);

  // Specialty canned templates
  const medicalTemplates = [
    "As a Doctor, I recommend taking Ashwagandha with warm milk after meals to lower cortisol levels safely.",
    "Please share your medical history. Are you currently taking any prescription medications?",
    "For physical stamina, standardized Shilajit should be consumed in pea-sized amounts twice daily."
  ];

  const herbalTemplates = [
    "I suggest Lemon Myrtle Sleep Tea to naturally relax your nervous system before bedtime.",
    "Eucalyptus syrup is highly effective to coat the throat and soothe seasonal chest congestion.",
    "Our standardized Shilajit has 98% purity, providing rich trace minerals without any chemical additives."
  ];

  const loadData = () => {
    if (!token) return;
    fetch('/api/chats/rooms', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRooms(data);
          // If activeRoom is set, check if it still exists in the active/pending rooms list
          if (activeRoom) {
            const stillExists = data.some(r => r._id === activeRoom._id);
            if (!stillExists) {
              setActiveRoom(null);
              setMessages([]);
              alert('This consultation has been closed by the customer.');
            }
          }
        }
        setLoadingRooms(false);
      })
      .catch(err => {
        console.error('Error fetching rooms:', err);
        setLoadingRooms(false);
      });
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'agent') {
        window.location.href = '/login';
      } else {
        setStatus(user.status);
        loadData();
      }
    }
  }, [user, authLoading, token]);

  // Poll rooms list every 5 seconds to get new pending/claimed chats
  useEffect(() => {
    if (!token || !user || user.role !== 'agent') return;
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [token, user, activeRoom?._id]);

  // Handle active room messages loading and polling
  useEffect(() => {
    let interval: any;
    if (activeRoom) {
      const pollMessages = () => {
        fetch(`/api/chats/rooms/${activeRoom._id}/messages`)
          .then(res => res.json())
          .then((data) => {
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

      pollMessagesNow.current = pollMessages;
      pollMessages();
      interval = setInterval(pollMessages, 1500);

      if (socket) {
        socket.emit('join-room', { roomId: activeRoom._id });
      }
    } else {
      setMessages([]);
      pollMessagesNow.current = null;
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeRoom?._id, socket]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, clientTyping]);

  // Socket triggers
  useEffect(() => {
    if (socket && user && user.role === 'agent') {
      
      socket.on('recv-msg', (newMsg: Message) => {
        if (activeRoom && newMsg.conversation === activeRoom._id) {
          setMessages(prev => [...prev, newMsg]);
        }
        // Update rooms listing to show latest message timestamps
        loadData();
      });

      socket.on('user-typing', ({ userId, isTyping }: { userId: string, isTyping: boolean }) => {
        if (activeRoom && userId !== user.id) {
          setClientTyping(isTyping);
        }
      });

      socket.on('chat-assigned', (updatedRoom: Conversation) => {
        setRooms(prev => prev.map(r => r._id === updatedRoom._id ? updatedRoom : r));
        if (activeRoom && activeRoom._id === updatedRoom._id) {
          setActiveRoom(updatedRoom);
        }
      });

      socket.on('chat-closed', (closedRoom: Conversation) => {
        setRooms(prev => prev.filter(r => r._id !== closedRoom._id));
        if (activeRoom && activeRoom._id === closedRoom._id) {
          setActiveRoom(null);
          alert('This conversation has been closed.');
        }
      });

      return () => {
        socket.off('recv-msg');
        socket.off('user-typing');
        socket.off('chat-assigned');
        socket.off('chat-closed');
      };
    }
  }, [socket, user, activeRoom]);

  const toggleStatus = async (newStatus: 'online' | 'offline' | 'busy') => {
    try {
      const res = await fetch('/api/agents/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      setStatus(data.status);
      refreshUser();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleClaimChat = async (roomId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/chats/rooms/${roomId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ agentId: user.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to claim chat');
      
      setRooms(prev => prev.map(r => r._id === roomId ? data : r));
      setActiveRoom(data);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || msgInput;
    if (!textToSend.trim() || !activeRoom || !user) return;

    if (!customText) setMsgInput('');
    handleTyping(false);

    // Optimistic: show immediately before server confirms
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      _id: tempId,
      conversation: activeRoom._id,
      sender: user.id,
      senderName: user.name,
      text: textToSend,
      attachmentUrl: null,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/chats/rooms/${activeRoom._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: user.id,
          senderName: user.name,
          text: textToSend,
          attachmentUrl: null
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Replace optimistic with real server message
        setMessages(prev => prev.map(m => m._id === tempId ? data : m));
        // Trigger immediate re-poll so customer sees it ASAP
        setTimeout(() => { pollMessagesNow.current?.(); }, 300);
      } else {
        setMessages(prev => prev.filter(m => m._id !== tempId));
      }
    } catch (err) {
      console.error('Failed to send message via HTTP:', err);
      setMessages(prev => prev.filter(m => m._id !== tempId));
      if (socket) {
        socket.emit('send-msg', {
          roomId: activeRoom._id,
          senderId: user.id,
          senderName: user.name,
          text: textToSend,
          attachmentUrl: null
        });
      }
    }
  };

  const handleCloseChat = async () => {
    if (!activeRoom) return;
    if (!confirm('Are you sure you want to close this consultation?')) return;

    try {
      const res = await fetch(`/api/chats/rooms/${activeRoom._id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to close room');
      setActiveRoom(null);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const simulateAttachment = () => {
    if (!activeRoom || !user) return;
    const filename = prompt('Enter symptom log file name (e.g. blood_report.pdf):', 'symptom_report.pdf');
    if (!filename) return;

    fetch(`/api/chats/rooms/${activeRoom._id}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename })
    })
      .then(res => res.json())
      .then(async (data) => {
        const textToSend = `Attached Document Log: ${filename}`;
        try {
          const resMsg = await fetch(`/api/chats/rooms/${activeRoom._id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender: user.id,
              senderName: user.name,
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
              roomId: activeRoom._id,
              senderId: user.id,
              senderName: user.name,
              text: textToSend,
              attachmentUrl: data.fileUrl
            });
          }
        }
      })
      .catch(console.error);
  };

  const handleTyping = (typingState: boolean) => {
    if (!activeRoom || !user || !socket) return;
    setIsTyping(typingState);
    socket.emit('typing', {
      roomId: activeRoom._id,
      userId: user.id,
      name: user.name,
      isTyping: typingState
    });
  };

  if (authLoading || !user || user.role !== 'agent') {
    return (
      <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-emerald-400 font-medium text-sm">Authenticating specialist credentials...</p>
        </div>
      </div>
    );
  }

  const templates = user.specialty === 'medical' ? medicalTemplates : herbalTemplates;

  return (
    <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full flex flex-col gap-6">
        
        {/* Profile Card & Online Status Switcher */}
        <section className="bg-emerald-950/15 border border-emerald-900/30 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover border border-emerald-800"
            />
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-xs text-emerald-400 font-medium capitalize">
                Role: {user.specialty} Specialist ({user.gender})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#050e0a] p-1.5 rounded-xl border border-emerald-900/40">
            {(['online', 'busy', 'offline'] as const).map((s) => (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  status === s
                    ? s === 'online'
                      ? 'bg-green-500 text-black'
                      : s === 'busy'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-red-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Live Chats grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow items-stretch">
          
          {/* Left Panel: Active / Pending Chats list */}
          <aside className="lg:col-span-1 bg-emerald-950/15 border border-emerald-900/30 rounded-3xl p-6 flex flex-col space-y-4 backdrop-blur-md">
            <h3 className="text-base font-bold text-white border-b border-emerald-900/20 pb-2.5 flex items-center gap-2">
              <span>🗂️</span> Consultation Rooms
            </h3>

            {loadingRooms ? (
              <p className="text-xs text-gray-400 py-6 text-center">Loading rooms list...</p>
            ) : rooms.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">No active chats in queue.</p>
            ) : (
              <div className="space-y-3 flex-grow overflow-y-auto max-h-[500px] pr-1">
                {rooms.map((room) => {
                  const isActive = activeRoom && activeRoom._id === room._id;
                  const isAssignedToMe = room.agent && room.agent._id === user.id;

                  return (
                    <div
                      key={room._id}
                      onClick={() => {
                        if (room.status === 'active' && isAssignedToMe) {
                          setActiveRoom(room);
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs space-y-2.5 ${
                        isActive
                          ? 'bg-yellow-500 text-black border-yellow-500 font-bold'
                          : isAssignedToMe
                          ? 'bg-emerald-950/40 text-white border-emerald-900 hover:bg-emerald-950/60'
                          : 'bg-emerald-900/10 text-emerald-300 border-emerald-900/20 hover:bg-emerald-900/20'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Anon Customer</span>
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                          room.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/35'
                            : 'bg-green-500/20 text-green-400 border-green-500/35'
                        }`}>
                          {room.status}
                        </span>
                      </div>

                      <div className="text-[10px] space-y-0.5">
                        <p>Customer Profile: {room.customerAge}y, {room.customerGender}</p>
                        <p>Comfort Specialty: {room.preferredSpecialty} ({room.preferredGender})</p>
                      </div>

                      {/* Claim action for unassigned room */}
                      {room.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaimChat(room._id);
                          }}
                          className="w-full mt-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-2 rounded-xl text-[10px] transition-colors"
                        >
                          Claim Consultation
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Right Panel: Active Chat Panel Workspace */}
          <section className="lg:col-span-2 bg-emerald-950/15 border border-emerald-900/30 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-md min-h-[500px]">
            {activeRoom ? (
              <div className="flex flex-col h-full justify-between gap-4">
                
                {/* Active Chat Header */}
                <div className="flex justify-between items-center border-b border-emerald-900/20 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">Consultation with Anonymous Customer</h3>
                    <p className="text-[10px] text-emerald-400">
                      Age: {activeRoom.customerAge} | Gender: <span className="capitalize">{activeRoom.customerGender}</span>
                    </p>
                  </div>
                  <button
                    onClick={handleCloseChat}
                    className="bg-red-950/40 hover:bg-red-950 border border-red-900/40 text-red-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Close Chat
                  </button>
                </div>

                {/* Messages Panel */}
                <div className="flex-grow overflow-y-auto max-h-[300px] space-y-4 p-4 bg-[#050e0a]/40 border border-emerald-900/20 rounded-2xl">
                  {messages.map((m) => {
                    const isMe = m.sender === user.id;
                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <span className="text-[9px] text-gray-500 mb-0.5 font-bold">
                          {isMe ? 'You' : 'Customer'}
                        </span>
                        
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe 
                            ? 'bg-yellow-500 text-black font-medium' 
                            : 'bg-emerald-900/20 text-gray-200 border border-emerald-900/40'
                        }`}>
                          <p>{m.text}</p>
                          {m.attachmentUrl && (
                            <a 
                              href={m.attachmentUrl} 
                              target="_blank" 
                              className={`block mt-2 font-bold underline text-[10px] ${isMe ? 'text-black' : 'text-yellow-400'}`}
                            >
                              📄 View Symptom Log Log
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {clientTyping && (
                    <div className="text-[10px] text-emerald-400 italic font-medium animate-pulse">
                      Customer is typing symptoms...
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Canned Clinical Replies templates selector */}
                <div className="space-y-1.5 pt-2 border-t border-emerald-900/10">
                  <span className="block text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                    Clinical Quick Reply Templates
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {templates.map((temp, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(undefined, temp)}
                        className="w-full text-left bg-[#050e0a]/50 hover:bg-emerald-950/80 border border-emerald-900/30 p-2 rounded-xl text-[10px] text-emerald-300 hover:text-yellow-400 transition-colors text-ellipsis overflow-hidden whitespace-nowrap"
                      >
                        {temp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={simulateAttachment}
                    className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 p-3.5 border border-emerald-900/40 rounded-xl text-xs transition-colors cursor-pointer"
                    title="Simulate Symptom logs upload"
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
                    placeholder="Type clinical guidance response..."
                    className="flex-grow bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 text-xs focus:border-yellow-500 focus:outline-none text-white font-medium"
                  />

                  <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold px-6 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Send
                  </button>
                </form>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-xs text-gray-500 py-16">
                <span className="text-4xl mb-3">💬</span>
                <p>Select an active consultation from the room sidebar workspace to start clinical messaging.</p>
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950/20 border-t border-emerald-900/30 py-8 text-center text-xs text-emerald-600 mt-12">
        © 2026 Nexoveda Global. Specialist Guidance Workspace. All rights reserved.
      </footer>
    </div>
  );
}
