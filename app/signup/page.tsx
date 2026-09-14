'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, display_name: name })
    }
    router.push('/')
    router.refresh()
  }

  return (
    <main className="wrap narrow">
      <Link href="/" className="back">← PEISell</Link>
      <h1>Create account</h1>
      <form onSubmit={submit} className="stack">
        <label>Name<input className="field" value={name} onChange={e => setName(e.target.value)} required maxLength={80} /></label>
        <label>Email<input className="field" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label>Password<input className="field" type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="muted">Already have an account? <Link className="red strong" href="/login">Log in</Link></p>
    </main>
  )
}
