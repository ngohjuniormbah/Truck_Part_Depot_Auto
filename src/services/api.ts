import { Product, Order, Review, GalleryItem, PartCategory } from '../types';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_GALLERY, INITIAL_ORDERS } from '../data/initialData';
import { getSupabase } from './supabase';

const IDB_NAME = 'tpd_depot_cache';
const IDB_STORE = 'app_data';

const idbGet = <T>(key: string, fallback: T): Promise<T> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) return resolve(fallback);
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
      req.onsuccess = () => {
        const tx = req.result.transaction(IDB_STORE, 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const getReq = store.get(key);
        getReq.onsuccess = () => resolve(getReq.result || fallback);
        getReq.onerror = () => resolve(fallback);
      };
      req.onerror = () => resolve(fallback);
    } catch {
      resolve(fallback);
    }
  });
};

export const idbSet = (key: string, val: any): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) return resolve();
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
      req.onsuccess = () => {
        const tx = req.result.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        store.put(val, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      };
      req.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
};

export function normalizeBrand(b?: string): 'Ford' | 'GMC' | 'Dodge / Ram' {
  if (!b) return 'Dodge / Ram';
  const l = b.toLowerCase();
  if (l.includes('dodge') || l.includes('ram')) return 'Dodge / Ram';
  if (l.includes('ford') || l.includes('powerstroke')) return 'Ford';
  if (l.includes('gmc') || l.includes('duramax') || l.includes('chevy')) return 'GMC';
  return (b as any) || 'Dodge / Ram';
}

function mapDbProduct(row: any): Product {
  let images: string[] = [];
  if (Array.isArray(row.images) && row.images.length > 0) {
    images = row.images;
  } else if (typeof row.images === 'string') {
    try {
      const parsed = JSON.parse(row.images);
      if (Array.isArray(parsed)) images = parsed;
    } catch {
      images = [row.images];
    }
  } else if (row.image) {
    images = [row.image];
  }
  return {
    id: String(row.id),
    name: row.name || 'Truck Part',
    brand: normalizeBrand(row.brand),
    model: row.model || '',
    yearRange: row.year_range || row.yearRange || '2015-2025',
    engine: row.engine || '',
    category: row.category || 'Turbochargers & Air Systems',
    oemNumber: row.oem_number || row.oemNumber || '',
    sku: row.sku || `SKU-${row.id}`,
    price: Number(row.price) || 0,
    coreDeposit: Number(row.core_deposit ?? row.coreDeposit ?? 0),
    inStock: row.in_stock !== undefined ? Boolean(row.in_stock) : true,
    stockCount: Number(row.stock_count ?? row.stockCount ?? 1),
    description: row.description || '',
    specs: row.specs || {},
    image: row.image || (images.length > 0 ? images[0] : ''),
    images: images.length > 0 ? images : [row.image || ''],
    featured: Boolean(row.featured),
    warranty: row.warranty || '12-Month / Unlimited-Mile Commercial',
  };
}

function mapProductToDb(p: Partial<Product>): Record<string, any> {
  const out: Record<string, any> = {};
  if (p.id) out.id = p.id;
  if (p.name !== undefined) out.name = p.name;
  if (p.brand !== undefined) out.brand = normalizeBrand(p.brand);
  if (p.model !== undefined) out.model = p.model;
  if (p.yearRange !== undefined) out.year_range = p.yearRange;
  if (p.engine !== undefined) out.engine = p.engine;
  if (p.category !== undefined) out.category = p.category;
  if (p.oemNumber !== undefined) out.oem_number = p.oemNumber;
  if (p.sku !== undefined) out.sku = p.sku;
  if (p.price !== undefined) out.price = Number(p.price) || 0;
  if (p.coreDeposit !== undefined) out.core_deposit = Number(p.coreDeposit) || 0;
  if (p.inStock !== undefined) out.in_stock = Boolean(p.inStock);
  if (p.stockCount !== undefined) out.stock_count = Number(p.stockCount) || 0;
  if (p.description !== undefined) out.description = p.description;
  if (p.specs !== undefined) out.specs = p.specs;
  if (p.image !== undefined) out.image = p.image;
  if (p.images !== undefined) out.images = p.images;
  if (p.featured !== undefined) out.featured = Boolean(p.featured);
  if (p.warranty !== undefined) out.warranty = p.warranty;
  return out;
}

