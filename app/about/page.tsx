'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import { useChat } from '../providers';

export default function AboutPage() {
  const { setChatOpen, setChatTab } = useChat();

  return (
    <main className="bg-[#050e0a] min-h-screen text-gray-100 font-sans selection:bg-yellow-500 selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-16 text-center border-b border-emerald-950/20">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 border border-emerald-800/80 bg-emerald-950/50 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
            <span>🌿</span> Ancient Wisdom Meets Modern Care
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
            About <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">Nexoveda</span>
          </h1>
          <p className="text-emerald-300 text-lg md:text-xl font-medium tracking-wide">
            Your Trusted Holistic Partner for Couple & Individual Wellness
          </p>
        </div>
      </section>

      {/* About Us & Mission section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="border-l-4 border-yellow-500 pl-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-yellow-400">Who We Are</h2>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-1">About Us</h3>
          </div>
          <p className="text-gray-300 leading-relaxed text-sm md:text-base">
            Nexoveda is a holistic wellness platform dedicated to supporting the physical, emotional, and relational health of married couples and individuals. We combine the ancient wisdom of Ayurveda with modern counselling practices to create a comprehensive approach to wellbeing—addressing not just the body, but also the mind, emotions, and intimate relationships.
          </p>
        </div>

        <div className="bg-[#04110c] border border-emerald-900/30 p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-800 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <span className="text-3xl">🎯</span>
          <h3 className="text-xl font-bold text-white mt-4">Our Mission</h3>
          <p className="text-gray-400 mt-3 text-sm leading-relaxed">
            We believe that true wellness encompasses physical vitality, mental clarity, emotional balance, and fulfilling relationships. Our mission is to empower couples and individuals to achieve optimal health through natural, evidence-based solutions and compassionate, professional guidance.
          </p>
        </div>
      </section>

      {/* What We Offer: Premium Products */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-emerald-950/20">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400">Our Offerings</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Premium Herbal & Ayurvedic Products</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            We source and curate authentic herbal products designed to support your wellness journey across three dedicated ranges.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Range 1 */}
          <div className="bg-[#04110c]/40 border border-emerald-900/20 p-8 rounded-3xl space-y-4 hover:border-emerald-800 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-900/30 flex items-center justify-center text-xl">🧘‍♂️</div>
            <h3 className="text-lg font-bold text-white">General Wellness</h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✔</span> Natural supplements for immunity, energy, and overall vitality
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✔</span> Formulations to support healthy digestion and metabolism
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✔</span> Products for quality sleep, stress relief, and mental clarity
              </li>
            </ul>
          </div>

          {/* Range 2 */}
          <div className="bg-[#04110c]/40 border border-emerald-900/20 p-8 rounded-3xl space-y-4 hover:border-emerald-800 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-900/30 flex items-center justify-center text-xl">💑</div>
            <h3 className="text-lg font-bold text-white">Intimate Wellness</h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✔</span> Ayurvedic preparations to enhance personal vitality
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✔</span> Natural solutions for intimate confidence and performance
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✔</span> Products supporting hormonal balance and vitality
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✔</span> Formulations crafted with proven traditional ingredients
              </li>
            </ul>
          </div>

          {/* Range 3 */}
          <div className="bg-[#04110c]/40 border border-emerald-900/20 p-8 rounded-3xl space-y-4 hover:border-emerald-800 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-900/30 flex items-center justify-center text-xl">🌿</div>
            <h3 className="text-lg font-bold text-white">Ayurvedic Range</h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✔</span> Products aligned with individual constitution (Prakriti)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✔</span> Seasonal wellness solutions and herbal elixirs
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✔</span> Support for various health concerns through Ayurvedic principles
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Free Professional Counselling Services */}
      <section className="bg-gradient-to-b from-[#050e0a] to-[#020604] border-t border-emerald-950/20 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="border-l-4 border-yellow-500 pl-4">
                <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400">Professional Services</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">Free Professional Counselling Services</h2>
              </div>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Understanding that wellness extends beyond the physical, we offer expert counselling services specifically designed for couples and married individuals.
              </p>
              <div className="bg-emerald-950/30 border border-emerald-800/40 p-6 rounded-2xl space-y-2">
                <h4 className="text-sm font-extrabold text-yellow-400">Wellness Should Be Accessible</h4>
                <p className="text-xs text-gray-300 leading-normal">
                  At Nexoveda, we provide ongoing counselling services at no cost because we believe financial barriers should never prevent you from getting the help you need. Sessions can be conducted completely anonymously.
                </p>
              </div>
              <button 
                onClick={() => { setChatTab('chat'); setChatOpen(true); }}
                className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold text-xs shadow-lg hover:bg-yellow-400 transition-all cursor-pointer"
              >
                Talk to a Consultant Free
              </button>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-3 gap-6">
              {/* Category 1 */}
              <div className="bg-[#04110c] border border-emerald-900/30 p-6 rounded-2xl space-y-3">
                <span className="text-2xl">💍</span>
                <h4 className="text-sm font-bold text-white">Marriage & Relationship</h4>
                <ul className="text-[10px] text-gray-400 space-y-2 leading-tight">
                  <li>• Conflict resolution</li>
                  <li>• Rebuilding trust</li>
                  <li>• Emotional intimacy</li>
                  <li>• Relationship foundation</li>
                </ul>
              </div>

              {/* Category 2 */}
              <div className="bg-[#04110c] border border-emerald-900/30 p-6 rounded-2xl space-y-3">
                <span className="text-2xl">🤫</span>
                <h4 className="text-sm font-bold text-white">Intimate Wellness</h4>
                <ul className="text-[10px] text-gray-400 space-y-2 leading-tight">
                  <li>• Intimacy guidance</li>
                  <li>• Relationship bonding</li>
                  <li>• Safe, judgment-free</li>
                  <li>• Tailored solutions</li>
                </ul>
              </div>

              {/* Category 3 */}
              <div className="bg-[#04110c] border border-emerald-900/30 p-6 rounded-2xl space-y-3">
                <span className="text-2xl">🧠</span>
                <h4 className="text-sm font-bold text-white">Mental Health Support</h4>
                <ul className="text-[10px] text-gray-400 space-y-2 leading-tight">
                  <li>• Anxiety & stress</li>
                  <li>• Emotional resilience</li>
                  <li>• Work-life balance</li>
                  <li>• Coping strategies</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Why Choose Nexoveda Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-emerald-950/20">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400">Our Strengths</span>
          <h2 className="text-3xl font-extrabold text-white">Why Choose Nexoveda?</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-[#04110c]/30 border border-emerald-900/10 p-6 rounded-2xl hover:border-emerald-800 transition-all duration-300">
            <span className="text-emerald-400 font-bold text-xs uppercase block mb-1">✓ Free Services</span>
            <h4 className="text-sm font-bold text-white mb-2">Free Counselling</h4>
            <p className="text-[11px] text-gray-400 leading-normal">
              All counselling is completely free and ongoing. Professional support is accessible to everyone.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#04110c]/30 border border-emerald-900/10 p-6 rounded-2xl hover:border-emerald-800 transition-all duration-300">
            <span className="text-emerald-400 font-bold text-xs uppercase block mb-1">✓ Anonymity</span>
            <h4 className="text-sm font-bold text-white mb-2">Complete Anonymity</h4>
            <p className="text-[11px] text-gray-400 leading-normal">
              Discuss concerns anonymously without revealing your identity. Privacy is our top priority.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#04110c]/30 border border-emerald-900/10 p-6 rounded-2xl hover:border-emerald-800 transition-all duration-300">
            <span className="text-emerald-400 font-bold text-xs uppercase block mb-1">✓ Holistic</span>
            <h4 className="text-sm font-bold text-white mb-2">Holistic Approach</h4>
            <p className="text-[11px] text-gray-400 leading-normal">
              We address wellness across physical, emotional, relational, and spiritual dimensions.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#04110c]/30 border border-emerald-900/10 p-6 rounded-2xl hover:border-emerald-800 transition-all duration-300">
            <span className="text-emerald-400 font-bold text-xs uppercase block mb-1">✓ Authentic</span>
            <h4 className="text-sm font-bold text-white mb-2">Authentic Ayurveda</h4>
            <p className="text-[11px] text-gray-400 leading-normal">
              All products are rooted in traditional Ayurvedic principles with quality laboratory assurance.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#04110c]/30 border border-emerald-900/10 p-6 rounded-2xl hover:border-emerald-800 transition-all duration-300">
            <span className="text-emerald-400 font-bold text-xs uppercase block mb-1">✓ Experts</span>
            <h4 className="text-sm font-bold text-white mb-2">Professional Expertise</h4>
            <p className="text-[11px] text-gray-400 leading-normal">
              Our counsellors are trained, certified, and experienced in couples and individual support.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#04110c]/30 border border-emerald-900/10 p-6 rounded-2xl hover:border-emerald-800 transition-all duration-300">
            <span className="text-emerald-400 font-bold text-xs uppercase block mb-1">✓ Discretion</span>
            <h4 className="text-sm font-bold text-white mb-2">Privacy & Discretion</h4>
            <p className="text-[11px] text-gray-400 leading-normal">
              Maintain strict confidentiality. Complete peace of mind during sensitive sessions.
            </p>
          </div>

          {/* Card 7 */}
          <div className="bg-[#04110c]/30 border border-emerald-900/10 p-6 rounded-2xl hover:border-emerald-800 transition-all duration-300">
            <span className="text-emerald-400 font-bold text-xs uppercase block mb-1">✓ Couples</span>
            <h4 className="text-sm font-bold text-white mb-2">Couple-Centric</h4>
            <p className="text-[11px] text-gray-400 leading-normal">
              Services specifically designed for married couples seeking to strengthen their bond.
            </p>
          </div>

          {/* Card 8 */}
          <div className="bg-[#04110c]/30 border border-emerald-900/10 p-6 rounded-2xl hover:border-emerald-800 transition-all duration-300">
            <span className="text-emerald-400 font-bold text-xs uppercase block mb-1">✓ Integrated</span>
            <h4 className="text-sm font-bold text-white mb-2">Integrated Solutions</h4>
            <p className="text-[11px] text-gray-400 leading-normal">
              Combine natural botanical products with professional guidance for comprehensive results.
            </p>
          </div>
        </div>
      </section>

      {/* Our Approach & Our Commitment */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-emerald-950/20 grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Our Approach</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            We understand that seeking support—whether for physical wellness or relationship challenges—is a sign of strength, not weakness. Nexoveda provides a safe, judgment-free space where couples and individuals can access:
          </p>
          <ul className="space-y-2 text-xs text-emerald-300 font-medium">
            <li>🍀 <strong>Natural Solutions</strong> that work with your body, not against it</li>
            <li>🎓 <strong>Expert Guidance</strong> from trained professionals</li>
            <li>💖 <strong>Personalized Care</strong> tailored to your unique needs</li>
            <li>🔒 <strong>Confidential Support</strong> you can trust completely</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Our Commitment</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Nexoveda is committed to supporting your long-term wellness journey:
          </p>
          <ul className="space-y-2 text-xs text-emerald-300 font-medium">
            <li>🌱 Providing authentic, high-quality botanical formulations</li>
            <li>💬 Delivering professional, empathetic, and free counselling</li>
            <li>🔒 Respecting your absolute privacy and personal journey</li>
            <li>🤝 Supporting sustainable wellness and healthy, happy relationships</li>
            <li>🔮 Combining traditional wisdom with modern clinical understandings</li>
          </ul>
        </div>
      </section>

      {/* Connect With Us */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-emerald-950/20 text-center space-y-6">
        <h3 className="text-2xl font-extrabold text-white">Connect With Us</h3>
        <p className="text-gray-300 text-sm max-w-2xl mx-auto leading-relaxed">
          Whether you're looking to enhance your wellness, strengthen your relationship, or seek professional guidance, Nexoveda is here for you. We invite you to explore our products and services with the knowledge that you're taking an important step toward a healthier, happier life—individually and as a couple.
        </p>
        <p className="text-yellow-400 font-extrabold text-sm tracking-wide">
          Your wellness journey begins here.
        </p>
        <div className="pt-4">
          <button 
            onClick={() => { setChatTab('chat'); setChatOpen(true); }}
            className="bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-sm shadow-xl hover:bg-yellow-400 transition-all cursor-pointer"
          >
            Start Free Online Consultation 💬
          </button>
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
