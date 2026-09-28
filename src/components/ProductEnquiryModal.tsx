import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { api } from '../lib/api';
import { formatNaira } from '../lib/utils';
import { X, MessageSquare, CheckCircle2, Loader2, Send, Image as ImageIcon } from 'lucide-react';

interface ProductEnquiryModalProps {
  product: Product;
  variant?: ProductVariant | null;
  onClose: () => void;
}

export const ProductEnquiryModal: React.FC<ProductEnquiryModalProps> = ({
  product,
  variant,
  onClose
}) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    message: `Hello Era Gadgets, I would like to inquire about availability and delivery for the ${product.name}${
      variant ? ` (${variant.storage} · ${variant.color.name})` : ''
    }.`
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activePrice = variant ? variant.price : product.basePrice;
  const variantDetails = variant
    ? `${variant.storage} · ${variant.color.name} · ${product.condition} · ${formatNaira(activePrice)}`
    : `${product.condition} · Starting at ${formatNaira(activePrice)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || (!form.phone && !form.whatsapp && !form.email)) {
      setErrorMsg('Please provide your name and at least one contact channel (phone/WhatsApp or email).');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await api.createLead({
        name: form.name,
        phone: form.phone || form.whatsapp,
        whatsapp: form.whatsapp || form.phone,
        email: form.email,
        message: form.message,
        productInterest: product.name,
        variantDetails,
        source: 'Product Enquiry'
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-100 relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 text-neutral-900" />
            <span>Product Enquiry</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-950">Ask About This Gadget</h3>
        </div>

        {/* Selected Product Context Card */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center border border-neutral-200/60">
            {(variant?.image || (product.images && product.images[0])) ? (
              <img
                src={variant?.image || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-neutral-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-neutral-900 truncate">{product.name}</h4>
            <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{variantDetails}</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 rounded-2xl text-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold">Inquiry Sent to Concierge</h4>
            <p className="text-xs text-emerald-700">
              Thank you! Our technical concierge has received your request and will reach out via WhatsApp/Phone shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Babatunde Lawal"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0802 334 1198"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  WhatsApp Number (if different)
                </label>
                <input
                  type="tel"
                  placeholder="0802 334 1198"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. babatunde@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Message / Inquiries
              </label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-950 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Product Inquiry</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
