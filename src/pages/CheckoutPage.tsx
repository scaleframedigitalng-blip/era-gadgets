import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatNaira, generateGeneralWhatsAppUrl } from '../lib/utils';
import { api } from '../lib/api';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  MessageCircle,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Loader2,
  Copy,
  Check,
  Upload,
  FileText,
  AlertCircle
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartTotal,
    settings,
    clearCart,
    setCurrentView,
    setCompletedOrder
  } = useStore();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    state: 'Lagos',
    notes: ''
  });

  const [deliveryOption, setDeliveryOption] = useState<'lagos' | 'outside_lagos' | 'pickup'>('lagos');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'paystack' | 'flutterwave' | 'cash_on_delivery' | 'pay_at_pickup'>('bank_transfer');
  
  // Payment Proof Upload state
  const [proofFile, setProofFile] = useState<{ dataUrl: string; name: string } | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (cart.length === 0) {
    return (
      <div className="pt-32 pb-24 text-center max-w-md mx-auto px-4 space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Your bag is empty</h2>
        <p className="text-xs text-neutral-500">
          Add gadgets to your bag before proceeding to checkout.
        </p>
        <button
          onClick={() => setCurrentView('shop')}
          className="px-6 py-2.5 bg-neutral-950 text-white rounded-full text-xs font-semibold hover:bg-neutral-800"
        >
          Explore Gadgets
        </button>
      </div>
    );
  }

  // Delivery fee calculation
  const freeThreshold = settings?.freeDeliveryThreshold || 3500000;
  const isFreeDelivery = cartTotal >= freeThreshold;

  let deliveryFee = 0;
  if (!isFreeDelivery) {
    if (deliveryOption === 'lagos') {
      deliveryFee = settings?.lagosDeliveryFee || 3500;
    } else if (deliveryOption === 'outside_lagos') {
      deliveryFee = settings?.outsideLagosDeliveryFee || 8500;
    } else {
      deliveryFee = 0;
    }
  }

  const grandTotal = cartTotal + deliveryFee;

  const nigerianStates = [
    'Lagos',
    'FCT Abuja',
    'Rivers (Port Harcourt)',
    'Oyo (Ibadan)',
    'Ogun',
    'Delta',
    'Edo',
    'Anambra',
    'Enugu',
    'Kano',
    'Kaduna',
    'Akwa Ibom',
    'Ondo',
    'Kwara',
    'Abia',
    'Other Nigerian State'
  ];

  // Configured bank transfer details from settings
  const bankConfig = settings?.paymentMethods?.bankTransfer || {
    enabled: true,
    bankName: 'Guaranty Trust Bank (GTBank)',
    accountName: 'Era Gadgets Limited',
    accountNumber: '0123456789',
    instructions: 'Please transfer the exact amount shown above to the account above.'
  };

  const handleCopyAccount = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(bankConfig.accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB. Please choose a smaller receipt file or screenshot.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofFile({
        dataUrl: reader.result as string,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.fullName || !form.phone || !form.address) {
      setErrorMsg('Please complete all required customer information fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          ...form,
          whatsapp: form.whatsapp || form.phone
        },
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          variantId: item.variantId,
          storage: item.storage,
          colorName: item.color?.name,
          condition: item.condition,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          sku: item.variantId
        })),
        deliveryOption,
        paymentMethod
      };

      // 1. Create order in backend
      const newOrder = await api.createOrder(orderPayload);

      // 2. If Bank Transfer: customer clicked "I've Made the Transfer", submit payment confirmation
      if (paymentMethod === 'bank_transfer') {
        const confirmed = await api.submitBankPayment(
          newOrder.id,
          proofFile?.dataUrl,
          proofFile?.name
        );
        clearCart();
        setCompletedOrder(confirmed.order);
        setCurrentView('order-success');
      } else {
        clearCart();
        setCompletedOrder(newOrder);
        setCurrentView('order-success');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 sm:pt-28 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          onClick={() => setCurrentView('shop')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Store</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Customer Information & Delivery Form */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
              Checkout & Delivery Details
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Select your payment method. Direct bank transfer is verified personally by our accounts desk.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* 1. Customer Information */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-100 space-y-4">
              <h3 className="text-sm font-bold text-neutral-950">1. Customer Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08012345678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    WhatsApp Number (for Instant Dispatch Updates) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08012345678"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Email Address (for Official Tax Invoice) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-100 space-y-4">
              <h3 className="text-sm font-bold text-neutral-950">2. Delivery Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Street Address & House/Apartment Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plot 14 Admiralty Way, Lekki Phase 1"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      City / Area *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lekki / Ikeja / Maitama"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      State *
                    </label>
                    <select
                      value={form.state}
                      onChange={(e) => {
                        const newState = e.target.value;
                        setForm({ ...form, state: newState });
                        if (newState.toLowerCase().includes('lagos')) {
                          setDeliveryOption('lagos');
                        } else {
                          setDeliveryOption('outside_lagos');
                        }
                      }}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900 bg-white"
                    >
                      {nigerianStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Leave with building security if unavailable..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>

            {/* 3. Delivery Method */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-100 space-y-4">
              <h3 className="text-sm font-bold text-neutral-950">3. Select Delivery Method</h3>
              <div className="space-y-2">
                <label
                  onClick={() => setDeliveryOption('lagos')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    deliveryOption === 'lagos'
                      ? 'border-neutral-950 bg-neutral-50'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryOption === 'lagos'}
                      onChange={() => setDeliveryOption('lagos')}
                      className="text-neutral-900 focus:ring-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Lagos Express Same-Day Dispatch</p>
                      <p className="text-[11px] text-neutral-500">Dispatched in 2–4 hours across Lagos</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-neutral-900 tabular-nums">
                    {isFreeDelivery ? 'FREE' : formatNaira(settings?.lagosDeliveryFee || 3500)}
                  </span>
                </label>

                <label
                  onClick={() => setDeliveryOption('outside_lagos')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    deliveryOption === 'outside_lagos'
                      ? 'border-neutral-950 bg-neutral-50'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryOption === 'outside_lagos'}
                      onChange={() => setDeliveryOption('outside_lagos')}
                      className="text-neutral-900 focus:ring-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Nationwide Priority Air Express</p>
                      <p className="text-[11px] text-neutral-500">Abuja, PH, Kano & nationwide (24–48hrs tracked)</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-neutral-900 tabular-nums">
                    {isFreeDelivery ? 'FREE' : formatNaira(settings?.outsideLagosDeliveryFee || 8500)}
                  </span>
                </label>

                {settings?.paymentMethods?.payAtPickup?.enabled !== false && (
                  <label
                    onClick={() => setDeliveryOption('pickup')}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      deliveryOption === 'pickup'
                        ? 'border-neutral-950 bg-neutral-50'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryOption === 'pickup'}
                        onChange={() => setDeliveryOption('pickup')}
                        className="text-neutral-900 focus:ring-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-neutral-900">Showroom Collection (Victoria Island)</p>
                        <p className="text-[11px] text-neutral-500">Inspect device in person & collect directly</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-900">FREE</span>
                  </label>
                )}
              </div>
            </div>

            {/* 4. Payment Method Selection (Only configured & enabled methods shown) */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-100 space-y-4">
              <h3 className="text-sm font-bold text-neutral-950">4. Select Payment Method</h3>
              <div className="space-y-2">
                {/* Bank Transfer */}
                {settings?.paymentMethods?.bankTransfer?.enabled !== false && (
                  <label
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-4 rounded-xl border flex items-start justify-between cursor-pointer transition-colors ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-neutral-950 bg-neutral-50'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="text-neutral-900 focus:ring-0 mt-0.5"
                      />
                      <div>
                        <p className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-neutral-900" />
                          Manual Bank Transfer (Direct to Era Gadgets)
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Transfer directly to our official business bank account. Verified by our accounts team.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-neutral-950 text-white px-2 py-0.5 rounded-full shrink-0">
                      Primary
                    </span>
                  </label>
                )}

                {/* Paystack (if enabled by admin) */}
                {settings?.paymentMethods?.paystack?.enabled && (
                  <label
                    onClick={() => setPaymentMethod('paystack')}
                    className={`p-4 rounded-xl border flex items-start justify-between cursor-pointer transition-colors ${
                      paymentMethod === 'paystack'
                        ? 'border-neutral-950 bg-neutral-50'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'paystack'}
                        onChange={() => setPaymentMethod('paystack')}
                        className="text-neutral-900 focus:ring-0 mt-0.5"
                      />
                      <div>
                        <p className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" />
                          Paystack Online Gateway
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Instant card payments (Mastercard, Visa, Verve), USSD, Apple Pay
                        </p>
                      </div>
                    </div>
                  </label>
                )}

                {/* Pay at Pickup (if enabled by admin) */}
                {settings?.paymentMethods?.payAtPickup?.enabled && (
                  <label
                    onClick={() => setPaymentMethod('pay_at_pickup')}
                    className={`p-4 rounded-xl border flex items-start justify-between cursor-pointer transition-colors ${
                      paymentMethod === 'pay_at_pickup'
                        ? 'border-neutral-950 bg-neutral-50'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'pay_at_pickup'}
                        onChange={() => setPaymentMethod('pay_at_pickup')}
                        className="text-neutral-900 focus:ring-0 mt-0.5"
                      />
                      <div>
                        <p className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Pay at Showroom Pickup
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Inspect your gadget in our Victoria Island showroom before completing POS or card payment.
                        </p>
                      </div>
                    </div>
                  </label>
                )}
              </div>

              {/* DEDICATED BANK TRANSFER DETAILS CARD */}
              {paymentMethod === 'bank_transfer' && (
                <div className="p-5 rounded-2xl bg-neutral-950 text-white space-y-4 mt-3">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Transfer Details
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      Exact Amount: {formatNaira(grandTotal)}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Bank Name:</span>
                      <strong className="text-white font-semibold">{bankConfig.bankName}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-400">Account Name:</span>
                      <strong className="text-white font-semibold">{bankConfig.accountName}</strong>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                          Account Number
                        </span>
                        <span className="text-lg font-mono font-bold tracking-widest text-white">
                          {bankConfig.accountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyAccount}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        {copiedAccount ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {bankConfig.instructions} Use your full name or phone number as transfer narration.
                  </p>

                  {/* OPTIONAL PAYMENT PROOF UPLOAD */}
                  <div className="pt-3 border-t border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-neutral-400" />
                        Upload Transfer Proof / Receipt (Optional)
                      </span>
                      <span className="text-[10px] text-neutral-500">JPG, PNG, PDF</span>
                    </div>

                    {proofFile ? (
                      <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate text-neutral-300">
                          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate">{proofFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProofFile(null)}
                          className="text-neutral-500 hover:text-rose-400 text-xs ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="p-3 border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-neutral-900/50 hover:bg-neutral-900 transition-colors text-xs text-neutral-300">
                        <Upload className="w-4 h-4 text-neutral-400" />
                        <span>Select Receipt or Screenshot</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-neutral-950 text-white text-sm font-semibold hover:bg-neutral-800 disabled:bg-neutral-400 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order Submission...</span>
                  </>
                ) : paymentMethod === 'bank_transfer' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>I've Made the Transfer ({formatNaira(grandTotal)})</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Place Order ({formatNaira(grandTotal)})</span>
                  </>
                )}
              </button>

              {paymentMethod === 'bank_transfer' && (
                <p className="text-[11px] text-center text-neutral-500">
                  Note: Clicking "I've Made the Transfer" sets your order status to{' '}
                  <strong className="text-neutral-800">Awaiting Verification</strong>. Once confirmed with our bank, your order and tax invoice are officially marked PAID.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-100 shadow-2xs space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-neutral-950 pb-3 border-b border-neutral-100">
              Order Summary ({cart.reduce((sum, i) => sum + i.quantity, 0)} Items)
            </h3>

            {/* Cart Items List */}
            <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.variantId} className="py-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-neutral-100 p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.productName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-neutral-900 truncate">
                      {item.productName}
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      {item.storage && item.storage !== 'None' ? `${item.storage} · ` : ''}
                      {item.color?.name || item.condition}
                      <span className="ml-1 text-neutral-700 font-medium">× {item.quantity}</span>
                    </p>
                  </div>
                  <span className="text-xs font-bold text-neutral-950 tabular-nums shrink-0">
                    {formatNaira(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900 tabular-nums">
                  {formatNaira(cartTotal)}
                </span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Delivery Fee</span>
                <span className="font-semibold text-neutral-900 tabular-nums">
                  {deliveryFee === 0 ? 'FREE' : formatNaira(deliveryFee)}
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-between text-sm font-bold text-neutral-950">
                <span>Grand Total</span>
                <span className="tabular-nums text-base">{formatNaira(grandTotal)}</span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="pt-4 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Diagnostic guarantee & payment escrow protection.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
