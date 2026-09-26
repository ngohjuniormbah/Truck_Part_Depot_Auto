import React, { useState } from 'react';
import { Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    truckDetails: '',
    subject: 'Parts Compatibility & Availability',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch {
      // fallback
    }
    setSubmitted(true);
  };

  return (
    <div className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Connect With A Diesel Parts Specialist
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Need fitment confirmation, commercial freight delivery rates, or help returning a core? Our team of ASE-certified parts technicians is available 6 days a week.
          </p>
        </div>

        {/* Quick Contact & Fulfillment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-white shrink-0" />
              <h3 className="text-sm font-bold text-white">Depot Operating Hours</h3>
            </div>
            <div className="space-y-1 text-xs text-neutral-400">
              <p>Monday &ndash; Friday: 6 AM &ndash; 7 PM CST</p>
              <p>Saturday: 8 AM &ndash; 3 PM CST</p>
            </div>
            <div className="pt-2 border-t border-neutral-800/80">
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 space-y-1">
                <span className="font-semibold text-white block">Dispatch &amp; Cutoff Policy</span>
                <p className="text-neutral-400 leading-relaxed">
                  For orders made after 3:00 PM, the shipment is done the next day. Otherwise, the shipment is done that same day.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-white shrink-0" />
              <h3 className="text-sm font-bold text-white">Order Dispatch</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              When order is made, we start preparing the dispatch immediately.
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Have questions regarding parts compatibility, fitment, or urgent dispatch requests? Submit the message form below and our specialists will respond promptly.
            </p>
          </div>
        </div>

        {/* Contact Form & Distribution Centers */}
        <div className="max-w-2xl mx-auto">
          {/* Form */}
          <div className="bg-neutral-950 rounded-2xl p-8 sm:p-10 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-white tracking-tight">Contact Us</h3>
              <p className="text-sm text-neutral-400">
                We reply ASAP within or less than no time.
              </p>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-white mx-auto" />
                <h4 className="text-lg font-bold text-white">Message Sent</h4>
                <p className="text-xs text-neutral-300">
                  Thank you! We received your message and will reply ASAP within or less than no time.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      company: '',
                      truckDetails: '',
                      subject: 'Parts Compatibility & Availability',
                      message: '',
                    });
                  }}
                  className="mt-4 px-5 py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full Name"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-base sm:text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-neutral-500 placeholder-neutral-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone Number"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-base sm:text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-neutral-500 placeholder-neutral-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email Address"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-base sm:text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-neutral-500 placeholder-neutral-500"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full min-h-[48px] py-3 bg-white text-black font-bold text-sm rounded-lg hover:bg-neutral-200 transition-all active:scale-[0.99] cursor-pointer inline-flex items-center justify-center"
                  >
                    Send
                  </button>
                </div>
                <p className="text-xs text-center text-neutral-400 pt-1">
                  We reply ASAP within or less than no time.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
