import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, ShoppingBag, Menu, X, Shield, ArrowRight, User } from 'lucide-react';
import { formatNaira } from '../lib/utils';

export const Navbar: React.FC = () => {
  const {
    cartCount,
    setIsCartOpen,
    setIsSearchOpen,
    currentView,
    setCurrentView,
    setCurrentCategoryFilter,
    isAdmin,
    settings
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Store', view: 'shop', category: 'all' },
    { label: 'iPhone', view: 'shop', category: 'iPhone' },
    { label: 'Samsung', view: 'shop', category: 'Samsung' },
    { label: 'Mac', view: 'shop', category: 'Mac' },
    { label: 'iPad', view: 'shop', category: 'iPad' },
    { label: 'Accessories', view: 'shop', category: 'Accessories' },
    { label: 'Laptops', view: 'shop', category: 'Laptops' },
    { label: 'Deals', view: 'deals', category: 'all' }
  ];

  const handleNavClick = (view: string, category: string) => {
    setCurrentCategoryFilter(category);
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav border-b border-black/[0.06] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] py-3'
            : 'bg-[#FBFBFB]/90 backdrop-blur-md border-b border-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Zone 1: Brand Wordmark & Monogram */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavClick('home', 'all')}
                className="group flex items-center gap-2.5 text-left focus:outline-none"
              >
                {/* Minimalist Geometric Monogram */}
                <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center text-white font-bold tracking-tighter text-sm transition-transform duration-200 group-hover:scale-95 shadow-sm">
                  <span className="font-semibold text-xs tracking-widest pl-0.5">ERA</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold tracking-tight text-neutral-950 group-hover:text-neutral-700 transition-colors">
                    Era Gadgets
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Navigation Links (Clean single-line desktop links) */}
            <nav className="hidden lg:flex items-center gap-7 text-[13.5px] font-medium text-neutral-600">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.view, item.category)}
                  className={`transition-colors whitespace-nowrap hover:text-neutral-950 relative py-1 ${
                    currentView === item.view && (item.category === 'all' || item.category === 'iPhone')
                      ? 'text-neutral-950 font-semibold'
                      : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Zone 3: Primary Actions (Search, Admin/Account, Cart) */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search gadgets"
                className="p-2 text-neutral-600 hover:text-neutral-950 hover:bg-black/5 rounded-full transition-colors"
                title="Search products"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Account / Admin Link */}
              <button
                onClick={() => handleNavClick('admin', 'all')}
                aria-label="Admin Portal"
                className={`p-2 rounded-full transition-colors ${
                  currentView === 'admin'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-black/5'
                }`}
                title="Admin Management Portal"
              >
                <User className="w-4 h-4" />
              </button>

              {/* Shopping Bag Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="View shopping bag"
                className="relative p-2 text-neutral-600 hover:text-neutral-950 hover:bg-black/5 rounded-full transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-neutral-950 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="lg:hidden p-2 text-neutral-700 hover:text-neutral-950 hover:bg-black/5 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Store Notice / Maintenance Alert if active */}
        {settings?.storeMaintenanceMode && (
          <div className="bg-neutral-900 text-neutral-200 text-xs py-1.5 px-4 text-center font-medium">
            {settings.maintenanceMessage} (Browsing mode active)
          </div>
        )}
      </header>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
                <span className="font-semibold text-lg text-neutral-950">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-neutral-500 hover:text-neutral-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                {navLinks.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.view, item.category)}
                    className="w-full text-left px-3 py-3 rounded-lg text-base font-medium text-neutral-800 hover:bg-neutral-50 hover:text-neutral-950 flex items-center justify-between transition-colors"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-neutral-100 space-y-2">
                <button
                  onClick={() => handleNavClick('contact', 'all')}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-950"
                >
                  Showroom & Concierge
                </button>
                <button
                  onClick={() => handleNavClick('admin', 'all')}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-950 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" /> Admin Inventory Portal
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-100 text-xs text-neutral-400 space-y-1">
              <p>© 2026 Era Gadgets Nigeria</p>
              <p>Victoria Island, Lagos</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
