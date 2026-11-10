import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import dotenv from 'dotenv';
import { getProductPath } from '../src/utils/seo-slugs.mjs';

dotenv.config({ path: ['.env.local', '.env'] });

const SITE_URL = 'https://truckpartsdepotauto.com';
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const outputDir = resolve('dist');
const pagePaths = [
  'products', 'services', 'about', 'reviews', 'gallery', 'contact',
  'refund-policy', 'checkout', 'admin',
];


function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function cleanDescription(product) {
  const value = [
    product.name, product.brand, product.model, product.engine,
    product.oem_number ? 'OEM ' + product.oem_number : '',
    product.description,
  ].filter(Boolean).join(' — ').replace(/\s+/g, ' ').trim();
  return value.length > 160 ? value.slice(0, 157).trimEnd() + '...' : value;
}

async function fetchProducts() {
  if (!supabaseUrl || !supabaseKey) {
    const message = 'Supabase public credentials missing: product prerender cannot run. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.';
    if (process.env.VERCEL) throw new Error(message);
    console.warn(message);
    return null;
  }

  const products = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const endpoint = new URL('/rest/v1/products', supabaseUrl);
    endpoint.search = new URLSearchParams({
      select: 'id,name,brand,model,year_range,engine,category,oem_number,sku,price,in_stock,description,image,images',
      order: 'name.asc',
      limit: String(pageSize),
      offset: String(offset),
    }).toString();

    const response = await fetch(endpoint, {
      headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey },
    });
    if (!response.ok) {
      throw new Error('Product prerender failed: Supabase returned HTTP ' + response.status);
    }
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Supabase products response was not an array.');
    products.push(...rows);
    if (rows.length < pageSize) break;
  }
  return products;
}

