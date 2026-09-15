import { supabase } from '@/lib/supabase';

export async function isFavorite(listingId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('listing_id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function toggleFavorite(listingId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error('Authentication required.');

  const exists = await isFavorite(listingId);

  if (exists) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from('favorites').insert({
    user_id: user.id,
    listing_id: listingId,
  });
  if (error) throw error;
  return true;
}

export async function fetchSavedListings() {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error('Authentication required.');

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      created_at,
      listings (
        *,
        listing_images(storage_path, sort_order)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row: any) => row.listings).filter(Boolean);
}
