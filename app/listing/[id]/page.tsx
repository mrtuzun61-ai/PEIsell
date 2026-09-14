import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: listing } = await supabase
    .from('listings')
    .select('id,user_id,description,price,location_text,status,created_at,listing_images(storage_path,sort_order),profiles(display_name,contact_method,contact_value)')
    .eq('id', id)
    .single()

  if (!listing || listing.status === 'removed') notFound()

  const images = [...(listing.listing_images || [])].sort((a: any,b: any) => a.sort_order - b.sort_order)
  const urls = images.map((img: any) => supabase.storage.from('listing-images').getPublicUrl(img.storage_path).data.publicUrl)
  const seller = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles
  let contactHref = ''
  if (seller?.contact_method === 'email' && seller.contact_value) contactHref = `mailto:${seller.contact_value}`
  if (seller?.contact_method === 'phone' && seller.contact_value) contactHref = `tel:${seller.contact_value}`
  if (seller?.contact_method === 'sms' && seller.contact_value) contactHref = `sms:${seller.contact_value}`

  return (
    <>
      <header className="top"><Link href="/" className="logo"><span className="red">PEI</span>Sell</Link><Link href="/sell" className="btn">+ Sell</Link></header>
      <main className="wrap detail">
        <Link href="/" className="back">← Back</Link>
        {urls.length > 0 ? <div className="gallery">{urls.map((url: string) => <img key={url} src={url} alt="" />)}</div> : <div className="heroPhoto placeholder">No photo</div>}
        <div className="detailBody">
          <div className="price big">${Number(listing.price).toLocaleString('en-CA')}</div>
          <h1 className="listingTitle">{listing.description}</h1>
          <p className="muted">{listing.location_text}</p>
          {listing.status === 'sold' && <div className="sold">SOLD</div>}
          <div className="sellerBox">
            <strong>{seller?.display_name || 'PEISell seller'}</strong>
            {contactHref ? <a className="btn full contact" href={contactHref}>Contact seller</a> : <p className="muted small">Seller has not added a contact method yet.</p>}
          </div>
        </div>
      </main>
    </>
  )
}
