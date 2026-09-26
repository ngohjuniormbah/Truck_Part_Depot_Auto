import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { CartItem, Order, OrderItem, NavPage, PaymentMethod } from '../types';
import { ShimmerButton } from '../components/ShimmerButton';
import { PAYMENT_OPTIONS, formatPaymentMethod } from '../utils/payment';
import { api } from '../services/api';

interface CheckoutPageProps {
  cartItems: CartItem[];
  onClearCart: () => void;
  onNavigate: (page: NavPage, initialTab?: 'products' | 'gallery' | 'reviews' | 'orders') => void;
  onOrderCreated: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cartItems,
  onClearCart,
  onNavigate,
  onOrderCreated,
}) => {
  // Customer & Shipping Info
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [deliveryType, setDeliveryType] = useState<'commercial' | 'residential'>('commercial');

  // Freight & Payment
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('zelle');
  const [paymentAccountInfo, setPaymentAccountInfo] = useState('');
  const [notes, setNotes] = useState('');

  // State
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [orderError, setOrderError] = useState('');

  // Auto-scroll directly to payment method section
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById('payment-method-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Calculations
  const partsSubtotal = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const coreTotal = cartItems.reduce((acc, i) => acc + (i.product.coreDeposit || 0) * i.quantity, 0);
  let shippingFee = 0;
  if (shippingMethod === 'standard') {
    shippingFee = partsSubtotal > 500 ? 0 : 35.0;
  } else if (shippingMethod === 'express') {
    shippingFee = 0; // Has extra cost, coordinated with customer upon order review
  }
  const tax = Math.round(partsSubtotal * 0.0725 * 100) / 100;
  const grandTotal = Math.round((partsSubtotal + coreTotal + shippingFee + tax) * 100) / 100;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!customerName || !customerEmail || !street || !city || !zip) return;
    setSubmitting(true);
    setOrderError('');

    try {
      const orderItems: OrderItem[] = cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        name: item.product.name,
        brand: item.product.brand,
        oemNumber: item.product.oemNumber,
        price: item.product.price,
        quantity: item.quantity,
        coreDeposit: item.product.coreDeposit || 0,
      }));

      const payload: Partial<Order> = {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date().toISOString(),
        customerName,
        customerEmail,
        customerPhone,
        companyName,
        shippingAddress: {
          street,
          city,
          state,
          zip,
          deliveryType,
        },
        shippingMethod,
        items: orderItems,
        subtotal: partsSubtotal,
        coreDepositTotal: coreTotal,
        shippingFee,
        tax,
        total: grandTotal,
        paymentMethod,
        paymentAccountInfo,
        paymentStatus: 'Pending Verification',
        orderStatus: 'Pending',
        trackingNumber: `TDP-${Math.floor(1000000 + Math.random() * 9000000)}-${state}`,
        notes: `Payment: ${formatPaymentMethod(paymentMethod)}${
          paymentAccountInfo ? ` (${paymentAccountInfo})` : ''
        } | Shipping: ${shippingMethod === 'express' ? 'Express 1-Day (Has Extra Cost)' : 'Standard 1-2 Days'} | Notes: ${notes}`,
      };

      const orderData = await api.createOrder(payload);
      setConfirmedOrder(orderData);
      onOrderCreated(orderData);
      onClearCart();
    } catch (err) {
      console.error('Failed to create order via API:', err);
      setOrderError('We could not save your order. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If confirmed, show order receipt
  if (confirmedOrder) {
    return (
      <div className="bg-black text-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-4">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
              Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Thank You For Your Order
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
              Your order #{confirmedOrder.id} has been received and scheduled for dispatch. A confirmation receipt has been sent to <strong className="text-white">{confirmedOrder.customerEmail}</strong>.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-left mt-6">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Order ID</span>
                <div className="text-xs font-mono font-bold text-white">{confirmedOrder.id}</div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Tracking #</span>
                <div className="text-xs font-mono font-bold text-white">{confirmedOrder.trackingNumber}</div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Payment Method</span>
                <div className="text-xs font-bold text-white">{formatPaymentMethod(confirmedOrder.paymentMethod)}</div>
                {confirmedOrder.paymentAccountInfo && (
                  <div className="text-[10px] text-neutral-400 font-mono truncate">{confirmedOrder.paymentAccountInfo}</div>
                )}
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Order Total</span>
                <div className="text-xs font-black text-white">${confirmedOrder.total.toLocaleString()}</div>
              </div>
            </div>

            {/* Payment Method Next Steps */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">
                  Payment Method: {formatPaymentMethod(confirmedOrder.paymentMethod)}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                  Instructions Being Sent
                </span>
              </div>
              <p className="text-neutral-300 text-xs leading-relaxed">
                The payment instructions will be sent to you after the order is received on how to pay. Our team will contact you directly at{' '}
                <strong className="text-white">{confirmedOrder.customerPhone || confirmedOrder.customerEmail}</strong>{' '}
                to confirm truck specifications, shipping details, and finalize your payment via{' '}
                <strong className="text-white">{formatPaymentMethod(confirmedOrder.paymentMethod)}</strong>.
              </p>
            </div>

            {/* Refund Policy Information */}
            <div className="p-4 sm:p-5 rounded-xl bg-neutral-900 border border-neutral-800 text-left space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Refund Policy
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Returns on eligible parts are accepted within 30 calendar days of delivery in brand-new, uninstalled condition with factory seals intact. Cores returned within 45 days using the provided bill of lading will receive a full core deposit refund upon warehouse inspection.
              </p>
            </div>
          </div>

          {/* Receipt Breakdown */}
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-3">
              Items In This Order
            </h3>
            <div className="divide-y divide-neutral-900">
              {confirmedOrder.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-bold text-white">{item.productName || item.name}</div>
                    <div className="text-neutral-400 text-[11px]">
                      {item.brand} &bull; OEM: {item.oemNumber} &bull; Qty: {item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">
                      ${(item.price * item.quantity).toLocaleString()}
                    </div>
                    {item.coreDeposit > 0 && (
                      <div className="text-[10px] text-neutral-400">
                        +${(item.coreDeposit * item.quantity).toLocaleString()} core
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-900 pt-4 space-y-2 text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>Parts Subtotal:</span>
                <span className="text-white">${confirmedOrder.subtotal.toLocaleString()}</span>
              </div>
              {confirmedOrder.coreDepositTotal > 0 && (
                <div className="flex justify-between">
                  <span>Core Deposit:</span>
                  <span className="text-white">${confirmedOrder.coreDepositTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({confirmedOrder.shippingMethod === 'express' ? 'Express 1 Day' : 'Standard 1–2 Days'}):</span>
                <span className="text-white font-medium">
                  {confirmedOrder.shippingMethod === 'express'
                    ? 'Has Extra Cost'
                    : confirmedOrder.shippingFee === 0
                    ? 'FREE'
                    : `$${confirmedOrder.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax:</span>
                <span className="text-white">${confirmedOrder.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                <span>Total:</span>
                <span>${confirmedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-neutral-900 border border-neutral-700 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors text-center cursor-pointer"
              >
                Print Invoice
              </button>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="px-6 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-colors text-center cursor-pointer"
              >
                Return to Store
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="bg-black text-white py-20 text-center">
        <div className="max-w-md mx-auto px-4 space-y-4">
          <h2 className="text-2xl font-bold text-white">Your Cart is Empty</h2>
          <p className="text-xs text-neutral-400">
            Browse our catalog to find parts and proceed to checkout.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="mt-4 px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-all cursor-pointer"
          >
            Browse Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Checkout
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Please enter your shipping address and payment details below.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left: Customer, Shipping & Payment Information */}
          <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-7">
            {/* 1. Customer Information */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white">
                Customer Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-base sm:text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Your phone number"
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-base sm:text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-base sm:text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Company / Fleet (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Alamo Commercial Logistics"
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-base sm:text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="pt-6 border-t border-neutral-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">
                  Shipping Address
                </h2>
                <div className="flex items-center gap-4 text-xs text-neutral-300">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === 'commercial'}
                      onChange={() => setDeliveryType('commercial')}
                      className="accent-white"
                    />
                    <span>Commercial</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === 'residential'}
                      onChange={() => setDeliveryType('residential')}
                      className="accent-white"
                    />
                    <span>Residential</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="4100 Commercial Pkwy, Bay 4"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-base sm:text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Your city"
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-base sm:text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="State"
                    className="w-full bg-neutral-900 border border-neutral-700 text-white font-mono uppercase text-base sm:text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="78219"
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-base sm:text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. Shipping Method */}
            <div className="pt-6 border-t border-neutral-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">
                  Shipping Method
                </h2>
                <span className="text-[11px] text-neutral-400 font-medium">
                  Fast Dispatch Nationwide
                </span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    id: 'standard',
                    label: 'Standard Shipping (1–2 Days)',
                    subtitle: 'Warehouse dispatch with prompt delivery in 1–2 business days',
                    price: partsSubtotal > 500 ? 'FREE' : '$35.00',
                  },
                  {
                    id: 'express',
                    label: 'Express Shipping (1 Day)',
                    subtitle: 'Next-day priority rush dispatch & guaranteed 1-day delivery',
                    price: 'Has Extra Cost',
                  },
                ].map((item) => {
                  const isSelected = shippingMethod === item.id;
                  return (
                    <label
                      key={item.id}
                      onClick={() => setShippingMethod(item.id as typeof shippingMethod)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-neutral-900 border-white text-white font-semibold ring-1 ring-white/30'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={isSelected}
                          onChange={() => setShippingMethod(item.id as typeof shippingMethod)}
                          className="accent-white h-4 w-4 shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{item.label}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">{item.subtitle}</span>
                        </div>
                      </div>
                      <span className="font-bold text-white shrink-0 ml-2">{item.price}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Payment Method */}
            <div id="payment-method-section" className="pt-6 border-t border-neutral-800/80 space-y-4 scroll-mt-24">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Payment Method
                    <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                      Step 4 of 4
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Select your preferred payment method below.
                  </p>
                </div>
              </div>

              {/* Simple Clean Payment Method Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {PAYMENT_OPTIONS.map((opt) => {
                  const isSelected = paymentMethod === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-neutral-900 border-white text-white font-semibold ring-1 ring-white/50 shadow-sm'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethodChoice"
                        checked={isSelected}
                        onChange={() => setPaymentMethod(opt.id)}
                        className="accent-white h-4 w-4 shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold">{opt.name}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">{opt.subtitle}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* General Payment Instructions Paragraph */}
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed pt-1">
                The payment instructions will be sent to you after the order is received on how to pay.
              </p>

              <div className="pt-2">
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Contact Instructions / Delivery Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferred contact time, gate code, loading dock number..."
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-base sm:text-xs px-3.5 py-2 rounded-lg focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* 5. Refund Policy */}
            <div className="pt-6 border-t border-neutral-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">
                  Refund Policy
                </h2>
                <span className="text-[11px] text-neutral-400">
                  30-Day Coverage &amp; Core Returns
                </span>
              </div>

              <div className="space-y-4 text-neutral-300 text-xs sm:text-sm leading-relaxed font-normal">
                <p>
                  Truck Parts Depot Auto accepts returns on eligible parts within 30 calendar days of the delivery date. To qualify for a full refund, items must be in brand-new, uninstalled, and resalable condition, complete with all original factory packaging, hardware, documentation, and manufacturer seals intact. Components that have been installed, modified, tested on a vehicle, or contaminated with fluids cannot be accepted for return due to strict commercial safety standards.
                </p>

                <p>
                  Core deposit refunds are processed independently of standard merchandise returns. Core assemblies, including turbochargers, fuel injectors, high-pressure pumps, and transmissions, must be drained of all fluids, safely packaged in the original protective casing, and returned within 45 days using the provided pre-paid bill of lading. Once received at our central distribution warehouse, our technicians inspect the unit to verify that it is fully assembled, crack-free, and rebuildable before releasing the complete core deposit refund.
                </p>

                <p>
                  All returned shipments undergo inspection by our parts specialists within 3 to 5 business days of arrival at our facility. Once approved, refunds are promptly credited back to the original method of payment used during checkout. Please allow an additional 2 to 4 business days for your financial institution to reflect the transaction, and feel free to reach out to our support specialists with your order reference if you require assistance at any stage of the process.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-xl p-5 sm:p-7 space-y-5 lg:sticky lg:top-24">
            <h2 className="text-base font-bold text-white border-b border-neutral-800/80 pb-3">
              Order Summary ({cartItems.length})
            </h2>

            {/* Cart Items List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-neutral-900 pr-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="py-3 flex gap-3 text-xs">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg bg-neutral-900 border border-neutral-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{item.product.name}</div>
                    <div className="text-[11px] text-neutral-400">
                      {item.product.brand} &bull; OEM: {item.product.oemNumber}
                    </div>
                    <div className="flex justify-between items-baseline mt-1 text-neutral-300">
                      <span>Qty: {item.quantity}</span>
                      <span className="font-bold text-white">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                    {item.product.coreDeposit ? (
                      <div className="text-[10px] text-neutral-400 text-right">
                        +${(item.product.coreDeposit * item.quantity).toLocaleString()} core
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-neutral-900 pt-4 space-y-2 text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>Parts Subtotal:</span>
                <span className="text-white font-medium">${partsSubtotal.toLocaleString()}</span>
              </div>
              {coreTotal > 0 && (
                <div className="flex justify-between">
                  <span>Refundable Core Deposit:</span>
                  <span className="text-white font-medium">${coreTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({shippingMethod === 'express' ? 'Express 1 Day' : 'Standard 1–2 Days'}):</span>
                <span className="text-white font-medium">
                  {shippingMethod === 'express'
                    ? 'Has Extra Cost'
                    : shippingFee === 0
                    ? 'FREE'
                    : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax:</span>
                <span className="text-white font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-3 border-t border-neutral-800">
                <span>Total Due:</span>
                <span>${grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {orderError && (
              <p className="text-xs text-red-400 text-center leading-relaxed" role="alert">
                {orderError}
              </p>
            )}

            {/* Submit Button */}
            <ShimmerButton
              type="submit"
              disabled={submitting}
              variant="primary"
              className="w-full justify-center py-3.5"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Placing Order...' : 'Place Order'}</span>
            </ShimmerButton>

            <p className="text-[11px] text-center text-neutral-400 leading-normal">
              No online charge today. Our team will contact you directly to confirm part details and coordinate payment.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
