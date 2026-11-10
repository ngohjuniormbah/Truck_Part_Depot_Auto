import type { NavPage, Product } from '../types';
import { getProductPath, slugify } from './seo-slugs.mjs';

export { getProductPath, slugify } from './seo-slugs.mjs';

export const SITE_URL = 'https://truckpartsdepotauto.com';


type PageMetadata = { title: string; description: string };

const PAGE_METADATA: Partial<Record<NavPage, PageMetadata>> = {
  home: {
    title: 'Heavy-Duty Truck Parts & Diesel Components | Truck Parts Depot Auto',
    description: 'Shop heavy-duty truck parts for Cummins, Powerstroke and Duramax applications. Explore diesel components, drivetrain parts and truck parts support.',
  },
  products: {
    title: 'Heavy-Duty Truck Parts Catalog | Truck Parts Depot Auto',
    description: 'Browse heavy-duty truck parts by component, brand, engine and OEM number. Find diesel parts for Cummins, Powerstroke and Duramax applications.',
  },
  services: {
    title: 'Truck Parts & Diesel Component Services | Truck Parts Depot Auto',
    description: 'Learn about truck parts sourcing and support for heavy-duty diesel applications from Truck Parts Depot Auto.',
  },
  about: {
    title: 'About Truck Parts Depot Auto | Heavy-Duty Parts',
    description: 'Learn about Truck Parts Depot Auto and its range of heavy-duty truck and diesel parts.',
  },
  contact: {
    title: 'Contact Truck Parts Depot Auto | Parts & Order Support',
    description: 'Contact Truck Parts Depot Auto for help identifying parts, checking availability or asking about an order.',
  },
  reviews: {
    title: 'Customer Reviews | Truck Parts Depot Auto',
    description: 'Read customer feedback about Truck Parts Depot Auto and its heavy-duty truck parts service.',
  },
  gallery: {
    title: 'Truck Builds & Parts Gallery | Truck Parts Depot Auto',
    description: 'Explore truck builds and installation photos featuring heavy-duty diesel components.',
  },
  'refund-policy': {
    title: 'Returns & Refund Policy | Truck Parts Depot Auto',
    description: 'Review the returns and refund information for Truck Parts Depot Auto.',
  },
  checkout: {
    title: 'Checkout | Truck Parts Depot Auto',
    description: 'Review your order with Truck Parts Depot Auto.',
  },
  admin: {
    title: 'Store Administration | Truck Parts Depot Auto',
    description: 'Store administration.',
  },
};

function setMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>('meta[' + attribute + '="' + key + '"]');
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(url: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

export function updatePageMetadata(page: NavPage, product?: Product | null): void {
  const metadata: PageMetadata = product
    ? {
        title: product.name + ' | ' + product.brand + ' Truck Parts | Truck Parts Depot Auto',
        description: [
          product.name,
          product.brand,
          product.model,
          product.engine,
          product.oemNumber ? 'OEM ' + product.oemNumber : '',
          product.description,
        ].filter(Boolean).join(' — '),
      }
    : page === 'product-detail'
      ? {
          title: 'Product Not Found | Truck Parts Depot Auto',
          description: 'This product could not be found in the Truck Parts Depot Auto catalogue.',
        }
      : PAGE_METADATA[page] || PAGE_METADATA.home!;

  const path = product ? getProductPath(product) : (window.location.pathname || '/');
  const canonicalUrl = SITE_URL + path;
  const description = metadata.description.length > 160
    ? metadata.description.slice(0, 157).trimEnd() + '...'
    : metadata.description;
  const robots = page === 'admin' || page === 'checkout' || (page === 'product-detail' && !product)
    ? 'noindex, nofollow'
    : 'index, follow';

  document.title = metadata.title;
  setMeta('name', 'description', description);
  setMeta('name', 'robots', robots);
  setMeta('property', 'og:type', product ? 'product' : 'website');
  setMeta('property', 'og:site_name', 'Truck Parts Depot Auto');
  setMeta('property', 'og:title', metadata.title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', metadata.title);
  setMeta('name', 'twitter:description', description);
  setCanonical(canonicalUrl);

  if (product?.image && /^https?:\/\//i.test(product.image)) {
    setMeta('property', 'og:image', product.image);
    setMeta('name', 'twitter:image', product.image);
  }
}
