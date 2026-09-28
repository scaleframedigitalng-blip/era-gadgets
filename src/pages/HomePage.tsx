import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { formatNaira } from '../lib/utils';
import {
  ArrowRight,
  Shield,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { products, setCurrentView, setCurrentCategoryFilter, openProduct, addToCart } = useStore();

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // Target flagship featured products
  const iphone17 = products.find((p) => p.slug === 'iphone-17-pro') || products[0];
  const macbookPro = products.find((p) => p.slug === 'macbook-pro-16-m4-max');
  const galaxyS25 = products.find((p) => p.slug === 'samsung-galaxy-s25-ultra');
  const bestSellers = products.filter((p) => p.featured || p.badge === 'Best Seller').slice(0, 4);

  const categories = [
    {
      name: 'iPhone',
      tagline: 'Latest titanium flagships & certified pristine models',
      count: products.filter((p) => p.category === 'iPhone').length,
      image: '/src/assets/images/hero_iphone_flagship_1790352890898.jpg',
      icon: Smartphone
    },
    {
      name: 'Mac',
      tagline: 'MacBook Pro & MacBook Air with Apple M-Series silicon',
      count: products.filter((p) => p.category === 'Mac').length,
      image: '/src/assets/images/showcase_macbook_pro_1790352903234.jpg',
      icon: Laptop
    },
    {
      name: 'Samsung',
      tagline: 'Galaxy S-Series Ultra & revolutionary foldables',
      count: products.filter((p) => p.category === 'Samsung').length,
      image: '/src/assets/images/category_samsung_galaxy_1790352913709.jpg',
      icon: Smartphone
    },
    {
      name: 'Accessories',
      tagline: 'AirPods Max, MagSafe power, and studio sound',
      count: products.filter((p) => p.category === 'Accessories').length,
      image: '/src/assets/images/accessories_airpods_gadgets_1790352927938.jpg',
      icon: Headphones
    }
  ];

  const faqs = [
    {
      q: 'Are your devices genuinely original and authentic?',
      a: 'Yes, without exception. Every Brand New unit is 100% factory sealed with valid manufacturer serial numbers and original warranties. Our UK/US used devices undergo a rigorous 36-point diagnostic inspection verifying genuine OLED screens, True Tone, Face ID/Touch ID, and pristine original battery health.'
    },
    {
      q: 'How fast is delivery across Lagos and other Nigerian states?',
      a: 'Orders within Lagos are dispatched same-day with delivery completed in 2 to 4 hours. Orders to Abuja, Port Harcourt, Ibadan, and other states are shipped via priority courier services (DHL / GIG Logistics) with tracking delivered within 24 to 48 hours.'
    },
    {
      q: 'What payment options do you accept?',
      a: 'We support secure online payments via Paystack and Flutterwave (debit cards, USSD, Apple Pay where available), direct bank transfers to our verified corporate bank accounts, and in-person card payments at our Victoria Island showroom.'
    },
    {
      q: 'Can I physically inspect a device before taking delivery?',
      a: 'Absolutely. Customers are always welcome at our Victoria Island showroom in Lagos to inspect devices, test Face ID, cameras, and displays in person before completing purchase.'
    },
    {
      q: 'What is your warranty policy?',
      a: 'Brand New devices include the full 1-Year official manufacturer warranty (Apple Care / Samsung Care). UK Used devices sold by Era Gadgets include a 90-day diagnostic replacement guarantee against technical defects.'
    }
  ];

  const handleCategoryClick = (categoryName: string) => {
    setCurrentCategoryFilter(categoryName);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="space-y-20 sm:space-y-32 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-[#FBFBFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-950 text-balance leading-[1.08]">
              The technology you actually want.
            </h1>
            <p className="text-base sm:text-xl text-neutral-600 font-normal max-w-2xl mx-auto leading-relaxed text-balance">
              Discover iPhones, MacBooks, Samsung devices and premium gadgets — carefully selected and ready for you in Nigeria.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => handleCategoryClick('iPhone')}
                className="px-6 py-3 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Shop iPhone
              </button>
              <button
                onClick={() => {
                  setCurrentCategoryFilter('all');
                  setCurrentView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs sm:text-sm font-semibold transition-colors"
              >
                Explore All Products
              </button>
            </div>
          </div>

          {/* Hero Visual Stage */}
          <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto">
            <div className="relative aspect-16/9 rounded-3xl overflow-hidden bg-gradient-to-b from-[#F2F2F2] to-[#EAEAEA] border border-neutral-200/70 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.06)] flex items-center justify-center p-4 sm:p-10">
              <img
                src="/src/assets/images/hero_iphone_flagship_1790352890898.jpg"
                alt="Era Gadgets Flagship iPhone 17 Pro"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain mix-blend-multiply scale-100 hover:scale-102 transition-transform duration-700 ease-out"
              />
              <div className="absolute bottom-5 sm:bottom-8 left-6 sm:left-10 text-left">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500">
                  Era Gadgets Flagship
                </span>
                <p className="text-sm sm:text-lg font-bold text-neutral-950">
                  iPhone 17 Pro · Aerospace Titanium
                </p>
              </div>
              <div className="absolute bottom-5 sm:bottom-8 right-6 sm:right-10 text-right">
                <button
                  onClick={() => openProduct('iphone-17-pro')}
                  className="px-4 py-2 bg-white/90 hover:bg-white text-neutral-900 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md transition-colors"
                >
                  Configure & Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL FEATURED SHOWCASE (iPhone 17 Pro) */}
      {iphone17 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-neutral-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-14 items-center">
              {/* Product Visual */}
              <div className="lg:col-span-7 bg-[#F7F7F6] rounded-2xl p-6 sm:p-10 flex items-center justify-center aspect-4/3 relative overflow-hidden group">
                <img
                  src={iphone17.images[0]}
                  alt={iphone17.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="text-xs font-semibold text-neutral-800 bg-white/90 px-3 py-1 rounded-full shadow-2xs backdrop-blur-md">
                    Featured Device
                  </span>
                </div>
              </div>

              {/* Product Information */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
                    <span>{iphone17.brand}</span>
                    <span>·</span>
                    <span>{iphone17.condition}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-medium">In Stock (VI Showroom)</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">
                    {iphone17.name}
                  </h2>
                  <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                    {iphone17.shortDescription}
                  </p>
                </div>

                <div className="space-y-4 pt-2 border-t border-neutral-100">
                  {/* Price */}
                  <div>
                    <span className="text-xs text-neutral-500">Starting from</span>
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-950 tabular-nums">
                      {formatNaira(iphone17.basePrice)}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <span className="text-xs font-semibold text-neutral-700">Available Finishes</span>
                    <div className="flex items-center gap-2 mt-2">
                      {iphone17.variants.map((v) => (
                        <div
                          key={v.id}
                          title={`${v.color.name} (${v.storage})`}
                          className="flex items-center gap-1.5 p-1 rounded-full bg-neutral-100 pr-2.5 text-xs text-neutral-700"
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/20"
                            style={{ backgroundColor: v.color.hex }}
                          />
                          <span className="text-[11px] font-medium">{v.color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Storage Options */}
                  <div>
                    <span className="text-xs font-semibold text-neutral-700">Capacities</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.from(new Set(iphone17.variants.map((v) => v.storage))).map((storage) => (
                        <span
                          key={storage}
                          className="px-3 py-1 text-xs font-medium rounded-lg bg-neutral-100 text-neutral-800"
                        >
                          {storage}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (iphone17.variants[0]) {
                        addToCart(iphone17, iphone17.variants[0]);
                      }
                    }}
                    className="flex-1 py-3 px-6 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors text-center shadow-xs"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => openProduct(iphone17.slug)}
                    className="flex-1 py-3 px-6 rounded-full bg-neutral-100 text-neutral-900 text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-colors text-center"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. CATEGORY SHOWCASE TILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
              Curated Collections
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Select a category to explore certified hardware.
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentCategoryFilter('all');
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs sm:text-sm font-semibold text-neutral-950 hover:text-neutral-600 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="group cursor-pointer rounded-2xl bg-white p-5 border border-neutral-100 hover:border-neutral-200 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
              >
                <div className="aspect-4/3 rounded-xl bg-[#F8F8F7] p-4 flex items-center justify-center overflow-hidden mb-4">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                    <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                      <Icon className="w-3.5 h-3.5" />
                      {cat.name}
                    </span>
                    <span>{cat.count} models</span>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-1">{cat.tagline}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. MACBOOK PRO WORKSTATION EDITORIAL SPOTLIGHT */}
      {macbookPro && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-14 overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-14 items-center">
              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
                  Pro Workstation
                </span>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                  MacBook Pro. M4 Max powerhouse.
                </h2>
                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-light">
                  Built for Nigerian software engineers, 3D artists, film colorists, and power users. Liquid Retina XDR screen, all-day 24-hour battery life, and up to 546GB/s memory bandwidth.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-800 text-left">
                  <div>
                    <span className="text-[11px] text-neutral-500">Peak Brightness</span>
                    <p className="text-base sm:text-xl font-bold text-white tabular-nums">1,600 nits</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500">Battery Life</span>
                    <p className="text-base sm:text-xl font-bold text-white tabular-nums">24 Hours</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500">Starting Price</span>
                    <p className="text-base sm:text-xl font-bold text-white tabular-nums">
                      {formatNaira(macbookPro.basePrice)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => openProduct(macbookPro.slug)}
                    className="px-6 py-3 rounded-full bg-white text-neutral-950 text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-colors"
                  >
                    Configure M4 Max
                  </button>
                  <button
                    onClick={() => handleCategoryClick('Mac')}
                    className="px-6 py-3 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-colors border border-neutral-800"
                  >
                    Explore Mac Lineup
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 rounded-2xl overflow-hidden aspect-4/3 flex items-center justify-center p-4">
                <img
                  src="/src/assets/images/showcase_macbook_pro_1790352903234.jpg"
                  alt="MacBook Pro 16 M4 Max"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain rounded-xl hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. BEST SELLERS CURATED GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
              Popular in Nigeria
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Top requested phones and gadgets ready for dispatch today.
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentCategoryFilter('all');
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs sm:text-sm font-semibold text-neutral-950 hover:text-neutral-600 flex items-center gap-1"
          >
            <span>Browse Full Store</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. SAMSUNG GALAXY SHOWCASE */}
      {galaxyS25 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F6F6F5] rounded-3xl p-6 sm:p-12 border border-neutral-200/80">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-14 items-center">
              <div className="lg:col-span-6 rounded-2xl overflow-hidden aspect-4/3 flex items-center justify-center p-4">
                <img
                  src="/src/assets/images/category_samsung_galaxy_1790352913709.jpg"
                  alt="Samsung Galaxy S25 Ultra"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain mix-blend-multiply hover:scale-102 transition-transform duration-500"
                />
              </div>

              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
                  Android Mastery
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">
                  Galaxy S25 Ultra. Titanium perfection.
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light">
                  Armed with the 200MP Quad Telephoto sensor, anti-reflective Gorilla Armor glass, Snapdragon 8 Elite, and integrated Bluetooth S Pen. Genuine dual-SIM Nigerian-network verified.
                </p>

                <div className="pt-2">
                  <div className="text-xs text-neutral-500">Starting from</div>
                  <div className="text-2xl sm:text-3xl font-bold text-neutral-950 tabular-nums">
                    {formatNaira(galaxyS25.basePrice)}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => openProduct(galaxyS25.slug)}
                    className="px-6 py-3 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    View Galaxy S25 Ultra
                  </button>
                  <button
                    onClick={() => handleCategoryClick('Samsung')}
                    className="px-6 py-3 rounded-full bg-white text-neutral-900 hover:bg-neutral-100 text-xs sm:text-sm font-semibold transition-colors border border-neutral-200"
                  >
                    All Samsung Phones
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. WHY ERA GADGETS (TRUST SECTION) */}
      <section id="trust" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            Why shop with Era Gadgets?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Buying high-end electronics in Nigeria should be transparent, safe, and effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-neutral-950">100% Genuine & Verified</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Every unit comes with verifiable serial numbers directly checked against Apple or Samsung servers. No refurbished parts disguised as new, no clone screens.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-neutral-950">Transparent Fixed Pricing</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              No daily price hikes or chaotic computer village bargaining. What you see on Era Gadgets is the exact price, inclusive of clear invoice documentation.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-neutral-950">Fast Insured Delivery</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Express same-day courier dispatch in Lagos, and priority tracked air express to Abuja, Port Harcourt, Kano, and across Nigeria with door-to-door transit protection.
            </p>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Everything you need to know about purchasing with Era Gadgets.
          </p>
        </div>

        <div className="divide-y divide-neutral-200 border-y border-neutral-200">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className="py-4 sm:py-5">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-semibold text-neutral-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? 'rotate-180 text-neutral-900' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed pr-6">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. VIP DROP NOTIFICATIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F8F8F7] rounded-3xl p-8 sm:p-12 text-center border border-neutral-200/60 space-y-4">
          <Sparkles className="w-6 h-6 mx-auto text-neutral-800" />
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
            Be first to know when new shipments arrive.
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            Get instant private alerts on newly cleared iPhone batches, MacBook M4 restocks, and exclusive deals.
          </p>

          {newsletterSubmitted ? (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl inline-block">
              Thank you! You are on our priority VIP announcement list.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-neutral-900"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors"
              >
                Join VIP Drops
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
