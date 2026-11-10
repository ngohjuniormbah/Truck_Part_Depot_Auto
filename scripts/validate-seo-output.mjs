import { access, readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist = resolve('dist');
const required = [
  'index.html',
  '404.html',
  'products/index.html',
  'services/index.html',
  'about/index.html',
  'reviews/index.html',
  'gallery/index.html',
  'contact/index.html',
  'refund-policy/index.html',
  'sitemap.xml',
];

for (const file of required) {
  try {
    await access(resolve(dist, file));
  } catch {
    throw new Error('Missing required generated SEO output: dist/' + file);
  }
}

const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('https://truckpartsdepotauto.com/')) {
  throw new Error('Sitemap is missing the canonical homepage URL.');
}
if (sitemap.includes('/checkout') || sitemap.includes('/admin')) {
  throw new Error('Transactional or admin URLs must not appear in the sitemap.');
}

const productsRoot = resolve(dist, 'products');
const entries = await readdir(productsRoot, { withFileTypes: true });
let prerenderedProducts = 0;
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const file = resolve(productsRoot, entry.name, 'index.html');
  try {
    const html = await readFile(file, 'utf8');
    if (!html.includes('application/ld+json') || !html.includes('itemtype="https://schema.org/Product"')) {
      throw new Error('Product page missing structured data or visible Product markup: ' + entry.name);
    }
    if (!html.includes('rel="canonical"') || !html.includes('<h1 itemprop="name">')) {
      throw new Error('Product page missing canonical or server-rendered product heading: ' + entry.name);
    }
    prerenderedProducts += 1;
  } catch (error) {
    if (error?.code === 'ENOENT') continue;
    throw error;
  }
}

console.log('SEO output validation passed. Static routes: ' + required.length + '; prerendered product pages: ' + prerenderedProducts + '.');
