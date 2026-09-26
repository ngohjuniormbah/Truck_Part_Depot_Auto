import React from 'react';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-8">
          Refund Policy
        </h1>

        <div className="space-y-6 text-neutral-300 text-base sm:text-lg leading-relaxed font-normal">
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
  );
};
