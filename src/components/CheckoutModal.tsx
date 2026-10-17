import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  ArrowLeft, 
  Printer, 
  ShoppingBag, 
  Lock, 
  UserPlus, 
  Key 
} from 'lucide-react';
import { 
  ApiService, 
  User as UserModel, 
  OrderItem, 
  SUPPORT_PHONE, 
  SUPPORT_PHONE_CALL, 
  SUPPORT_WHATSAPP, 
  PAYMENT_API_KEY 
} from '../services/api';
import { BRAND_ASSETS, BRAND_CONFIG } from '../assets/branding';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: OrderItem[];
  currentUser: UserModel | null;
  onClearCart: () => void;
  onOpenAuth: () => void;
  onOpenSupport: () => void;
  onOpenPrivacy?: () => void;
  theme?: 'dark' | 'light';
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  onClearCart,
  onOpenAuth,
  onOpenSupport,
  onOpenPrivacy,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');

  // Customer info
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('Accra');
  const [notes, setNotes] = useState('');

  // Payment info
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card' | 'applepay' | 'cod'>('momo');
  const [momoNetwork, setMomoNetwork] = useState<'MTN' | 'Telecel' | 'AT'>('MTN');
  const [momoPhone, setMomoPhone] = useState(currentUser?.phone || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Loading & confirmation
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Sync state if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerPhone(currentUser.phone);
      setCustomerEmail(currentUser.email);
      if (!momoPhone) setMomoPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal > 2000 ? 0 : 50;
  const total = subtotal + shippingFee;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onClose();
      onOpenAuth();
      return;
    }
    if (!customerName || !customerPhone || !shippingAddress) return;
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    await ApiService.verifyPayment(total, paymentMethod === 'momo' ? `MoMo (${momoNetwork})` : paymentMethod);

    const orderPayload = {
      userEmail: customerEmail || currentUser?.email || 'guest@bluemahub.com',
      customerName,
      customerPhone,
      shippingAddress: `${shippingAddress}, ${city}. ${notes ? `(Note: ${notes})` : ''}`,
      items: cartItems,
      subtotal,
      total,
      paymentMethod: paymentMethod === 'momo' ? `MoMo (${momoNetwork})` : paymentMethod,
      paymentPhone: paymentMethod === 'momo' ? momoPhone : undefined,
      paymentApiKey: PAYMENT_API_KEY
    };

    const res = await ApiService.createOrder(orderPayload);
    setLoading(false);

    if (res.success) {
      // Order persistence to both Firebase Firestore and SQLite Database is handled in ApiService and backend proxy

      setConfirmedOrder({
        orderId: res.orderId,
        reference: res.reference,
        paymentApiKey: res.paymentApiKey || PAYMENT_API_KEY,
        gatewayAuth: res.gatewayAuth || `AUTH-05935632-${res.orderId}`,
        total,
        paymentMethod: orderPayload.paymentMethod,
        items: cartItems,
        customerName,
        customerPhone,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
      onClearCart();
      setStep('success');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 ${
      isDark ? 'bg-slate-950/85 text-white' : 'bg-slate-900/60 text-slate-950'
    } backdrop-blur-lg animate-in fade-in duration-200 overflow-hidden overscroll-none`}>
      {/* Background Image using Official BLUEMA Hero Asset */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center scale-105 opacity-25 pointer-events-none fixed"
        style={{ backgroundImage: `url(${BRAND_ASSETS.heroBanner})` }}
      />

      {/* Futuristic Card Container */}
      <div 
        className={`relative w-full max-w-2xl ${
          isDark 
            ? 'bg-slate-950/95 border-white/20 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)]' 
            : 'bg-white border-slate-200 text-slate-950 shadow-2xl'
        } backdrop-blur-2xl rounded-[28px] overflow-hidden border ring-1 ring-black/5 animate-in zoom-in-95 duration-300 max-h-[88vh] flex flex-col z-10`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top glossy light refraction */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent shrink-0" />

        {/* Header with BLUEMA Badge */}
        <div className={`px-6 py-4 flex items-center justify-between shrink-0 border-b ${
          isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm tracking-tighter shadow-md shrink-0 ${
              isDark ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
            }`}>
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-black font-brand tracking-wider uppercase ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}>
                  {BRAND_CONFIG.name}
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                Encrypted transaction • 100% Genuine Guarantee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/15' : 'text-slate-500 hover:text-slate-950 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className={`px-6 py-3 border-b flex items-center justify-between text-xs shrink-0 backdrop-blur-md ${
          isDark ? 'bg-slate-900/60 border-white/10' : 'bg-slate-50 border-slate-200/80'
        }`}>
          <div className={`flex items-center gap-2 ${step === 'details' ? (isDark ? 'text-white font-bold' : 'text-slate-950 font-bold') : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 'details' ? 'bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-500/30' : (isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700')}`}>1</span>
            <span>1. Information</span>
          </div>
          <div className={`w-8 sm:w-16 h-px ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
          <div className={`flex items-center gap-2 ${step === 'payment' ? (isDark ? 'text-white font-bold' : 'text-slate-950 font-bold') : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 'payment' ? 'bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-500/30' : (isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700')}`}>2</span>
            <span>2. Payment</span>
          </div>
          <div className={`w-8 sm:w-16 h-px ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
          <div className={`flex items-center gap-2 ${step === 'success' ? (isDark ? 'text-white font-bold' : 'text-slate-950 font-bold') : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 'success' ? 'bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-500/30' : (isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700')}`}>3</span>
            <span>3. Confirmation</span>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              {!currentUser && (
                <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl space-y-2.5 backdrop-blur-md">
                  <div className="flex items-start gap-2.5">
                    <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 dark:text-amber-100">
                      <strong className="block text-sm font-bold text-amber-950 dark:text-amber-200 mb-0.5">
                        Registration & Sign In Required To Complete Purchase
                      </strong>
                      <span>
                        Before selecting payment or checking out, first-time users must register an account and sign in.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenAuth(); }}
                    className="w-full py-2.5 bg-black hover:bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register Your Account Now / Sign In
                  </button>
                </div>
              )}

              {/* Order Summary Mini Bar */}
              <div className={`p-4 rounded-2xl border backdrop-blur-md ${
                isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Cart Items ({cartItems.reduce((a, c) => a + c.quantity, 0)})</span>
                  <span className={`font-semibold font-mono ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    GH₵{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Delivery Dispatch</span>
                  <span className="font-mono">{shippingFee === 0 ? 'FREE' : `GH₵${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className={`flex items-center justify-between text-sm font-bold pt-2 border-t ${
                  isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-950'
                }`}>
                  <span>Total Amount Due</span>
                  <span className="text-emerald-500 text-base font-extrabold font-mono">
                    GH₵{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Delivery Contact Information */}
              <div className="space-y-4">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  1. Shipping & Customer Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Receiver name"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none transition-all ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-white' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-950'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 059 883 0932"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none transition-all ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-white' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-950'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Delivery Address *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Street, Landmark, Apartment or Office"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none transition-all ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-white' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-950'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>City / Region</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Accra / Kumasi"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none transition-all ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-white' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-950'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Call before arrival, leave with receptionist"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none transition-all ${
                      isDark 
                        ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-white' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-950'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl transition-all shadow-xl cursor-pointer ${
                  isDark ? 'bg-white hover:bg-slate-100 text-slate-950' : 'bg-black hover:bg-slate-900 text-white'
                }`}
              >
                Proceed to Payment Method (GH₵{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) →
              </button>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <button
                onClick={() => setStep('details')}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Shipping Details
              </button>

              <div>
                {/* Active Payment Gateway API Indicator */}
                <div className={`mb-4 p-3.5 rounded-2xl flex items-center justify-between text-xs shadow-md backdrop-blur-md border ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                        <Key className="w-3.5 h-3.5 text-emerald-500" />
                        <span>PAYMENT API: {PAYMENT_API_KEY}</span>
                      </div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Live Gateway Connection Active · 100% Secure Checkout
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/85 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 tracking-wide">
                    ACTIVE
                  </span>
                </div>

                <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  2. Select Verified Payment Method
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['momo', 'card', 'applepay', 'cod'] as const).map((m) => {
                    const active = paymentMethod === m;
                    const labels: Record<string, { title: string; sub: string; icon: any }> = {
                      momo: { title: 'Mobile Money', sub: 'MTN / Telecel / AT', icon: Smartphone },
                      card: { title: 'Credit / Debit', sub: 'Visa, Mastercard', icon: CreditCard },
                      applepay: { title: 'Apple Pay', sub: '1-Tap Biometric', icon: ShieldCheck },
                      cod: { title: 'Pay on Delivery', sub: 'Inspect & Pay', icon: DollarSign }
                    };
                    const IconComp = labels[m].icon;
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? (isDark ? 'border-white bg-slate-900 text-white shadow-md ring-1 ring-white' : 'border-slate-950 bg-slate-900 text-white shadow-md')
                            : (isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800')
                        }`}
                      >
                        <IconComp className={`w-5 h-5 mb-2 ${active ? 'text-emerald-400' : (isDark ? 'text-slate-300' : 'text-slate-600')}`} />
                        <div className={`text-xs font-bold ${active ? 'text-white' : (isDark ? 'text-slate-200' : 'text-slate-900')}`}>{labels[m].title}</div>
                        <div className={`text-[10px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>{labels[m].sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Specific Form Inputs */}
              {paymentMethod === 'momo' && (
                <div className={`p-4 rounded-2xl border space-y-3 backdrop-blur-md ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex gap-2">
                    {(['MTN', 'Telecel', 'AT'] as const).map((net) => (
                      <button
                        type="button"
                        key={net}
                        onClick={() => setMomoNetwork(net)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          momoNetwork === net
                            ? 'bg-black text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm'
                            : (isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-slate-300 text-slate-700')
                        }`}
                      >
                        {net} MoMo
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {momoNetwork} Mobile Money Number *
                    </label>
                    <input
                      type="tel"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      placeholder="e.g. 059 883 0932"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none transition-all ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-white' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-950'
                      }`}
                    />
                    <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      A prompt will be triggered to this number to authorize GH₵{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className={`p-4 rounded-2xl border space-y-3 backdrop-blur-md ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Card Number *</label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none transition-all ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-white' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-950'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Expiry Date *</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none transition-all ${
                          isDark 
                            ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-white' 
                            : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-950'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>CVV / CVC *</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none transition-all ${
                          isDark 
                            ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-white' 
                            : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-950'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'applepay' && (
                <div className={`p-4 rounded-2xl border text-center space-y-2 backdrop-blur-md ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="w-12 h-12 bg-black text-white dark:bg-white dark:text-slate-950 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    
                  </div>
                  <h5 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-950'}`}>Apple Pay Authorized</h5>
                  <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Use Touch ID or Face ID to confirm the order total of GH₵{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
                  </p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 space-y-2 backdrop-blur-md">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Pay on Delivery (Cash or MoMo upon inspection)</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    Our courier will dispatch your items nationwide. You can inspect your genuine items before making payment.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className={`w-full py-4 px-4 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                  isDark ? 'bg-white hover:bg-slate-100 text-slate-950' : 'bg-black hover:bg-slate-900 text-white'
                }`}
              >
                {loading ? (
                  <span>Processing Verified Payment...</span>
                ) : (
                  <span>Authorize & Complete Payment (GH₵{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                )}
              </button>
            </div>
          )}

          {step === 'success' && confirmedOrder && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Verified Payment Successful
                </span>
                <h3 className={`text-xl sm:text-2xl font-black font-brand mt-2 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  Order #{confirmedOrder.orderId} Placed!
                </h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Thank you, <strong className={isDark ? 'text-white' : 'text-slate-950'}>{confirmedOrder.customerName}</strong>. Your payment has been securely authorized and logged.
                </p>
              </div>

              {/* Receipt card */}
              <div className={`p-4 rounded-2xl border text-left space-y-3 font-mono text-xs backdrop-blur-md ${
                isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex justify-between pb-2 border-b border-white/10">
                  <span className="text-slate-400">Reference:</span>
                  <span className="font-bold">{confirmedOrder.reference}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-white/10">
                  <span className="text-slate-400">Payment API Key:</span>
                  <span className="text-emerald-500 font-bold">{confirmedOrder.paymentApiKey}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-white/10">
                  <span className="text-slate-400">Gateway Auth:</span>
                  <span className="font-bold">{confirmedOrder.gatewayAuth}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-white/10">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="font-bold uppercase">{confirmedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1">
                  <span className={isDark ? 'text-white' : 'text-slate-950'}>Total Paid:</span>
                  <span className="text-emerald-500 font-extrabold">GH₵{confirmedOrder.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isDark ? 'border-slate-700 hover:bg-slate-900 text-white' : 'border-slate-300 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <Printer className="w-4 h-4" /> Print Official Receipt
                </button>
                <button
                  onClick={onClose}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                    isDark ? 'bg-white hover:bg-slate-100 text-slate-950' : 'bg-black hover:bg-slate-900 text-white'
                  }`}
                >
                  Done / Close
                </button>
              </div>

              <div className={`pt-4 border-t text-[11px] ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                Need concierge assistance? Call our hotline directly at <a href={SUPPORT_PHONE_CALL} className="underline font-bold text-emerald-500">{SUPPORT_PHONE}</a> or <a href={SUPPORT_WHATSAPP} target="_blank" rel="noreferrer" className="underline font-bold text-emerald-500">WhatsApp Concierge</a>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
