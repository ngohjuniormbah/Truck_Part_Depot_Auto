import React from 'react';
import { NavPage } from '../types';

interface AboutPageProps {
  onNavigate: (page: NavPage) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-black text-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header / Hero Section */}
        <div className="max-w-3xl space-y-5">
          <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block">
            About Our Company
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Selling Quality Car & Truck Spare Parts Since 2012
          </h1>
          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
            We started in 2012 with Dodge Ram parts, later adding GMC parts, and then expanding into Ford parts in 2020 and beyond. With over a decade of continuous service in the automotive business, we have built the hands-on experience needed to get you the exact parts your vehicle requires.
          </p>
        </div>

        {/* Core Capabilities - 3 Columns, Clean Text, No Borders, No Boxes, No Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">In Business Since 2012</h3>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              We started in 2012 specializing in Dodge Ram parts, later added GMC parts, and then incorporated Ford parts in 2020 and beyond. Our deep background ensures you get the right part every time.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">Domestic & Worldwide Shipping</h3>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              We ship domestically and internationally. Whether you order domestically or internationally, we package every spare part securely for prompt and safe delivery.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">Always Satisfying Customers</h3>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Customer satisfaction is our priority. We stand behind every part we sell, providing fitment verification, fair pricing, and dependable support whenever you need help with your vehicle.
            </p>
          </div>
        </div>

        {/* Experience & Logistics - Simple Text, No Box / Border */}
        <div className="space-y-10">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block">
              Experience & Logistics
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Experienced in What We Do
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              With years of hands-on automotive knowledge, we understand the technical specifications that keep vehicles running. From heavy-duty diesel truck components to passenger car replacement parts, our catalog is selected for durability and exact fitment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">Extensive Parts Selection</h4>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Engines, transmissions, fuel injection systems, turbos, steering racks, suspension parts, and heavy-duty towing kits.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">Domestic & Global Reach</h4>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Fast dispatch and direct international shipping worldwide.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">Fitment Guarantee</h4>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Provide your vehicle details and our specialists will double-check compatibility before processing.
              </p>
            </div>
          </div>
        </div>

        {/* Simple Call to Action - Clean Open Text, No Box / Border */}
        <div className="space-y-5 pt-6">
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Need Help Finding the Right Part?
          </h3>
          <p className="text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
            Our experienced parts team is ready to help you find the exact spare part you need with fast domestic or international delivery.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-6 py-3 bg-white text-black font-semibold text-sm rounded hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Browse Parts Catalog
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 bg-neutral-800 text-white font-semibold text-sm rounded hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
