import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Product,
  CartItem,
  Order,
  Review,
  GalleryItem,
  NavPage,
  PartCategory,
  OrderStatus,
} from './types';
import { api, idbSet } from './services/api';
import { getSupabase } from './services/supabase';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './views/HomePage';
import { ProductsPage } from './views/ProductsPage';
import { ProductDetailPage } from './views/ProductDetailPage';
import { ServicesPage } from './views/ServicesPage';
import { AboutPage } from './views/AboutPage';
import { ContactPage } from './views/ContactPage';
import { RefundPolicyPage } from './views/RefundPolicyPage';
import { ReviewsPage } from './views/ReviewsPage';
import { GalleryPage } from './views/GalleryPage';
import { CheckoutPage } from './views/CheckoutPage';
import { AdminPage } from './views/AdminPage';
import { sendOrderPushNotification, playOrderChime } from './utils/notifications';

function getInitialPage(): { page: NavPage; tab?: 'products' | 'gallery' | 'reviews' | 'orders' } {
  if (typeof window === 'undefined') return { page: 'home' };

  const validPages: NavPage[] = [
    'home',
    'services',
    'about',
    'products',
    'product',
    'product-detail',
    'reviews',
    'gallery',
    'contact',
    'refund-policy',
    'checkout',
    'admin',
  ];

  const pathname = window.location.pathname.toLowerCase();
  const pathParts = pathname.split('/').filter(Boolean);

  if (pathParts.includes('admin') || pathname.endsWith('/admin') || pathname.endsWith('/admin/')) {
    const adminIdx = pathParts.indexOf('admin');
    const subTab = pathParts[adminIdx + 1] as 'products' | 'gallery' | 'reviews' | 'orders' | undefined;
    return {
      page: 'admin',
      tab: subTab && ['products', 'gallery', 'reviews', 'orders'].includes(subTab) ? subTab : undefined,
    };
  }

  for (const p of validPages) {
    if (pathParts.includes(p)) return { page: p };
  }

  return { page: 'home' };
}

