import { getSupabase } from './supabase';

// Bucket must exist in Supabase Storage — see supabase-storage-setup.sql.
const BUCKET = 'product-images';

function resizeToBlob(file: File, maxDim = 1600, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') return reject(new Error('Failed to read image'));
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas unavailable'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode image'))),
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.src = result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Legacy path — only used if the Storage bucket upload fails (e.g. bucket
// not yet created). Keeps the app functional, but this is the exact path
// that silently loses extra photos on large payloads, so it's a fallback
// only, not the primary path anymore.
function dataUrlFallback(file: File, maxDim = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') return reject(new Error('Failed to read image'));
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
          return;
        }
        resolve(result);
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file to Supabase Storage and returns its public URL.
 * Falls back to an embedded base64 data URL ONLY if the storage upload
 * fails (e.g. the bucket hasn't been created yet) so the app keeps working,
 * but that fallback is what caused photos to silently disappear before —
 * run supabase-storage-setup.sql once to make this the reliable path.
 */
export async function uploadImage(
  file: File,
  folder: 'products' | 'gallery' | 'reviews' = 'products'
): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Selected file is not an image');

  try {
    const supabase = getSupabase();
    const blob = await resizeToBlob(file);
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
      cacheControl: '31536000',
      upsert: false,
      contentType: 'image/jpeg',
    });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    if (data?.publicUrl) return data.publicUrl;
    throw new Error('No public URL returned from storage');
  } catch (err) {
    console.warn('Supabase Storage upload failed, falling back to embedded image:', err);
    return await dataUrlFallback(file);
  }
}

/** True if a value is a real uploaded file URL (Storage or any external link). */
export function isRealUrl(value?: string): boolean {
  return !!value && !value.startsWith('data:');
}

/** True if a value is a giant base64 data: URL embedded directly in the row. */
export function isEmbeddedImage(value?: string): boolean {
  return !!value && value.startsWith('data:');
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = /data:(.*?);base64/.exec(header || '');
  const mime = mimeMatch?.[1] || 'image/jpeg';
  const binary = atob(base64 || '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

/**
 * Uploads a single already-embedded base64 image to Supabase Storage and
 * returns the new public URL. Used to migrate old rows that were saved
 * before the storage bucket existed (see supabase-storage-setup.sql), which
 * is what makes the products table huge and slow/unreliable to fetch.
 */
export async function reuploadEmbeddedImage(dataUrl: string, folder: 'products' | 'gallery' | 'reviews' = 'products'): Promise<string> {
  const supabase = getSupabase();
  const file = dataUrlToFile(dataUrl, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type || 'image/jpeg',
  });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('No public URL returned from storage');
  return data.publicUrl;
}
