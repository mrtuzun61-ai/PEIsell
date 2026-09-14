'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <main className="wrap narrow">
      <Link href="/" className="back">← PEISell</Link>
      <h1>Log in</h1>
      <form onSubmit={submit} className="stack">
        <label>Email<input className="field" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label>Password<input className="field" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn full" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="muted">New to PEISell? <Link className="red strong" href="/signup">Create an account</Link></p>
    </main>
  )
}
