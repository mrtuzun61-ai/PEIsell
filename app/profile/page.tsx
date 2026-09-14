'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

type Listing = { id:string; description:string; price:number; status:string }

export default function ProfilePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [method, setMethod] = useState('email')
  const [contact, setContact] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('display_name,contact_method,contact_value').eq('id', user.id).single()
      setName(profile?.display_name || '')
      setMethod(profile?.contact_method || 'email')
      setContact(profile?.contact_value || user.email || '')
      const { data } = await supabase.from('listings').select('id,description,price,status').eq('user_id', user.id).order('created_at', { ascending:false })
      setListings((data || []) as Listing[])
    })()
  }, [router])

  async function save(e: FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ display_name:name.trim(), contact_method:method, contact_value:contact.trim() }).eq('id', user.id)
    setMessage(error ? error.message : 'Profile saved.')
  }

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return <main className="wrap narrow">
    <Link href="/" className="back">← PEISell</Link>
    <h1>My account</h1>
    <form onSubmit={save} className="stack sellerBox">
      <label>Name<input className="field" value={name} onChange={e=>setName(e.target.value)} /></label>
      <label>Contact method<select className="field" value={method} onChange={e=>setMethod(e.target.value)}><option value="email">Email</option><option value="phone">Phone</option><option value="sms">SMS</option></select></label>
      <label>Contact detail<input className="field" value={contact} onChange={e=>setContact(e.target.value)} placeholder="email or phone" /></label>
      {message && <p className="muted small">{message}</p>}
      <button className="btn full">Save profile</button>
    </form>
    <h2>My listings</h2>
    <div className="myList">{listings.map(item => <Link href={`/listing/${item.id}/edit`} className="myRow" key={item.id}><span><strong>${Number(item.price).toLocaleString('en-CA')}</strong><br/><span className="small muted">{item.description}</span></span><span className="status">{item.status}</span></Link>)}{listings.length===0 && <p className="muted">You haven’t posted anything yet.</p>}</div>
    <button className="ghost full" onClick={logout}>Log out</button>
  </main>
}
