'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useCart } from '../providers';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  discountPercent: number;
  ingredients: string[];
}

export default function ShopPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [minRating, setMinRating] = useState<number>(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        const cats: string[] = Array.from(new Set(data.map((p: Product) => p.category)));
        setCategories(cats);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  }, []);

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase()) ||
                          p.ingredients.some(i => i.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    const discountedPrice = p.price * (1 - (p.discountPercent || 0) / 100);
    const matchesPrice = discountedPrice <= maxPrice;
    
    const matchesRating = p.rating >= minRating;

    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setCartFeedback(product.name);
    setTimeout(() => {
      setCartFeedback(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-emerald-950/40 to-[#050e0a] border-b border-emerald-900/20 py-12 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-700/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 z-10 relative">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Natural Health <span className="text-yellow-400">Catalog</span>
          </h1>
          <p className="text-emerald-300 mt-3 text-base md:text-lg">
            Standardized herbal formulas with verified quality, shipped directly to you across India.
          </p>
        </div>
      </section>

      {/* Cart Feedback Toast */}
      {cartFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-yellow-500 text-black px-6 py-3.5 rounded-xl font-bold shadow-xl flex items-center gap-2 animate-bounce">
          <span>🛒</span>
          <span>Added {cartFeedback} to cart!</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filters */}
          <aside className="lg:col-span-1 bg-emerald-950/15 border border-emerald-900/30 rounded-3xl p-6 h-fit backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-6 border-b border-emerald-900/30 pb-3 flex items-center gap-2">
              <span>🔍</span> Filter Products
            </h3>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                Search Catalog
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Shilajit, Tea, etc..."
                className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-2.5 text-sm focus:border-yellow-500 focus:outline-none transition-colors text-white"
              />
            </div>

            {/* Category selection */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                Category
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-yellow-500 text-black font-bold'
                      : 'bg-[#050e0a]/50 text-gray-300 hover:bg-emerald-950/50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-yellow-500 text-black font-bold'
                        : 'bg-[#050e0a]/50 text-gray-300 hover:bg-emerald-950/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                <span>Max Price</span>
                <span className="text-yellow-400">${maxPrice.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-yellow-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>$0.00</span>
                <span>$100.00</span>
              </div>
            </div>

            {/* Ratings Filter */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                Minimum Rating
              </label>
              <div className="flex gap-2">
                {[0, 4, 4.5, 4.8].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      minRating === rating
                        ? 'bg-yellow-500 text-black border-yellow-500'
                        : 'bg-[#050e0a]/50 text-gray-300 border-emerald-900/40 hover:bg-emerald-950/50'
                    }`}
                  >
                    {rating === 0 ? 'All' : `${rating}⭐`}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* Right Product Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                <p className="text-emerald-400 font-medium text-sm">Loading wellness catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-3xl p-16 text-center">
                <span className="text-4xl mb-4 block">🍃</span>
                <h3 className="text-xl font-bold text-white mb-2">No Products Match Your Criteria</h3>
                <p className="text-gray-400 max-w-md mx-auto text-sm">
                  Try adjusting your search terms, changing the category, or expanding your price slider.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const finalPrice = product.price * (1 - (product.discountPercent || 0) / 100);
                  return (
                    <div 
                      key={product._id} 
                      className="bg-emerald-950/10 border border-emerald-900/30 rounded-3xl overflow-hidden hover:border-emerald-800 transition-all flex flex-col group shadow-lg"
                    >
                      {/* Image Block */}
                      <div className="relative h-48 bg-[#050e0a] overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.discountPercent > 0 && (
                          <span className="absolute top-4 left-4 bg-yellow-500 text-black text-xs font-extrabold px-2.5 py-1 rounded-lg">
                            {product.discountPercent}% OFF
                          </span>
                        )}
                        <span className="absolute bottom-4 right-4 bg-[#050e0a]/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold text-emerald-400 tracking-wider border border-emerald-900/30">
                          {product.category}
                        </span>
                      </div>

                      {/* Content Block */}
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-yellow-400">
                            <span>⭐</span>
                            <span>{product.rating.toFixed(1)}</span>
                            <span className="text-gray-400 font-normal">({product.reviewCount} reviews)</span>
                          </div>

                          <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                            <Link href={`/product/${product._id}`}>
                              {product.name}
                            </Link>
                          </h3>

                          <p className="text-gray-400 mt-2 text-xs leading-relaxed line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        {/* Price & Buy Action */}
                        <div className="mt-6 pt-4 border-t border-emerald-900/20 flex items-center justify-between">
                          <div>
                            {product.discountPercent > 0 ? (
                              <div>
                                <span className="text-lg font-extrabold text-white">${finalPrice.toFixed(2)}</span>
                                <span className="text-xs text-gray-500 line-through block">${product.price.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="text-lg font-extrabold text-white">${product.price.toFixed(2)}</span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Link 
                              href={`/product/${product._id}`}
                              className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 p-2.5 rounded-xl border border-emerald-900/40 text-xs font-semibold transition-colors"
                              title="View details"
                            >
                              👁️
                            </Link>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                            >
                              Add 🛒
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-emerald-950/20 border-t border-emerald-900/30 py-8 text-center text-xs text-emerald-600 mt-12">
        © 2026 Nexoveda India. Standardized Natural Formulations. All rights reserved.
      </footer>
    </div>
  );
}
