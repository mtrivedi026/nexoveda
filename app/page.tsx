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
    a: 'Standard delivery is free on orders above $50.00 and takes 3-5 business days. We also offer express courier delivery to major regions within 24-48 hours.'
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
  const [formSubmitted, setFormSubmitted] = useState(false);

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
    <main className="bg-[#050e0a] min-h-screen text-gray-100 scroll-smooth font-sans">
      


      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-b border-emerald-950/20">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 border border-emerald-800/80 bg-emerald-950/50 text-emerald-400 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold tracking-wider uppercase">
              <span>🌟</span> Premium Wellness Formula
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-none tracking-tight text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">Adivance</span>
              <br />
              Capsule
            </h1>

            <h2 className="text-xl md:text-2xl text-emerald-300 mt-5 font-semibold tracking-wide">
              Restore Strength, Stamina, Power & Recovery
            </h2>

            <p className="text-gray-300 mt-6 text-base md:text-lg leading-relaxed max-w-xl">
              Crafted exclusively with standardized Himalayan Shilajit, KSM-66 Ashwagandha, Safed Musli, and Gokshura. Formulated to optimize daily performance, physical vitality, and speed muscle recovery.
            </p>

            {/* Quick Badges */}
            <div className="grid grid-cols-2 gap-3 mt-8 max-w-md">
              <div className="flex items-center gap-2.5 bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl">
                <span className="text-xl">🌿</span>
                <span className="text-xs font-medium text-emerald-100">100% Herbal Extracts</span>
              </div>
              <div className="flex items-center gap-2.5 bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl">
                <span className="text-xl">🏔️</span>
                <span className="text-xs font-medium text-emerald-100">Purified Shilajit</span>
              </div>
              <div className="flex items-center gap-2.5 bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl">
                <span className="text-xl">🛡️</span>
                <span className="text-xs font-medium text-emerald-100">GMP Lab Certified</span>
              </div>
              <div className="flex items-center gap-2.5 bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl">
                <span className="text-xl">⚡</span>
                <span className="text-xs font-medium text-emerald-100">Zero Side Effects</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mt-10">
              <button 
                onClick={triggerInAppCheckout}
                className="bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-yellow-500/10 hover:bg-yellow-400 hover:shadow-yellow-400/20 transition-all cursor-pointer"
              >
                Order Adivance Capsule - $29.99
              </button>
              <button 
                onClick={() => {
                  setChatTab('chat');
                  setChatOpen(true);
                }}
                className="border border-emerald-800/80 bg-emerald-950/20 text-emerald-300 hover:text-white px-8 py-4 rounded-xl text-base font-semibold hover:border-emerald-700 hover:bg-emerald-950/50 transition-all text-center cursor-pointer"
              >
                Request Consultation
              </button>
            </div>
          </div>

          {/* Right Product Image Column */}
          <div className="relative flex justify-center items-center">
            {/* Ambient Background Aura */}
            <div className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-emerald-500/10 rounded-full blur-[100px] z-0"></div>
            
            <div className="relative z-10 transition-transform duration-500 hover:scale-102">
              <img
                src="/image/adivance-capsule.jpeg"
                alt="Adivance Capsule Bottle"
                className="w-[380px] md:w-[480px] h-auto object-contain rounded-3xl shadow-2xl border border-emerald-900/10 bg-[#040c08]"
              />
              <span className="absolute bottom-4 right-4 bg-yellow-500 text-black px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wider shadow-md">
                60 CAPSULES BOTTLE
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-[#030907]/90 py-20 md:py-28 border-b border-emerald-950/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400">Proven Health Results</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3 leading-tight">
              Why Choose Adivance Capsule?
            </h2>
            <p className="text-gray-400 mt-4 text-base">
              Specifically formulated with standardized natural extracts to target physical stress, support muscle development, and boost daily productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {BENEFITS.map((b, idx) => (
              <div 
                key={idx} 
                className="border border-emerald-900/30 bg-gradient-to-b from-[#06140f] to-[#040e0a] p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:border-emerald-800/60 shadow-lg hover:shadow-emerald-950/30 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-850 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  {b.icon}
                </div>
                <h3 className="font-bold text-xl text-white tracking-wide">{b.title}</h3>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Ingredients Section */}
      <section id="ingredients" className="py-20 md:py-28 border-b border-emerald-950/20 relative">
        <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400">Pure Botanical Ingredients</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3 leading-tight">
              100% Standardized Botanical Actives
            </h2>
            <p className="text-gray-400 mt-4 text-base">
              We extract only the active chemical profiles of traditional herbs to guarantee therapeutic dosage safety and consistent performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {INGREDIENTS.map((ing, idx) => (
              <div 
                key={idx} 
                className="border border-emerald-900/20 bg-emerald-950/10 p-6 rounded-2xl backdrop-blur-sm shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl mb-4">{ing.icon}</div>
                  <h3 className="font-bold text-lg text-white mb-2">{ing.name}</h3>
                  <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mb-3">{ing.purity}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{ing.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-emerald-900/30 flex items-center gap-2">
                  <span className="text-emerald-400 text-xs">✓ Clinical Purity Verified</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="bg-[#030907]/90 py-20 md:py-28 border-b border-emerald-950/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400">Customer Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3 leading-tight">
              Verified Buyer Reviews
            </h2>
            <p className="text-gray-400 mt-4 text-base">
              See how Adivance Capsule has transformed the energy and recovery levels of our customers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((rev, idx) => (
              <div 
                key={idx} 
                className="border border-emerald-900/30 bg-[#05110c]/85 p-8 rounded-2xl shadow-lg relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-lg ${i < rev.rating ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-300 italic text-sm leading-relaxed">"{rev.comment}"</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-emerald-900/30 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-white text-sm">{rev.name}</h4>
                    <span className="text-emerald-500 font-medium">{rev.location}</span>
                  </div>
                  <span className="text-gray-500">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-28 border-b border-emerald-950/20 relative">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          
          <div className="text-center mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400">Got Questions?</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-emerald-900/30 rounded-xl bg-emerald-950/10 overflow-hidden transition-all duration-350"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center font-bold text-white md:text-lg hover:bg-emerald-950/20 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-xl text-emerald-400">{activeFaq === idx ? '−' : '+'}</span>
                </button>
                
                <div 
                  className={`transition-all duration-300 ${activeFaq === idx ? 'max-h-40 py-5 px-6 border-t border-emerald-900/20 opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}
                >
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-[#030907]/90 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
            
            {/* Contact Details */}
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400">Nexoveda Helpdesk</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3 leading-tight">
                Get In Touch With Our Health Experts
              </h2>
              <p className="text-gray-400 mt-4 leading-relaxed">
                Have specific medical symptoms or need stamina guidance? Fill out the form to request a confidential advisor consultation, or reach us instantly via WhatsApp.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-900/50 flex items-center justify-center text-xl">
                    📞
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">Phone Support</h4>
                    <p className="text-white font-medium">+1 555-0199</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-900/50 flex items-center justify-center text-xl">
                    🛒
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">Direct Order Desk</h4>
                    <p onClick={triggerInAppCheckout} className="text-yellow-400 font-bold hover:underline cursor-pointer">Click here to Order Instantly</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-900/50 flex items-center justify-center text-xl">
                    ✉️
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">Email Queries</h4>
                    <p className="text-white font-medium">support@nexoveda.com</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-emerald-900/30 mt-10 pt-6">
                <p className="text-xs text-gray-500">
                  Nexoveda Wellness Global Ltd. London, UK.
                </p>
              </div>
            </div>

            {/* Quick Consultation Request Form */}
            <div className="border border-emerald-900/30 bg-[#05110c]/70 p-8 md:p-10 rounded-3xl shadow-xl backdrop-blur-sm">
              <h3 className="font-bold text-2xl text-white mb-6">Request Callback / Consult</h3>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-emerald-400 tracking-wider mb-1.5">Your Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={contactName} 
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter name" 
                    className="w-full bg-[#030907] border border-emerald-900/40 rounded-xl px-4 py-3 text-sm focus:border-emerald-600 outline-none text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-emerald-400 tracking-wider mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    value={contactPhone} 
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +1 555-0199" 
                    className="w-full bg-[#030907] border border-emerald-900/40 rounded-xl px-4 py-3 text-sm focus:border-emerald-600 outline-none text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-emerald-400 tracking-wider mb-1.5">Your Symptom / Health Query</label>
                  <textarea 
                    rows={3} 
                    value={contactMsg} 
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Describe how we can support you..." 
                    className="w-full bg-[#030907] border border-emerald-900/40 rounded-xl px-4 py-3 text-sm focus:border-emerald-600 outline-none text-white transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold text-base shadow-lg shadow-yellow-500/10 hover:bg-yellow-400 hover:shadow-yellow-400/20 active:scale-98 transition-all cursor-pointer"
                >
                  Start Live Consultation Chat 💬
                </button>
              </form>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-950/30 bg-[#020604] py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; 2026 Nexoveda Wellness Global. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Delivery Policies</span>
          </div>
        </div>
      </footer>

    </main>
  );
}