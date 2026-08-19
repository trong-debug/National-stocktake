'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'
import {
  Home,
  Truck,
  LayoutList,
  Shield,
  Package,
  HelpCircle,
  RefreshCw,
  ChevronDown,
  Archive,
  LogOut,
  Upload,
  Users,
  UserCog,
} from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'

interface SidebarProps {
  profile: Profile | null
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith('/admin'))

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="w-56 flex flex-col h-full shrink-0 text-white" style={{ backgroundColor: '#007B8E' }}>

      {/* User info */}
      <div className="px-4 py-4 border-b flex items-center gap-2.5" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          {profile?.full_name?.[0] || profile?.email?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate leading-tight">
            {profile?.full_name || profile?.email?.split('@')[0] || 'User'}
          </p>
          <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {profile?.email || ''}
          </p>
        </div>
        {profile?.id && <NotificationBell userId={profile.id} />}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-1">

        {/* Fake decorative menu items */}
        <FakeRow icon={<Home className="h-5 w-5" />} label="Home" />
        <FakeRow icon={<Truck className="h-5 w-5" />} label="Delivery" expandable />
        <FakeRow icon={<LayoutList className="h-5 w-5" />} label="Manage" expandable />

        {/* Admin — functional for admin users */}
        {isAdmin ? (
          <>
            <button
              onClick={() => setAdminOpen(o => !o)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.9)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.12)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = ''}
            >
              <Shield className="h-5 w-5 shrink-0" />
              <span className="flex-1">Admin</span>
              <ChevronDown
                className={cn('h-4 w-4 transition-transform shrink-0', adminOpen && 'rotate-180')}
                style={{ color: 'rgba(255,255,255,0.7)' }}
              />
            </button>

            {adminOpen && (
              <div style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}>
                <Link
                  href="/admin"
                  className="flex items-center gap-2.5 pl-11 pr-4 py-2.5 text-sm transition-colors"
                  style={{
                    color: pathname === '/admin' ? '#fff' : 'rgba(255,255,255,0.8)',
                    fontWeight: pathname === '/admin' ? 600 : 400,
                    backgroundColor: pathname === '/admin' ? 'rgba(0,0,0,0.15)' : undefined,
                  }}
                  onMouseEnter={e => { if (pathname !== '/admin') (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.1)' }}
                  onMouseLeave={e => { if (pathname !== '/admin') (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
                >
                  <UserCog className="h-4 w-4 shrink-0" />
                  Users
                </Link>
                <Link
                  href="/admin/clients"
                  className="flex items-center gap-2.5 pl-11 pr-4 py-2.5 text-sm transition-colors"
                  style={{
                    color: pathname === '/admin/clients' ? '#fff' : 'rgba(255,255,255,0.8)',
                    fontWeight: pathname === '/admin/clients' ? 600 : 400,
                    backgroundColor: pathname === '/admin/clients' ? 'rgba(0,0,0,0.15)' : undefined,
                  }}
                  onMouseEnter={e => { if (pathname !== '/admin/clients') (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.1)' }}
                  onMouseLeave={e => { if (pathname !== '/admin/clients') (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  Clients
                </Link>
                <Link
                  href="/admin/import"
                  className="flex items-center gap-2.5 pl-11 pr-4 py-2.5 text-sm transition-colors"
                  style={{
                    color: pathname === '/admin/import' ? '#fff' : 'rgba(255,255,255,0.8)',
                    fontWeight: pathname === '/admin/import' ? 600 : 400,
                    backgroundColor: pathname === '/admin/import' ? 'rgba(0,0,0,0.15)' : undefined,
                  }}
                  onMouseEnter={e => { if (pathname !== '/admin/import') (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.1)' }}
                  onMouseLeave={e => { if (pathname !== '/admin/import') (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
                >
                  <Upload className="h-4 w-4 shrink-0" />
                  Import Data
                </Link>
              </div>
            )}
          </>
        ) : (
          <FakeRow icon={<Shield className="h-5 w-5" />} label="Admin" expandable />
        )}

        <FakeRow icon={<Package className="h-5 w-5" />} label="Inventory" expandable />
        <FakeRow icon={<HelpCircle className="h-5 w-5" />} label="API FAQ" />
        <FakeRow icon={<RefreshCw className="h-5 w-5" />} label="Change Client" />

        {/* National Stocktake — real functional item */}
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors"
          style={{ backgroundColor: 'rgba(0,0,0,0.18)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.25)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.18)'}
        >
          <Archive className="h-5 w-5 shrink-0" />
          <span className="flex-1">National Stocktake</span>
          <span
            className="text-xs font-bold rounded px-1.5 py-0.5 shrink-0"
            style={{ backgroundColor: '#4CAF50', color: '#fff' }}
          >
            NEW
          </span>
        </Link>
      </nav>

      {/* Sign out footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-4 py-3 text-xs cursor-pointer transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  )
}

function FakeRow({ icon, label, expandable }: { icon: React.ReactNode; label: string; expandable?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 text-sm select-none"
      style={{ color: 'rgba(255,255,255,0.85)' }}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {expandable && (
        <ChevronDown className="h-4 w-4 shrink-0" style={{ color: 'rgba(255,255,255,0.6)' }} />
      )}
    </div>
  )
}
