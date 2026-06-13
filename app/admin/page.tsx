'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth, useSocket } from '../providers';
import { useRouter } from 'next/navigation';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  suburb: string;
  state: string;
  postcode: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
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

interface Agent {
  _id: string;
  name: string;
  email: string;
  role: string;
  specialty: 'herbal' | 'medical';
  gender: 'male' | 'female';
  status: 'online' | 'offline' | 'busy';
  avatarUrl?: string;
}

export default function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [rooms, setRooms] = useState<Conversation[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);

  const [selectedAgentForRoom, setSelectedAgentForRoom] = useState<{ [roomId: string]: string }>({});
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Tab control
  const [activePanel, setActivePanel] = useState<'ops' | 'specs' | 'quiz'>('ops');
  
  // Specialists states
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [loadingSpecialists, setLoadingSpecialists] = useState(true);
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecTiming, setNewSpecTiming] = useState('');
  
  // Quiz states
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [newQText, setNewQText] = useState('');
  const [newOpt1Text, setNewOpt1Text] = useState('');
  const [newOpt1Score, setNewOpt1Score] = useState(1);
  const [newOpt2Text, setNewOpt2Text] = useState('');
  const [newOpt2Score, setNewOpt2Score] = useState(2);
  const [newOpt3Text, setNewOpt3Text] = useState('');
  const [newOpt3Score, setNewOpt3Score] = useState(3);

  const loadData = () => {
    if (!token) return;
    
    // Fetch orders
    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        setLoadingOrders(false);
      })
      .catch(console.error);

    // Fetch conversation rooms
    fetch('/api/chats/rooms', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRooms(data);
        setLoadingRooms(false);
      })
      .catch(console.error);

    // Fetch agents list
    fetch('/api/agents', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAgents(data);
        setLoadingAgents(false);
      })
      .catch(console.error);

    // Fetch specialists timings
    fetch('/api/specialists')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSpecialists(data);
        setLoadingSpecialists(false);
      })
      .catch(console.error);

    // Fetch quiz questions
    fetch('/api/quiz/questions')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) setQuestions(data);
        setLoadingQuestions(false);
      })
      .catch(console.error);
  };

  const handleAddSpecialist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecName || !newSpecTiming) return;
    try {
      const res = await fetch('/api/specialists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newSpecName, timing: newSpecTiming, active: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save specialist timing');
      
      setSpecialists(prev => {
        const idx = prev.findIndex(item => item._id === data._id);
        if (idx !== -1) return prev.map((item, i) => i === idx ? data : item);
        return [...prev, data];
      });
      setNewSpecName('');
      setNewSpecTiming('');
      showFeedback('Specialist timing saved successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSpecialist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this specialist timing?')) return;
    try {
      const res = await fetch(`/api/specialists/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete');
      }
      setSpecialists(prev => prev.filter(item => item._id !== id));
      showFeedback('Specialist timing deleted.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleSpecialistActive = async (spec: any) => {
    try {
      const res = await fetch('/api/specialists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...spec, active: !spec.active })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update');
      setSpecialists(prev => prev.map(item => item._id === spec._id ? data : item));
      showFeedback('Specialist status updated.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText || !newOpt1Text || !newOpt2Text || !newOpt3Text) {
      alert('Please enter a question and at least 3 options.');
      return;
    }
    const options = [
      { text: newOpt1Text, score: Number(newOpt1Score) },
      { text: newOpt2Text, score: Number(newOpt2Score) },
      { text: newOpt3Text, score: Number(newOpt3Score) }
    ];

    try {
      const res = await fetch('/api/quiz/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newQText, options, active: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save question');

      setQuestions(prev => {
        const idx = prev.findIndex(item => item._id === data._id);
        if (idx !== -1) return prev.map((item, i) => i === idx ? data : item);
        return [...prev, data];
      });
      setNewQText('');
      setNewOpt1Text('');
      setNewOpt2Text('');
      setNewOpt3Text('');
      showFeedback('Quiz question saved successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz question?')) return;
    try {
      const res = await fetch(`/api/quiz/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete');
      }
      setQuestions(prev => prev.filter(item => item._id !== id));
      showFeedback('Quiz question deleted.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleQuestionActive = async (q: any) => {
    try {
      const res = await fetch('/api/quiz/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...q, active: !q.active })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update');
      setQuestions(prev => prev.map(item => item._id === q._id ? data : item));
      showFeedback('Question status updated.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        window.location.href = '/login';
      } else {
        loadData();
      }
    }
  }, [user, authLoading, token]);

  // Handle Socket Events for real-time lists
  useEffect(() => {
    if (socket && user && user.role === 'admin') {
      socket.on('new-order-received', (newOrder: Order) => {
        setOrders(prev => [newOrder, ...prev]);
      });

      socket.on('order-status-changed', (updatedOrder: Order) => {
        setOrders(prev => prev.map(ord => ord._id === updatedOrder._id ? updatedOrder : ord));
      });

      socket.on('new-pending-chat', (newRoom: Conversation) => {
        setRooms(prev => [newRoom, ...prev]);
      });

      socket.on('queue-updated', () => {
        if (token) {
          fetch('/api/chats/rooms', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setRooms(data); });
        }
      });

      socket.on('agent-status-updated', ({ agentId, status }: { agentId: string, status: string }) => {
        setAgents(prev => prev.map(ag => ag._id === agentId ? { ...ag, status: status as any } : ag));
      });

      return () => {
        socket.off('new-order-received');
        socket.off('order-status-changed');
        socket.off('new-pending-chat');
        socket.off('queue-updated');
        socket.off('agent-status-updated');
      };
    }
  }, [socket, user, token]);

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'shipped' | 'delivered') => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update order status');
      setOrders(prev => prev.map(o => o._id === orderId ? data : o));
      showFeedback(`Order ${orderId} updated to ${newStatus}`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAssignAgent = async (roomId: string) => {
    const room = rooms.find(r => r._id === roomId);
    const currentAgentId = room && room.agent ? (room.agent._id || room.agent) : '';
    const agentId = selectedAgentForRoom[roomId] !== undefined ? selectedAgentForRoom[roomId] : currentAgentId;
    if (!agentId) {
      alert('Please select an agent to assign.');
      return;
    }

    try {
      const res = await fetch(`/api/chats/rooms/${roomId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ agentId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to assign agent');
      
      setRooms(prev => prev.map(r => r._id === roomId ? data : r));
      showFeedback('Agent assigned successfully!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-emerald-400 font-medium text-sm">Authenticating admin permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col">
      <Navbar />

      {/* Floating feedback */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-yellow-500 text-black px-6 py-3.5 rounded-xl font-bold shadow-xl border border-yellow-400">
          ✓ {feedbackMsg}
        </div>
      )}

      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 border-b border-emerald-900/20 pb-4 text-xs sm:text-sm">
          <button
            onClick={() => setActivePanel('ops')}
            className={`px-4 py-2 rounded-xl font-bold transition-all border cursor-pointer ${
              activePanel === 'ops'
                ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/10'
                : 'bg-[#05140f] border-emerald-900/30 text-gray-400 hover:text-white hover:bg-emerald-900/20'
            }`}
          >
            📊 Operations & Sales
          </button>
          <button
            onClick={() => setActivePanel('specs')}
            className={`px-4 py-2 rounded-xl font-bold transition-all border cursor-pointer ${
              activePanel === 'specs'
                ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/10'
                : 'bg-[#05140f] border-emerald-900/30 text-gray-400 hover:text-white hover:bg-emerald-900/20'
            }`}
          >
            ⏰ Specialist Timings
          </button>
          <button
            onClick={() => setActivePanel('quiz')}
            className={`px-4 py-2 rounded-xl font-bold transition-all border cursor-pointer ${
              activePanel === 'quiz'
                ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/10'
                : 'bg-[#05140f] border-emerald-900/30 text-gray-400 hover:text-white hover:bg-emerald-900/20'
            }`}
          >
            📝 Health Quiz Manager
          </button>
        </div>

        {/* PANEL 1: OPERATIONS & SALES */}
        {activePanel === 'ops' && (
          <>
            {/* Top summary row: Agents connections dashboard */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>👩‍⚕️</span> Support Agent Live Status
              </h3>
              {loadingAgents ? (
                <p className="text-xs text-gray-400">Loading agents status...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {agents.map((ag) => (
                    <div key={ag._id} className="bg-emerald-950/10 border border-emerald-900/30 p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ag.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                          alt={ag.name}
                          className="w-10 h-10 rounded-full object-cover border border-emerald-800"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{ag.name}</h4>
                          <p className="text-[9px] text-emerald-400 font-medium capitalize mt-0.5">{ag.specialty} ({ag.gender})</p>
                        </div>
                      </div>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        ag.status === 'online'
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : ag.status === 'busy'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {ag.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Split grid: Chats queues & Shipment management */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
              
              {/* Left: Chat consultation rooms */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>💬</span> Anonymous Consultation Queue
                </h3>

                {loadingRooms ? (
                  <p className="text-xs text-gray-400">Loading consultation queue...</p>
                ) : rooms.length === 0 ? (
                  <div className="bg-emerald-950/5 border border-emerald-900/20 rounded-2xl p-8 text-center text-xs text-gray-400">
                    No active or pending consultations in the queue.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rooms.map((room) => (
                      <div key={room._id} className="bg-emerald-950/10 border border-emerald-900/30 p-5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <p className="font-bold text-white">Customer (Anonymous)</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Age: {room.customerAge} | Gender: <span className="capitalize">{room.customerGender}</span>
                            </p>
                          </div>
                          
                          <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-xl uppercase border ${
                            room.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                              : 'bg-green-500/20 text-green-400 border-green-500/40'
                          }`}>
                            {room.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-300 bg-[#050e0a]/40 p-3 rounded-xl">
                          <p><span className="text-emerald-400 font-medium">Req Specialty:</span> <span className="capitalize">{room.preferredSpecialty}</span></p>
                          <p><span className="text-emerald-400 font-medium">Req Gender:</span> <span className="capitalize">{room.preferredGender}</span></p>
                          <p className="col-span-2 mt-1 pt-1 border-t border-emerald-900/10">
                            <span className="text-emerald-400 font-medium">Matched Advisor:</span>{' '}
                            {room.agent ? (
                              <span className="font-bold text-yellow-400">{room.agent.name || 'Assigned'}</span>
                            ) : (
                              <span className="text-red-400 font-bold">Unassigned</span>
                            )}
                          </p>
                        </div>

                        {/* Manual Assign tool */}
                        {room.status !== 'closed' && (
                          <div className="flex items-center gap-2 pt-2">
                            <select
                              value={selectedAgentForRoom[room._id] !== undefined ? selectedAgentForRoom[room._id] : (room.agent ? (room.agent._id || room.agent) : '')}
                              onChange={(e) => setSelectedAgentForRoom(prev => ({ ...prev, [room._id]: e.target.value }))}
                              className="flex-grow bg-[#050e0a] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs focus:outline-none text-white font-medium"
                            >
                              <option value="">-- Choose Agent to Assign --</option>
                              {agents.map((ag) => (
                                <option key={ag._id} value={ag._id}>
                                  {ag.name} ({ag.specialty === 'herbal' ? 'Herbal' : 'Medical'} - {ag.status})
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssignAgent(room._id)}
                              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Assign
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Right: Shipment status management */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📦</span> Global Orders & Shipments Dispatcher
                </h3>

                {loadingOrders ? (
                  <p className="text-xs text-gray-400">Loading sales orders...</p>
                ) : orders.length === 0 ? (
                  <div className="bg-emerald-950/5 border border-emerald-900/20 rounded-2xl p-8 text-center text-xs text-gray-400">
                    No orders registered in the system.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="bg-emerald-950/10 border border-emerald-900/30 p-5 rounded-2xl space-y-4 text-xs text-gray-300">
                        <div className="flex justify-between items-center border-b border-emerald-900/10 pb-2.5">
                          <div>
                            <p className="font-bold text-white">{order.customerName}</p>
                            <p className="text-[10px] text-gray-400">Order ID: {order._id}</p>
                          </div>
                          
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                            order.status === 'delivered'
                              ? 'bg-green-500/15 text-green-400 border-green-500/30'
                              : order.status === 'shipped'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p><span className="text-emerald-400 font-medium">Destination:</span> {order.addressLine1}, {order.suburb}, {order.state}</p>
                          <p><span className="text-emerald-400 font-medium">Phone contact:</span> {order.customerPhone}</p>
                          <p><span className="text-emerald-400 font-medium">Grand Total:</span> <span className="font-bold text-yellow-400">${order.total.toFixed(2)}</span></p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2.5 border-t border-emerald-900/10">
                          <button
                            onClick={() => updateOrderStatus(order._id, 'pending')}
                            className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] transition-colors cursor-pointer border ${
                              order.status === 'pending'
                                ? 'bg-yellow-500 text-black border-yellow-500'
                                : 'bg-emerald-950/50 text-gray-400 border-emerald-900/40 hover:bg-emerald-900/30'
                            }`}
                          >
                            Pending Prep
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order._id, 'shipped')}
                            className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] transition-colors cursor-pointer border ${
                              order.status === 'shipped'
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-emerald-950/50 text-gray-400 border-emerald-900/40 hover:bg-emerald-900/30'
                            }`}
                          >
                            Ship Order
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order._id, 'delivered')}
                            className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] transition-colors cursor-pointer border ${
                              order.status === 'delivered'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-emerald-950/50 text-gray-400 border-emerald-900/40 hover:bg-emerald-900/30'
                            }`}
                          >
                            Deliver Order
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>
          </>
        )}

        {/* PANEL 2: SPECIALISTS TIMINGS */}
        {activePanel === 'specs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Create Timing Form */}
            <div className="bg-emerald-950/10 border border-emerald-900/35 p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-white">Add Specialist Timing</h3>
              <form onSubmit={handleAddSpecialist} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                    Specialist Name / Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSpecName}
                    onChange={(e) => setNewSpecName(e.target.value)}
                    placeholder="e.g. Male Ayurvedic Doctor"
                    className="w-full bg-[#050e0a] border border-emerald-900/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-600 text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                    Availability Timing *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSpecTiming}
                    onChange={(e) => setNewSpecTiming(e.target.value)}
                    placeholder="e.g. 12:00 PM to 3:00 PM"
                    className="w-full bg-[#050e0a] border border-emerald-900/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-600 text-white font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-3 rounded-xl transition-all text-xs cursor-pointer shadow-md"
                >
                  Save Specialist Option
                </button>
              </form>
            </div>

            {/* List Timings */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-white">Active Timings</h3>
              {loadingSpecialists ? (
                <p className="text-xs text-gray-400">Loading timings...</p>
              ) : specialists.length === 0 ? (
                <p className="text-xs text-gray-400">No specialist timings configured.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {specialists.map((spec) => (
                    <div key={spec._id} className="bg-emerald-950/10 border border-emerald-900/30 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{spec.name}</h4>
                        <p className="text-xs text-emerald-400 font-semibold mt-1">⏰ {spec.timing}</p>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-emerald-900/10 justify-between items-center text-xs">
                        <button
                          onClick={() => handleToggleSpecialistActive(spec)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-[10px] cursor-pointer ${
                            spec.active !== false
                              ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800'
                              : 'bg-red-950/25 text-red-400 border border-red-950/40'
                          }`}
                        >
                          {spec.active !== false ? 'Active' : 'Disabled'}
                        </button>
                        <button
                          onClick={() => handleDeleteSpecialist(spec._id)}
                          className="bg-red-950 hover:bg-red-900 text-red-200 border border-red-900/40 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* PANEL 3: HEALTH QUIZ QUESTIONS */}
        {activePanel === 'quiz' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Create Quiz Question Form */}
            <div className="bg-emerald-950/10 border border-emerald-900/35 p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-white">Add Quiz Question</h3>
              <form onSubmit={handleAddQuestion} className="space-y-4 text-xs text-gray-300">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                    Question Text *
                  </label>
                  <input
                    type="text"
                    required
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    placeholder="e.g. Rate your muscle recovery?"
                    className="w-full bg-[#050e0a] border border-emerald-900/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-600 text-white font-medium"
                  />
                </div>
                
                <div className="space-y-3 pt-2 border-t border-emerald-900/10">
                  <h4 className="font-bold text-white">Question Options & Scores</h4>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-3">
                      <label className="block text-[9px] text-gray-400 mb-0.5">Option 1 Text *</label>
                      <input
                        type="text"
                        required
                        value={newOpt1Text}
                        onChange={(e) => setNewOpt1Text(e.target.value)}
                        placeholder="Option 1"
                        className="w-full bg-[#050e0a] border border-emerald-900/40 rounded-lg px-2.5 py-1.5 focus:outline-none text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-400 mb-0.5">Score</label>
                      <input
                        type="number"
                        required
                        value={newOpt1Score}
                        onChange={(e) => setNewOpt1Score(Number(e.target.value))}
                        className="w-full bg-[#050e0a] border border-emerald-900/40 rounded-lg px-2.5 py-1.5 focus:outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-3">
                      <label className="block text-[9px] text-gray-400 mb-0.5">Option 2 Text *</label>
                      <input
                        type="text"
                        required
                        value={newOpt2Text}
                        onChange={(e) => setNewOpt2Text(e.target.value)}
                        placeholder="Option 2"
                        className="w-full bg-[#050e0a] border border-emerald-900/40 rounded-lg px-2.5 py-1.5 focus:outline-none text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-400 mb-0.5">Score</label>
                      <input
                        type="number"
                        required
                        value={newOpt2Score}
                        onChange={(e) => setNewOpt2Score(Number(e.target.value))}
                        className="w-full bg-[#050e0a] border border-emerald-900/40 rounded-lg px-2.5 py-1.5 focus:outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-3">
                      <label className="block text-[9px] text-gray-400 mb-0.5">Option 3 Text *</label>
                      <input
                        type="text"
                        required
                        value={newOpt3Text}
                        onChange={(e) => setNewOpt3Text(e.target.value)}
                        placeholder="Option 3"
                        className="w-full bg-[#050e0a] border border-emerald-900/40 rounded-lg px-2.5 py-1.5 focus:outline-none text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-400 mb-0.5">Score</label>
                      <input
                        type="number"
                        required
                        value={newOpt3Score}
                        onChange={(e) => setNewOpt3Score(Number(e.target.value))}
                        className="w-full bg-[#050e0a] border border-emerald-900/40 rounded-lg px-2.5 py-1.5 focus:outline-none text-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-3 rounded-xl transition-all text-xs cursor-pointer shadow-md"
                >
                  Save Quiz Question
                </button>
              </form>
            </div>

            {/* List Quiz Questions */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-white">Quiz Questions List</h3>
              {loadingQuestions ? (
                <p className="text-xs text-gray-400">Loading questions...</p>
              ) : questions.length === 0 ? (
                <p className="text-xs text-gray-400">No health quiz questions configured.</p>
              ) : (
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div key={q._id} className="bg-emerald-950/10 border border-emerald-900/30 p-5 rounded-2xl space-y-3">
                      <div>
                        <h4 className="font-extrabold text-white text-sm leading-tight">{q.text}</h4>
                        <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-gray-400">
                          {q.options && q.options.map((opt: any, idx: number) => (
                            <span key={idx} className="bg-[#050e0a]/60 px-2.5 py-1 rounded-lg border border-emerald-900/25">
                              {opt.text} <strong className="text-yellow-400">({opt.score} pts)</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-emerald-900/10 justify-between items-center text-xs">
                        <button
                          onClick={() => handleToggleQuestionActive(q)}
                          className={`px-3 py-1 rounded-lg font-bold text-[10px] cursor-pointer ${
                            q.active !== false
                              ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800'
                              : 'bg-red-950/25 text-red-400 border border-red-950/40'
                          }`}
                        >
                          {q.active !== false ? 'Active' : 'Disabled'}
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="bg-red-950 hover:bg-red-900 text-red-200 border border-red-900/40 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Delete Question
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950/20 border-t border-emerald-900/30 py-8 text-center text-xs text-emerald-600 mt-12">
        © 2026 Nexoveda Global. Admin Command Desk. All rights reserved.
      </footer>
    </div>
  );
}
