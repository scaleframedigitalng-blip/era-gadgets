import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { generateGeneralWhatsAppUrl } from '../lib/utils';

export const ContactPage: React.FC = () => {
  const { settings } = useStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  const whatsappUrl = generateGeneralWhatsAppUrl(
    settings?.whatsappNumber || '2348145550192',
    'Hello Era Gadgets Concierge, I would like to schedule a showroom visit or inquire about available devices.'
  );

  return (
    <div className="pt-24 sm:pt-28 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">
          Flagship Showroom & Concierge
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-2 leading-relaxed">
          Visit our curated tech showroom in Victoria Island, Lagos for device diagnostics, unboxing, and collection, or reach our concierge directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-100 shadow-2xs space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">Showroom Address</h4>
                <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                  {settings?.address || 'Victoria Island Flagship Showroom, Lagos, Nigeria'}
                </p>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Private parking & device testing benches available.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">Hours of Operation</h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  {settings?.openingHours || 'Mon – Sat: 9:00 AM – 7:30 PM WAT'}
                </p>
                <p className="text-xs text-neutral-400">Sunday: Closed for inventory restock</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">Direct Telephone</h4>
                <p className="text-xs text-neutral-600 mt-0.5">{settings?.phone || '+234 814 555 0192'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">Official Email</h4>
                <p className="text-xs text-neutral-600 mt-0.5">{settings?.email || 'concierge@eragadgets.ng'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-5 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp Directly</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right: Interactive Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-100 shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-neutral-950">Send an Inquiry or Schedule a Visit</h3>

            {submitted ? (
              <div className="p-6 bg-emerald-50 rounded-2xl text-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                <h4 className="text-sm font-bold">Message Received</h4>
                <p className="text-xs text-emerald-700">
                  Thank you. An Era Gadgets specialist will respond via WhatsApp or email within 30 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tunde Williams"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">WhatsApp / Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0803 123 4567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. tunde@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Message / Inquiry *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Inquire about a specific model, trade-in, or schedule a showroom unboxing..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-neutral-950 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Concierge Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