export const api = {
  async getInitialCachedData() {
    const [products, orders, reviews, gallery] = await Promise.all([
      idbGet<Product[]>('tpd_products', INITIAL_PRODUCTS),
      idbGet<Order[]>('tpd_orders', INITIAL_ORDERS),
      idbGet<Review[]>('tpd_reviews', INITIAL_REVIEWS),
      idbGet<GalleryItem[]>('tpd_gallery', INITIAL_GALLERY),
    ]);
    return { products, orders, reviews, gallery };
  },

  // Products can carry large embedded photos (old rows saved before the
  // Storage bucket existed — see supabase-storage-setup.sql), which makes
  // `select('*')` a multi-megabyte response. On a slow/flaky connection that
  // single attempt can fail. A bare try/catch used to treat that exactly
  // like "no products", silently swapping a working list for an empty or
  // stale one. We now retry a couple of times before giving up, and a
  // failure returns null (not an empty list) so the caller keeps whatever
  // it already has on screen instead of wiping it.
  async getProducts(params?: { brand?: string; category?: PartCategory; search?: string }): Promise<Product[] | null> {
    const supabase = getSupabase();
    if (supabase) {
      const attempts = 3;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          let query = supabase.from('products').select('*');
          if (params?.brand && params.brand !== 'All') {
            query = query.eq('brand', normalizeBrand(params.brand));
          }
          if (params?.category && params.category !== 'All') {
            query = query.eq('category', params.category);
          }
          const { data, error } = await query;
          if (error) throw error;
          if (Array.isArray(data)) {
            let list = data.map(mapDbProduct);
            if (params?.search) {
              const q = params.search.trim().toLowerCase();
              list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.oemNumber && p.oemNumber.toLowerCase().includes(q)));
            }
            if (!params?.brand && !params?.category && !params?.search) {
              void idbSet('tpd_products', list);
            }
            return list;
          }
        } catch (err) {
          console.warn(`Supabase products fetch failed (attempt ${attempt}/${attempts}):`, err);
          if (attempt < attempts) {
            await new Promise((r) => setTimeout(r, attempt * 800));
          } else {
            console.error(
              'All product fetch attempts failed — the site will keep showing whatever was already on screen (or the last cached copy on first load) instead of an empty catalog. ' +
                'If this keeps happening, some product photos are likely still stored as giant embedded base64 images instead of Storage URLs; run the "Optimize Photos" tool in Admin > Products.'
            );
          }
        }
      }
      return null;
    }
    return await idbGet<Product[]>('tpd_products', INITIAL_PRODUCTS);
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const newProduct: Product = {
      id: product.id || `prod-${Date.now()}`,
      name: product.name || 'New Truck Part',
      brand: normalizeBrand(product.brand),
      model: product.model || '',
      yearRange: product.yearRange || '2015-2025',
      engine: product.engine || 'Heavy Duty Diesel',
      category: product.category || 'Turbochargers & Air Systems',
      oemNumber: product.oemNumber || '',
      sku: product.sku || `SKU-${Date.now().toString().slice(-4)}`,
      price: Number(product.price) || 0,
      coreDeposit: Number(product.coreDeposit) || 0,
      inStock: product.inStock ?? true,
      stockCount: Number(product.stockCount) || 1,
      description: product.description || '',
      specs: product.specs || {},
      image: product.image || (product.images?.[0] || ''),
      images: product.images?.length ? product.images : (product.image ? [product.image] : []),
      featured: Boolean(product.featured),
      warranty: product.warranty || '12-Month / Unlimited-Mile Commercial',
    };

    const supabase = getSupabase();
    if (supabase) {
      const fullDb = mapProductToDb(newProduct);
      let res = await supabase.from('products').upsert(fullDb).select().single();
      if (res.error) {
        console.error(
          'Product insert with images/specs/warranty failed — retrying without them. ' +
            'This means those fields were NOT saved to the database:',
          res.error
        );
        const { images: _i, specs: _s, warranty: _w, ...coreDb } = fullDb;
        res = await supabase.from('products').upsert(coreDb).select().single();
      }
      if (res.error) {
        console.error('Supabase product insert error:', res.error);
        throw new Error(res.error.message);
      }
      if (res.data) {
        const saved = mapDbProduct(res.data);
        if (newProduct.images?.length && (!saved.images || !saved.images.length)) {
          saved.images = newProduct.images;
        }
        return saved;
      }
    }
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const supabase = getSupabase();
    if (supabase) {
      const fullDb = mapProductToDb(updates);
      let res = await supabase.from('products').update(fullDb).eq('id', id).select().single();
      if (res.error) {
        console.error(
          'Product update with images/specs/warranty failed — retrying without them. ' +
            'This means those fields were NOT saved to the database:',
          res.error
        );
        const { images: _i, specs: _s, warranty: _w, ...coreDb } = fullDb;
        res = await supabase.from('products').update(coreDb).eq('id', id).select().single();
      }
      if (res.error) throw new Error(res.error.message);
      if (res.data) return mapDbProduct(res.data);
    }
    return { id, ...updates } as Product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) console.error('Delete product error:', error);
    }
    return true;
  },

  async getOrders(): Promise<Order[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let res = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (res.error) {
          res = await supabase.from('orders').select('*');
        }
        if (!res.error && Array.isArray(res.data)) {
          const list = res.data.map((r: any) => ({
            id: String(r.id),
            createdAt: r.created_at || new Date().toISOString(),
            customerName: r.customer_name || 'Customer',
            customerEmail: r.customer_email || '',
            customerPhone: r.customer_phone || '',
            companyName: r.company_name || '',
            shippingAddress: r.shipping_address || { street: '', city: '', state: '', zip: '', deliveryType: 'commercial' },
            shippingMethod: r.shipping_method || 'standard',
            items: Array.isArray(r.items) ? r.items : [],
            subtotal: Number(r.subtotal) || 0,
            coreDepositTotal: Number(r.core_deposit_total) || 0,
            shippingFee: Number(r.shipping_fee) || 0,
            tax: Number(r.tax) || 0,
            total: Number(r.total) || 0,
            paymentMethod: r.payment_method || 'zelle',
            paymentAccountInfo: r.payment_account_info || '',
            paymentStatus: r.payment_status || 'Pending Verification',
            orderStatus: r.order_status || 'Pending',
            trackingNumber: r.tracking_number || '',
            notes: r.notes || '',
          }));
          void idbSet('tpd_orders', list);
          return list;
        }
      } catch {}
    }
    return await idbGet<Order[]>('tpd_orders', INITIAL_ORDERS);
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const newOrder: Order = {
      id: orderData.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: orderData.createdAt || new Date().toISOString(),
      customerName: orderData.customerName || 'Customer',
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone || '',
      companyName: orderData.companyName || '',
      shippingAddress: orderData.shippingAddress || { street: '', city: '', state: '', zip: '', deliveryType: 'commercial' },
      shippingMethod: orderData.shippingMethod || 'standard',
      items: orderData.items || [],
      subtotal: Number(orderData.subtotal) || 0,
      coreDepositTotal: Number(orderData.coreDepositTotal) || 0,
      shippingFee: Number(orderData.shippingFee) || 0,
      tax: Number(orderData.tax) || 0,
      total: Number(orderData.total) || 0,
      paymentMethod: orderData.paymentMethod || 'zelle',
      paymentAccountInfo: orderData.paymentAccountInfo || '',
      paymentStatus: orderData.paymentStatus || 'Pending Verification',
      orderStatus: orderData.orderStatus || 'Pending',
      trackingNumber: orderData.trackingNumber || `TDP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      notes: orderData.notes || '',
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('orders').insert({
          id: newOrder.id,
          created_at: newOrder.createdAt,
          customer_name: newOrder.customerName,
          customer_email: newOrder.customerEmail,
          customer_phone: newOrder.customerPhone,
          company_name: newOrder.companyName,
          shipping_address: newOrder.shippingAddress,
          shipping_method: newOrder.shippingMethod,
          items: newOrder.items,
          subtotal: newOrder.subtotal,
          core_deposit_total: newOrder.coreDepositTotal,
          shipping_fee: newOrder.shippingFee,
          tax: newOrder.tax,
          total: newOrder.total,
          payment_method: newOrder.paymentMethod,
          payment_account_info: newOrder.paymentAccountInfo,
          payment_status: newOrder.paymentStatus,
          order_status: newOrder.orderStatus,
          tracking_number: newOrder.trackingNumber,
          notes: newOrder.notes,
        });
      } catch (err) {
        console.warn('Order save failed:', err);
      }
    }
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
      } catch {}
    }
    return { id: orderId, orderStatus: status as any } as Order;
  },

  async deleteOrder(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('orders').delete().eq('id', id);
      } catch {}
    }
    return true;
  },

  async getReviews(): Promise<Review[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let res = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (res.error) {
          res = await supabase.from('reviews').select('*');
        }
        if (!res.error && Array.isArray(res.data)) {
          const list = res.data.map((r: any) => ({
            id: String(r.id),
            author: r.author || 'Verified Buyer',
            avatar: r.avatar || '',
            company: r.company || '',
            truckModel: r.truck_model || r.truckModel || '',
            rating: Number(r.rating) || 5,
            date: r.date || '',
            comment: r.comment || '',
            partPurchased: r.part_purchased || r.partPurchased || '',
            verifiedPurchase: Boolean(r.verified_purchase ?? true),
            reviewImage: r.review_image || r.reviewImage || '',
            link: r.link || '',
            linkText: r.link_text || r.linkText || '',
          }));
          void idbSet('tpd_reviews', list);
          return list;
        }
      } catch (err) {
        console.warn('Reviews fetch error:', err);
      }
    }
    return await idbGet<Review[]>('tpd_reviews', INITIAL_REVIEWS);
  },

  async createReview(reviewData: Partial<Review>): Promise<Review> {
    const newRev: Review = {
      id: reviewData.id || `REV-${Date.now()}`,
      author: reviewData.author || 'Verified Buyer',
      avatar: reviewData.avatar || '',
      company: reviewData.company || '',
      truckModel: reviewData.truckModel || 'Ford F-250',
      rating: Number(reviewData.rating) || 5,
      date: reviewData.date || 'Just Now',
      comment: reviewData.comment || '',
      partPurchased: reviewData.partPurchased || '',
      verifiedPurchase: reviewData.verifiedPurchase ?? true,
      reviewImage: reviewData.reviewImage || '',
      link: reviewData.link || '',
      linkText: reviewData.linkText || '',
    };

    const supabase = getSupabase();
    if (supabase) {
      const fullPayload = {
        id: newRev.id,
        author: newRev.author,
        avatar: newRev.avatar,
        company: newRev.company,
        truck_model: newRev.truckModel,
        rating: newRev.rating,
        date: newRev.date,
        comment: newRev.comment,
        part_purchased: newRev.partPurchased,
        verified_purchase: newRev.verifiedPurchase,
        review_image: newRev.reviewImage,
        link: newRev.link,
        link_text: newRev.linkText,
      };

      let res = await supabase.from('reviews').insert(fullPayload).select().single();
      if (res.error) {
        const { review_image: _ri, link_text: _lt, ...corePayload } = fullPayload;
        res = await supabase.from('reviews').insert(corePayload).select().single();
      }
      if (res.error) {
        console.error('Final review insert error:', res.error);
        throw new Error(res.error.message);
      }
    }
    return newRev;
  },

  async deleteReview(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) console.error('Delete review error:', error);
    }
    return true;
  },

  async getGallery(): Promise<GalleryItem[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let res = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (res.error) {
          res = await supabase.from('gallery').select('*');
        }
        if (!res.error && Array.isArray(res.data)) {
          const list = res.data.map((g: any) => {
            let imgs: string[] = [];
            if (Array.isArray(g.images) && g.images.length > 0) {
              imgs = g.images;
            } else if (typeof g.images === 'string') {
              try {
                const parsed = JSON.parse(g.images);
                if (Array.isArray(parsed)) imgs = parsed;
              } catch {
                imgs = [g.images];
              }
            } else if (g.image_url) {
              imgs = [g.image_url];
            }
            return {
              id: String(g.id),
              title: g.title || 'Rig Build',
              truckBrand: normalizeBrand(g.truck_brand || g.truckBrand),
              truckModel: g.truck_model || g.truckModel || '',
              year: g.year || '',
              imageUrl: g.image_url || (imgs[0] || ''),
              images: imgs.length > 0 ? imgs : [g.image_url || ''],
              caption: g.caption || '',
              installedParts: Array.isArray(g.installed_parts) ? g.installed_parts : [],
            };
          });
          void idbSet('tpd_gallery', list);
          return list;
        }
      } catch (err) {
        console.warn('Gallery fetch error:', err);
      }
    }
    return await idbGet<GalleryItem[]>('tpd_gallery', INITIAL_GALLERY);
  },

  async createGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
    const images = (item.images && item.images.length > 0 ? item.images : (item.imageUrl ? [item.imageUrl] : [])).filter(Boolean);
    const newItem: GalleryItem = {
      id: item.id || `GAL-${Date.now()}`,
      title: item.title || 'Customer Rig Installation',
      truckBrand: normalizeBrand(item.truckBrand),
      truckModel: item.truckModel || '',
      year: item.year || '2024',
      imageUrl: item.imageUrl || (images[0] || ''),
      images: images.length > 0 ? images : [item.imageUrl || ''],
      caption: item.caption || '',
      installedParts: item.installedParts || [],
    };

    const supabase = getSupabase();
    if (supabase) {
      const fullPayload = {
        id: newItem.id,
        title: newItem.title,
        truck_brand: newItem.truckBrand,
        truck_model: newItem.truckModel,
        year: newItem.year,
        image_url: newItem.imageUrl,
        images: newItem.images,
        caption: newItem.caption,
        installed_parts: newItem.installedParts,
      };

      let res = await supabase.from('gallery').upsert(fullPayload).select().single();
      if (res.error) {
        const { images: _i, installed_parts: _ip, ...corePayload } = fullPayload;
        res = await supabase.from('gallery').upsert(corePayload).select().single();
      }
      if (res.error) {
        console.error('Final gallery insert error:', res.error);
        throw new Error(res.error.message);
      }
    }
    return newItem;
  },

  async deleteGalleryItem(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) console.error('Delete gallery error:', error);
    }
    return true;
  },
};
