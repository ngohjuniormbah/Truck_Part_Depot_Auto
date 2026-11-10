export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'part';
}

export function getProductPath(product) {
  const identifier = product.oemNumber || product.oem_number || product.sku || product.id;
  return '/products/' + slugify(product.name) + '-' + slugify(identifier) + '-' + slugify(product.id);
}
