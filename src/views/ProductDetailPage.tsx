import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, ChevronRight, ChevronLeft, Check, Camera } from 'lucide-react';
import { Product, NavPage } from '../types';
import { ProductAsideSections } from '../components/ProductAsideSections';

interface ProductDetailPageProps {
  product?: Product | null;
  allProducts: Product[];
  onBack?: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onOrderNow?: (product: Product, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
  onNavigate: (page: NavPage) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onBack,
  onAddToCart,
  onOrderNow,
  onSelectProduct,
  onNavigate,
}) => {
  const [added, setAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    } else {
      onNavigate('products');
    }
  };

  const handleOrderNowClick = (prod: Product, qty = 1) => {
    if (typeof onOrderNow === 'function') {
      onOrderNow(prod, qty);
    } else {
      onAddToCart(prod, qty);
      onNavigate('checkout');
    }
  };

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-white py-16 flex flex-col items-center justify-center text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
          <Package className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">No Product Selected</h2>
        <p className="text-sm text-neutral-500 max-w-sm mb-6">
          The requested product item is not found or the product catalog is currently empty.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  // Other products to display below the main product
  const otherProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const handleAddToCartClick = () => {
    onAddToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Multiple photos collection (2 or more photos)
  const photos = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : (product.image ? [product.image] : []);
  const currentPhoto = photos[selectedImageIndex] || photos[0] || product.image;

  return (
    <div className="bg-white text-neutral-900 min-h-screen">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-neutral-600 hover:text-black transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>
      </div>

      {/* Main Product Display */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start">
          {/* Picture Gallery (Multi-photo support) */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] bg-neutral-100 rounded-2xl border border-neutral-200 overflow-hidden flex flex-col items-center justify-center p-2 text-center group">
              {currentPhoto ? (
                <>
                  <img
                    src={currentPhoto}
                    alt={`${product.brand} ${product.name} OEM ${product.oemNumber}`}
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />

                  {/* Photo count indicator */}
                  {photos.length > 1 && (
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-xs font-mono font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{selectedImageIndex + 1} / {photos.length}</span>
                    </div>
                  )}

                  {/* Prev / Next navigation arrows if 2 or more photos */}
                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md flex items-center justify-center transition-transform hover:scale-105 cursor-pointer border border-neutral-200"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md flex items-center justify-center transition-transform hover:scale-105 cursor-pointer border border-neutral-200"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 mb-3 shadow-sm">
                    <Package className="w-8 h-8 text-neutral-400" />
                  </div>
                  <span className="text-sm font-bold text-neutral-700">No Image Available</span>
                  <span className="text-xs text-neutral-400 mt-1 font-mono">OEM #{product.oemNumber}</span>
                </>
              )}
            </div>

            {/* Thumbnail Strip (2 or more photos) */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {photos.map((photoUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer border-2 ${
                      selectedImageIndex === idx
                        ? 'border-neutral-950 ring-2 ring-neutral-950/20 opacity-100 shadow-sm'
                        : 'border-transparent hover:border-neutral-300 opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img
                      src={photoUrl}
                      alt={`${product.name} angle ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-neutral-950/80 text-[8px] text-white font-bold py-0.5 text-center uppercase tracking-wider">
                        Cover
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details: Name, Price, Description, Action Buttons */}
          <div className="space-y-5 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-tight">
                {product.name}
              </h1>
              <div className="text-2xl sm:text-3xl font-black text-neutral-950 mt-2 sm:mt-3">
                ${product.price.toLocaleString()}
              </div>
            </div>

            {/* Description (No borders around the text) */}
            {product.description && (
              <div className="text-neutral-600 text-sm sm:text-base leading-relaxed space-y-3">
                <p>{product.description}</p>
              </div>
            )}

            {/* Action Buttons: Add to Cart or Order Now */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleOrderNowClick(product, 1)}
                className="flex-1 min-h-[48px] py-3 px-6 bg-white text-neutral-950 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 font-bold text-sm uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                Order Now
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>
              <button
                type="button"
                onClick={handleAddToCartClick}
                className="flex-1 min-h-[48px] py-3 px-6 bg-neutral-950 text-white hover:bg-neutral-800 font-bold text-sm uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <span>Add to Cart</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================
            TWO ASIDE SECTIONS BELOW PRODUCT (LEFT & RIGHT)
        ============================================================ */}
        <ProductAsideSections className="mt-16" />

        {otherProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-neutral-200">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-neutral-950 tracking-tight">
                More Products
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Explore more verified parts from our catalog.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-400 hover:shadow-sm transition-all group cursor-pointer"
                >
                  <div>
                    {/* Placeholder Image or Real Image */}
                    <div className="aspect-[16/10] bg-neutral-100 border-b border-neutral-200 flex flex-col items-center justify-center p-4 text-center">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 mb-2 shadow-sm">
                            <Package className="w-5 h-5 text-neutral-400" />
                          </div>
                          <span className="text-xs font-bold text-neutral-700">No Image Available</span>
                        </>
                      )}
                    </div>
                    {/* Product Name */}
                    <div className="p-4 pb-2">
                      <h3 className="text-sm font-bold text-neutral-950 leading-snug group-hover:text-black line-clamp-2">
                        {p.name}
                      </h3>
                    </div>
                  </div>

                  {/* Price and Shop Now Button */}
                  <div className="p-4 pt-0">
                    <div className="text-lg font-black text-neutral-950 mb-3">
                      ${p.price.toLocaleString()}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-2 bg-white text-neutral-950 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Shop Now
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
