'use client';

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import { useChat, useCart } from './providers';

// Ingredients Data
const INGREDIENTS = [
  {
    name: 'Purified Shilajit',
    description: 'A mineral-rich organic resin sourced from high-altitude rocks. Renowned for enhancing cellular energy, stamina, and physical endurance.',
    icon: '🏔️',
    purity: '98.5% Standardized'
  },
  {
    name: 'KSM-66 Ashwagandha',
    description: 'An adaptogenic herb that lowers cortisol levels, reduces daily stress, and improves muscle recovery and overall stamina.',
    icon: '🌿',
    purity: 'Organic Extract'
  },
  {
    name: 'Safed Musli',
    description: 'A traditional vitalizing root that supports physical power, muscle tissue nourishment, and combats physical fatigue.',
    icon: '🌱',
    purity: 'High Alkaloid Extract'
  },
  {
    name: 'Gokshura (Tribulus)',
    description: 'An herb that natural supports testosterone release, enhances nitric oxide levels for muscle pump, and boosts stamina.',
    icon: '🌾',
    purity: '45% Saponins'
  }
];

// Benefits Data
const BENEFITS = [
  {
    title: 'Peak Physical Stamina',
    desc: 'Enhances cellular ATP production, giving you sustainable energy levels for workouts and active daily schedules without crashes.',
    icon: '⚡'
  },
  {
    title: 'Natural Vitality & Power',
    desc: 'Formulated with clinical-grade herbs that optimize natural endocrine levels for improved performance and strength.',
    icon: '🔋'
  },
  {
    title: 'Fast Muscle Recovery',
    desc: 'Significantly reduces inflammation and lactic acid build-up, ensuring quicker recovery after high-intensity training.',
    icon: '🛡️'
  },
  {
    title: 'Stress & Fatigue Relief',
    desc: 'Soothes the central nervous system, helping combat mental stress, exhaustion, and brain fog for focus.',
    icon: '🧠'
  }
];

// Verified Reviews Data
const REVIEWS = [
  {
    name: 'Fahad Patel',
    location: 'London, UK',
    rating: 5,
    date: 'June 01, 2026',
    comment: 'Best vitality capsule I have tried. Within 10 days, I felt a significant difference in my gym energy and daily focus. Shipping was very fast!'
  },
  {
    name: 'John Doe',
    location: 'New York, USA',
    rating: 5,
    date: 'May 24, 2026',
    comment: 'Highly recommend Adivance Capsule. I use it daily after my shifts. 100% natural and safe. Customer support on WhatsApp was extremely helpful.'
  },
  {
    name: 'Dr. Amira Iyer',
    location: 'Singapore',
    rating: 4,
    date: 'May 15, 2026',
    comment: 'The formulation uses standardized extracts of KSM-66 Ashwagandha and purified Shilajit. Very clean profile, great product for active recovery.'
  }
];

// FAQ Data
const FAQS = [
  {
    q: 'How should I take Adivance Capsules?',
    a: 'Take 1 to 2 capsules daily, preferably with a warm glass of milk or water after meals, or as directed by a healthcare specialist.'
  },
  {
    q: 'Are there any side effects?',
    a: 'Adivance Capsule is formulated with 100% natural, certified organic ingredients and is free from chemical additives. It is safe for long-term daily use.'
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery takes 3-5 business days. We also offer express courier delivery to major regions within 24-48 hours.'
  },
  {
    q: 'Is this product certified?',
    a: 'Yes, Nexoveda products are manufactured in GMP-certified facilities using standard raw materials that undergo rigorous third-party purity testing.'
  }
];