export default function App() {
  const initialRoute = getInitialPage();
  const [currentPage, setCurrentPage] = useState<NavPage>(initialRoute.page);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    try {
      const saved = sessionStorage.getItem('tpd_selected_product');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedBrand, setSelectedBrand] = useState<'All' | 'Ford' | 'GMC' | 'Dodge / Ram'>('All');
  const [selectedCategory, setSelectedCategory] = useState<PartCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminInitialTab, setAdminInitialTab] = useState<'products' | 'gallery' | 'reviews' | 'orders'>(
    initialRoute.tab || 'products'
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Initial Cache Load from IndexedDB
  useEffect(() => {
    let active = true;
    void (async () => {
      const cached = await api.getInitialCachedData();
      if (active) {
        if (cached.products.length > 0) setProducts(cached.products);
        if (cached.orders.length > 0) setOrders(cached.orders);
        if (cached.reviews.length > 0) setReviews(cached.reviews);
        if (cached.gallery.length > 0) setGallery(cached.gallery);
        if (cached.products.length > 0) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // 2. Independent Data Fetching
  // Each resource has its own monotonically-increasing request id. Because
  // refreshProducts/Orders/etc. get triggered concurrently and independently
  // from three places (initial mount, the realtime channel, and the 15s
  // poll), network responses can resolve out of order (a slower, earlier
  // request finishing AFTER a faster, later one). Without sequencing, that
  // stale response overwrites fresh state — this was the cause of newly
  // added products appearing then vanishing on refresh. We only ever commit
  // the response that belongs to the most recently issued request for that
  // resource; anything older is discarded.
  const productsReqId = useRef(0);
  const ordersReqId = useRef(0);
  const reviewsReqId = useRef(0);
  const galleryReqId = useRef(0);

  const refreshProducts = useCallback(async () => {
    const reqId = ++productsReqId.current;
    const list = await api.getProducts();
    if (reqId !== productsReqId.current) return; // a newer request already won
    // list is null when every fetch attempt failed (e.g. slow connection +
    // large embedded photos) — keep whatever is already rendered instead of
    // replacing it with an empty catalog. Only a real (possibly empty)
    // result from the database is committed to state.
    if (list !== null) {
      setProducts(list);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    const reqId = ++ordersReqId.current;
    const list = await api.getOrders();
    if (reqId !== ordersReqId.current) return;
    if (list) setOrders(list);
  }, []);

  const refreshReviews = useCallback(async () => {
    const reqId = ++reviewsReqId.current;
    const list = await api.getReviews();
    if (reqId !== reviewsReqId.current) return;
    if (list) setReviews(list);
  }, []);

  const refreshGallery = useCallback(async () => {
    const reqId = ++galleryReqId.current;
    const list = await api.getGallery();
    if (reqId !== galleryReqId.current) return;
    if (list) setGallery(list);
  }, []);

  const refreshAll = useCallback(() => {
    void refreshProducts();
    void refreshOrders();
    void refreshReviews();
    void refreshGallery();
  }, [refreshProducts, refreshOrders, refreshReviews, refreshGallery]);

  useEffect(() => {
    refreshAll();

    const supabase = getSupabase();
    let channel: any = null;
    if (supabase) {
      try {
        channel = supabase.channel('tpd-live-sync');
        channel.on('postgres_changes', { event: '*', schema: 'public' }, (payload: any) => {
          if (payload.table === 'products') void refreshProducts();
          if (payload.table === 'orders') {
            void refreshOrders();
            playOrderChime();
          }
          if (payload.table === 'reviews') void refreshReviews();
          if (payload.table === 'gallery') void refreshGallery();
        });
        channel.subscribe();
      } catch (err) {
        console.warn('Realtime subscription skipped:', err);
      }
    }

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshAll();
      }
    }, 15000);

    return () => {
      clearInterval(timer);
      if (supabase && channel) void supabase.removeChannel(channel);
    };
  }, [refreshAll, refreshProducts, refreshOrders, refreshReviews, refreshGallery]);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tpd_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('tpd_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  const handleNavigate = (page: NavPage, initialTab?: 'products' | 'gallery' | 'reviews' | 'orders') => {
    setCurrentPage(page);
    if (initialTab) setAdminInitialTab(initialTab);
    if (typeof window !== 'undefined') {
      try {
        const targetUrl = page === 'home' ? '/' : `/${page}`;
        window.history.pushState({ page, initialTab }, '', targetUrl);
      } catch {}
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    try {
      sessionStorage.setItem('tpd_selected_product', JSON.stringify(product));
    } catch {}
    setCurrentPage('product-detail');
    if (typeof window !== 'undefined') {
      window.history.pushState({ page: 'product-detail' }, '', '/product-detail');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBrand = (brand: 'All' | 'Ford' | 'GMC' | 'Dodge / Ram') => {
    setSelectedBrand(brand);
    setCurrentPage('products');
    if (typeof window !== 'undefined') {
      window.history.pushState({ page: 'products' }, '', '/products');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setCartOpen(true);
  };

  const handleOrderNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    handleNavigate('checkout');
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => setCartItems([]);

  const handleProceedToCheckout = () => {
    setCartOpen(false);
    handleNavigate('checkout');
  };

  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => {
      const next = [newOrder, ...prev.filter((o) => o.id !== newOrder.id)];
      void idbSet('tpd_orders', next);
      return next;
    });
    playOrderChime();
    void sendOrderPushNotification(newOrder);
  };

  const handleAddProduct = async (p: Partial<Product>) => {
    const created = await api.createProduct(p);
    setProducts((prev) => {
      const next = [created, ...prev.filter((item) => item.id !== created.id)];
      void idbSet('tpd_products', next);
      return next;
    });
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    const updated = await api.updateProduct(id, updates);
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updated } : p));
      void idbSet('tpd_products', next);
      return next;
    });
  };

  const handleDeleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      void idbSet('tpd_products', next);
      return next;
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await api.updateOrderStatus(orderId, status);
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o));
      void idbSet('tpd_orders', next);
      return next;
    });
  };

  const handleDeleteOrder = async (orderId: string) => {
    await api.deleteOrder(orderId);
    setOrders((prev) => {
      const next = prev.filter((o) => o.id !== orderId);
      void idbSet('tpd_orders', next);
      return next;
    });
  };

  const handleAddGalleryItem = async (g: Partial<GalleryItem>) => {
    const created = await api.createGalleryItem(g);
    setGallery((prev) => {
      const next = [created, ...prev.filter((item) => item.id !== created.id)];
      void idbSet('tpd_gallery', next);
      return next;
    });
  };

  const handleDeleteGalleryItem = async (id: string) => {
    await api.deleteGalleryItem(id);
    setGallery((prev) => {
      const next = prev.filter((g) => g.id !== id);
      void idbSet('tpd_gallery', next);
      return next;
    });
  };

  const handleAddReview = async (r: Partial<Review>) => {
    const created = await api.createReview(r);
    setReviews((prev) => {
      const next = [created, ...prev.filter((item) => item.id !== created.id)];
      void idbSet('tpd_reviews', next);
      return next;
    });
  };

  const handleDeleteReview = async (id: string) => {
    await api.deleteReview(id);
    setReviews((prev) => {
      const next = prev.filter((r) => r.id !== id);
      void idbSet('tpd_reviews', next);
      return next;
    });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            products={products}
            gallery={gallery}
            reviews={reviews}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedBrand={selectedBrand}
            onSelectBrand={handleSelectBrand}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
          />
        );
      case 'products':
        return (
          <ProductsPage
            products={products}
            isLoading={isLoading}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onSelectBrand={setSelectedBrand}
            onSelectCategory={setSelectedCategory}
            onSearchChange={setSearchQuery}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
          />
        );
      case 'product':
      case 'product-detail':
        return (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={products}
            onBack={() => handleNavigate('products')}
            onAddToCart={handleAddToCart}
            onOrderNow={handleOrderNow}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        );
      case 'services':
        return <ServicesPage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage />;
      case 'refund-policy':
        return <RefundPolicyPage />;
      case 'reviews':
        return (
          <ReviewsPage
            reviews={reviews}
            isLoading={isLoading}
            onAddReview={handleAddReview}
            onNavigate={handleNavigate}
          />
        );
      case 'gallery':
        return (
          <GalleryPage
            galleryItems={gallery}
            isLoading={isLoading}
            onAddGalleryItem={handleAddGalleryItem}
            onNavigate={handleNavigate}
          />
        );
      case 'checkout':
        return (
          <CheckoutPage
            cartItems={cartItems}
            onClearCart={handleClearCart}
            onNavigate={handleNavigate}
            onOrderCreated={handleOrderCreated}
          />
        );
      case 'admin':
        return (
          <AdminPage
            products={products}
            orders={orders}
            reviews={reviews}
            gallery={gallery}
            isLoading={isLoading}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onAddGalleryItem={handleAddGalleryItem}
            onDeleteGalleryItem={handleDeleteGalleryItem}
            onAddReview={handleAddReview}
            onDeleteReview={handleDeleteReview}
            onNavigate={handleNavigate}
            onRefreshOrders={refreshOrders}
            initialTab={adminInitialTab}
          />
        );
      default:
        return (
          <HomePage
            products={products}
            gallery={gallery}
            reviews={reviews}
            isLoading={isLoading}
            onSelectProduct={handleSelectProduct}
            onSelectBrand={handleSelectBrand}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      <Navbar
        currentPage={currentPage}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onNavigate={handleNavigate}
        onOpenCart={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        products={products}
        onSelectProduct={handleSelectProduct}
        selectedBrand={selectedBrand}
        onSelectBrand={handleSelectBrand}
      />

      <main className="flex-1">{renderCurrentPage()}</main>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
