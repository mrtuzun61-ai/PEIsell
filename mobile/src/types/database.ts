export type ListingStatus = 'draft' | 'active' | 'sold' | 'expired' | 'hidden' | 'deleted';

export type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  is_free: boolean;
  category: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  status: ListingStatus;
  published_at: string | null;
  expires_at: string | null;
  is_boosted: boolean;
  boosted_at: string | null;
  boost_expires_at: string | null;
  created_at: string;
  updated_at: string;
};
