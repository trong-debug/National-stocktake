'use client'

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Mode = 'link' | 'password'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<Mode>('link')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  function validateEmail(e: string) {
    if (!e.endsWith('@becoolcouriers.com.au')) {
      setError('Only @becoolcouriers.com.au accounts can access this system.')
      return false
    }
    return true
  }

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validateEmail(email)) return
    setLoading(true)

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (err) setError(err.message)
    else setSent(true)
    setLoading(false)
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validateEmail(email)) return
    setLoading(true)

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) setError(err.message)
    // on success middleware redirects automatically
    setLoading(false)
  }

  function switchMode(m: Mode) {
    setMode(m)
    setError('')
    setPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            BC
          </div>
          <CardTitle className="text-2xl">National Stocktake</CardTitle>
          <CardDescription>Sign in with your Be Cool Couriers email</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-medium text-slate-800">Check your email</p>
              <p className="text-sm text-slate-500">
                We sent a login link to <strong>{email}</strong>.<br />
                Click it to sign in — it expires in 1 hour.
              </p>
              <button
                className="text-xs text-blue-700 underline mt-2"
                onClick={() => { setSent(false); setEmail('') }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              <div className="flex rounded-lg border p-1 mb-4 gap-1">
                <button
                  type="button"
                  onClick={() => switchMode('link')}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${mode === 'link' ? 'bg-blue-800 text-white font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Email Link
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('password')}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${mode === 'password' ? 'bg-blue-800 text-white font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Password
                </button>
              </div>

              <form onSubmit={mode === 'link' ? handleSendLink : handlePasswordLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Email address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@becoolcouriers.com.au"
                    required
                    autoFocus
                  />
                </div>

                {mode === 'password' && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Your password"
                      required
                    />
                  </div>
                )}

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-800 hover:bg-blue-900"
                  disabled={loading || !email || (mode === 'password' && !password)}
                >
                  {loading ? 'Signing in…' : mode === 'link' ? 'Send Login Link' : 'Sign In'}
                </Button>
                <p className="text-center text-xs text-slate-500">
                  Only @becoolcouriers.com.au accounts can access this system.
                </p>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
