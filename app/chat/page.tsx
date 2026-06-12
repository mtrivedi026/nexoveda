'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useSocket } from '../providers';
import Link from 'next/link';

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

export default function ChatPage() {
  const { socket, isConnected } = useSocket();

  // Lobby form states
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [specialty, setSpecialty] = useState<'herbal' | 'medical'>('herbal');
  const [prefGender, setPrefGender] = useState<'male' | 'female' | 'any'>('any');

  // Room states
  const [room, setRoom] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [initiating, setInitiating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Wellness facts slideshow for loading screen
  const wellnessFacts = [
    "Himalayan Shilajit contains over 84 ionic trace minerals and is rich in Fulvic Acid for cellular energy.",
    "KSM-66 Ashwagandha is clinical-grade and proven to lower cortisol levels by up to 27%.",
    "Lemon Myrtle Sleep Tea is naturally caffeine-free and stimulates soothing nervous system responses.",
    "Organic Eucalyptus honey elixirs provide physical throat coating protection and combat cold symptoms."
  ];
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (room && room.status === 'pending') {
      interval = setInterval(() => {
        setFactIndex(prev => (prev + 1) % wellnessFacts.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [room]);

  // Join socket room immediately when room ID is generated (pending or active)
  useEffect(() => {
    if (room && socket) {
      socket.emit('join-room', { roomId: room._id });
    }
  }, [room?._id, socket]);

  // Load messages if conversation is active
  useEffect(() => {
    if (room && room.status === 'active') {
      fetch(`/api/chats/rooms/${room._id}/messages`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setMessages(data);
        })
        .catch(console.error);
    }
  }, [room?._id, room?.status]);

  // Scroll bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentTyping]);

  // Socket triggers
  useEffect(() => {
    if (socket && room) {
      socket.on('recv-msg', (newMsg: Message) => {
        if (newMsg.conversation === room._id) {
          setMessages(prev => [...prev, newMsg]);
        }
      });

      socket.on('user-typing', ({ userId, isTyping }: { userId: string, isTyping: boolean }) => {
        // If matched agent is typing
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
          setRoom(null);
          alert('Consultation closed by matched advisor.');
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
    if (!age || Number(age) < 12 || Number(age) > 120) {
      setErrorMessage('Please enter a valid age (12-120).');
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
          preferredGender: prefGender
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Matching initiation failed.');

      setRoom(data);
    } catch (e: any) {
      setErrorMessage(e.message || 'Error connecting to support queue.');
    } finally {
      setInitiating(false);
    }
  };

  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || msgInput;
    if (!textToSend.trim() || !room) return;

    if (socket) {
      socket.emit('send-msg', {
        roomId: room._id,
        senderId: 'anonymous-customer',
        senderName: 'Anonymous Customer',
        text: textToSend,
        attachmentUrl: null
      });
    }

    if (!customText) setMsgInput('');
    handleTyping(false);
  };

  const simulateAttachment = () => {
    if (!room) return;
    const filename = prompt('Enter image or log filename (e.g. skin_issue.jpg):', 'symptom_photo.jpg');
    if (!filename) return;

    fetch(`/api/chats/rooms/${room._id}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename })
    })
      .then(res => res.json())
      .then((data) => {
        if (socket) {
          socket.emit('send-msg', {
            roomId: room._id,
            senderId: 'anonymous-customer',
            senderName: 'Anonymous Customer',
            text: `Uploaded symptom log file: ${filename}`,
            attachmentUrl: data.fileUrl
          });
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
    if (!confirm('Are you sure you want to end this anonymous consultation?')) return;

    try {
      const res = await fetch(`/api/chats/rooms/${room._id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setRoom(null);
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Quick reply messages for client symptoms
  const clientCannedQuestions = [
    "I feel heavy muscle fatigue after workouts. Which Shilajit capsule dose is best?",
    "Can I consume Shilajit and Ashwagandha concurrently?",
    "Do you deliver express package orders directly to Mumbai or Delhi?"
  ];

  return (
    <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10 flex-grow w-full flex flex-col items-center justify-center">
        
        {/* LOBBY VIEW: Initiate Form */}
        {!room && (
          <div className="w-full max-w-lg bg-emerald-950/20 border border-emerald-900/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="text-center">
              <span className="text-4xl block mb-2">💬</span>
              <h2 className="text-2xl font-black text-white">Anonymous Consultation Lobby</h2>
              <p className="text-xs text-emerald-400 mt-2">
                Discuss your physical conditions, recovery issues, or dosages privately with verified health advisors.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-950/30 border border-red-900/50 text-red-200 px-4 py-3 rounded-xl text-xs">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleStartChat} className="space-y-5">
              
              {/* Profile details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    Your Age *
                  </label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 24"
                    className="w-full bg-[#050e0a] border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs focus:border-yellow-500 focus:outline-none text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    Your Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#050e0a] border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs focus:border-yellow-500 focus:outline-none text-white font-medium"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="couple">Couple</option>
                  </select>
                </div>
              </div>

              {/* Specialist Specialty choice */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                  Choose Advisor Specialist Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSpecialty('herbal')}
                    className={`py-3.5 border rounded-2xl text-xs font-bold transition-all ${
                      specialty === 'herbal'
                        ? 'bg-yellow-500 text-black border-yellow-500'
                        : 'bg-[#050e0a]/50 text-gray-300 border-emerald-900/40 hover:bg-emerald-950/50'
                    }`}
                  >
                    🌿 Herbal Expert Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecialty('medical')}
                    className={`py-3.5 border rounded-2xl text-xs font-bold transition-all ${
                      specialty === 'medical'
                        ? 'bg-yellow-500 text-black border-yellow-500'
                        : 'bg-[#050e0a]/50 text-gray-300 border-emerald-900/40 hover:bg-emerald-950/50'
                    }`}
                  >
                    👩‍⚕️ Medical Doctor GP
                  </button>
                </div>
              </div>

              {/* Specialist Gender preference */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                  Choose Advisor Gender Comfort Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'any'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setPrefGender(g)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                        prefGender === g
                          ? 'bg-yellow-500 text-black border-yellow-500'
                          : 'bg-[#050e0a]/50 text-gray-300 border-emerald-900/40 hover:bg-emerald-950/50'
                      }`}
                    >
                      {g === 'any' ? 'Couple' : g}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={initiating}
                className="w-full bg-yellow-500 text-black font-extrabold py-3.5 rounded-xl hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/10 active:scale-98 transition-all text-xs cursor-pointer disabled:opacity-50"
              >
                {initiating ? 'Finding Match...' : 'Initiate Anonymous Consultation 🔒'}
              </button>

            </form>
          </div>
        )}

        {/* LOADING Facts View (When status is pending) */}
        {room && room.status === 'pending' && (
          <div className="w-full max-w-lg bg-emerald-950/20 border border-emerald-900/40 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl space-y-8 animate-pulse">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
              <h3 className="text-xl font-bold text-white">Connecting to Verified Advisor...</h3>
              <p className="text-xs text-emerald-400">
                Lobby comfort settings: <span className="capitalize font-bold">{room.preferredGender}</span>{' '}
                <span className="capitalize font-bold">{room.preferredSpecialty === 'herbal' ? 'Herbalist' : 'Medical Doctor'}</span>
              </p>
            </div>

            {/* Wellness Facts Carousel */}
            <div className="bg-[#050e0a]/70 border border-emerald-900/35 p-5 rounded-2xl min-h-[90px] flex items-center justify-center">
              <div className="text-xs text-gray-300 transition-opacity duration-500 italic">
                <span className="font-bold text-yellow-400 block not-italic mb-1">💡 Nexoveda Wellness Fact:</span>
                "{wellnessFacts[factIndex]}"
              </div>
            </div>

            <button
              onClick={handleCloseChat}
              className="text-xs text-red-400 hover:text-red-300 underline font-semibold cursor-pointer"
            >
              Cancel Connection Request
            </button>
          </div>
        )}

        {/* CHAT INTERACTIVE PANEL (When status is active) */}
        {room && room.status === 'active' && (
          <div className="w-full bg-emerald-950/20 border border-emerald-900/45 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between min-h-[500px]">
            
            {/* Chat header (Matched Advisor details) */}
            <div className="flex justify-between items-center border-b border-emerald-900/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-lg font-bold text-black border border-yellow-400">
                  {room.agent && typeof room.agent === 'object' && room.agent.name ? room.agent.name[0] : '👨‍⚕️'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs">
                    Matched Advisor: {room.agent && typeof room.agent === 'object' && room.agent.name ? room.agent.name : 'Wellness Specialist'}
                  </h3>
                  <p className="text-[9px] text-emerald-400 capitalize">
                    Role: {room.agent && typeof room.agent === 'object' && room.agent.specialty ? room.agent.specialty : room.preferredSpecialty} Advisor
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseChat}
                className="bg-red-950/40 hover:bg-red-950 border border-red-900/40 text-red-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                End Session
              </button>
            </div>

            {/* Messages box */}
            <div className="flex-grow overflow-y-auto max-h-[300px] space-y-4 my-4 p-4 bg-[#050e0a]/40 border border-emerald-900/20 rounded-2xl">
              {messages.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-10">
                  Matched! Feel free to describe your symptoms or dosage inquiries. Your advisor is online.
                </p>
              )}

              {messages.map((m) => {
                const isMe = m.sender === 'anonymous-customer';
                return (
                  <div
                    key={m._id}
                    className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <span className="text-[9px] text-gray-500 mb-0.5 font-bold">
                      {isMe ? 'You (Anonymous)' : (room.agent && typeof room.agent === 'object' && room.agent.name ? room.agent.name : 'Advisor')}
                    </span>

                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe 
                        ? 'bg-yellow-500 text-black font-medium' 
                        : 'bg-emerald-900/20 text-gray-200 border border-emerald-900/45'
                    }`}>
                      <p>{m.text}</p>
                      {m.attachmentUrl && (
                        <a 
                          href={m.attachmentUrl} 
                          target="_blank" 
                          className={`block mt-2 font-bold underline text-[10px] ${isMe ? 'text-black' : 'text-yellow-400'}`}
                        >
                          📄 View Attached Document Log
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Matched Advisor Typing Indicator */}
              {agentTyping && (
                <div className="text-[10px] text-yellow-400 italic font-medium animate-pulse">
                  {room.agent && typeof room.agent === 'object' && room.agent.name ? room.agent.name : 'Advisor'} is typing...
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick symptom queries */}
            <div className="space-y-1.5 pt-2 border-t border-emerald-900/10 mb-2">
              <span className="block text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                Suggested Symptom Queries
              </span>
              <div className="flex flex-col gap-1.5">
                {clientCannedQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(undefined, q)}
                    className="w-full text-left bg-[#050e0a]/50 hover:bg-emerald-950/80 border border-emerald-900/35 p-2 rounded-xl text-[10px] text-emerald-300 hover:text-yellow-400 transition-colors text-ellipsis overflow-hidden whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat entry form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <button
                type="button"
                onClick={simulateAttachment}
                className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 p-3.5 border border-emerald-900/40 rounded-xl text-xs transition-colors cursor-pointer"
                title="Attach photo symptom log"
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
                placeholder="Type details about your stamina, fatigue, or recovery..."
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
        )}

      </main>

      {/* Footer */}
      <footer className="bg-emerald-950/20 border-t border-emerald-900/30 py-6 text-center text-xs text-emerald-600 mt-12">
        © 2026 Nexoveda Global. Secure Consultation Portal. All rights reserved.
      </footer>
    </div>
  );
}
