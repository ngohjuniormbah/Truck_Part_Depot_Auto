import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ChevronRight,
  Package,
  ChevronLeft,
  Star,
} from 'lucide-react';
import { Product, TruckBrand, PartCategory, NavPage, Review, GalleryItem } from '../types';
import { SpotlightCard } from '../components/SpotlightCard';
import { ShimmerButton } from '../components/ShimmerButton';
import { FadeIn } from '../components/FadeIn';
import { ProductAsideSections } from '../components/ProductAsideSections';

interface HomePageProps {
  products: Product[];
  reviews?: Review[];
  gallery?: GalleryItem[];
  selectedCategory?: PartCategory;
  onSelectCategory?: (cat: PartCategory) => void;
  selectedVehicle?: unknown;
  onSelectVehicle?: (veh: unknown) => void;
  onAddToCart?: (product: Product) => void;
  onNavigate: (page: NavPage) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  selectedBrand?: TruckBrand;
  onSelectBrand?: (brand: TruckBrand) => void;
  onOpenProductModal?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products = [],
  reviews = [],
  gallery = [],
  onNavigate,
  searchQuery = '',
  onSearchChange = (_q: string) => {},
  selectedBrand = 'All',
  onSelectBrand = (_brand: TruckBrand) => {},
  onSelectProduct = (_p: Product) => {},
  onAddToCart = (_p: Product) => {},
}) => {
  // Category selection for the product catalog
  const [selectedCategory] = useState<PartCategory>('All');

  // Contact form state in section 10
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Reviews for the 1-row, 4-columns review section
  const displayedReviews = useMemo(() => {
    return reviews ? (reviews as Review[]).slice(0, 4) : [];
  }, [reviews]);

  // Gallery items for the slideshow section
  const displayedGallery = useMemo(() => {
    return gallery ? (gallery as GalleryItem[]) : [];
  }, [gallery]);

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  // Slideshow that automatically advances from left to right every 3.5 seconds
  useEffect(() => {
    if (displayedGallery.length <= 1) return;
    const interval = setInterval(() => {
      setActiveGalleryIndex((prev) => (prev + 1) % displayedGallery.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [displayedGallery.length]);

  const nextGallerySlide = () => {
    setActiveGalleryIndex((prev) => (prev + 1) % displayedGallery.length);
  };

  const prevGallerySlide = () => {
    setActiveGalleryIndex((prev) => (prev - 1 + displayedGallery.length) % displayedGallery.length);
  };

  // Filtered products list matching search and filters
  const filteredProducts = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return products.filter((p) => {
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
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));
      return matchBrand && matchCat && matchSearch;
    });
  }, [products, selectedBrand, selectedCategory, searchQuery]);

  // Featured products when no search is active: 1 row of 4 items
  const featuredProducts = useMemo(() => {
    const brandProducts = products.filter(
      (p) => selectedBrand === 'All' || p.brand === selectedBrand
    );
    const featuredOnly = brandProducts.filter((p) => p.featured);
    if (featuredOnly.length >= 4) return featuredOnly.slice(0, 4);
    const combined = [...featuredOnly];
    for (const p of brandProducts) {
      if (!combined.some((item) => item.id === p.id)) {
        combined.push(p);
      }
      if (combined.length === 4) break;
    }
    return combined.slice(0, 4);
  }, [products, selectedBrand]);

  // Catalog products when no search is active: 2 rows of 4 items (8 items)
  const productSectionProducts = useMemo(() => {
    const featuredIds = new Set(featuredProducts.map((p) => p.id));
    const nonFeatured = filteredProducts.filter((p) => !featuredIds.has(p.id));
    if (nonFeatured.length >= 8) {
      return nonFeatured.slice(0, 8);
    }
    const combined = [...nonFeatured];
    for (const p of filteredProducts) {
      if (!combined.some((item) => item.id === p.id)) {
        combined.push(p);
      }
      if (combined.length === 8) break;
    }
    return combined.slice(0, 8);
  }, [filteredProducts, featuredProducts]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactEmail) return;
    try {
      await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          phone: contactPhone,
          email: contactEmail,
          message: 'Website contact form inquiry',
        }),
      });
    } catch {
      // ignore
    }
    setContactSubmitted(true);
  };

  return (
    <div className="bg-black text-white selection:bg-white selection:text-black">
      {/* ============================================================
          SECTION 1: HERO SECTION (DARK GRADIENT STYLING)
      ============================================================ */}
      <section className="relative pt-16 pb-20 border-b border-neutral-800 overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
        {/* Subtle dark gradient glow and grid accents */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(120,119,198,0.12),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="space-y-6 flex flex-col items-center">
            {/* Authoritative Headline with FadeIn */}
            <FadeIn direction="up" delay={0.1} duration={0.65}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                AMERICAN TRUCK <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
                  SPARE PARTS DEPOT
                </span>
              </h1>
            </FadeIn>

            {/* Subtitle with FadeIn */}
            <FadeIn direction="up" delay={0.25} duration={0.65}>
              <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mx-auto">
                Dedicated commercial supply of OEM remanufactured and severe-duty performance parts for <strong className="text-white font-bold">Dodge Ram Cummins</strong>, <strong className="text-white font-bold">Ford Super Duty & F-150</strong>, and <strong className="text-white font-bold">GMC Sierra HD</strong> pickup trucks.
              </p>
            </FadeIn>

            {/* Action Buttons with FadeIn */}
            <FadeIn direction="up" delay={0.35} duration={0.65}>
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                <a href="#catalog-section">
                  <ShimmerButton variant="primary">
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </ShimmerButton>
                </a>
                <ShimmerButton
                  variant="secondary"
                  onClick={() => onNavigate('services')}
                >
                  <span>Services</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </ShimmerButton>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: SERVICES SECTION
      ============================================================ */}
      <section id="services-section" className="py-16 bg-neutral-950 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Centered Header: Services with FadeIn */}
          <FadeIn className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Services
            </h2>
            <p className="text-base text-neutral-400 mt-3 leading-relaxed">
              We sell car and truck spare parts from Dodge Ram to Ford and GMC. We offer fast and on-time delivery, domestic and international shipping.
            </p>
          </FadeIn>

          {/* Clean 4 Columns - Simple, Clean with 21st.dev FadeIn Staggering */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
            <FadeIn delay={0.05} className="space-y-2 p-3 -m-3 rounded-xl hover:bg-neutral-900/50 transition-colors">
              <h3 className="text-base font-bold text-white tracking-tight">
                Dodge Ram, Ford & GMC Parts
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Specialized in genuine OEM remanufactured and severe-duty spare parts for Dodge Ram, Ford Super Duty and F-150, and GMC Sierra.
              </p>
            </FadeIn>

            <FadeIn delay={0.15} className="space-y-2 p-3 -m-3 rounded-xl hover:bg-neutral-900/50 transition-colors">
              <h3 className="text-base font-bold text-white tracking-tight">
                Fast & On-Time Delivery
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Reliable, prompt dispatch and strict on-schedule delivery to eliminate vehicle downtime and keep you running.
              </p>
            </FadeIn>

            <FadeIn delay={0.25} className="space-y-2 p-3 -m-3 rounded-xl hover:bg-neutral-900/50 transition-colors">
              <h3 className="text-base font-bold text-white tracking-tight">
                Domestic Shipping
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Nationwide freight and ground delivery across all 50 states directly to your door, commercial shop, or garage.
              </p>
            </FadeIn>

            <FadeIn delay={0.35} className="space-y-2 p-3 -m-3 rounded-xl hover:bg-neutral-900/50 transition-colors">
              <h3 className="text-base font-bold text-white tracking-tight">
                International Shipping
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Worldwide international export to Canada, Europe, Asia, and global destinations with complete export packaging.
              </p>
            </FadeIn>
          </div>

          {/* Link to Services Page */}
          <FadeIn delay={0.4} className="text-center pt-10">
            <button
              type="button"
              onClick={() => onNavigate('services')}
              className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              Explore Commercial Services Page
              <ArrowRight className="w-4 h-4" />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================
          IN-STOCK & INVENTORY AVAILABILITY (SUMMARIZED, WHITE BG, LINE-HEIGHT 1.5)
      ============================================================ */}
      <section id="stock-availability-section" className="py-10 sm:py-12 bg-white text-neutral-900">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-3.5 text-center sm:text-left">
          <motion.p
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-base sm:text-lg font-semibold text-neutral-950 leading-[1.5]"
          >
            All parts for Dodge Ram, Ford, and GMC are physically stocked on-site in our central warehouse—guaranteeing verified inventory with zero drop-shipping or backorder delays.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.7,
              delay: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-sm sm:text-base text-neutral-700 leading-[1.5]"
          >
            From high-torque transmissions and turbochargers to fuel injectors and steering assemblies, every unit is inspected, cataloged, and ready for immediate pulling and boxing.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.7,
              delay: 0.34,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-sm sm:text-base text-neutral-600 leading-[1.5]"
          >
            Because our parts are on the shelf and ready to ship today, we dispatch orders same-day nationwide and internationally to get your truck back on the road without downtime.
          </motion.p>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: PRODUCT SECTIONS (WHITE BACKGROUND, 2 ROWS)
          Row 1: Feature Section
          Row 2: Products found on the page
      ============================================================ */}
      <section id="catalog-section" className="py-16 bg-white border-b border-neutral-200 text-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered Heading: Featured Product Section */}
          <FadeIn className="text-center max-w-3xl mx-auto mb-6">
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
              Featured Product Section
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">
              High-demand OEM remanufactured and verified spare parts ready for immediate delivery.
            </p>
          </FadeIn>

          {/* Horizontal Bar: All, and the types of brand of cars */}
          <FadeIn delay={0.1} className="flex justify-start sm:justify-center mb-12 overflow-x-auto pb-2 sm:pb-0">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-xl border border-neutral-200 bg-neutral-100/90 shadow-sm shrink-0">
              {(['All', 'Dodge / Ram', 'Ford', 'GMC'] as TruckBrand[]).map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => onSelectBrand(brand)}
                  className={`min-h-[40px] px-4 sm:px-5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center justify-center ${
                    selectedBrand === brand
                      ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/60'
                  }`}
                >
                  {brand === 'All' ? 'All Platforms' : brand}
                </button>
              ))}
            </div>
          </FadeIn>

          {(searchQuery || '').trim().length > 0 ? (
            /* SEARCH RESULTS VIEW */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
                    Search Results for &ldquo;{searchQuery}&rdquo;
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                    Found <strong className="text-neutral-950">{filteredProducts.length}</strong> matching {filteredProducts.length === 1 ? 'part' : 'parts'}
                    {selectedBrand !== 'All' && (
                      <span> in <strong className="text-neutral-950">{selectedBrand}</strong></span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="self-start sm:self-auto text-xs font-semibold text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-200 p-8 space-y-3">
                  <Package className="w-10 h-10 text-neutral-400 mx-auto" />
                  <h4 className="text-base font-bold text-neutral-900">No products found matching &ldquo;{searchQuery}&rdquo;</h4>
                  <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                    We couldn&apos;t find any parts matching that name or part number. Try searching for &ldquo;turbo&rdquo;, &ldquo;injector&rdquo;, &ldquo;Ford&rdquo;, or &ldquo;Duramax&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange('');
                      onSelectBrand('All');
                    }}
                    className="mt-2 px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    View Full Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <SpotlightCard
                      key={product.id}
                      isLight={true}
                      onClick={() => {
                        if (onSelectProduct) {
                          onSelectProduct(product);
                        }
                      }}
                      className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all group cursor-pointer"
                    >
                      <div>
                        {/* Product Image */}
                        <div className="relative aspect-[16/10] bg-neutral-100 border-b border-neutral-200 overflow-hidden flex items-center justify-center">
                          {product.image ? (
                            <>
                              <img
                                src={product.image}
                                alt={product.name}
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
                              <span className="text-xs font-bold text-neutral-700">OEM Replacement</span>
                            </div>
                          )}
                        </div>

                        {/* Name & Details */}
                        <div className="p-4 pb-2">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                            {product.brand} &bull; {product.category}
                          </span>
                          <h4 className="text-sm font-bold text-neutral-950 leading-snug group-hover:text-black line-clamp-2">
                            {product.name}
                          </h4>
                          <span className="font-mono text-[11px] text-neutral-400 block mt-1">
                            OEM #{product.oemNumber}
                          </span>
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
                            if (onSelectProduct) {
                              onSelectProduct(product);
                            }
                          }}
                          className="w-full py-2 bg-white text-neutral-950 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Shop Now
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                        </button>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* ROW 1: THE FEATURE SECTION */}
              <FadeIn delay={0.15} className="mb-14">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-100">
                  <h3 className="text-xl font-black text-neutral-950 tracking-tight">
                    Featured Products
                  </h3>
                  <span className="text-xs text-neutral-500 font-medium">
                    {selectedBrand === 'All' ? 'Top High-Demand Selections' : `Featured ${selectedBrand} Selections`}
                  </span>
                </div>

                {featuredProducts.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200 p-8 space-y-2">
                    <Package className="w-9 h-9 text-neutral-400 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-neutral-900">No Featured Products Yet</h4>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto">
                      All products are managed and published dynamically through the Admin inventory portal.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.slice(0, 4).map((product) => (
                      <SpotlightCard
                        key={product.id}
                        isLight={true}
                        onClick={() => {
                          if (onSelectProduct) {
                            onSelectProduct(product);
                          }
                        }}
                        className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div>
                          {/* Product Image */}
                          <div className="relative aspect-[16/10] bg-neutral-100 border-b border-neutral-200 overflow-hidden flex items-center justify-center">
                            {product.image ? (
                              <>
                                <img
                                  src={product.image}
                                  alt={product.name}
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
                                <span className="text-xs font-bold text-neutral-700">OEM Replacement</span>
                              </div>
                            )}
                          </div>

                          {/* Name of the Product */}
                          <div className="p-4 pb-2">
                            <h4 className="text-sm font-bold text-neutral-950 leading-snug group-hover:text-black line-clamp-2">
                              {product.name}
                            </h4>
                          </div>
                        </div>

                        {/* Price & Shop Now Button in White Color */}
                        <div className="p-4 pt-0">
                          <div className="text-lg font-black text-neutral-950 mb-3">
                            ${product.price.toLocaleString()}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectProduct) {
                                onSelectProduct(product);
                              }
                            }}
                            className="w-full py-2 bg-white text-neutral-950 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            Shop Now
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                          </button>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>
                )}
              </FadeIn>

              {/* ROW 2: THE PRODUCTS SECTION (2 ROWS, 4 COLUMNS = 8 ITEMS) */}
              <FadeIn delay={0.2}>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-100">
                  <h3 className="text-xl font-black text-neutral-950 tracking-tight">
                    Products
                  </h3>
                  <span className="text-xs text-neutral-500">
                    Showing <strong className="text-neutral-950">{productSectionProducts.length}</strong> items
                    {selectedBrand !== 'All' && (
                      <span> for <strong className="text-neutral-950">{selectedBrand}</strong></span>
                    )}
                  </span>
                </div>

                {productSectionProducts.length === 0 ? (
                  <div className="text-center py-14 bg-neutral-50 rounded-xl border border-neutral-200 p-8 space-y-3">
                    <Package className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                    <h4 className="text-base font-bold text-neutral-900">No Products Available</h4>
                    <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                      Commercial truck parts will be displayed here once catalog items are published.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {productSectionProducts.map((product) => (
                      <SpotlightCard
                        key={product.id}
                        isLight={true}
                        onClick={() => {
                          if (onSelectProduct) {
                            onSelectProduct(product);
                          }
                        }}
                        className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div>
                          {/* Product Image */}
                          <div className="relative aspect-[16/10] bg-neutral-100 border-b border-neutral-200 overflow-hidden flex items-center justify-center">
                            {product.image ? (
                              <>
                                <img
                                  src={product.image}
                                  alt={product.name}
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

                          {/* Name of the Product */}
                          <div className="p-4 pb-2">
                            <h4 className="text-sm font-bold text-neutral-950 leading-snug group-hover:text-black line-clamp-2">
                              {product.name}
                            </h4>
                          </div>
                        </div>

                        {/* Price & Shop Now Button in White Color */}
                        <div className="p-4 pt-0">
                          <div className="text-lg font-black text-neutral-950 mb-3">
                            ${product.price.toLocaleString()}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectProduct) {
                                onSelectProduct(product);
                              }
                            }}
                            className="w-full py-2 bg-white text-neutral-950 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            Shop Now
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                          </button>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>
                )}

                {/* Link to Checkout / Freight */}
                <div className="text-center pt-10">
                  <button
                    type="button"
                    onClick={() => onNavigate('checkout')}
                    className="px-6 py-3 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    Proceed to Checkout & Freight
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* ============================================================
                    BELOW THE PRODUCT SECTION: TWO ASIDE SECTIONS (LEFT & RIGHT)
                ============================================================ */}
                <ProductAsideSections className="mt-14" />
              </FadeIn>
            </>
          )}
        </div>
      </section>

      {/* ============================================================
          SECTION 4: MODEL YEAR & COMPATIBILITY MATRIX TABLE
      ============================================================ */}
      <section className="py-20 border-b border-neutral-800 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pickup Truck Generation Breakdown
            </h2>
            <p className="text-sm text-neutral-400 mt-2">
              Commercial fitment reference across high-demand Dodge / Ram, Ford, and GMC platforms.
            </p>
          </FadeIn>

          {/* Clean, Modern Table with FadeIn */}
          <FadeIn delay={0.1} className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead>
                <tr className="border-b border-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  <th className="py-4 px-6">Brand</th>
                  <th className="py-4 px-6">Pickup Truck Model</th>
                  <th className="py-4 px-6">Generations / Common Years</th>
                  <th className="py-4 px-6">Strongest Demand Platforms</th>
                  <th className="py-4 px-6 text-right">Quick Filter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/80">
                {/* Ram Row 1 */}
                <tr className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">Dodge / Ram</td>
                  <td className="py-4 px-6 text-neutral-100 font-medium">Ram 2500 / 3500</td>
                  <td className="py-4 px-6 text-neutral-400">1981 present</td>
                  <td className="py-4 px-6 text-neutral-300">
                    2010 2025 Ram 2500/3500 (6.7L Cummins Diesel)
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBrand('Dodge / Ram');
                        onSearchChange('Ram 2500');
                        const el = document.getElementById('catalog-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1.5 bg-white text-neutral-950 font-semibold text-xs rounded-lg hover:bg-neutral-100 transition-colors shadow-sm cursor-pointer"
                    >
                      Filter Parts
                    </button>
                  </td>
                </tr>

                {/* Ram Row 2 */}
                <tr className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">Dodge / Ram</td>
                  <td className="py-4 px-6 text-neutral-100 font-medium">Ram 1500</td>
                  <td className="py-4 px-6 text-neutral-400">1981 present</td>
                  <td className="py-4 px-6 text-neutral-300">
                    2009 2025 Ram 1500 (5.7L Hemi / EcoDiesel / Hurricane)
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBrand('Dodge / Ram');
                        onSearchChange('Ram 1500');
                        const el = document.getElementById('catalog-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1.5 bg-white text-neutral-950 font-semibold text-xs rounded-lg hover:bg-neutral-100 transition-colors shadow-sm cursor-pointer"
                    >
                      Filter Parts
                    </button>
                  </td>
                </tr>

                {/* Ford Row 1 */}
                <tr className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">Ford</td>
                  <td className="py-4 px-6 text-neutral-100 font-medium">Super Duty (F-250 / F-350)</td>
                  <td className="py-4 px-6 text-neutral-400">1999 present</td>
                  <td className="py-4 px-6 text-neutral-300">
                    1999 2025 F-250/F-350 (6.7L, 6.0L, 7.3L Powerstroke)
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBrand('Ford');
                        onSearchChange('Super Duty');
                        const el = document.getElementById('catalog-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1.5 bg-white text-neutral-950 font-semibold text-xs rounded-lg hover:bg-neutral-100 transition-colors shadow-sm cursor-pointer"
                    >
                      Filter Parts
                    </button>
                  </td>
                </tr>

                {/* Ford Row 2 */}
                <tr className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">Ford</td>
                  <td className="py-4 px-6 text-neutral-100 font-medium">F-150</td>
                  <td className="py-4 px-6 text-neutral-400">1948 present</td>
                  <td className="py-4 px-6 text-neutral-300">
                    2004 2025 F-150 (3.5L EcoBoost & 5.0L Coyote)
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBrand('Ford');
                        onSearchChange('F-150');
                        const el = document.getElementById('catalog-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1.5 bg-white text-neutral-950 font-semibold text-xs rounded-lg hover:bg-neutral-100 transition-colors shadow-sm cursor-pointer"
                    >
                      Filter Parts
                    </button>
                  </td>
                </tr>

                {/* GMC Row 1 */}
                <tr className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">GMC</td>
                  <td className="py-4 px-6 text-neutral-100 font-medium">Sierra 2500HD / 3500HD</td>
                  <td className="py-4 px-6 text-neutral-400">2001 present</td>
                  <td className="py-4 px-6 text-neutral-300">
                    2007 2025 Sierra HD (6.6L Duramax LMM/LML/L5P)
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBrand('GMC');
                        onSearchChange('Sierra 2500HD');
                        const el = document.getElementById('catalog-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1.5 bg-white text-neutral-950 font-semibold text-xs rounded-lg hover:bg-neutral-100 transition-colors shadow-sm cursor-pointer"
                    >
                      Filter Parts
                    </button>
                  </td>
                </tr>

                {/* GMC Row 2 */}
                <tr className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">GMC</td>
                  <td className="py-4 px-6 text-neutral-100 font-medium">Sierra 1500</td>
                  <td className="py-4 px-6 text-neutral-400">1999 present</td>
                  <td className="py-4 px-6 text-neutral-300">
                    2007 2025 Sierra 1500 (5.3L, 6.2L, 3.0L Duramax)
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBrand('GMC');
                        onSearchChange('Sierra 1500');
                        const el = document.getElementById('catalog-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1.5 bg-white text-neutral-950 font-semibold text-xs rounded-lg hover:bg-neutral-100 transition-colors shadow-sm cursor-pointer"
                    >
                      Filter Parts
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </FadeIn>

          {/* Link to Fitment / Services */}
          <FadeIn delay={0.2} className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-800">
            <span className="text-xs text-neutral-400">
              Need custom fitment confirmation or heavy fleet pricing?
            </span>
            <button
              type="button"
              onClick={() => onNavigate('services')}
              className="px-5 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              View Compatibility & Fleet Services
            </button>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: ABOUT US
      ============================================================ */}
      <section className="py-20 sm:py-24 bg-white border-b border-neutral-200 text-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="max-w-3xl mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight leading-tight">
              Built on heavy-duty reliability since 2012.
            </h2>
            <p className="mt-4 text-base text-neutral-600 leading-relaxed">
              We specialize in commercial-grade truck parts, severe-duty powertrain assemblies, and precision diesel components. Engineered for mechanics, fleet operators, and hardworking truck owners, our parts are tested to endure the toughest real-world demands.
            </p>
          </FadeIn>

          <FadeIn delay={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-neutral-950 block mb-2">
                2012
              </span>
              <h3 className="text-base font-bold text-neutral-950 mb-2">
                Started with Dodge Ram Parts
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Our story began in 2012 specializing in Dodge Ram truck parts and Cummins diesel components. Founded on the principle of direct reliability, we focused on solving critical failure points for Ram truck owners and commercial operators who needed dependable hardware without dealership markups.
              </p>
            </div>

            <div>
              <span className="text-2xl sm:text-3xl font-black text-neutral-950 block mb-2">
                Later
              </span>
              <h3 className="text-base font-bold text-neutral-950 mb-2">
                Added GMC Truck Parts
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                As our commercial client base expanded, we later added GMC parts to our depot. We established direct distributor pipelines for GMC Sierra HD and Duramax diesel assemblies, providing precision testing and prompt delivery across the country.
              </p>
            </div>

            <div>
              <span className="text-2xl sm:text-3xl font-black text-neutral-950 block mb-2">
                2020 & Beyond
              </span>
              <h3 className="text-base font-bold text-neutral-950 mb-2">
                Added Ford Parts & Full Platform Coverage
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                In 2020 and beyond, we brought onboard comprehensive Ford Powerstroke and Super Duty / F-150 parts. Today, we supply complete commercial parts coverage across Dodge / Ram, Ford, and GMC platforms with nationwide and worldwide shipping.
              </p>
            </div>
          </FadeIn>

          {/* Link to Dedicated About Us Page */}
          <FadeIn delay={0.2} className="mt-12 text-center sm:text-left">
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="px-6 py-3 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              Read Full Company Story & Heritage
              <ArrowRight className="w-4 h-4" />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================
          SECTION 6: CUSTOMER REVIEWS
      ============================================================ */}
      <section className="py-20 border-b border-neutral-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            {displayedReviews.length === 0 ? (
              <div className="text-center py-16 bg-neutral-900/60 rounded-2xl border border-neutral-800 p-8 max-w-xl mx-auto space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400">
                  <Star className="w-6 h-6 text-neutral-400" />
                </div>
                <h4 className="text-sm font-bold text-white">No Customer Reviews Yet</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Verified customer reviews and feedback will appear here once published.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedReviews.map((rev) => (
                  <SpotlightCard
                    key={rev.id}
                    className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col space-y-4 hover:border-neutral-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                        alt={rev.author}
                        className="w-12 h-12 rounded-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-sm font-bold text-white">
                        {rev.author}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-white text-white"
                        />
                      ))}
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </SpotlightCard>
                ))}
              </div>
            )}
          </FadeIn>

          {/* Link to Verified Reviews Page */}
          <FadeIn delay={0.15} className="text-center pt-10">
            <button
              type="button"
              onClick={() => onNavigate('reviews')}
              className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              View All Customer Reviews
              <ArrowRight className="w-4 h-4" />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================
          SECTION 7: GALLERY SLIDESHOW
      ============================================================ */}
      <section className="py-16 sm:py-20 bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            {displayedGallery.length === 0 ? (
              <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-200 p-8 max-w-xl mx-auto space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 shadow-xs">
                  <Package className="w-6 h-6 text-neutral-400" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900">No Gallery Photos Yet</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Customer truck photos, build installations, and rig showcases will appear here once published.
                </p>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl shadow-sm">
                {/* Slide Track */}
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${activeGalleryIndex * 100}%)` }}
                >
                  {displayedGallery.map((item, idx) => (
                    <div key={item.id || idx} className="w-full shrink-0 flex flex-col">
                      <img
                        src={item.imageUrl}
                        alt={item.title || 'Gallery rig'}
                        className="w-full h-80 sm:h-[420px] md:h-[480px] lg:h-[540px] object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {(item.title || item.caption) && (
                        <div className="p-4 sm:p-5 bg-neutral-950 text-white border-t border-neutral-800">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                              {item.title}
                            </h4>
                            <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-semibold">
                              {item.truckBrand} {item.year ? `• ${item.year}` : ''}
                            </span>
                          </div>
                          {item.caption && (
                            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-1.5 line-clamp-2">
                              {item.caption}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Navigation Controls */}
                <button
                  type="button"
                  onClick={prevGallerySlide}
                  className="absolute left-4 top-40 sm:top-52 md:top-60 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={nextGallerySlide}
                  className="absolute right-4 top-40 sm:top-52 md:top-60 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full z-10">
                  {displayedGallery.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveGalleryIndex(idx)}
                      className={`transition-all rounded-full cursor-pointer ${
                        idx === activeGalleryIndex
                          ? 'w-6 h-2 bg-white'
                          : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </FadeIn>

          {/* Link to Full Customer Builds Gallery Page */}
          <FadeIn delay={0.15} className="text-center pt-8">
            <button
              type="button"
              onClick={() => onNavigate('gallery')}
              className="px-6 py-3 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              Explore Full Customer Rig Gallery
              <ArrowRight className="w-4 h-4" />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================
          SECTION 9: HOW TO ORDER
      ============================================================ */}
      <section className="py-20 border-b border-neutral-800 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              How To Order
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Follow our simple three-step process to get the right heavy-duty diesel parts.
            </p>
          </FadeIn>

          <FadeIn delay={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SpotlightCard className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 text-center space-y-3 hover:border-neutral-700 transition-all">
              <div className="w-12 h-12 bg-white text-black font-black text-lg rounded-full flex items-center justify-center mx-auto shadow-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Find Your Product</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                See a product either by searching on the search bar or visiting the product page or section.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 text-center space-y-3 hover:border-neutral-700 transition-all">
              <div className="w-12 h-12 bg-white text-black font-black text-lg rounded-full flex items-center justify-center mx-auto shadow-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Enter Your Details</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Order by filling in your information like your full name, phone number, email address, and shipping details.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 text-center space-y-3 hover:border-neutral-700 transition-all">
              <div className="w-12 h-12 bg-white text-black font-black text-lg rounded-full flex items-center justify-center mx-auto shadow-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Place Order & Quick Follow-Up</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Place the order and we get back to you immediately to confirm fitment and dispatch details.
              </p>
            </SpotlightCard>
          </FadeIn>

          {/* Link to Checkout Page */}
          <FadeIn delay={0.25} className="text-center pt-10">
            <button
              type="button"
              onClick={() => onNavigate('checkout')}
              className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              Start Your Order & Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================
          SECTION 10: SIMPLE CONTACT US
      ============================================================ */}
      <section className="py-20 bg-black">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Contact Us
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              We reply ASAP within or less than no time.
            </p>
          </FadeIn>

          {contactSubmitted ? (
            <FadeIn className="text-center py-8 space-y-2">
              <h4 className="text-base font-bold text-white">Message Sent</h4>
              <p className="text-xs text-neutral-300">
                Thank you! We received your information and will reply ASAP within or less than no time.
              </p>
              <button
                type="button"
                onClick={() => setContactSubmitted(false)}
                className="mt-4 px-5 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </FadeIn>
          ) : (
            <FadeIn delay={0.15}>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-base sm:text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-neutral-500 placeholder-neutral-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-base sm:text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-neutral-500 placeholder-neutral-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-base sm:text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-neutral-500 placeholder-neutral-500"
                  />
                </div>
                <div className="pt-2">
                  <ShimmerButton
                    type="submit"
                    variant="primary"
                    className="w-full justify-center text-sm py-3 min-h-[48px]"
                  >
                    <span>Send</span>
                    <ArrowRight className="w-4 h-4" />
                  </ShimmerButton>
                </div>
                <p className="text-[11px] text-center text-neutral-500 pt-1">
                  We reply ASAP within or less than no time.
                </p>
              </form>
            </FadeIn>
          )}

          {/* Link to Full Contact Page */}
          <FadeIn delay={0.25} className="text-center pt-6">
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="text-xs text-neutral-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
            >
              Need commercial depot hubs or warehouse dispatch? Visit Contact Page
            </button>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};
