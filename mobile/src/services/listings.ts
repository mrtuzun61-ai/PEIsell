import { supabase } from '@/lib/supabase';

export async function fetchActiveListings(limit = 30) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      listing_images (
        storage_path,
        sort_order
      )
    `)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('is_boosted', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function createDraft(input: {
  title: string;
  description?: string;
  price: number;
  category?: string;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error('Authentication required.');

  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: user.id,
      title: input.title,
      description: input.description ?? null,
      price: input.price,
      currency: 'CAD',
      is_free: input.price === 0,
      category: input.category ?? null,
      location_name: input.location_name,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function publishListing(listingId: string) {
  const { data, error } = await supabase.rpc('publish_listing', {
    p_listing_id: listingId,
  });

  if (error) throw error;
  return data as {
    published: boolean;
    payment_required?: boolean;
    fee?: number;
    currency?: string;
    used_free_credit?: boolean;
    expires_at?: string;
  };
}
