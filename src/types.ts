export type TruckBrand = 'Ford' | 'GMC' | 'Dodge / Ram' | 'All';

export type PartCategory =
  | 'All'
  | 'Turbochargers & Air Systems'
  | 'Fuel Injectors & Pumps'
  | 'Transmissions & Drivetrain'
  | 'Suspension & Steering'
  | 'Brakes & Hubs'
  | 'Cooling & Radiators'
  | 'Exhaust & Emissions'
  | 'Electrical & Sensors';

export interface Product {
  id: string;
  name: string;
  brand: 'Ford' | 'GMC' | 'Dodge / Ram';
  model: string;
  yearRange: string;
  engine: string;
  category: PartCategory;
  oemNumber: string;
  sku: string;
  price: number;
  coreDeposit?: number;
  inStock: boolean;
  stockCount: number;
  description: string;
  specs: { [key: string]: string };
  image: string;
  images?: string[];
  featured?: boolean;
  warranty: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  name?: string;
  id?: string;
  brand: string;
  oemNumber: string;
  price: number;
  quantity: number;
  coreDeposit: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type PaymentMethod =
  | 'zelle'
  | 'cashapp'
  | 'chime'
  | 'apple_pay';

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    deliveryType: 'commercial' | 'residential';
  };
  shippingMethod: 'standard' | 'express' | 'ground' | 'freight_liftgate' | 'overnight_diesel' | string;
  items: OrderItem[];
  subtotal: number;
  coreDepositTotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod | string;
  paymentAccountInfo?: string;
  paymentStatus: 'Paid' | 'Authorized' | 'Awaiting Wire' | 'Pending Verification';
  orderStatus: OrderStatus;
  trackingNumber: string;
  notes?: string;
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  company?: string;
  truckModel: string;
  rating: number;
  date: string;
  comment: string;
  partPurchased?: string;
  verifiedPurchase: boolean;
  reviewImage?: string;
  link?: string;
  linkText?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  truckBrand: 'Ford' | 'GMC' | 'Dodge / Ram';
  truckModel: string;
  year: string;
  imageUrl: string;
  images?: string[];
  caption: string;
  installedParts: string[];
}

export interface VehicleFilter {
  brand: TruckBrand;
  model: string;
  year: string;
  engine: string;
}

export type VehicleSelection = VehicleFilter;

export type NavPage =
  | 'home'
  | 'services'
  | 'about'
  | 'products'
  | 'product'
  | 'product-detail'
  | 'reviews'
  | 'gallery'
  | 'contact'
  | 'refund-policy'
  | 'checkout'
  | 'admin';
