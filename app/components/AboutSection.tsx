import React from 'react';
import ScrollReveal from './ScrollReveal';

export default function AboutSection() {
  return (
    <ScrollReveal>
      <section className="py-24 relative z-10 border-t border-emerald-950/30 bg-[#030906] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 px-3 py-1 rounded-full">About The Company</span>
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 tracking-tight leading-tight">
              Information About Nexoveda
            </h2>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto pt-4">
              Nexoveda is a holistic wellness platform dedicated to supporting the physical, emotional, and relational health of married couples and individuals. We combine the ancient wisdom of Ayurveda with modern counselling practices to create a comprehensive approach to wellbeing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 text-emerald-50/90 leading-relaxed text-base">
            
            {/* Left Column */}
            <div className="space-y-10">
              <div className="bg-emerald-950/20 border border-emerald-900/30 p-8 rounded-3xl">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-3">
                  <span className="text-3xl">🎯</span> Our Mission
                </h3>
                <p>
                  We believe that true wellness encompasses physical vitality, mental clarity, emotional balance, and fulfilling relationships. Our mission is to empower couples and individuals to achieve optimal health through natural, evidence-based solutions and compassionate, professional guidance.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
                  <span className="text-3xl">🌿</span> What We Offer
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-emerald-300 mb-2">Premium Herbal & Ayurvedic Products</h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-300">
                      <li>Natural supplements for immunity, energy, and overall vitality.</li>
                      <li>Intimate wellness formulations to enhance personal vitality and confidence.</li>
                      <li>Products aligned with individual constitution (Prakriti).</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-10">
              <div className="bg-gradient-to-br from-emerald-950/40 to-[#020604] border border-emerald-800/40 p-8 rounded-3xl relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>
                
                <h3 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-3 relative z-10">
                  <span className="text-3xl">💬</span> Free Professional Counselling
                </h3>
                <p className="text-sm mb-5 relative z-10">
                  Understanding that wellness extends beyond the physical, we offer expert counselling services specifically designed for couples and married individuals.
                </p>
                <div className="bg-emerald-900/40 border border-emerald-800/50 p-4 rounded-xl mb-5 relative z-10">
                  <p className="font-bold text-yellow-300 text-sm">
                    We Believe Wellness Should Be Accessible — That&apos;s Why Our Counselling Services Are Completely Free & Anonymous.
                  </p>
                </div>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-300 relative z-10">
                  <li>Marriage & Relationship Counselling.</li>
                  <li>Intimate Wellness & Personal Guidance.</li>
                  <li>Mental Health Support (Stress, Anxiety, Life Challenges).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
                  <span className="text-3xl">⭐</span> Why Choose Us?
                </h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex gap-3"><span className="text-emerald-400 font-bold">✓</span> <div><strong>Free & Ongoing Support:</strong> Professional help accessible to everyone.</div></li>
                  <li className="flex gap-3"><span className="text-emerald-400 font-bold">✓</span> <div><strong>100% Anonymity:</strong> Discuss concerns safely without revealing identity.</div></li>
                  <li className="flex gap-3"><span className="text-emerald-400 font-bold">✓</span> <div><strong>Holistic Approach:</strong> Multi-dimensional wellness: physical, emotional, and spiritual.</div></li>
                </ul>
              </div>
            </div>

          </div>

        </div>
      </section>
    </ScrollReveal>
  );
}
