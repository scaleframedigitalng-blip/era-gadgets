import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Filter, X, SlidersHorizontal, ArrowUpDown, RotateCcw } from 'lucide-react';
import { formatNaira } from '../lib/utils';

export const ShopPage: React.FC = () => {
  const { products, currentCategoryFilter, setCurrentCategoryFilter } = useStore();

  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedStorage, setSelectedStorage] = useState('all');
  const [selectedPricePreset, setSelectedPricePreset] = useState('all');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'iPhone', label: 'iPhones' },
    { id: 'Samsung', label: 'Samsung' },
    { id: 'Mac', label: 'Mac' },
    { id: 'iPad', label: 'iPads' },
    { id: 'Apple Watch', label: 'Apple Watch' },
    { id: 'Accessories', label: 'AirPods & Accessories' },
    { id: 'Laptops', label: 'Windows Laptops' }
  ];

  const brands = ['all', 'Apple', 'Samsung', 'Dell', 'HP', 'Lenovo'];
  const conditions = ['all', 'Brand New', 'UK Used', 'US Used', 'Refurbished', 'Open Box'];
  const storages = ['all', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];

  const resetFilters = () => {
    setCurrentCategoryFilter('all');
    setSelectedBrand('all');
    setSelectedCondition('all');
    setSelectedStorage('all');
    setSelectedPricePreset('all');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('featured');
  };

  const handlePricePreset = (preset: string) => {
    setSelectedPricePreset(preset);
    if (preset === 'under-500k') {
      setMinPrice(0);
      setMaxPrice(500000);
    } else if (preset === '500k-1m') {
      setMinPrice(500000);
      setMaxPrice(1000000);
    } else if (preset === '1m-2m') {
      setMinPrice(1000000);
      setMaxPrice(2000000);
    } else if (preset === '2m-plus') {
      setMinPrice(2000000);
      setMaxPrice('');
    } else {
      setMinPrice('');
      setMaxPrice('');
    }
  };

  // Dynamic filter application
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category
    if (currentCategoryFilter !== 'all') {
      result = result.filter(
        (p) => p.category.toLowerCase() === currentCategoryFilter.toLowerCase()
      );
    }

    // Brand
    if (selectedBrand !== 'all') {
      result = result.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Condition
    if (selectedCondition !== 'all') {
      result = result.filter((p) => p.condition === selectedCondition);
    }

    // Storage
    if (selectedStorage !== 'all') {
      result = result.filter((p) =>
        p.variants.some((v) => v.storage?.toLowerCase().includes(selectedStorage.toLowerCase()))
      );
    }

    // Price
    if (minPrice !== '') {
      result = result.filter((p) => p.basePrice >= Number(minPrice));
    }
    if (maxPrice !== '') {
      result = result.filter((p) => p.basePrice <= Number(maxPrice));
    }

    // In Stock Only
    if (inStockOnly) {
      result = result.filter(
        (p) => !p.isSold && p.variants.some((v) => !v.isSold && v.stock > 0)
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [
    products,
    currentCategoryFilter,
    selectedBrand,
    selectedCondition,
    selectedStorage,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy
  ]);

  const activeFiltersCount =
    (currentCategoryFilter !== 'all' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (selectedCondition !== 'all' ? 1 : 0) +
    (selectedStorage !== 'all' ? 1 : 0) +
    (minPrice !== '' || maxPrice !== '' ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  return (
    <div className="pt-24 sm:pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="pb-8 border-b border-neutral-100 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">
            {currentCategoryFilter === 'all'
              ? 'All Gadgets'
              : `${currentCategoryFilter} Collection`}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Carefully curated devices with certified diagnostics and transparent pricing.
          </p>
        </div>

        {/* Category Horizontal Segmented Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCurrentCategoryFilter(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                currentCategoryFilter.toLowerCase() === cat.id.toLowerCase()
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Strip (Results count, mobile filter trigger, sorting) */}
      <div className="py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3 py-1.5 bg-neutral-100 rounded-lg text-xs font-semibold text-neutral-800 flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          <span className="text-xs font-medium text-neutral-500">
            Showing <strong className="text-neutral-900">{filteredProducts.length}</strong> items
          </span>

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-neutral-500 hover:text-neutral-900 underline flex items-center gap-1 ml-2"
            >
              <RotateCcw className="w-3 h-3" />
              Reset all
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold text-neutral-900 bg-transparent border-none focus:outline-none cursor-pointer pr-4"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="newest">Sort by: Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Left Filter Sidebar + Right 4-Col Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl p-5 border border-neutral-100 space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <span className="text-sm font-bold text-neutral-950 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filter Catalog
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-neutral-500 hover:text-neutral-900 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-neutral-800">In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-900 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              Brand
            </span>
            <div className="space-y-1 pt-1">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between ${
                    selectedBrand === brand
                      ? 'bg-neutral-950 text-white font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span className="capitalize">{brand === 'all' ? 'All Brands' : brand}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              Condition
            </span>
            <div className="space-y-1 pt-1">
              {conditions.map((cond) => (
                <button
                  key={cond}
                  onClick={() => setSelectedCondition(cond)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors ${
                    selectedCondition === cond
                      ? 'bg-neutral-950 text-white font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {cond === 'all' ? 'All Conditions' : cond}
                </button>
              ))}
            </div>
          </div>

          {/* Storage Capacity */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              Storage Capacity
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {storages.map((storage) => (
                <button
                  key={storage}
                  onClick={() => setSelectedStorage(storage)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    selectedStorage === storage
                      ? 'bg-neutral-950 text-white font-semibold'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {storage === 'all' ? 'Any' : storage}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              Price Range (₦)
            </span>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under-500k', label: 'Under ₦500,000' },
                { id: '500k-1m', label: '₦500,000 – ₦1,000,000' },
                { id: '1m-2m', label: '₦1,000,000 – ₦2,000,000' },
                { id: '2m-plus', label: '₦2,000,000+' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePricePreset(p.id)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md ${
                    selectedPricePreset === p.id
                      ? 'bg-neutral-950 text-white font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                placeholder="Min ₦"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value ? Number(e.target.value) : '');
                  setSelectedPricePreset('custom');
                }}
                className="w-1/2 p-2 border border-neutral-200 rounded-lg text-xs"
              />
              <span className="text-neutral-400">–</span>
              <input
                type="number"
                placeholder="Max ₦"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value ? Number(e.target.value) : '');
                  setSelectedPricePreset('custom');
                }}
                className="w-1/2 p-2 border border-neutral-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-9">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-100 space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                No gadgets match your filters
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try expanding your price range, choosing another brand or reset filters to view all devices.
              </p>
              <button
                onClick={resetFilters}
                className="mt-2 px-5 py-2 text-xs font-semibold bg-neutral-950 text-white rounded-full hover:bg-neutral-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Slide-Over */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <h3 className="text-base font-bold text-neutral-950">Filters</h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Filters Content */}
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-800">In Stock Only</span>
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-neutral-900"
                    />
                  </label>

                  <div>
                    <span className="text-xs font-bold text-neutral-800 uppercase">Brand</span>
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {brands.map((b) => (
                        <button
                          key={b}
                          onClick={() => setSelectedBrand(b)}
                          className={`text-xs p-2 rounded-lg text-left ${
                            selectedBrand === b ? 'bg-neutral-950 text-white font-semibold' : 'bg-neutral-100'
                          }`}
                        >
                          {b === 'all' ? 'All' : b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-neutral-800 uppercase">Condition</span>
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {conditions.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedCondition(c)}
                          className={`text-xs p-2 rounded-lg text-left ${
                            selectedCondition === c ? 'bg-neutral-950 text-white font-semibold' : 'bg-neutral-100'
                          }`}
                        >
                          {c === 'all' ? 'All' : c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-neutral-950 text-white rounded-xl text-xs font-bold"
                >
                  View {filteredProducts.length} Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
