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
  preferredSpecialty: 'herbal' | 'medical' | 'mental_health';
  preferredGender: 'male' | 'female' | 'any';
  status: 'pending' | 'active' | 'closed';
  lastMessageAt: string;
  referenceNumber?: string;
}

interface Agent {
  _id: string;
  name: string;
  email: string;
  role: string;
  specialty: 'herbal' | 'medical' | 'mental_health';
  gender: 'male' | 'female';
  status: 'online' | 'offline' | 'busy';
  avatarUrl?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
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
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const [selectedAgentForRoom, setSelectedAgentForRoom] = useState<{ [roomId: string]: string }>({});
  const [feedbackMsg, setFeedbackMsg] = useState('');

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

    // Fetch products
    fetch('/api/products')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        setLoadingProducts(false);
      })
      .catch(console.error);
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) {
      alert('Name and price are required.');
      return;
    }
    setIsAddingProduct(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProductName,
          price: Number(newProductPrice),
          description: newProductDesc,
          category: newProductCategory,
          image: newProductImage
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add product');
      setProducts(prev => [...prev, data]);
      setNewProductName('');
      setNewProductPrice('');
      setNewProductDesc('');
      setNewProductCategory('');
      setNewProductImage('');
      showFeedback('Product added successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete product');
      setProducts(prev => prev.filter(p => p._id !== productId));
      showFeedback('Product deleted successfully!');
    } catch (err: any) {
      alert(err.message);
    }
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full space-y-12">
        <div className="flex justify-between items-center border-b border-emerald-900/30 pb-5">
          <div>
            <h1 className="text-3xl font-black text-white">Admin Command Center</h1>
            <p className="text-xs text-emerald-400 font-medium">Nexoveda Global Sales & Consultation Operations</p>
          </div>
          <span className="bg-yellow-500/25 text-yellow-400 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-yellow-500/40 uppercase">
            System Administrator
          </span>
        </div>

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
                        {room.referenceNumber && (
                          <p className="text-[10px] font-mono mt-1 text-yellow-300 font-bold tracking-wider">
                            🔖 Ref: {room.referenceNumber}
                          </p>
                        )}
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
                      <p><span className="text-emerald-400 font-medium">Req Specialty:</span> <span className="capitalize">{room.preferredSpecialty.replace('_', ' ')}</span></p>
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
                              {ag.name} ({ag.specialty === 'herbal' ? 'Herbal' : ag.specialty === 'mental_health' ? 'Mental Health' : 'Medical'} - {ag.status})
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

        {/* Product Management Section */}
        <section className="space-y-6 pt-8 border-t border-emerald-900/30">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🛒</span> Product Catalog Management
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Add New Product Form */}
            <form onSubmit={handleAddProduct} className="bg-emerald-950/20 border border-emerald-900/40 p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-emerald-400 border-b border-emerald-900/30 pb-2">Add New Product</h4>
              
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Product Name *</label>
                <input type="text" required value={newProductName} onChange={e => setNewProductName(e.target.value)} className="w-full bg-[#050e0a] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white" />
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Price (USD) *</label>
                <input type="number" step="0.01" required value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} className="w-full bg-[#050e0a] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white" />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Category</label>
                <input type="text" value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)} placeholder="e.g. Supplements" className="w-full bg-[#050e0a] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white" />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Image URL</label>
                <input type="text" value={newProductImage} onChange={e => setNewProductImage(e.target.value)} placeholder="/image/file.jpeg or https://..." className="w-full bg-[#050e0a] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white" />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Description</label>
                <textarea rows={3} value={newProductDesc} onChange={e => setNewProductDesc(e.target.value)} className="w-full bg-[#050e0a] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white resize-none" />
              </div>

              <button type="submit" disabled={isAddingProduct} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50 mt-2 cursor-pointer">
                {isAddingProduct ? 'Adding...' : 'Add Product'}
              </button>
            </form>

            {/* Product List */}
            <div className="lg:col-span-2 space-y-4">
              {loadingProducts ? (
                <p className="text-xs text-gray-400">Loading products...</p>
              ) : products.length === 0 ? (
                <div className="bg-emerald-950/5 border border-emerald-900/20 rounded-2xl p-8 text-center text-xs text-gray-400">
                  No products in catalog.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map(prod => (
                    <div key={prod._id} className="bg-emerald-950/10 border border-emerald-900/30 p-4 rounded-2xl flex gap-4 items-center">
                      <img src={prod.image || '/image/adivance-capsule.jpeg'} alt={prod.name} className="w-16 h-16 rounded-xl object-cover border border-emerald-800" />
                      <div className="flex-grow">
                        <h4 className="text-sm font-bold text-white">{prod.name}</h4>
                        <p className="text-[10px] text-emerald-400">${prod.price.toFixed(2)} &bull; {prod.category}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteProduct(prod._id)}
                        className="bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 p-2 rounded-lg transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-emerald-950/20 border-t border-emerald-900/30 py-8 text-center text-xs text-emerald-600 mt-12">
        © 2026 Nexoveda Global. Admin Command Desk. All rights reserved.
      </footer>
    </div>
  );
}
