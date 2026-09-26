import React from 'react';
import { FadeIn } from './FadeIn';

interface ProductAsideSectionsProps {
  className?: string;
}

export const ProductAsideSections: React.FC<ProductAsideSectionsProps> = ({ className = '' }) => {
  return (
    <FadeIn delay={0.1} className={`w-full ${className}`}>
      <div id="product-shipping-policy-container" className="pt-10 border-t border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Section 1: Free Shipping on Orders Over $1,000 */}
          <div id="shipping-policy-qualifying-orders" className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Shipping Policy
            </span>
            <h3 className="text-base sm:text-lg font-bold text-neutral-950 tracking-tight">
              Free Shipping on Orders Over $1,000
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              We provide complimentary standard and commercial freight shipping on all qualifying orders totaling $1,000 or more. Whether you are purchasing heavy-duty replacement assemblies, turbochargers, or essential fleet maintenance inventory, the free shipping discount is automatically applied during checkout with no promotional codes required.
            </p>
          </div>

          {/* Section 2: Secure Packaging & Commercial Dispatch */}
          <div id="shipping-policy-dispatch-delivery" className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Freight & Logistics
            </span>
            <h3 className="text-base sm:text-lg font-bold text-neutral-950 tracking-tight">
              Secure Packaging & Direct Commercial Delivery
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              All qualifying freight shipments are palletized, crated, and protected to ensure your parts arrive in ready-to-install condition. Orders are dispatched quickly with full carrier tracking provided directly to your shop, fleet terminal, or commercial repair depot so you can minimize vehicle downtime without transit cost surprises.
            </p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};
