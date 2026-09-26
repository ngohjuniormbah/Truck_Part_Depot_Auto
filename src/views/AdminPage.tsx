import React, { useState, useEffect, useRef } from 'react';
import { Bell, RefreshCw, Eye, Trash2, Lock, Key } from 'lucide-react';
import {
  Product,
  Order,
  Review,
  GalleryItem,
  OrderStatus,
  PartCategory,
  NavPage,
} from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { MultiImageUploader } from '../components/MultiImageUploader';
import { isEmbeddedImage, reuploadEmbeddedImage } from '../services/storage';
import {
  playOrderChime,
  enableNotificationsWithChime,
  sendBrowserNotification,
} from '../utils/notifications';
import { formatPaymentMethod } from '../utils/payment';

interface AdminPageProps {
  products: Product[];
  orders: Order[];
  reviews: Review[];
  gallery: GalleryItem[];
  isLoading?: boolean;
  onAddProduct: (p: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onDeleteOrder?: (id: string) => Promise<void>;
  onAddGalleryItem: (g: Partial<GalleryItem>) => Promise<void>;
  onDeleteGalleryItem: (id: string) => Promise<void>;
  onAddReview: (r: Partial<Review>) => Promise<void>;
  onDeleteReview: (id: string) => Promise<void>;
  onNavigate: (page: NavPage) => void;
  onRefreshOrders?: () => void;
  initialTab?: 'products' | 'gallery' | 'reviews' | 'orders';
}

export const AdminPage: React.FC<AdminPageProps> = ({
  products,
  orders,
  reviews,
  gallery,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  onAddGalleryItem,
  onDeleteGalleryItem,
  onAddReview,
  onDeleteReview,
  onNavigate,
  onRefreshOrders,
  initialTab = 'products',
  isLoading = false,
}) => {
  // =========================================================================
  // ADMIN AUTHENTICATION (DEFAULT PASSWORD: iamadeveloper)
  // =========================================================================
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('tpd_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'iamadeveloper') {
      try {
        sessionStorage.setItem('tpd_admin_auth', 'true');
      } catch {}
      setIsAuthenticated(true);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleLockAdmin = () => {
    try {
      sessionStorage.removeItem('tpd_admin_auth');
    } catch {}
    setIsAuthenticated(false);
  };

  // Simple clean text tabs - no borders, no icons
  const [activeTab, setActiveTab] = useState<'products' | 'gallery' | 'reviews' | 'orders'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Push notification & audio alert state
  const [pushActive, setPushActive] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const checkPushSubscription = async () => {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
        const registration = await navigator.serviceWorker.getRegistration('/');
        const subscription = registration ? await registration.pushManager.getSubscription() : null;
        if (!cancelled) setPushActive(Boolean(subscription));
      } catch {
        if (!cancelled) setPushActive(false);
      }
    };
    void checkPushSubscription();
    return () => {
      cancelled = true;
    };
  }, []);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [pushError, setPushError] = useState('');
  const [isEnablingPush, setIsEnablingPush] = useState(false);

  // Guards prevent duplicate network writes when a save/delete control is
  // clicked repeatedly while Supabase is still responding.
  const actionLockRef = useRef(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [busyGalleryId, setBusyGalleryId] = useState<string | null>(null);
  const [busyReviewId, setBusyReviewId] = useState<string | null>(null);

  const handleTogglePush = async () => {
    setPushError('');
    setIsEnablingPush(true);
    try {
      if (pushActive) {
        await sendBrowserNotification('Depot Push Test', {
          body: 'Push notifications are active on this browser.',
          tag: 'tpd-push-test',
        });
        playOrderChime();
        return;
      }

      const enabled = await enableNotificationsWithChime();
      setPushActive(enabled);
      if (!enabled) {
        setPushError('Notification permission was not granted.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to enable push notifications.';
      setPushError(message);
      setPushActive(false);
    } finally {
      setIsEnablingPush(false);
    }
  };

  const handleDeleteOrderClick = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (busyOrderId) return;
    if (!window.confirm(`Are you sure you want to delete order #${orderId}? This action cannot be undone.`)) return;

    setBusyOrderId(orderId);
    try {
      if (onDeleteOrder) await onDeleteOrder(orderId);
      if (openedOrderId === orderId) setOpenedOrderId(null);
    } finally {
      setBusyOrderId(null);
    }
  };

  // =========================================================================
  // PRODUCTS CRUD (SIMPLIFIED: PHOTOS, NAME, DESCRIPTION, PRICE, TYPE, STOCK)
  // =========================================================================
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [prodForm, setProdForm] = useState({
    name: '',
    description: '',
    price: 0,
    brand: 'Dodge / Ram' as 'Ford' | 'GMC' | 'Dodge / Ram',
    stockCount: 1,
    images: [] as string[],
    category: 'Turbochargers & Air Systems' as PartCategory,
    model: '',
    yearRange: '2017-2025',
    engine: '',
    oemNumber: '',
    sku: '',
    coreDeposit: 0,
    warranty: '24 Months Replacement',
  });

  const openAddProduct = () => {
    setEditingProductId(null);
    setProdForm({
      name: '',
      description: '',
      price: 0,
      brand: 'Dodge / Ram',
      stockCount: 1,
      images: [],
      category: 'Turbochargers & Air Systems',
      model: '',
      yearRange: '2017-2025',
      engine: '',
      oemNumber: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      coreDeposit: 0,
      warranty: '24 Months Replacement',
    });
    setProductFormOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    const existingImages = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : (p.image ? [p.image] : []);

    setProdForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      brand: (p.brand as 'Ford' | 'GMC' | 'Dodge / Ram') || 'Dodge / Ram',
      stockCount: p.stockCount,
      images: existingImages,
      category: p.category,
      model: p.model,
      yearRange: p.yearRange,
      engine: p.engine,
      oemNumber: p.oemNumber,
      sku: p.sku,
      coreDeposit: p.coreDeposit || 0,
      warranty: p.warranty,
    });
    setProductFormOpen(true);
  };

  // =========================================================================
  // PHOTO OPTIMIZER — one-click migration for old products whose photos got
  // saved as giant embedded base64 text (from before the Storage bucket
  // existed) instead of small Storage URLs. Those oversized rows are what
  // make the full product list slow/unreliable to load, which is what makes
  // products intermittently "disappear" for visitors on a slow connection.
  // Run supabase-storage-setup.sql once in the Supabase SQL editor first —
  // this tool needs the "product-images" bucket to exist.
  // =========================================================================
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeProgress, setOptimizeProgress] = useState({ done: 0, total: 0 });
  const [optimizeResult, setOptimizeResult] = useState<string | null>(null);

  const heavyProductCount = products.filter(
    (p) => isEmbeddedImage(p.image) || (p.images || []).some((img) => isEmbeddedImage(img))
  ).length;

  const runPhotoOptimizer = async () => {
    const targets = products.filter(
      (p) => isEmbeddedImage(p.image) || (p.images || []).some((img) => isEmbeddedImage(img))
    );
    if (targets.length === 0) return;
    setOptimizing(true);
    setOptimizeResult(null);
    setOptimizeProgress({ done: 0, total: targets.length });

    let migrated = 0;
    let failed = 0;

    for (const product of targets) {
      try {
        const newImages: string[] = [];
        for (const img of product.images && product.images.length > 0 ? product.images : [product.image]) {
          if (isEmbeddedImage(img)) {
            newImages.push(await reuploadEmbeddedImage(img, 'products'));
          } else if (img) {
            newImages.push(img);
          }
        }
        if (newImages.length > 0) {
          await onUpdateProduct(product.id, { image: newImages[0], images: newImages });
          migrated++;
        }
      } catch (err) {
        console.error(`Photo optimization failed for ${product.id}:`, err);
        failed++;
      } finally {
        setOptimizeProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      }
    }

    setOptimizing(false);
    setOptimizeResult(
      failed === 0
        ? `Done — moved photos for ${migrated} product${migrated === 1 ? '' : 's'} to fast storage.`
        : `Moved ${migrated} product${migrated === 1 ? '' : 's'}, but ${failed} failed. Make sure supabase-storage-setup.sql has been run, then try again.`
    );
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingProduct || actionLockRef.current) return;
    if (!(prodForm.name || '').trim()) return;

    actionLockRef.current = true;
    setSavingProduct(true);

    try {
      const primaryImg =
        prodForm.images && prodForm.images.length > 0
          ? prodForm.images[0]
          : 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80';

      const allImages =
        prodForm.images && prodForm.images.length > 0 ? prodForm.images : [primaryImg];

      const stock = Number(prodForm.stockCount) >= 0 ? Number(prodForm.stockCount) : 1;
      const priceNum = Number(prodForm.price) || 0;

      const payload: Partial<Product> = {
        name: prodForm.name.trim(),
        description: prodForm.description.trim(),
        price: priceNum,
        brand: prodForm.brand,
        stockCount: stock,
        inStock: stock > 0,
        image: primaryImg,
        images: allImages,
        category: prodForm.category || 'Turbochargers & Air Systems',
        model: prodForm.model || prodForm.brand,
        yearRange: prodForm.yearRange || '2017-2025',
        engine: prodForm.engine || 'Heavy Duty Diesel',
        oemNumber: prodForm.oemNumber || '',
        sku: prodForm.sku || `SKU-${Date.now().toString().slice(-4)}`,
        coreDeposit: 0,
        warranty: prodForm.warranty || '24 Months Replacement',
      };

      if (editingProductId) {
        await onUpdateProduct(editingProductId, payload);
      } else {
        await onAddProduct({
          ...payload,
          id: `prod-${Date.now()}`,
        });
      }

      setProductFormOpen(false);
    } catch (error) {
      console.error('Failed to save product:', error);
      window.alert('The product could not be saved. Please try again.');
    } finally {
      actionLockRef.current = false;
      setSavingProduct(false);
    }
  };

  // =========================================================================
  // GALLERY CRUD (NO "OEM REPLACEMENT PARTS" AUTO-TAG)
  // =========================================================================
  const [galleryFormOpen, setGalleryFormOpen] = useState(false);
  const [galForm, setGalForm] = useState({
    title: '',
    truckBrand: 'Dodge / Ram' as 'Ford' | 'GMC' | 'Dodge / Ram',
    truckModel: '',
    year: '2024',
    imageUrl: '',
    images: [] as string[],
    caption: '',
    installedParts: '',
  });

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingGallery || actionLockRef.current) return;

    const images = (galForm.images || []).filter(Boolean);
    const imageUrl = images[0] || (galForm.imageUrl || '').trim();
    if (!(galForm.title || '').trim() || !imageUrl) return;

    actionLockRef.current = true;
    setSavingGallery(true);
    try {
      await onAddGalleryItem({
        ...galForm,
        imageUrl,
        images: images.length > 0 ? images : [imageUrl],
        installedParts: galForm.installedParts
          ? galForm.installedParts
              .split(',')
              .map((item) => (item || '').trim())
              .filter((item) => Boolean(item) && item !== 'OEM Replacement Parts')
          : [],
      });
      setGalleryFormOpen(false);
      setGalForm({
        title: '',
        truckBrand: 'Dodge / Ram',
        truckModel: '',
        year: '2024',
        imageUrl: '',
        images: [],
        caption: '',
        installedParts: '',
      });
    } catch (error) {
      console.error('Failed to save gallery item:', error);
      window.alert('The gallery photos could not be saved. Please try again.');
    } finally {
      actionLockRef.current = false;
      setSavingGallery(false);
    }
  };

  // =========================================================================
  // REVIEWS CRUD
  // =========================================================================
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [revForm, setRevForm] = useState({
    author: '',
    avatar: '',
    company: '',
    truckModel: '',
    rating: 5,
    comment: '',
    partPurchased: '',
    reviewImage: '',
    link: '',
    linkText: '',
  });

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingReview || actionLockRef.current) return;
    if (!(revForm.author || '').trim() || !(revForm.comment || '').trim()) return;

    actionLockRef.current = true;
    setSavingReview(true);
    try {
      await onAddReview({
        ...revForm,
        id: `rev-${Date.now()}`,
        date: 'Just Now',
        verifiedPurchase: true,
      });
      setReviewFormOpen(false);
      setRevForm({
        author: '',
        avatar: '',
        company: '',
        truckModel: '',
        rating: 5,
        comment: '',
        partPurchased: '',
        reviewImage: '',
        link: '',
        linkText: '',
      });
    } catch (error) {
      console.error('Failed to save review:', error);
      window.alert('The review could not be saved. Please try again.');
    } finally {
      actionLockRef.current = false;
      setSavingReview(false);
    }
  };

  // =========================================================================
  // ORDERS (TEXT MESSAGE FORMAT - CLICK TO OPEN, NO COLORS)
  // =========================================================================
  const [openedOrderId, setOpenedOrderId] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.oemNumber || '').toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-black text-white">
        <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-white">
              <Lock className="w-5 h-5 text-neutral-300" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Admin Access
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Enter admin password to manage store, orders & products
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Enter admin password"
                  className="w-full bg-neutral-900 border border-neutral-800 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-neutral-500 pr-12 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-400 text-xs mt-1.5 font-medium">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-all cursor-pointer shadow-sm"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-900 text-center">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
            >
              &larr; Return to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Page Header with Visible Push Notification Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-white">
                Admin
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Store management console
            </p>
            {pushError && (
              <p className="text-[11px] text-red-400 mt-1.5 max-w-xl">{pushError}</p>
            )}
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Highly Visible Push Notification Button */}
            <button
              type="button"
              onClick={handleTogglePush}
              disabled={isEnablingPush}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer bg-white text-black hover:bg-neutral-200 shadow-sm"
              title="Click to enable or test order sound alert & push notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>
                {isEnablingPush ? 'Enabling Push…' : pushActive ? 'Push Alerts: Active (Test)' : 'Enable Push Notifications'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleLockAdmin}
              className="text-xs text-neutral-400 hover:text-red-400 transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-900 flex items-center gap-1.5"
              title="Lock admin session"
            >
              <Lock className="w-3 h-3" />
              <span>Lock</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer px-2 py-1.5"
            >
              Go to store &rarr;
            </button>
          </div>
        </div>

        {/* Clean Text Tabs - No borders, No icons */}
        <div className="flex gap-8 border-b border-neutral-800 pb-2 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`transition-colors capitalize pb-1 cursor-pointer ${
              activeTab === 'products'
                ? 'text-white font-medium border-b border-white -mb-[9px]'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`transition-colors capitalize pb-1 cursor-pointer ${
              activeTab === 'gallery'
                ? 'text-white font-medium border-b border-white -mb-[9px]'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Gallery ({gallery.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`transition-colors capitalize pb-1 cursor-pointer ${
              activeTab === 'reviews'
                ? 'text-white font-medium border-b border-white -mb-[9px]'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Reviews ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`transition-colors capitalize pb-1 cursor-pointer ${
              activeTab === 'orders'
                ? 'text-white font-medium border-b border-white -mb-[9px]'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {/* ===================================================================
            TAB 1: PRODUCTS (Clean CRUD)
        =================================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 max-w-xs">
                {products.length > 0 && (
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Filter products..."
                    className="w-full bg-neutral-900 text-white text-xs px-3 py-1.5 rounded focus:outline-none"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={openAddProduct}
                className="px-3.5 py-1.5 bg-white text-black text-xs font-medium rounded hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                + Add Product
              </button>
            </div>

            {heavyProductCount > 0 && (
              <div className="p-3.5 bg-amber-950/30 border border-amber-900/60 rounded-lg space-y-2">
                <p className="text-xs text-amber-200">
                  {heavyProductCount} product{heavyProductCount === 1 ? '' : 's'} still {heavyProductCount === 1 ? 'has' : 'have'} photos saved
                  directly in the database instead of fast storage. This is the most likely reason products sometimes fail to load on the
                  live site. Fix it once below (requires <code className="text-amber-100">supabase-storage-setup.sql</code> to have been run
                  in the Supabase SQL editor).
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={optimizing}
                    onClick={runPhotoOptimizer}
                    className="px-3.5 py-1.5 bg-amber-100 text-amber-950 text-xs font-semibold rounded hover:bg-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                  >
                    {optimizing
                      ? `Optimizing ${optimizeProgress.done}/${optimizeProgress.total}...`
                      : `Optimize Photos (${heavyProductCount})`}
                  </button>
                  {optimizeResult && <span className="text-xs text-amber-200">{optimizeResult}</span>}
                </div>
              </div>
            )}

            {products.length === 0 ? (
              <div className="py-16 text-center text-neutral-500 text-xs space-y-2">
                <p>No products added yet.</p>
                <p className="text-neutral-600">
                  Click &ldquo;+ Add Product&rdquo; above to upload your first spare part.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800 border-t border-b border-neutral-800">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="py-3.5 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {p.image ? (
                        <div className="relative shrink-0">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded bg-neutral-900"
                            referrerPolicy="no-referrer"
                          />
                          {p.images && p.images.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 bg-neutral-900 text-neutral-300 text-[9px] font-mono px-1 rounded border border-neutral-700">
                              {p.images.length} pics
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-neutral-900 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate">
                          {p.name}
                        </div>
                        <div className="text-neutral-500 text-[11px] mt-0.5">
                          {p.brand} {p.oemNumber ? `• OEM: ${p.oemNumber} ` : ''}• Stock: {p.stockCount}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-mono text-white text-sm">
                        ${p.price.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditProduct(p)}
                        className="text-neutral-400 hover:text-white cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (busyProductId) return;
                          setBusyProductId(p.id);
                          try { await onDeleteProduct(p.id); } finally { setBusyProductId(null); }
                        }}
                        className="text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 2: GALLERY (Clean CRUD)
        =================================================================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">
                Manage truck build gallery photos
              </p>
              <button
                type="button"
                onClick={() => setGalleryFormOpen(true)}
                className="px-3.5 py-1.5 bg-white text-black text-xs font-medium rounded hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                + Add Photo
              </button>
            </div>

            {gallery.length === 0 ? (
              <div className="py-16 text-center text-neutral-500 text-xs">
                No gallery photos yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {gallery.map((item) => (
                  <div key={item.id} className="space-y-2 group text-xs">
                    <div className="relative aspect-video bg-neutral-900 rounded overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 pr-1">
                        <div className="font-medium text-white">{item.title}</div>
                        <div className="text-neutral-500 text-[11px]">
                          {item.truckBrand} {item.year ? `• ${item.year}` : ''}
                        </div>
                        {item.caption && (
                          <p className="text-neutral-400 text-[11px] leading-relaxed mt-1 line-clamp-2">
                            {item.caption}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                        if (busyGalleryId) return;
                        setBusyGalleryId(item.id);
                        try { await onDeleteGalleryItem(item.id); } finally { setBusyGalleryId(null); }
                      }}
                        className="text-neutral-500 hover:text-red-400 cursor-pointer shrink-0 text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 3: REVIEWS (Clean CRUD)
        =================================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">
                Manage customer reviews, attached pictures and links
              </p>
              <button
                type="button"
                onClick={() => setReviewFormOpen(true)}
                className="px-3.5 py-1.5 bg-white text-black text-xs font-medium rounded hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                + Add Review
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="py-16 text-center text-neutral-500 text-xs">
                No reviews yet.
              </div>
            ) : (
              <div className="divide-y divide-neutral-800 border-t border-b border-neutral-800">
                {reviews.map((rev) => (
                  <div key={rev.id} className="py-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rev.avatar && (
                          <img
                            src={rev.avatar}
                            alt={rev.author}
                            className="w-6 h-6 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <span className="font-medium text-white">{rev.author}</span>
                        <span className="text-neutral-500 text-[11px]">
                          &bull; {rev.rating || 5}/5 stars
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (busyReviewId) return;
                          setBusyReviewId(rev.id);
                          try { await onDeleteReview(rev.id); } finally { setBusyReviewId(null); }
                        }}
                        className="text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-neutral-300 text-xs">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                    {rev.reviewImage && (
                      <div className="pt-1">
                        <img
                          src={rev.reviewImage}
                          alt="Review attachment"
                          className="w-28 h-20 object-cover rounded bg-neutral-900"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    {rev.link && (
                      <div className="text-[11px] text-neutral-400 pt-1">
                        Link:{' '}
                        <a
                          href={rev.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white underline underline-offset-2"
                        >
                          {rev.linkText || rev.link}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 4: ORDERS (TEXT MESSAGE INBOX - CLICK TO OPEN, ZERO COLOR)
        =================================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Push Notifications & Alert Status Banner */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">
                    Order Push Notifications
                  </div>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Real-time desktop/mobile push alerts & audio chimes whenever a new customer places an order.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTogglePush}
                  disabled={isEnablingPush}
                  className="px-3.5 py-1.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isEnablingPush ? 'Enabling…' : pushActive ? 'Test Push & Chime' : 'Enable Push Notifications'}</span>
                </button>
                {onRefreshOrders && (
                  <button
                    type="button"
                    onClick={async () => {
                      setIsRefreshingOrders(true);
                      try {
                        await onRefreshOrders();
                      } finally {
                        setTimeout(() => setIsRefreshingOrders(false), 500);
                      }
                    }}
                    className="px-3 py-1.5 bg-neutral-800 text-neutral-300 hover:text-white font-medium text-xs rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer border border-neutral-700 inline-flex items-center gap-1.5"
                    title="Refresh orders list"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshingOrders ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                )}
              </div>
            </div>
            {pushError && (
              <p className="text-[11px] text-red-400 -mt-3">{pushError}</p>
            )}

            {orders.length === 0 ? (
              <div className="py-16 text-center text-neutral-500 text-xs">
                No orders received yet. When a customer checks out, the order will arrive here like a message.
              </div>
            ) : (
              <div className="space-y-2">
                {orders.map((order) => {
                  const isOpened = openedOrderId === order.id;
                  const firstItem = order.items[0]?.productName || order.items[0]?.name || 'Spare Part';
                  const extraCount = order.items.length - 1;
                  const itemSummary =
                    extraCount > 0 ? `${firstItem} + ${extraCount} more` : firstItem;

                  return (
                    <div
                      key={order.id}
                      className={`rounded-xl overflow-hidden transition-all duration-200 border ${
                        isOpened
                          ? 'bg-white text-neutral-900 border-neutral-300 shadow-xl ring-2 ring-neutral-900/10 my-3'
                          : 'bg-neutral-900/60 text-white border-neutral-800/80 hover:border-neutral-700'
                      }`}
                    >
                      {/* Order Header Row - Click to Open */}
                      <button
                        type="button"
                        onClick={() => setOpenedOrderId(isOpened ? null : order.id)}
                        className={`w-full px-4 py-3.5 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                          isOpened
                            ? 'bg-neutral-50 hover:bg-neutral-100 border-b border-neutral-200 text-neutral-900'
                            : 'hover:bg-neutral-900 text-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold ${isOpened ? 'text-neutral-950' : 'text-white'}`}>
                              {order.customerName}
                            </span>
                            <span className={`text-[11px] font-mono ${isOpened ? 'text-neutral-500' : 'text-neutral-400'}`}>
                              #{order.id}
                            </span>
                            <span className={`text-[11px] ${isOpened ? 'text-neutral-600' : 'text-neutral-400'}`}>
                              &bull; {order.shippingAddress.state} &bull; {order.customerPhone}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                                isOpened
                                  ? 'bg-neutral-900 text-white border-neutral-900'
                                  : 'bg-neutral-800 text-white border-neutral-700'
                              }`}
                            >
                              {formatPaymentMethod(order.paymentMethod)}
                            </span>
                          </div>
                          <p className={`text-xs truncate mt-0.5 ${isOpened ? 'text-neutral-600' : 'text-neutral-400'}`}>
                            {itemSummary} &bull; ${order.total.toFixed(2)} &bull; {formatPaymentMethod(order.paymentMethod)} &bull;{' '}
                            <span className={`font-semibold ${isOpened ? 'text-neutral-900' : 'text-neutral-200'}`}>
                              {order.orderStatus}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right text-[11px] hidden sm:block">
                            <div className={isOpened ? 'text-neutral-700 font-medium' : 'text-neutral-400'}>
                              {new Date(order.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteOrderClick(e, order.id)}
                            title="Delete order"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isOpened
                                ? 'text-neutral-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-neutral-500 hover:text-red-400 hover:bg-neutral-800'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              isOpened
                                ? 'bg-neutral-200 text-neutral-800'
                                : 'text-neutral-400 bg-neutral-800/80'
                            }`}
                          >
                            {isOpened ? 'Close' : 'Open'}
                          </div>
                        </div>
                      </button>

                      {/* Opened Order Body (Crisp White Background, High-Contrast Clean Layout) */}
                      {isOpened && (
                        <div className="p-5 bg-white text-neutral-900 text-xs space-y-5">
                          {/* Payment Method Details Box */}
                          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 shadow-sm">
                            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                              <p className="text-[11px] text-neutral-600 uppercase tracking-wider font-bold">
                                Customer Payment Method
                              </p>
                              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-900 text-white font-mono font-medium">
                                {order.paymentStatus || 'Pending Verification'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-base font-bold text-neutral-950">
                                {formatPaymentMethod(order.paymentMethod)}
                              </span>
                            </div>
                            {order.paymentAccountInfo && (
                              <p className="text-xs text-neutral-700 bg-white p-2.5 rounded-lg border border-neutral-200">
                                Customer Account / Phone / Handle:{' '}
                                <strong className="text-neutral-950 font-mono text-sm block sm:inline mt-0.5 sm:mt-0">
                                  {order.paymentAccountInfo}
                                </strong>
                              </p>
                            )}
                            {order.notes && (
                              <p className="text-xs text-neutral-600 bg-white p-2.5 rounded-lg border border-neutral-200">
                                Order Note: <span className="text-neutral-900 font-medium">{order.notes}</span>
                              </p>
                            )}
                          </div>

                          {/* Contact & Delivery Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                              <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-bold">
                                Customer Contact
                              </p>
                              <p className="text-sm font-bold text-neutral-950">{order.customerName}</p>
                              <p className="text-neutral-800 font-medium flex items-center gap-1.5">
                                <span className="text-neutral-500">Phone:</span> {order.customerPhone}
                              </p>
                              <p className="text-neutral-800 font-medium flex items-center gap-1.5">
                                <span className="text-neutral-500">Email:</span> {order.customerEmail}
                              </p>
                            </div>
                            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                              <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-bold">
                                Delivery Address & Shipping
                              </p>
                              <p className="text-sm font-bold text-neutral-950">
                                {order.shippingAddress.street}
                              </p>
                              <p className="text-neutral-800 font-medium">
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                              </p>
                              <div className="pt-1 border-t border-neutral-200 text-[11px] text-neutral-600 flex flex-wrap gap-2">
                                <span className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 font-medium capitalize">
                                  {order.shippingAddress.deliveryType} Delivery
                                </span>
                                <span className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 font-medium">
                                  {order.shippingMethod === 'express' ? 'Express 1 Day (Extra Cost)' : 'Standard 1–2 Days'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Ordered Items */}
                          <div className="space-y-2 pt-2 border-t border-neutral-200">
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-bold">
                                Ordered Items ({order.items.length})
                              </p>
                              <span className="text-xs text-neutral-500">Price breakdown</span>
                            </div>
                            <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                              {order.items.map((item, idx) => (
                                <div
                                  key={item.id || item.productId || idx}
                                  className="flex items-center justify-between p-3 text-neutral-800 hover:bg-white transition-colors"
                                >
                                  <div>
                                    <span className="font-bold text-neutral-950 block">
                                      {item.productName || item.name}
                                    </span>
                                    <span className="text-neutral-500 text-[11px]">
                                      Qty: {item.quantity} {item.oemNumber ? `&bull; OEM: ${item.oemNumber}` : ''}
                                    </span>
                                  </div>
                                  <span className="font-mono font-bold text-neutral-950 text-sm">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Status and Action Row */}
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-neutral-200 bg-neutral-50 -mx-5 -mb-5 p-4 rounded-b-xl">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-neutral-600 font-bold text-xs">Update Status:</span>
                                <select
                                  value={order.orderStatus}
                                  disabled={busyOrderId === order.id}
                                  onChange={(e) =>
                                    onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                                  }
                                  className="bg-white border border-neutral-300 text-neutral-950 text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteOrderClick(e, order.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Order</span>
                              </button>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              <span className="text-neutral-600 text-xs font-semibold">Total Order Amount:</span>
                              <span className="text-base font-bold text-neutral-950 font-mono px-3 py-1 bg-white border border-neutral-300 rounded-lg shadow-sm">
                                ${order.total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            MODAL: PRODUCT
        =================================================================== */}
        {productFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-lg w-full p-5 sm:p-6 space-y-4 my-8 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">
                    {editingProductId ? 'Edit Product' : 'Add Product'}
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Upload photos, set product details, price, type, and inventory
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProductFormOpen(false)}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer text-base rounded-md"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                {/* 1. Upload photos (can be more than 2) */}
                <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
                  <MultiImageUploader
                    label="Upload Photos (can upload 2 or more photos)"
                    images={prodForm.images || []}
                    onChange={(imgs) =>
                      setProdForm({
                        ...prodForm,
                        images: imgs,
                      })
                    }
                    helperText="Upload 2 or more pictures for this product. The 1st photo is used as the primary cover photo."
                  />
                </div>

                {/* 2. Name of the product */}
                <div>
                  <label className="block text-neutral-300 mb-1.5 font-medium">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    placeholder="e.g. 6.7L Turbocharger Assembly"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-neutral-500 text-xs"
                  />
                </div>

                {/* 3. Description */}
                <div>
                  <label className="block text-neutral-300 mb-1.5 font-medium">Description</label>
                  <textarea
                    rows={3}
                    value={prodForm.description}
                    onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                    placeholder="Enter product description, condition, fitment or details..."
                    className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-neutral-500 text-xs"
                  />
                </div>

                {/* 4. Price ($), 5. Type, and 6. Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-300 mb-1.5 font-medium">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={prodForm.price}
                      onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                      placeholder="0.00"
                      className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-neutral-500 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1.5 font-medium">Type *</label>
                    <select
                      value={prodForm.brand}
                      onChange={(e) =>
                        setProdForm({ ...prodForm, brand: e.target.value as 'Ford' | 'GMC' | 'Dodge / Ram' })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-neutral-500 text-xs cursor-pointer"
                    >
                      <option value="Dodge / Ram">Dodge / Ram</option>
                      <option value="GMC">GMC</option>
                      <option value="Ford">Ford</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1.5 font-medium">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={prodForm.stockCount}
                      onChange={(e) => setProdForm({ ...prodForm, stockCount: Number(e.target.value) })}
                      placeholder="1"
                      className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-neutral-500 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="w-full py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
                  >
                    <span>{savingProduct ? 'Saving…' : editingProductId ? 'Update Product' : 'Save Product'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL: GALLERY
        =================================================================== */}
        {galleryFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-md w-full p-5 space-y-4 my-8 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
                <h3 className="text-sm font-semibold text-white">Add Photo</h3>
                <button
                  type="button"
                  onClick={() => setGalleryFormOpen(false)}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer text-base rounded-md"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveGallery} className="space-y-3">
                <MultiImageUploader
                  label="Gallery Photos"
                  folder="gallery"
                  images={galForm.images || []}
                  onChange={(images) =>
                    setGalForm({
                      ...galForm,
                      images,
                      imageUrl: images[0] || '',
                    })
                  }
                  helperText="Upload one or many gallery photos. All selected photos are saved to this gallery post."
                />
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Title</label>
                  <input
                    type="text"
                    required
                    value={galForm.title}
                    onChange={(e) => setGalForm({ ...galForm, title: e.target.value })}
                    placeholder="e.g. Ram 3500 Commercial Tow Rig"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2 rounded focus:outline-none focus:border-neutral-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Brand</label>
                    <select
                      value={galForm.truckBrand}
                      onChange={(e) =>
                        setGalForm({ ...galForm, truckBrand: e.target.value as 'Ford' | 'GMC' | 'Dodge / Ram' })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2 rounded focus:outline-none focus:border-neutral-600"
                    >
                      <option value="Dodge / Ram">Dodge / Ram</option>
                      <option value="Ford">Ford</option>
                      <option value="GMC">GMC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Year</label>
                    <input
                      type="text"
                      value={galForm.year}
                      onChange={(e) => setGalForm({ ...galForm, year: e.target.value })}
                      placeholder="2024"
                      className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2 rounded focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">
                    Post Description (Displays directly below photo)
                  </label>
                  <textarea
                    rows={3}
                    value={galForm.caption}
                    onChange={(e) => setGalForm({ ...galForm, caption: e.target.value })}
                    placeholder="Write a description of the truck build, parts installed, or details to display below the image..."
                    className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2 rounded focus:outline-none focus:border-neutral-600 leading-relaxed"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingGallery}
                    className="w-full py-2 bg-white text-black font-medium text-xs rounded hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                  >
                    {savingGallery ? 'Saving…' : 'Save Photo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL: REVIEW
        =================================================================== */}
        {reviewFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-md w-full p-5 space-y-4 my-8 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
                <h3 className="text-sm font-semibold text-white">Add Review</h3>
                <button
                  type="button"
                  onClick={() => setReviewFormOpen(false)}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer text-base rounded-md"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveReview} className="space-y-3">
                <ImageUploader
                  label="Author Avatar"
                  value={revForm.avatar}
                  onChange={(val) => setRevForm({ ...revForm, avatar: val })}
                  compact
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Author</label>
                    <input
                      type="text"
                      required
                      value={revForm.author}
                      onChange={(e) => setRevForm({ ...revForm, author: e.target.value })}
                      placeholder="Name"
                      className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2 rounded focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Rating</label>
                    <select
                      value={revForm.rating}
                      onChange={(e) => setRevForm({ ...revForm, rating: Number(e.target.value) })}
                      className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2 rounded focus:outline-none focus:border-neutral-600"
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Comment</label>
                  <textarea
                    rows={2}
                    required
                    value={revForm.comment}
                    onChange={(e) => setRevForm({ ...revForm, comment: e.target.value })}
                    placeholder="Customer feedback..."
                    className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2 rounded focus:outline-none focus:border-neutral-600"
                  />
                </div>
                <ImageUploader
                  label="Attached Photo (Optional)"
                  value={revForm.reviewImage}
                  onChange={(val) => setRevForm({ ...revForm, reviewImage: val })}
                  compact
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Link URL (Optional)</label>
                    <input
                      type="url"
                      value={revForm.link}
                      onChange={(e) => setRevForm({ ...revForm, link: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2 rounded focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Link Text</label>
                    <input
                      type="text"
                      value={revForm.linkText}
                      onChange={(e) => setRevForm({ ...revForm, linkText: e.target.value })}
                      placeholder="e.g. Forum Post"
                      className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2 rounded focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingReview}
                    className="w-full py-2 bg-white text-black font-medium text-xs rounded hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                  >
                    {savingReview ? 'Saving…' : 'Save Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
