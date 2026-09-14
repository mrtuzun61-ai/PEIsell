'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

export default function SellPage() {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const numericPrice = Number(price)
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError('Enter a valid price.')
      setLoading(false)
      return
    }

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        user_id: user.id,
        description: description.trim(),
        price: numericPrice,
        location_text: location.trim(),
      })
      .select('id')
      .single()

    if (listingError || !listing) {
      setError(listingError?.message || 'Could not create listing.')
      setLoading(false)
      return
    }

    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.id}/${listing.id}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('listing-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (uploadError) continue
      await supabase.from('listing_images').insert({
        listing_id: listing.id,
        storage_path: path,
        sort_order: i,
      })
    }

    router.push(`/listing/${listing.id}`)
    router.refresh()
  }

  return (
    <main className="wrap narrow">
      <Link href="/" className="back">← PEISell</Link>
      <h1>Sell an item</h1>
      <p className="muted">Photo, short description, price, location. That’s it.</p>
      <form onSubmit={submit} className="stack">
        <label className="photo">
          <strong>Add photos</strong>
          <span className="muted small"> Tap to take a photo or choose from your phone</span>
          <input className="file" type="file" accept="image/*" multiple onChange={e => setPhotos(Array.from(e.target.files || []).slice(0, 8))} />
          {photos.length > 0 && <span className="small">{photos.length} photo{photos.length > 1 ? 's' : ''} selected</span>}
        </label>
        <label>Description<textarea className="field area" value={description} onChange={e => setDescription(e.target.value)} minLength={2} maxLength={1000} required placeholder="What are you selling?" /></label>
        <label>Price (CAD)<input className="field" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} required placeholder="25" /></label>
        <label>Location<input className="field" value={location} onChange={e => setLocation(e.target.value)} minLength={2} maxLength={200} required placeholder="Charlottetown" /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn full" disabled={loading}>{loading ? 'Publishing…' : 'Publish listing'}</button>
      </form>
    </main>
  )
}
