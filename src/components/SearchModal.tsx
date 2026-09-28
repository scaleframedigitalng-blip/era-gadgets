import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, X, ArrowRight, Tag, Image as ImageIcon } from 'lucide-react';
import { formatNaira } from '../lib/utils';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products, openProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchTerm('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = searchTerm.trim()
    ? products.filter((p) => {
        const q = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.variants.some((v) => v.storage?.toLowerCase().includes(q) || v.sku?.toLowerCase().includes(q))
        );
      })
    : [];

  const popularSearches = [
    'iPhone 17 Pro',
    'MacBook Pro M4',
    'Galaxy S25 Ultra',
    'AirPods Max',
    'Apple Watch Ultra',
    'UK Used'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/40 backdrop-blur-md transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative min-h-screen px-4 pt-16 pb-20 flex justify-center">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200/80 my-auto">
          {/* Search Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center gap-3">
            <Search className="w-5 h-5 text-neutral-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search iPhones, MacBooks, Samsung, accessories..."
              className="w-full text-base sm:text-lg text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="px-2.5 py-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 bg-neutral-100 rounded-md"
            >
              ESC
            </button>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
            {searchTerm.trim() ? (
              filteredProducts.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Products ({filteredProducts.length})
                  </p>
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        openProduct(product.slug);
                      }}
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors border border-transparent hover:border-neutral-100"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-lg bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <span>{product.brand}</span>
                            <span>·</span>
                            <span>{product.category}</span>
                            <span>·</span>
                            <span className="font-medium text-neutral-700">{product.condition}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-black">
                            {product.name}
                          </h4>
                          <p className="text-xs font-medium text-neutral-600 tabular-nums mt-0.5">
                            From {formatNaira(product.basePrice)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[11px] font-medium ${
                            product.isSold ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {product.isSold ? 'Sold Out' : 'Available'}
                        </span>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 group-hover:text-neutral-900 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-neutral-900">No gadgets match "{searchTerm}"</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Try searching for another device model, storage, or brand name.
                  </p>
                </div>
              )
            ) : (
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchTerm(term)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
                    >
                      <Tag className="w-3 h-3 text-neutral-400" />
                      {term}
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                    Featured Collections
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['iPhone', 'Samsung', 'Mac', 'AirPods', 'Laptops', 'Apple Watch'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSearchTerm(cat);
                        }}
                        className="p-3 text-left rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors text-xs font-medium text-neutral-800"
                      >
                        {cat} Store
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