function buildProductHtml(template, product) {
  const path = getProductPath(product);
  const canonical = SITE_URL + path;
  const title = product.name + ' | ' + (product.brand || 'Diesel') + ' Truck Parts | Truck Parts Depot Auto';
  const description = cleanDescription(product) || 'View product specifications and availability from Truck Parts Depot Auto.';
  const images = Array.isArray(product.images)
    ? product.images.filter((item) => typeof item === 'string' && /^https?:\/\//i.test(item))
    : [];
  const image = (product.image && /^https?:\/\//i.test(product.image) ? product.image : images[0]) || '';
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || description,
    image: image ? [image] : images,
    sku: product.sku || undefined,
    mpn: product.oem_number || undefined,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.category || undefined,
    ...(Number(product.price) > 0 ? {
      offers: {
        '@type': 'Offer',
        url: canonical,
        priceCurrency: 'USD',
        price: Number(product.price).toFixed(2),
        availability: product.in_stock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      },
    } : {}),
  };

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + escapeHtml(title) + '</title>');
  html = html.replace(/<meta\s+name="description"[\s\S]*?>/i, '<meta name="description" content="' + escapeHtml(description) + '" />');
  html = html.replace(/<meta\s+name="robots"[^>]*>/i, '<meta name="robots" content="index, follow, max-image-preview:large" />');
  html = html.replace(/<link\s+rel="canonical"[^>]*>/i, '<link rel="canonical" href="' + escapeHtml(canonical) + '" />');
  html = html.replace(/<meta\s+property="og:type"[^>]*>/i, '<meta property="og:type" content="product" />');
  html = html.replace(/<meta\s+property="og:url"[^>]*>/i, '<meta property="og:url" content="' + escapeHtml(canonical) + '" />');
  html = html.replace(/<meta\s+property="og:title"[^>]*>/i, '<meta property="og:title" content="' + escapeHtml(title) + '" />');
  html = html.replace(/<meta\s+property="og:description"[^>]*>/i, '<meta property="og:description" content="' + escapeHtml(description) + '" />');
  html = html.replace(/<meta\s+property="og:image"[^>]*>/i, '<meta property="og:image" content="' + escapeHtml(image || SITE_URL + '/favicon.png') + '" />');
  html = html.replace(/<meta\s+name="twitter:title"[^>]*>/i, '<meta name="twitter:title" content="' + escapeHtml(title) + '" />');
  html = html.replace(/<meta\s+name="twitter:description"[^>]*>/i, '<meta name="twitter:description" content="' + escapeHtml(description) + '" />');
  html = html.replace(/<meta\s+name="twitter:image"[^>]*>/i, '<meta name="twitter:image" content="' + escapeHtml(image || SITE_URL + '/favicon.png') + '" />');

  const content = [
    '<main id="prerendered-product" class="mx-auto max-w-5xl px-6 py-12">',
    '<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/products">Products</a> / <span>' + escapeHtml(product.name) + '</span></nav>',
    '<article itemscope itemtype="https://schema.org/Product">',
    '<h1 itemprop="name">' + escapeHtml(product.name) + '</h1>',
    product.brand ? '<p><strong>Brand:</strong> <span itemprop="brand">' + escapeHtml(product.brand) + '</span></p>' : '',
    product.model ? '<p><strong>Model:</strong> ' + escapeHtml(product.model) + '</p>' : '',
    product.engine ? '<p><strong>Engine:</strong> ' + escapeHtml(product.engine) + '</p>' : '',
    product.oem_number ? '<p><strong>OEM number:</strong> <span itemprop="mpn">' + escapeHtml(product.oem_number) + '</span></p>' : '',
    product.sku ? '<p><strong>SKU:</strong> <span itemprop="sku">' + escapeHtml(product.sku) + '</span></p>' : '',
    image ? '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(product.name + ' ' + (product.brand || '') + ' truck part') + '" width="800" height="600" loading="eager" itemprop="image" />' : '',
    product.description ? '<p itemprop="description">' + escapeHtml(product.description) + '</p>' : '',
    Number(product.price) > 0 ? '<p><strong>Price:</strong> $' + Number(product.price).toFixed(2) + ' USD</p>' : '',
    '<p><strong>Availability:</strong> ' + (product.in_stock === false ? 'Out of stock' : 'Contact us to confirm availability') + '</p>',
    '<p><a href="/products">Browse all truck parts</a> · <a href="/contact">Contact us about this part</a></p>',
    '</article></main>',
  ].join('');
  const schemaTag = '<script type="application/ld+json">' + JSON.stringify(productSchema).replace(/</g, '\\u003c') + '</script>';
  html = html.replace('</head>', schemaTag + '\n</head>');
  html = html.replace('<div id="root"></div>', '<div id="root">' + content + '</div>');
  return html;
}

const template = await readFile(resolve(outputDir, 'index.html'), 'utf8');

// Materialise known SPA routes as real static files. No catch-all rewrite is
// needed, so unknown URLs can receive Vercel's native HTTP 404 response.
for (const route of pagePaths) {
  const routeFile = resolve(outputDir, route, 'index.html');
  await mkdir(dirname(routeFile), { recursive: true });
  await copyFile(resolve(outputDir, 'index.html'), routeFile);
}

const products = await fetchProducts();
const sitemapUrls = new Set([
  SITE_URL + '/', ...pagePaths.filter((path) => path !== 'checkout' && path !== 'admin').map((path) => SITE_URL + '/' + path),
]);

if (products) {
  for (const product of products) {
    if (!product.id || !product.name) continue;
    const route = getProductPath(product);
    const destination = resolve(outputDir, route.slice(1), 'index.html');
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, buildProductHtml(template, product), 'utf8');
    sitemapUrls.add(SITE_URL + route);
  }
  console.log('Pre-rendered ' + products.length + ' product pages.');
}

const sitemapEntries = [...sitemapUrls].sort().map((url) => '  <url><loc>' + escapeHtml(url) + '</loc></url>');
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemapEntries.join('\n') + '\n</urlset>\n';
await writeFile(resolve(outputDir, 'sitemap.xml'), sitemap, 'utf8');
console.log('Generated sitemap with ' + sitemapUrls.size + ' URLs.');
