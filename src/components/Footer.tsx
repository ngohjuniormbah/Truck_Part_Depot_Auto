import React from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { NavPage } from '../types';

interface FooterProps {
  onNavigate: (page: NavPage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-black text-neutral-400 border-t border-neutral-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1 row, 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-neutral-900">
          {/* Column 1: Brand / About */}
          <div className="space-y-4">
            <span className="text-lg sm:text-xl font-black tracking-tight text-white block">
              TRUCK PARTS DEPOT AUTO
            </span>
            <p className="text-sm text-neutral-300 font-medium">
              Selling Quality Car &amp; Truck Spare Parts Since 2012.
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              America&apos;s premier commercial distributor of OEM, remanufactured, and severe-duty performance parts for heavy-duty pickup trucks.
            </p>
            <p className="text-xs text-neutral-500 font-medium">
              Coverage: Ford 1999–2025 &bull; GMC 2007–2025 &bull; Ram 2009–2025
            </p>
          </div>

          {/* Column 2: Depot Catalog */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Depot Catalog
            </h4>
            <ul className="space-y-1 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-1.5 min-h-[36px] flex items-center"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-1.5 min-h-[36px] flex items-center"
                >
                  Commercial Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-1.5 min-h-[36px] flex items-center"
                >
                  Products Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-1.5 min-h-[36px] flex items-center"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-1.5 min-h-[36px] flex items-center"
                >
                  Customer Builds Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('reviews')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-1.5 min-h-[36px] flex items-center"
                >
                  Verified Owner Reviews
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-1.5 min-h-[36px] flex items-center"
                >
                  Contact Desk
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('refund-policy')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-1.5 min-h-[36px] flex items-center"
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('checkout')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-1.5 min-h-[36px] flex items-center"
                >
                  Checkout & Freight
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Specialties */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Specialties
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>Turbocharger VGT Calibration</li>
              <li>Common Rail Injector Testing</li>
              <li>Billet Allison & 68RFE Converters</li>
              <li>Pre-Paid Core Return Program</li>
              <li>Expedited LTL Freight Logistics</li>
            </ul>
          </div>

          {/* Column 4: Contact & Depot */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Contact & Depot
            </h4>
            <div className="space-y-3 text-sm text-neutral-400">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-white shrink-0" />
                <a
                  href="tel:+17348588599"
                  className="text-white font-semibold hover:text-neutral-200 transition-colors"
                >
                  (734) 858-8599
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-white shrink-0" />
                <a
                  href="mailto:partsdepott@gmail.com"
                  className="hover:text-white transition-colors truncate"
                >
                  partsdepott@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-neutral-400">Same-day cutoff: 3:00 PM CST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-neutral-400">
          <p>&copy; {new Date().getFullYear()} Truck Parts Depot Auto. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-neutral-500">OEM Brand trademarks belong to their respective holders.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
