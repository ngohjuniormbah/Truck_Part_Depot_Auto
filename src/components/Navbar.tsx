import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ShoppingBag, Menu, X, ArrowRight, Package } from 'lucide-react';
import { NavPage, TruckBrand, Product } from '../types';

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  selectedBrand?: TruckBrand;
  onSelectBrand?: (brand: TruckBrand) => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  cartCount,
  onOpenCart,
  searchQuery = '',
  onSearchChange = (_q: string) => {},
  products = [],
  onSelectProduct = (_p: Product) => {},
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const navLinks: { id: NavPage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'products', label: 'Products' },
    { id: 'about', label: 'About' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
    { id: 'refund-policy', label: 'Refund Policy' },
  ];

  // Live search matching for instant results dropdown
  const matchingProducts = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q || !products.length) return [];
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.oemNumber && p.oemNumber.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.model && p.model.toLowerCase().includes(q)) ||
        (p.engine && p.engine.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, products]);

  // Handle outside click to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchFocused(false);
    onNavigate('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductPick = (product: Product) => {
    setIsSearchFocused(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      onNavigate('products');
    }
  };

  const showDropdown = isSearchFocused && (searchQuery || '').trim().length > 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4 md:gap-6">
          {/* Brand Name Logo */}
          <div
            id="nav-brand-logo"
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="cursor-pointer shrink-0 select-none py-1 flex items-center"
          >
            <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-neutral-950 hover:text-neutral-700 transition-colors whitespace-nowrap">
              Truck Parts Depot
            </span>
          </div>

          {/* Primary Nav Links */}
          <nav className="hidden lg:flex items-center space-x-5 xl:space-x-6">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => onNavigate(link.id)}
                  className={`text-sm transition-colors py-1 cursor-pointer ${
                    isActive
                      ? 'text-black font-semibold'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Working Search Bar with Instant Results Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-[160px] sm:max-w-xs md:max-w-md min-w-0">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div
                id="clean-search-bar"
                className="flex items-center gap-1.5 sm:gap-2 bg-neutral-100 border border-neutral-200 focus-within:border-neutral-400 focus-within:bg-white rounded-full px-2.5 sm:px-3.5 py-1.5 transition-colors"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery || ''}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    if (!isSearchFocused) setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsSearchFocused(false);
                    }
                  }}
                  placeholder="Search parts..."
                  className="w-full bg-transparent text-xs sm:text-sm text-black placeholder-neutral-500 focus:outline-none min-w-0"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange('');
                      setIsSearchFocused(false);
                    }}
                    className="text-neutral-400 hover:text-black p-0.5 transition-colors shrink-0 cursor-pointer min-w-[24px] min-h-[24px] flex items-center justify-center"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Instant Search Dropdown Popover */}
            {showDropdown && (
              <div className="absolute top-full -left-12 right-0 sm:left-0 sm:right-0 mt-2 w-[calc(100vw-3rem)] sm:w-auto max-w-md bg-white rounded-xl border border-neutral-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2.5 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                  <span>
                    {matchingProducts.length > 0
                      ? `Found ${matchingProducts.length} matching ${matchingProducts.length === 1 ? 'part' : 'parts'}`
                      : 'No matching parts found'}
                  </span>
                  <span className="text-[10px] text-neutral-400 hidden sm:inline">Press Enter for catalog</span>
                </div>

                {matchingProducts.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-neutral-600 font-medium">
                      No products found matching &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Try searching by brand (Ford, GMC, Ram) or component (turbo, injector).
                    </p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                    {matchingProducts.slice(0, 5).map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleProductPick(prod)}
                        className="w-full flex items-center gap-3 p-2.5 hover:bg-neutral-50 text-left transition-colors cursor-pointer group"
                      >
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-lg bg-neutral-100 border border-neutral-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-neutral-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-neutral-900 group-hover:text-black truncate">
                            {prod.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                            <span className="font-medium text-neutral-700">{prod.brand}</span>
                            <span>&bull;</span>
                            <span className="font-mono text-neutral-400">{prod.oemNumber}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-neutral-950">
                            ${prod.price.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {matchingProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSearchSubmit();
                      onNavigate('products');
                    }}
                    className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View all {matchingProducts.length} results in Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Action: Cart & Mobile Menu */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              id="nav-cart-btn"
              type="button"
              onClick={onOpenCart}
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-800 hover:text-black transition-colors cursor-pointer"
              title="View Cart"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-black text-white rounded-full leading-none">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-800 hover:text-black transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer min-h-[44px] flex items-center ${
                currentPage === link.id
                  ? 'text-black font-bold bg-neutral-100'
                  : 'text-neutral-700 hover:text-black hover:bg-neutral-50'
              }`}
            >
              {link.label}
            </button>
          ))}

        </div>
      )}
    </header>
  );
};
