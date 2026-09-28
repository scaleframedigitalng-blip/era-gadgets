import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Tag, Sparkles } from 'lucide-react';

export const DealsPage: React.FC = () => {
  const { products } = useStore();
  const [selectedCat, setSelectedCat] = useState('all');

  // Filter deals
  const deals = products.filter(
    (p) => (p.compareAtPrice && p.compareAtPrice > p.basePrice) || p.badge === 'Sale'
  );

  const filteredDeals = selectedCat === 'all'
    ? deals
    : deals.filter((d) => d.category.toLowerCase() === selectedCat.toLowerCase());

  return (
    <div className="pt-24 sm:pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="pb-8 border-b border-neutral-100 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            <Tag className="w-3.5 h-3.5 text-neutral-900" />
            <span>Limited Inventory Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">
            Exclusive Deals & Offers
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Carefully verified iPhones, MacBooks, and gadgets at limited-time promotional rates.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'iPhone', 'Mac', 'Samsung', 'Accessories'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize whitespace-nowrap transition-colors ${
                selectedCat === cat
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat === 'all' ? 'All Promotions' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-8">
        {filteredDeals.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredDeals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-2xl border border-neutral-100 space-y-3">
            <Sparkles className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="text-base font-semibold text-neutral-900">All promotional batches sold out</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Check back shortly as new shipments and promotional allocations arrive every week.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
