import { supabase } from '@/lib/supabase';

function extensionFromUri(uri: string) {
  const clean = uri.split('?')[0];
  const ext = clean.split('.').pop()?.toLowerCase();
  if (ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return ext === 'jpeg' ? 'jpg' : ext;
  return 'jpg';
}

export async function uploadListingImage(listingId: string, uri: string, sortOrder = 0) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error('Authentication required.');

  const ext = extensionFromUri(uri);
  const path = `${user.id}/${listingId}/${Date.now()}-${sortOrder}.${ext}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('listing-images')
    .upload(path, blob, {
      contentType: ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { error: rowError } = await supabase.from('listing_images').insert({
    listing_id: listingId,
    owner_id: user.id,
    storage_path: path,
    sort_order: sortOrder,
  });

  if (rowError) {
    await supabase.storage.from('listing-images').remove([path]);
    throw rowError;
  }

  return path;
}

export function publicListingImageUrl(path: string) {
  return supabase.storage.from('listing-images').getPublicUrl(path).data.publicUrl;
}
