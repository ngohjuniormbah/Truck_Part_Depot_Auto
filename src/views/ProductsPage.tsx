import React from 'react';
import { Package, ChevronRight, ArrowRight, Search, X } from 'lucide-react';
import { Product, TruckBrand, PartCategory, VehicleSelection, NavPage } from '../types';
import { SpotlightCard } from '../components/SpotlightCard';
import { ProductAsideSections } from '../components/ProductAsideSections';

interface ProductsPageProps {
  products: Product[];
  selectedBrand?: TruckBrand;
  onSelectBrand?: (brand: TruckBrand) => void;
  selectedCategory?: PartCategory | 'All';
  onSelectCategory?: (cat: PartCategory | 'All') => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  selectedVehicle?: VehicleSelection | null;
  onSelectVehicle?: (v: VehicleSelection | null) => void;
  onAddToCart?: (product: Product, qty?: number) => void;
  onSelectProduct?: (product: Product) => void;
  onNavigate?: (page: NavPage) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products = [],
  selectedBrand = 'All',
  onSelectBrand = (_brand: TruckBrand) => {},
  selectedCategory = 'All',
  onSelectCategory = (_cat: PartCategory | 'All') => {},
  searchQuery = '',
  onSearchChange = (_q: string) => {},
  onAddToCart = (_p: Product, _qty?: number) => {},
  onSelectProduct = (_p: Product) => {},
  onNavigate = (_page: NavPage) => {},
}) => {
  const filteredProducts = products.filter((p) => {
    const q = (searchQuery || '').trim().toLowerCase();
    const matchBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.oemNumber && p.oemNumber.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.engine && p.engine.toLowerCase().includes(q)) ||
      (p.model && p.model.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q));
    return matchBrand && matchCat && matchSearch;
  });

  const isSearching = (searchQuery || '').trim().length > 0;

  return (
    <div className="bg-white text-neutral-900 min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title & Intro */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold block">
            Commercial Inventory & OEM Replacement
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
            Commercial Truck Parts Catalog
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Direct-fit OEM, precision remanufactured, and severe-duty assemblies for Dodge / Ram Cummins, Ford Powerstroke, and GMC Duramax platforms.
          </p>

          {/* Simple Inline Brand Pills (No enclosing border box) */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 max-w-full">
            {['All', 'Dodge / Ram', 'Ford', 'GMC'].map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => onSelectBrand(brand as any)}
                className={`min-h-[38px] px-4 py-2 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center ${
                  selectedBrand === brand
                    ? 'bg-neutral-950 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {brand === 'All' ? 'All Platforms' : brand}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Active Search Feedback */}
        {isSearching && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-neutral-500 shrink-0" />
              <span className="text-sm text-neutral-700">
                Search results for <strong className="text-neutral-950 font-bold">&ldquo;{searchQuery}&rdquo;</strong>
                <span className="text-neutral-500 ml-1.5">({filteredProducts.length} {filteredProducts.length === 1 ? 'part' : 'parts'} found)</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-black px-3 py-1.5 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Search</span>
            </button>
          </div>
        )}

        {/* ============================================================
            PRODUCT SECTION (GRID)
        ============================================================ */}
        <section id="products-catalog-section" className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <div>
              <h2 className="text-xl font-black text-neutral-950 tracking-tight">
                {isSearching ? 'Matching Products' : 'All Commercial Parts'}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Showing {filteredProducts.length} items
                {selectedBrand !== 'All' && <span> &bull; {selectedBrand}</span>}
                {selectedCategory !== 'All' && <span> &bull; {selectedCategory}</span>}
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-neutral-200 p-8 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 shadow-xs">
                <Package className="w-7 h-7 text-neutral-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900">
                  {isSearching ? `No products found matching "${searchQuery}"` : 'No Products Available'}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                  {isSearching
                    ? 'We could not find any parts matching that query. Try searching by component or engine type.'
                    : 'Parts will be displayed here once available. Please check back soon or contact our desk for specific inquiries.'}
                </p>
              </div>
              {(selectedBrand !== 'All' || selectedCategory !== 'All' || isSearching) && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBrand('All');
                      onSelectCategory('All');
                      onSearchChange('');
                    }}
                    className="px-4 py-2 bg-white border border-neutral-300 text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-50 shadow-xs transition-colors cursor-pointer"
                  >
                    Clear Filters &amp; View All
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <SpotlightCard
                  key={product.id}
                  isLight={true}
                  onClick={() => onSelectProduct(product)}
                  className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative aspect-[16/10] bg-neutral-100 border-b border-neutral-200 overflow-hidden flex items-center justify-center">
                      {product.image ? (
                        <>
                          <img
                            src={product.image}
                            alt={`${product.brand} ${product.name} OEM ${product.oemNumber}`}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          {product.images && product.images.length > 1 && (
                            <span className="absolute bottom-2 right-2 bg-neutral-950/80 backdrop-blur-xs text-white text-[10px] font-mono font-medium px-1.5 py-0.5 rounded shadow-xs">
                              {product.images.length} pics
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 mb-2 shadow-sm">
                            <Package className="w-5 h-5 text-neutral-400" />
                          </div>
                          <span className="text-xs font-bold text-neutral-700">No Image Available</span>
                        </div>
                      )}
                    </div>

                    {/* Name & Brand */}
                    <div className="p-4 pb-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        {product.brand} &bull; {product.model}
                      </div>
                      <h3 className="text-sm font-bold text-neutral-950 leading-snug group-hover:text-black line-clamp-2">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  {/* Price & Shop Now Button */}
                  <div className="p-4 pt-0">
                    <div className="text-lg font-black text-neutral-950 mb-3">
                      ${product.price.toLocaleString()}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                      className="w-full min-h-[44px] py-2 bg-white text-neutral-950 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      View Details
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                    </button>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          )}
        </section>

        {/* ============================================================
            BELOW THE PRODUCT SECTION: TWO ASIDE SECTIONS (LEFT & RIGHT)
        ============================================================ */}
        <section id="products-page-aside-sections" className="space-y-4">
          <ProductAsideSections />
        </section>

        {/* Checkout CTA banner */}
        <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            Have commercial questions or need expedited palletized freight?
          </p>
          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className="px-5 py-2.5 bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            Contact Depot Specialist
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
