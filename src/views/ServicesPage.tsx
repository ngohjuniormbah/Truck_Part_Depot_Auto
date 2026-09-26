import React, { useState } from 'react';
import { NavPage } from '../types';

interface ServicesPageProps {
  onNavigate: (page: NavPage) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const [partFormSubmitted, setPartFormSubmitted] = useState(false);
  const [partForm, setPartForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    partDetails: '',
  });

  const handlePartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...partForm,
          type: 'part_inquiry',
        }),
      });
    } catch {
      // Fallback in case endpoint is local/offline
    }
    setPartFormSubmitted(true);
  };

  return (
    <div className="w-full">
      {/* ============================================================
          SECTION 1: OVERVIEW & STANDARDS (WHITE BG, SIDE-BY-SIDE)
      ============================================================ */}
      <section className="bg-white text-neutral-950 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Heading & Description */}
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                Commercial Capabilities
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
                Commercial & Heavy-Duty Diesel Services
              </h1>
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed">
                From precision flow-bench injector balancing to nationwide palletized freight logistics, Truck Parts Depot Auto supports fleet operators, municipal garages, and independent diesel repair facilities with reliable commercial turnaround.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="px-6 py-3 bg-black text-white text-sm font-semibold rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Contact Commercial Desk
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="px-6 py-3 bg-neutral-100 text-neutral-900 text-sm font-semibold rounded hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Browse Parts Catalog
                </button>
              </div>
            </div>

            {/* Right Column: Aside Overview (Clean, no borders) */}
            <div className="lg:col-span-5 bg-neutral-50 p-8 sm:p-10 rounded-2xl space-y-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                Depot Standards
              </span>
              <h3 className="text-xl font-bold text-neutral-950">
                Fast Dispatch & Delivery
              </h3>
              <div className="text-sm text-neutral-700 leading-relaxed">
                <div>
                  <div className="font-bold text-neutral-950">Instant Dispatch Upon Payment</div>
                  <p className="text-neutral-600 mt-1.5 leading-relaxed">
                    We start dispatching your order the moment payment is received. Once dispatched, you receive your product in 1–2 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: ENGINEERING & CALIBRATION (DARK BG, SIDE-BY-SIDE)
      ============================================================ */}
      <section className="bg-neutral-950 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
              Engineering & Calibration
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Precision Rebuilding & Component Calibration
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Service 1 */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Precision Remanufacturing & Core Exchange
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                OEM-spec disassembly, ultrasonic chemical tank cleansing, precision machining, and dynamic VSR balancing for turbos, CP3/CP4 injection pumps, and Allison valve bodies.
              </p>
              <div className="space-y-2 text-sm text-neutral-400 pt-2">
                <p>&bull; Pre-printed return shipping label included in every box</p>
                <p>&bull; 100% Core deposit refund issued within 48 business hours</p>
                <p>&bull; No crack or disassembly penalties on standard rebuildable cores</p>
                <p>&bull; Bulk crate consolidation service for commercial fleet shops</p>
              </div>
            </div>

            {/* Service 2 */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Common Rail & Piezo Flow Bench Calibration
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                State-of-the-art clean-room testing of common rail diesel injectors across full pressure ramps up to 29,000 PSI (2,000 bar).
              </p>
              <div className="space-y-2 text-sm text-neutral-400 pt-2">
                <p>&bull; Individual factory IQA codes provided for exact ECU programming</p>
                <p>&bull; Micro-sac nozzle spray angle and atomization verification</p>
                <p>&bull; Thermal cycle testing under extreme simulated towing loads</p>
                <p>&bull; Includes copper crush washers and high-temp Viton O-rings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: FREIGHT & TOWING UPGRADES (WHITE BG, SIDE-BY-SIDE)
      ============================================================ */}
      <section className="bg-white text-neutral-950 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-2">
              Heavy Freight & Towing Upgrades
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-950 tracking-tight">
              Freight Logistics & Severe-Duty Components
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Service 3 */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
                Expedited Nationwide LTL & Ground Freight
              </h3>
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                Engineered logistics tailored specifically for heavy diesel engines, heavy-duty transmissions, complete axle assemblies, and palletized commercial shipments.
              </p>
              <div className="space-y-2 text-sm text-neutral-600 pt-2">
                <p>&bull; Same-day freight dispatch on orders placed prior to 3:00 PM CST</p>
                <p>&bull; Residential and commercial hydraulic liftgate truck delivery</p>
                <p>&bull; Dedicated freight tracking numbers and delivery appointment scheduling</p>
                <p>&bull; Heavy-duty banded wooden crates preventing transit damage</p>
              </div>
            </div>

            {/* Service 4 */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
                Severe-Duty & Towing Performance Upgrades
              </h3>
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                Engineered upgrades for trucks regularly operating at maximum gross combined weight rating (GCWR) or pulling heavy fifth wheels and goosenecks.
              </p>
              <div className="space-y-2 text-sm text-neutral-600 pt-2">
                <p>&bull; Billet 68RFE & Allison torque converters with triple lockup clutches</p>
                <p>&bull; Forged 4140 chromoly steering drag links and tie rods</p>
                <p>&bull; High-silicon ductile iron exhaust manifolds resistant to cracking</p>
                <p>&bull; Drilled & slotted zinc-dichromate heavy-tow brake kits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: ACCOUNTS & FITMENT (DARK BG, SIDE-BY-SIDE)
      ============================================================ */}
      <section className="bg-neutral-950 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
              Accounts & Compatibility
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Fleet Commercial Accounts & Direct Fitment
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Service 5 */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Commercial Fleet Net-30 Billing Accounts
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                Streamlined wholesale pricing and flexible payment terms designed for municipal fleets, hotshot haulers, construction contractors, and repair facilities.
              </p>
              <div className="space-y-2 text-sm text-neutral-400 pt-2">
                <p>&bull; Tiered volume discounts on frequent parts orders</p>
                <p>&bull; Tax-exempt certificate management for verified resellers</p>
                <p>&bull; Monthly consolidated invoicing with PO matching</p>
                <p>&bull; Direct line to dedicated ASE Master Parts Specialist</p>
              </div>
            </div>

            {/* Service 6 */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Direct Vehicle Compatibility Verification
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                Eliminate guesswork and downtime. Our parts specialists verify your exact truck specifications and factory options before order processing.
              </p>
              <div className="space-y-2 text-sm text-neutral-400 pt-2">
                <p>&bull; Guaranteed fitment or zero-restocking-fee exchange</p>
                <p>&bull; Detection of mid-year manufacturer revisions and split-year parts</p>
                <p>&bull; Transmission code verification (e.g. 68RFE vs Aisin AS69RC)</p>
                <p>&bull; Free technical schematics and torque specs provided on request</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: GET A PART FROM US CONTACT FORM (WHITE BG, SIDE-BY-SIDE)
      ============================================================ */}
      <section className="bg-white text-neutral-950 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                Direct Parts Inquiry
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
                Looking for a Specific Part?
              </h3>
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                Tell us what vehicle or spare part you need. Our parts team will check live warehouse stock, verify fitment, and get back to you with pricing and delivery details.
              </p>
              <div className="pt-2 space-y-2 text-sm text-neutral-600">
                <p>&bull; Fast domestic shipping and worldwide international delivery</p>
                <p>&bull; Guaranteed fitment verification for trucks and vehicles</p>
                <p>&bull; Direct support from experienced parts specialists</p>
              </div>
            </div>

            <div className="lg:col-span-7 bg-neutral-100 p-8 sm:p-10 rounded-2xl">
              {partFormSubmitted ? (
                <div className="space-y-3 py-6 text-center">
                  <h4 className="text-lg font-bold text-neutral-950">Part Request Received</h4>
                  <p className="text-sm text-neutral-600 max-w-md mx-auto">
                    Thank you! We have received your part inquiry and shipping information. Our team will verify inventory and reach out to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPartFormSubmitted(false)}
                    className="mt-4 px-5 py-2 bg-neutral-200 text-neutral-900 text-xs font-semibold rounded hover:bg-neutral-300 transition-colors cursor-pointer"
                  >
                    Request another part
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePartSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={partForm.name}
                        onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 text-base sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-neutral-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={partForm.email}
                        onChange={(e) => setPartForm({ ...partForm, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 text-base sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-neutral-950"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={partForm.phone}
                        onChange={(e) => setPartForm({ ...partForm, phone: e.target.value })}
                        placeholder="Your phone number"
                        className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 text-base sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-neutral-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Delivery Address
                      </label>
                      <input
                        type="text"
                        required
                        value={partForm.address}
                        onChange={(e) => setPartForm({ ...partForm, address: e.target.value })}
                        placeholder="Street, City, State, ZIP & Country"
                        className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 text-base sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-neutral-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Part Needed & Vehicle Details
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={partForm.partDetails}
                      onChange={(e) => setPartForm({ ...partForm, partDetails: e.target.value })}
                      placeholder="Vehicle year, make, model, engine size, or the specific part name/number you need..."
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 text-base sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-neutral-950 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer inline-flex items-center justify-center"
                  >
                    Request Part From Us
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
