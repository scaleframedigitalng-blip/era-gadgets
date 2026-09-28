import React from 'react';
import { useStore } from '../context/StoreContext';
import { MapPin, Phone, MessageSquare, Mail, ShieldCheck, Clock } from 'lucide-react';
import { generateGeneralWhatsAppUrl } from '../lib/utils';

export const Footer: React.FC = () => {
  const { setCurrentView, setCurrentCategoryFilter, settings } = useStore();

  const handleNav = (view: string, category = 'all') => {
    setCurrentCategoryFilter(category);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappUrl = generateGeneralWhatsAppUrl(
    settings?.whatsappNumber || '2348145550192',
    'Hello Era Gadgets Concierge, I would like to make an inquiry regarding available devices.'
  );

  return (
    <footer className="bg-neutral-950 text-neutral-400 text-xs border-t border-neutral-800">
      {/* Upper Trust Strip */}
      <div className="border-b border-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-neutral-200 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-neutral-200 font-semibold text-sm">Genuine & Verified Devices</h4>
                <p className="text-neutral-500 text-xs mt-0.5">
                  100% authentic Apple and Samsung devices, backed by diagnostic verification.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-neutral-200 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-neutral-200 font-semibold text-sm">Nationwide Delivery</h4>
                <p className="text-neutral-500 text-xs mt-0.5">
                  Same-day delivery across Lagos, tracked 24–48hr express to Abuja, PH, and nationwide.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-neutral-200 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-neutral-200 font-semibold text-sm">Physical Showroom</h4>
                <p className="text-neutral-500 text-xs mt-0.5">
                  Visit our Victoria Island space for inspection, direct collection, and device setup.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-neutral-200 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-neutral-200 font-semibold text-sm">WhatsApp Concierge</h4>
                <p className="text-neutral-500 text-xs mt-0.5">
                  Direct personal assistance from tech specialists before and after your purchase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-column Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Shop */}
          <div className="space-y-3">
            <h4 className="text-neutral-200 font-semibold text-sm tracking-wide">Shop</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNav('shop', 'iPhone')}
                  className="hover:text-white transition-colors"
                >
                  iPhone Models
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('shop', 'Samsung')}
                  className="hover:text-white transition-colors"
                >
                  Samsung Galaxy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('shop', 'Mac')}
                  className="hover:text-white transition-colors"
                >
                  MacBook Pro & Air
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('shop', 'iPad')}
                  className="hover:text-white transition-colors"
                >
                  iPad & Apple Pencil
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('shop', 'Apple Watch')}
                  className="hover:text-white transition-colors"
                >
                  Apple Watch Series & Ultra
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('shop', 'Accessories')}
                  className="hover:text-white transition-colors"
                >
                  AirPods & Genuine Accessories
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('deals')}
                  className="hover:text-white transition-colors"
                >
                  Current Promotions & Deals
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-neutral-200 font-semibold text-sm tracking-wide">Company</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-white transition-colors">
                  About Era Gadgets
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-white transition-colors">
                  Showroom & Concierge
                </button>
              </li>
              <li>
                <a href="#trust" className="hover:text-white transition-colors">
                  Diagnostic Standards
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <button onClick={() => handleNav('admin')} className="hover:text-white transition-colors">
                  Admin Management
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-neutral-200 font-semibold text-sm tracking-wide">Customer Support</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-neutral-500">Same-Day Dispatch (Lagos)</span>
              </li>
              <li>
                <span className="text-neutral-500">Paystack / Bank Transfer Protected</span>
              </li>
              <li>
                <span className="text-neutral-500">90-Day Inspected Device Coverage</span>
              </li>
              <li>
                <span className="text-neutral-500">In-Showroom Setup & Testing</span>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Direct WhatsApp Help
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-neutral-200 font-semibold text-sm tracking-wide">Showroom & Inquiries</h4>
            <div className="space-y-2 text-neutral-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <span>{settings?.address || 'Victoria Island Flagship Showroom, Lagos, Nigeria'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>{settings?.phone || '+234 814 555 0192'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>{settings?.email || 'concierge@eragadgets.ng'}</span>
              </p>
              <p className="text-neutral-500 text-[11px] pt-1">
                Hours: {settings?.openingHours || 'Mon – Sat: 9:00 AM – 7:30 PM WAT'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© 2026 Era Gadgets Limited. All rights reserved. Registered consumer electronics retailer in Nigeria.</p>
          <div className="flex items-center gap-4">
            <span>Paystack Certified</span>
            <span>·</span>
            <span>Flutterwave Supported</span>
            <span>·</span>
            <span>NDPR Privacy Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
