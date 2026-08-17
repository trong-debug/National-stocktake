'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BRANCHES } from '@/lib/constants'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Upload,
  ChevronDown,
  Users,
  GitBranch,
} from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'

interface SidebarProps {
  profile: Profile | null
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [branchesOpen, setBranchesOpen] = useState(
    BRANCHES.some(b => pathname === `/${b.value}`)
  )
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith('/admin'))

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="w-60 flex flex-col h-full shrink-0 text-white" style={{ backgroundColor: '#00b4d8' }}>

      {/* User info */}
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase shrink-0 border-2 border-white/40" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            {profile?.full_name?.[0] || profile?.email?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">
              {profile?.full_name || profile?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {profile?.email || ''}
            </p>
          </div>
          {profile?.id && <NotificationBell userId={profile.id} />}
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            {profile?.role === 'admin' ? 'Admin' : 'Staff'}
          </span>
          {profile?.depts?.map(d => (
            <span key={d} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>{d}</span>
          ))}
        </div>
      </div>

      {/* App title */}
      <div className="px-5 py-3 flex items-center gap-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
        <img src="/becool-logo.svg" alt="Be Cool" className="w-7 h-7 rounded-full shrink-0" />
        <div>
          <p className="text-xs font-bold leading-tight">National Stocktake</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Be Cool Couriers</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">

        {/* Dashboard */}
        <NavRow
          href="/"
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
          active={pathname === '/'}
        />

        {/* Branches group */}
        <button
          onClick={() => setBranchesOpen(o => !o)}
          className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors text-left"
          style={{
            backgroundColor: branchesOpen ? 'rgba(0,0,0,0.12)' : undefined,
            color: 'rgba(255,255,255,0.95)',
          }}
          onMouseEnter={e => { if (!branchesOpen) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.08)' }}
          onMouseLeave={e => { if (!branchesOpen) (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
        >
          <GitBranch className="h-5 w-5 shrink-0" />
          <span className="flex-1">Branches</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform shrink-0', branchesOpen && 'rotate-180')} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </button>

        {branchesOpen && (
          <div style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
            {BRANCHES.map(({ value, label }) => (
              <Link
                key={value}
                href={`/${value}`}
                className="flex items-center gap-3 pl-12 pr-5 py-2.5 text-sm transition-colors"
                style={{
                  backgroundColor: pathname === `/${value}` ? 'rgba(0,0,0,0.18)' : undefined,
                  color: pathname === `/${value}` ? '#ffffff' : 'rgba(255,255,255,0.8)',
                  fontWeight: pathname === `/${value}` ? 600 : 400,
                }}
              >
                <span className="text-xs font-mono font-bold w-8 shrink-0">{value}</span>
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Admin group */}
        {isAdmin && (
          <>
            <button
              onClick={() => setAdminOpen(o => !o)}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors text-left"
              style={{
                backgroundColor: adminOpen ? 'rgba(0,0,0,0.12)' : undefined,
                color: 'rgba(255,255,255,0.95)',
              }}
              onMouseEnter={e => { if (!adminOpen) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { if (!adminOpen) (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
            >
              <Settings className="h-5 w-5 shrink-0" />
              <span className="flex-1">Admin</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform shrink-0', adminOpen && 'rotate-180')} style={{ color: 'rgba(255,255,255,0.7)' }} />
            </button>

            {adminOpen && (
              <div style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 pl-12 pr-5 py-2.5 text-sm transition-colors"
                  style={{
                    backgroundColor: pathname === '/admin' ? 'rgba(0,0,0,0.18)' : undefined,
                    color: pathname === '/admin' ? '#ffffff' : 'rgba(255,255,255,0.8)',
                    fontWeight: pathname === '/admin' ? 600 : 400,
                  }}
                >
                  Users
                </Link>
                <Link
                  href="/admin/clients"
                  className="flex items-center gap-3 pl-12 pr-5 py-2.5 text-sm transition-colors"
                  style={{
                    backgroundColor: pathname === '/admin/clients' ? 'rgba(0,0,0,0.18)' : undefined,
                    color: pathname === '/admin/clients' ? '#ffffff' : 'rgba(255,255,255,0.8)',
                    fontWeight: pathname === '/admin/clients' ? 600 : 400,
                  }}
                >
                  <Users className="h-4 w-4 mr-1 shrink-0" style={{ display: 'inline' }} />
                  Clients
                </Link>
                <Link
                  href="/admin/import"
                  className="flex items-center gap-3 pl-12 pr-5 py-2.5 text-sm transition-colors"
                  style={{
                    backgroundColor: pathname === '/admin/import' ? 'rgba(0,0,0,0.18)' : undefined,
                    color: pathname === '/admin/import' ? '#ffffff' : 'rgba(255,255,255,0.8)',
                    fontWeight: pathname === '/admin/import' ? 600 : 400,
                  }}
                >
                  <Upload className="h-4 w-4 mr-1 shrink-0" style={{ display: 'inline' }} />
                  Import Data
                </Link>
              </div>
            )}
          </>
        )}
      </nav>

      {/* Sign out */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 text-sm py-2 transition-opacity"
          style={{ color: 'rgba(255,255,255,0.8)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = ''}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  )
}

function NavRow({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-5 py-3 text-sm transition-colors"
      style={{
        backgroundColor: active ? 'rgba(0,0,0,0.18)' : undefined,
        color: active ? '#ffffff' : 'rgba(255,255,255,0.9)',
        fontWeight: active ? 600 : 400,
      }}
    >
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  )
}
