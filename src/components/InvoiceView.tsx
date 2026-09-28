import React from 'react';
import { Order, StoreSettings } from '../types';
import { formatNaira, generateGeneralWhatsAppUrl } from '../lib/utils';
import { Printer, Download, MessageCircle, ArrowLeft, CheckCircle2, Clock, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';

interface InvoiceViewProps {
  order: Order;
  settings?: StoreSettings | null;
  onBack?: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ order, settings, onBack }) => {
  const isPaid = order.paymentStatus === 'verified';
  const isAwaiting = order.paymentStatus === 'awaiting_verification';

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = `Hello Era Gadgets Concierge, regarding invoice ${order.invoiceNumber} for order ${order.orderNumber}.`;
  const whatsappUrl = generateGeneralWhatsAppUrl(
    settings?.whatsappNumber || '2348145550192',
    whatsappMessage
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar (hidden in print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        )}

        <div className="flex items-center gap-2.5 ml-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Share via WhatsApp</span>
          </a>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/90 shadow-sm print:border-none print:shadow-none print:p-0 relative overflow-hidden">
        {/* Status Stamp Watermark */}
        {isPaid ? (
          <div className="absolute top-8 right-8 sm:top-12 sm:right-12 border-4 border-emerald-600/30 text-emerald-700 font-extrabold text-xl sm:text-2xl tracking-widest uppercase px-6 py-2 rounded-xl rotate-[-8deg] pointer-events-none select-none">
            PAID · VERIFIED
          </div>
        ) : isAwaiting ? (
          <div className="absolute top-8 right-8 sm:top-12 sm:right-12 border-2 border-amber-600/40 text-amber-700 font-bold text-xs sm:text-sm tracking-wider uppercase px-4 py-1.5 rounded-lg rotate-[-4deg] pointer-events-none select-none bg-amber-50/60">
            AWAITING VERIFICATION
          </div>
        ) : null}

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-neutral-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white font-bold text-xs flex items-center justify-center tracking-wider">
                ERA
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-950">
                Era Gadgets Limited
              </span>
            </div>
            <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
              {settings?.address || 'Victoria Island Flagship Showroom, Lagos, Nigeria'}
            </p>
            <div className="text-[11px] text-neutral-500 space-y-0.5">
              <p>Phone: {settings?.phone || '+234 814 555 0192'}</p>
              <p>Email: {settings?.email || 'concierge@eragadgets.ng'}</p>
              <p>Web: https://eragadgets.ng</p>
            </div>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight block">
              TAX INVOICE
            </span>
            <div className="text-xs space-y-1 text-neutral-600 pt-1">
              <p>
                <strong className="text-neutral-900">Invoice No:</strong>{' '}
                <span className="font-mono">{order.invoiceNumber}</span>
              </p>
              <p>
                <strong className="text-neutral-900">Order Ref:</strong>{' '}
                <span className="font-mono">{order.orderNumber}</span>
              </p>
              <p>
                <strong className="text-neutral-900">Date:</strong>{' '}
                {new Date(order.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
              <p>
                <strong className="text-neutral-900">Payment Status:</strong>{' '}
                <span
                  className={`font-semibold capitalize ${
                    isPaid
                      ? 'text-emerald-700'
                      : isAwaiting
                      ? 'text-amber-700'
                      : 'text-neutral-700'
                  }`}
                >
                  {isPaid
                    ? 'PAID (Verified)'
                    : isAwaiting
                    ? 'Awaiting Bank Verification'
                    : 'Pending'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Customer & Billing Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-neutral-100 text-xs text-neutral-600">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Billed & Delivered To:
            </span>
            <h4 className="text-sm font-bold text-neutral-900">{order.customer.fullName}</h4>
            <p className="mt-0.5">{order.customer.address}</p>
            <p>
              {order.customer.city}, {order.customer.state}
            </p>
            <p className="mt-1">Tel: {order.customer.phone}</p>
            {order.customer.whatsapp && <p>WhatsApp: {order.customer.whatsapp}</p>}
            <p>Email: {order.customer.email}</p>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Payment Method & Channel:
            </span>
            <p className="font-bold text-neutral-900 uppercase">
              {order.paymentMethod.replace(/_/g, ' ')}
            </p>
            <p className="font-mono text-[11px] text-neutral-500 mt-0.5">
              Ref: {order.paymentReference}
            </p>
            {order.verifiedAt && (
              <p className="text-emerald-700 text-[11px] font-medium mt-1">
                Verified: {new Date(order.verifiedAt).toLocaleString()}
              </p>
            )}

            {order.paymentMethod === 'bank_transfer' && (
              <div className="mt-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 sm:text-right">
                <p className="font-medium text-neutral-700">Bank: {settings?.paymentMethods.bankTransfer.bankName || 'GTBank'}</p>
                <p>Account: {settings?.paymentMethods.bankTransfer.accountName || 'Era Gadgets Limited'}</p>
                <p className="font-mono">Account No: {settings?.paymentMethods.bankTransfer.accountNumber || '0123456789'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3">Item Description</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {order.items.map((item, idx) => (
                <tr key={idx} className="text-neutral-700">
                  <td className="py-3.5 pr-4">
                    <span className="font-bold text-neutral-900 block">{item.productName}</span>
                    <span className="text-[11px] text-neutral-500">
                      {[
                        item.storage && item.storage !== 'None' ? item.storage : null,
                        item.colorName,
                        item.condition
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </td>
                  <td className="py-3.5 text-center font-semibold tabular-nums">{item.quantity}</td>
                  <td className="py-3.5 text-right font-medium tabular-nums">{formatNaira(item.price)}</td>
                  <td className="py-3.5 text-right font-bold text-neutral-950 tabular-nums">
                    {formatNaira(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="pt-4 border-t border-neutral-200 flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-neutral-900 tabular-nums">{formatNaira(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Shipping & Delivery:</span>
              <span className="font-semibold text-neutral-900 tabular-nums">
                {order.deliveryFee === 0 ? 'FREE' : formatNaira(order.deliveryFee)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Promotional Discount:</span>
                <span className="tabular-nums">- {formatNaira(order.discount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-neutral-300 flex justify-between text-sm font-bold text-neutral-950">
              <span>Total Amount:</span>
              <span className="text-base tabular-nums">{formatNaira(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Guarantee and Terms Footer */}
        <div className="mt-10 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Certified Diagnostic Guarantee · Official Electronic Invoice</span>
          </div>
          <div className="text-right">
            <span>Era Gadgets Nigeria · Victoria Island Showroom</span>
          </div>
        </div>
      </div>
    </div>
  );
};
