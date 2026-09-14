'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/client'

export default function EditListingPage() {
  const { id } = useParams<{ id:string }>()
  const router = useRouter()
  const [description,setDescription]=useState('')
  const [price,setPrice]=useState('')
  const [location,setLocation]=useState('')
  const [status,setStatus]=useState('active')
  const [error,setError]=useState('')

  useEffect(()=>{
    ;(async()=>{
      const supabase=createClient()
      const { data:{ user } }=await supabase.auth.getUser()
      if(!user){router.replace('/login');return}
      const { data }=await supabase.from('listings').select('description,price,location_text,status,user_id').eq('id',id).single()
      if(!data || data.user_id!==user.id){router.replace('/');return}
      setDescription(data.description);setPrice(String(data.price));setLocation(data.location_text);setStatus(data.status)
    })()
  },[id,router])

  async function save(e:FormEvent){
    e.preventDefault();setError('')
    const supabase=createClient()
    const { error }=await supabase.from('listings').update({description:description.trim(),price:Number(price),location_text:location.trim(),status}).eq('id',id)
    if(error){setError(error.message);return}
    router.push(`/listing/${id}`);router.refresh()
  }

  async function markSold(){
    const supabase=createClient();await supabase.from('listings').update({status:'sold'}).eq('id',id);router.push(`/listing/${id}`);router.refresh()
  }

  async function remove(){
    if(!confirm('Delete this listing?')) return
    const supabase=createClient()
    const { data: images }=await supabase.from('listing_images').select('storage_path').eq('listing_id',id)
    if(images?.length) await supabase.storage.from('listing-images').remove(images.map(x=>x.storage_path))
    await supabase.from('listings').delete().eq('id',id)
    router.push('/profile');router.refresh()
  }

  return <main className="wrap narrow">
    <Link href="/profile" className="back">← My listings</Link>
    <h1>Edit listing</h1>
    <form onSubmit={save} className="stack">
      <label>Description<textarea className="field area" value={description} onChange={e=>setDescription(e.target.value)} required /></label>
      <label>Price (CAD)<input className="field" inputMode="decimal" value={price} onChange={e=>setPrice(e.target.value)} required /></label>
      <label>Location<input className="field" value={location} onChange={e=>setLocation(e.target.value)} required /></label>
      <label>Status<select className="field" value={status} onChange={e=>setStatus(e.target.value)}><option value="active">Active</option><option value="sold">Sold</option></select></label>
      {error && <p className="error">{error}</p>}
      <button className="btn full">Save changes</button>
    </form>
    {status!=='sold' && <button className="ghost full space" onClick={markSold}>Mark as sold</button>}
    <button className="danger full space" onClick={remove}>Delete listing</button>
  </main>
}
