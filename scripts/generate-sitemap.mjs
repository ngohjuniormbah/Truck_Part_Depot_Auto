import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const SITE_URL = 'https://truckpartsdepotauto.com';
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'part';
}

const staticPaths = [
  '/', '/products', '/services', '/about', '/reviews', '/gallery', '/contact', '/refund-policy',
];
const urls = new Set(staticPaths.map((path) => `${SITE_URL}${path}`));

if (supabaseUrl && supabaseKey) {
  const endpoint = new URL('/rest/v1/products', supabaseUrl);
  endpoint.search = new URLSearchParams({
    select: 'name,oem_number,sku',
    order: 'name.asc',
  }).toString();

  const response = await fetch(endpoint, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
  if (!response.ok) {
    throw new Error(`Unable to generate product sitemap: Supabase returned ${response.status}`);
  }

  const products = await response.json();
  for (const product of products) {
    const identifier = product.oem_number || product.sku;
    const slug = `${slugify(product.name)}-${slugify(identifier)}`;
    urls.add(`${SITE_URL}/products/${slug}`);
  }
  console.log(`Added ${products.length} product URLs to sitemap.`);
} else {
  console.warn('Supabase public credentials are missing; generated a static-only sitemap. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the production build environment to include product URLs.');
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n` +
  [...urls].sort().map((url) => `  <url><loc>${url.replace(/&/g, '&amp;')}</loc></url>`).join('\\n') +
  '\\n</urlset>\\n';

await writeFile(resolve('public/sitemap.xml'), xml, 'utf8');
