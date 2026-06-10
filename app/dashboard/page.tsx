'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth, useSocket } from '../providers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function DashboardPage() {
  const { user, token, refreshUser, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Load orders matching customer email
  const fetchOrders = () => {
    if (!user) return;
    fetch('/api/orders')
      .then(res => res.json())
      .then((data: Order[]) => {
        // Filter orders for the logged-in customer
        const customerOrders = data.filter(ord => 
          ord.customerEmail.toLowerCase() === user.email.toLowerCase()
        );
        setOrders(customerOrders);
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error('Error loading orders:', err);
        setLoadingOrders(false);
      });
  };

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      refreshUser();
    }
  }, [user]);

  // Real-time socket event: Order status changes
  useEffect(() => {
    if (socket) {
      const handleOrderStatusUpdate = (updatedOrder: Order) => {
        if (user && updatedOrder.customerEmail.toLowerCase() === user.email.toLowerCase()) {
          setOrders(prev => 
            prev.map(ord => ord._id === updatedOrder._id ? updatedOrder : ord)
          );
          // Refresh user loyalty points if delivered
          if (updatedOrder.status === 'delivered') {
            refreshUser();
          }
        }
      };

      socket.on('client-order-status-updated', handleOrderStatusUpdate);
      return () => {
        socket.off('client-order-status-updated', handleOrderStatusUpdate);
      };
    }
  }, [socket, user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-emerald-400 font-medium text-sm">Authenticating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full space-y-10">
        
        {/* Profile Card & Loyalty Points summary */}
        <section className="bg-emerald-950/10 border border-emerald-900/30 rounded-3xl p-6 md:p-8 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-16 h-16 rounded-full border border-emerald-800 object-cover"
            />
            <div>
              <h2 className="text-2xl font-black text-white">{user.name}</h2>
              <p className="text-xs text-emerald-400 font-medium">{user.email} | Global Customer</p>
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-850 p-5 rounded-2xl text-left md:text-right relative z-10 w-full md:w-auto">
            <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">Nexoveda Loyalty Balance</p>
            <p className="text-3xl font-black text-yellow-400">${user.loyaltyPoints.toFixed(2)} <span className="text-sm font-bold text-white">Points</span></p>
            <p className="text-[10px] text-gray-400 mt-1 max-w-xs">
              Earn 5% points back on every order. Redeem 1 point for $0.10 discount at checkout.
            </p>
          </div>
        </section>

        {/* Orders List & Status Tracking Timeline */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📦</span> Order History & Real-Time Shipment Tracking
          </h3>

          {loadingOrders ? (
            <div className="py-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mx-auto mb-2"></div>
              <p className="text-xs text-gray-400">Loading order records...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-emerald-950/5 border border-emerald-900/20 rounded-3xl p-12 text-center">
              <span className="text-3xl mb-4 block">🍃</span>
              <p className="text-sm text-gray-400">You haven't placed any orders yet. Visit our shop to get started!</p>
              <Link href="/shop" className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-xl text-xs inline-block transition-colors">
                Browse Shop Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div 
                  key={order._id} 
                  className="bg-emerald-950/10 border border-emerald-900/30 rounded-3xl p-6 space-y-6 shadow-md"
                >
                  {/* Order header information */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-900/20 pb-4 gap-2 text-xs">
                    <div>
                      <p className="text-emerald-400 font-semibold">Order ID: {order._id}</p>
                      <p className="text-gray-400 mt-0.5">Placed: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="font-bold text-white">Grand Total: ${order.total.toFixed(2)}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Shipping: {order.shippingCost === 0 ? 'FREE Standard' : `$${order.shippingCost.toFixed(2)}`}
                      </p>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Order Items</p>
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-gray-300">{item.name} <span className="text-gray-500">x{item.quantity}</span></span>
                            <span className="font-medium text-emerald-300">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Delivery Address</p>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {order.customerName}<br />
                        {order.addressLine1}, {order.suburb}<br />
                        {order.state}, postcode {order.postcode}<br />
                        Phone: {order.customerPhone}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic tracking timeline */}
                  <div className="pt-4 border-t border-emerald-900/20">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 mb-6">Package Tracking Status</p>
                    
                    <div className="relative flex justify-between items-center max-w-xl mx-auto px-4">
                      {/* Timeline Line */}
                      <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[#050e0a] border-t border-b border-emerald-900/30 z-0"></div>
                      
                      {/* Progress Line */}
                      <div 
                        className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-yellow-500 transition-all duration-500 z-0"
                        style={{ 
                          width: order.status === 'pending' ? '0%' : order.status === 'shipped' ? '50%' : '100%' 
                        }}
                      ></div>

                      {/* Step 1: Pending */}
                      <div className="flex flex-col items-center z-10 text-center space-y-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border ${
                          order.status === 'pending' || order.status === 'shipped' || order.status === 'delivered'
                            ? 'bg-yellow-500 text-black border-yellow-500'
                            : 'bg-emerald-950 text-gray-400 border-emerald-900/40'
                        }`}>
                          📋
                        </div>
                        <span className="text-[10px] font-bold text-white">Order Received</span>
                        <span className="text-[8px] text-gray-500 block">Pending Prep</span>
                      </div>

                      {/* Step 2: Shipped */}
                      <div className="flex flex-col items-center z-10 text-center space-y-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border transition-colors ${
                          order.status === 'shipped' || order.status === 'delivered'
                            ? 'bg-yellow-500 text-black border-yellow-500'
                            : 'bg-emerald-950 text-gray-400 border-emerald-900/40'
                        }`}>
                          🚚
                        </div>
                        <span className={`text-[10px] font-bold ${order.status === 'shipped' || order.status === 'delivered' ? 'text-white' : 'text-gray-500'}`}>
                          Dispatched
                        </span>
                        <span className="text-[8px] text-gray-500 block">India Post / Courier</span>
                      </div>

                      {/* Step 3: Delivered */}
                      <div className="flex flex-col items-center z-10 text-center space-y-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border transition-colors ${
                          order.status === 'delivered'
                            ? 'bg-yellow-500 text-black border-yellow-500'
                            : 'bg-emerald-950 text-gray-400 border-emerald-900/40'
                        }`}>
                          🏠
                        </div>
                        <span className={`text-[10px] font-bold ${order.status === 'delivered' ? 'text-white' : 'text-gray-500'}`}>
                          Delivered
                        </span>
                        <span className="text-[8px] text-gray-500 block">Package Handed Over</span>
                      </div>

                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-emerald-950/20 border-t border-emerald-900/30 py-8 text-center text-xs text-emerald-600 mt-12">
        © 2026 Nexoveda India. Standardized Natural Formulations. All rights reserved.
      </footer>
    </div>
  );
}