export default function Home() {
  const { setChatOpen, setChatTab } = useChat();
  const { addToCart } = useCart();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChatTab('chat');
    setChatOpen(true);
    setContactName('');
    setContactPhone('');
    setContactMsg('');
  };

  const triggerInAppCheckout = () => {
    addToCart({
      _id: 'prod-adivance',
      name: 'Adivance Capsule',
      price: 29.99,
      image: '/image/adivance-capsule.jpeg',
      category: 'Capsule'
    });
    setChatTab('checkout');
    setChatOpen(true);
  };

  return (
    <main className="bg-[#030906] min-h-screen text-gray-100 scroll-smooth font-sans relative overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] bg-yellow-500/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[50vw] h-[50vw] bg-emerald-600/5 rounded-full blur-[180px] pointer-events-none z-0"></div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <div className="grid md:grid-cols-12 gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="relative z-10 md:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 border border-emerald-500/25 bg-emerald-950/40 text-emerald-400 px-4.5 py-2 rounded-full text-[11px] font-extrabold tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.05)] backdrop-blur-md">
              <span className="animate-pulse">✨</span> Premium Wellness Elixir
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tight text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-sm">Adivance</span>
                <br />
                <span className="text-white">Capsule</span>
              </h1>

              <h2 className="text-2xl md:text-3xl text-emerald-300/95 font-extrabold tracking-wide">
                Reclaim Strength, Stamina, Power & Vitality
              </h2>
            </div>

            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl">
              Engineered using wild-harvested Himalayan Shilajit, pure KSM-66 Ashwagandha extract, Safed Musli, and Gokshura. A medical-grade Ayurvedic blend clinically optimized to enhance daily endurance, speed muscle recovery, and support marital wellbeing.
            </p>

            {/* Quick Benefits Badges */}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div className="flex items-center gap-3.5 bg-emerald-950/15 border border-emerald-900/20 hover:border-emerald-500/30 p-3.5 rounded-2xl transition-all duration-300">
                <span className="text-2xl">🌿</span>
                <span className="text-xs font-semibold text-emerald-200">100% Organic Actives</span>
              </div>
              <div className="flex items-center gap-3.5 bg-emerald-950/15 border border-emerald-900/20 hover:border-emerald-500/30 p-3.5 rounded-2xl transition-all duration-300">
                <span className="text-2xl">🏔️</span>
                <span className="text-xs font-semibold text-emerald-200">Purified Shilajit (98%)</span>
              </div>
              <div className="flex items-center gap-3.5 bg-emerald-950/15 border border-emerald-900/20 hover:border-emerald-500/30 p-3.5 rounded-2xl transition-all duration-300">
                <span className="text-2xl">🛡️</span>
                <span className="text-xs font-semibold text-emerald-200">GMP Laboratory Certified</span>
              </div>
              <div className="flex items-center gap-3.5 bg-emerald-950/15 border border-emerald-900/20 hover:border-emerald-500/30 p-3.5 rounded-2xl transition-all duration-300">
                <span className="text-2xl">⚡</span>
                <span className="text-xs font-semibold text-emerald-200">Zero Synthetic Fillers</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <button 
                onClick={triggerInAppCheckout}
                className="group relative bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-9 py-5 rounded-2xl font-black text-sm shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Order Adivance Capsule • $29.99
                <span className="block text-[10px] opacity-75 font-bold tracking-wider uppercase mt-0.5">Free Global Delivery Included</span>
              </button>
              <button 
                onClick={() => {
                  setChatTab('chat');
                  setChatOpen(true);
                }}
                className="group border border-emerald-800/80 bg-emerald-950/15 hover:bg-emerald-950/40 text-emerald-300 hover:text-white px-9 py-5 rounded-2xl text-sm font-extrabold hover:border-emerald-500 transition-all duration-300 text-center cursor-pointer flex flex-col justify-center items-center"
              >
                <span>Request Free Consultation</span>
                <span className="block text-[10px] text-emerald-500 group-hover:text-emerald-400 font-bold uppercase tracking-wider mt-0.5">100% Private & Anonymous</span>
              </button>
            </div>
          </div>

          {/* Right Product Image Column */}
          <div className="relative md:col-span-5 flex justify-center items-center z-10">
            {/* Ambient Background Aura */}
            <div className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-emerald-500/10 rounded-full blur-[100px] z-0"></div>
            
            <div className="relative z-10 transition-all duration-500 hover:scale-[1.03] group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-3xl blur opacity-20 group-hover:opacity-35 transition duration-500"></div>
              <img
                src="/image/adivance-capsule.jpeg"
                alt="Adivance Capsule Bottle"
                className="w-[340px] md:w-[420px] h-auto object-contain rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.6)] border border-emerald-800/20 bg-[#040e0a]"
              />
              <div className="absolute bottom-5 right-5 bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-4.5 py-2 rounded-2xl text-xs font-black tracking-widest shadow-md">
                📦 60 CAPSULES BOTTLE
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 md:py-32 relative z-10 border-t border-emerald-950/30 bg-[#020705]/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 px-3 py-1 rounded-full">Proven Therapeutic Support</span>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Optimize Performance & Stamina
            </h2>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              Carefully engineered to promote optimal hormone synthesis, speed up oxygen uptake, and combat systemic physical fatigue.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {BENEFITS.map((b, idx) => (
              <div 
                key={idx} 
                className="border border-emerald-900/20 bg-gradient-to-b from-[#05140e] to-[#030906] p-8 rounded-3xl transition-all duration-400 hover:-translate-y-2 hover:border-emerald-600/50 shadow-xl hover:shadow-[0_10px_30px_rgba(16,185,129,0.05)] group relative overflow-hidden"
              >
                <div className="absolute top-[-20%] right-[-20%] w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-950/70 border border-emerald-850 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform shadow-inner">
                  {b.icon}
                </div>
                <h3 className="font-extrabold text-xl text-white tracking-wide">{b.title}</h3>
                <p className="mt-4 text-sm text-gray-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Ingredients Section */}
      <section id="ingredients" className="py-24 md:py-32 relative z-10 border-t border-emerald-950/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 px-3 py-1 rounded-full">Pure Bio-Active Profile</span>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Standardized Botanical Concentrates
            </h2>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              We extract only the active therapeutic chemical structures of traditional herbs to guarantee consistent biological potency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {INGREDIENTS.map((ing, idx) => (
              <div 
                key={idx} 
                className="border border-emerald-900/15 bg-emerald-950/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col justify-between hover:border-emerald-600/30 transition-all duration-300 relative group"
              >
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-colors"></div>
                <div>
                  <div className="text-5xl mb-6">{ing.icon}</div>
                  <h3 className="font-extrabold text-xl text-white mb-2 tracking-wide">{ing.name}</h3>
                  <span className="inline-block text-[10px] text-yellow-400 font-extrabold uppercase tracking-widest bg-yellow-500/5 border border-yellow-500/20 px-2.5 py-0.5 rounded-md mb-4">{ing.purity}</span>
                  <p className="text-sm text-gray-400 leading-relaxed mt-2">{ing.description}</p>
                </div>
                <div className="mt-8 pt-5 border-t border-emerald-900/20 flex items-center gap-2 text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider">
                  <span>🛡️ Clinical Purity Assured</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Verified Reviews Section */}
      <section id="reviews" className="py-24 md:py-32 relative z-10 border-t border-emerald-950/30 bg-[#020705]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 px-3 py-1 rounded-full">Real Customer Experiences</span>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Verified Buyer Reviews
            </h2>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              Read transparent feedback from clients globally who have restored energy levels and gym endurance with Adivance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {REVIEWS.map((rev, idx) => (
              <div 
                key={idx} 
                className="border border-emerald-900/20 bg-gradient-to-b from-[#05110c]/80 to-[#030906] p-8 rounded-3xl shadow-2xl relative flex flex-col justify-between hover:border-emerald-600/20 transition-all duration-300"
              >
                <div>
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-xl ${i < rev.rating ? 'text-yellow-400' : 'text-gray-700'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-300 italic text-sm leading-relaxed font-medium">"{rev.comment}"</p>
                </div>
                
                <div className="mt-8 pt-5 border-t border-emerald-900/20 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-extrabold text-white text-sm tracking-wide">{rev.name}</h4>
                    <span className="text-emerald-400 font-semibold mt-0.5 block">{rev.location}</span>
                  </div>
                  <span className="text-gray-500 font-bold">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 md:py-32 relative z-10 border-t border-emerald-950/30">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          
          <div className="text-center mb-20 space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 px-3 py-1 rounded-full">Answering Queries</span>
            <h2 className="text-4xl md:text-6xl font-black text-white">
              Common Questions
            </h2>
          </div>

          <div className="space-y-5">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen ? 'border-emerald-600/40 bg-emerald-950/10' : 'border-emerald-900/20 bg-emerald-950/5 hover:border-emerald-900/40'
                  }`}
                >
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-6 py-6.5 flex justify-between items-center font-extrabold text-white text-base md:text-lg transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-xl font-black transition-transform duration-300 ${isOpen ? 'rotate-180 text-yellow-400' : 'text-emerald-400'}`}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-[250px] py-6 px-6 border-t border-emerald-900/10 opacity-100' : 'max-h-0 overflow-hidden opacity-0'
                    }`}
                  >
                    <p className="text-sm md:text-base text-gray-300 leading-relaxed font-medium">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 md:py-32 relative z-10 border-t border-emerald-950/30 bg-[#020705]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="grid md:grid-cols-2 gap-16 items-start">
            
            {/* Contact Details */}
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 px-3 py-1 rounded-full">Nexoveda Client Desk</span>
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                  Confidential Consultation
                </h2>
                <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                  Need clinical stamina recommendations or want to speak about chronic physical exhaustion privately? Submit details to match with a dedicated, anonymous advisor.
                </p>
              </div>

              <div className="space-y-5 pt-4">
                <div className="flex items-center gap-4.5 bg-emerald-950/10 border border-emerald-900/15 p-5 rounded-2xl">
                  <div className="w-14 h-14 rounded-xl bg-emerald-900/20 border border-emerald-800/40 flex items-center justify-center text-2xl shadow-inner">
                    📞
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Customer Support Phone</h4>
                    <p className="text-white font-black text-base mt-0.5">+1 555-0199</p>
                  </div>
                </div>

                <div className="flex items-center gap-4.5 bg-emerald-950/10 border border-emerald-900/15 p-5 rounded-2xl">
                  <div className="w-14 h-14 rounded-xl bg-emerald-900/20 border border-emerald-800/40 flex items-center justify-center text-2xl shadow-inner">
                    🛒
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Direct Dispatch Hub</h4>
                    <p onClick={triggerInAppCheckout} className="text-yellow-400 font-black text-base mt-0.5 hover:underline cursor-pointer">Order Adivance Instantly ➔</p>
                  </div>
                </div>

                <div className="flex items-center gap-4.5 bg-emerald-950/10 border border-emerald-900/15 p-5 rounded-2xl">
                  <div className="w-14 h-14 rounded-xl bg-emerald-900/20 border border-emerald-800/40 flex items-center justify-center text-2xl shadow-inner">
                    ✉️
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Corporate Email Desk</h4>
                    <p className="text-white font-black text-base mt-0.5">support@nexoveda.com</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 text-xs text-gray-500 font-bold border-t border-emerald-900/10">
                🏢 Nexoveda Wellness Global Ltd. London, United Kingdom.
              </div>
            </div>

            {/* Quick Consultation Request Form */}
            <div className="border border-emerald-800/30 bg-gradient-to-b from-[#05110c]/90 to-[#030906] p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
              
              <h3 className="font-black text-2xl text-white mb-8 tracking-wide">Request Callback / Consult</h3>
              
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-emerald-400 tracking-widest mb-2">Your Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={contactName} 
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. John Doe" 
                    className="w-full bg-[#030907]/90 border border-emerald-900/55 focus:border-yellow-400 rounded-xl px-4.5 py-4 text-xs outline-none text-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-emerald-400 tracking-widest mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    value={contactPhone} 
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +1 555-0199" 
                    className="w-full bg-[#030907]/90 border border-emerald-900/55 focus:border-yellow-400 rounded-xl px-4.5 py-4 text-xs outline-none text-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-emerald-400 tracking-widest mb-2">Your Health Query / Symptoms</label>
                  <textarea 
                    rows={4} 
                    value={contactMsg} 
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Describe how we can support you (anonymity fully protected)..." 
                    className="w-full bg-[#030907]/90 border border-emerald-900/55 focus:border-yellow-400 rounded-xl px-4.5 py-4 text-xs outline-none text-white transition-all resize-none font-medium"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black py-4.5 rounded-2xl font-black text-sm shadow-[0_4px_20px_rgba(245,158,11,0.15)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer uppercase tracking-wider"
                >
                  Start Live Consultation Chat 💬
                </button>
              </form>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-950/40 bg-[#010302] py-12 text-center text-xs text-gray-500 font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="tracking-wide">&copy; 2026 Nexoveda Wellness Global. All Rights Reserved.</p>
          <div className="flex flex-wrap justify-center gap-5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
            <span className="hover:text-yellow-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-emerald-900">•</span>
            <span className="hover:text-yellow-400 cursor-pointer transition-colors">Terms of Service</span>
            <span className="text-emerald-900">•</span>
            <span className="hover:text-yellow-400 cursor-pointer transition-colors">Delivery Policies</span>
          </div>
        </div>
      </footer>

    </main>
  );
}