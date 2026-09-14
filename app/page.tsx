import Link from 'next/link'
import { createClient } from '../lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: listings } = await supabase
    .from('listings')
    .select('id,description,price,location_text,status,created_at,listing_images(storage_path,sort_order)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(60)

  return (
    <>
      <header className="top">
        <Link href="/" className="logo"><span className="red">PEI</span>Sell</Link>
        <nav className="nav">
          <Link href="/sell" className="btn">+ Sell</Link>
          <Link href={user ? '/profile' : '/login'} className="navlink">{user ? 'My account' : 'Log in'}</Link>
        </nav>
      </header>
      <main className="wrap">
        <section className="hero">
          <h1>Buy & sell across PEI</h1>
          <p className="muted">Simple local listings. No complicated forms.</p>
        </section>
        {listings && listings.length > 0 ? (
          <div className="grid">
            {listings.map((listing: any) => {
              const images = [...(listing.listing_images || [])].sort((a: any,b: any) => a.sort_order - b.sort_order)
              const first = images[0]?.storage_path
              const imageUrl = first ? supabase.storage.from('listing-images').getPublicUrl(first).data.publicUrl : null
              return (
                <Link key={listing.id} href={`/listing/${listing.id}`} className="card">
                  {imageUrl ? <img className="pic image" src={imageUrl} alt="" /> : <div className="pic placeholder">No photo</div>}
                  <div className="pad">
                    <div className="price">${Number(listing.price).toLocaleString('en-CA')}</div>
                    <div className="desc">{listing.description}</div>
                    <div className="muted small">{listing.location_text}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <section className="empty">
            <h2>PEISell is getting ready</h2>
            <p className="muted">Be one of the first people to list something in PEI.</p>
            <Link className="btn" href="/sell">Post an item</Link>
          </section>
        )}
      </main>
    </>
  )
}
