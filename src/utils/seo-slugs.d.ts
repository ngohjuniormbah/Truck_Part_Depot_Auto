export function slugify(value: string): string;

export function getProductPath(product: {
  id: string;
  name: string;
  oemNumber?: string | null;
  oem_number?: string | null;
  sku?: string | null;
}): string;
