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
  UserCog,
  GitBranch,
  Package2,
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
    <div className="w-60 flex flex-col h-full shrink-0 text-white bg-blue-900">

      {/* App title */}
      <div className="px-5 py-3 flex items-center gap-2.5 border-b border-blue-800">
        <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <Package2 className="w-4 h-4 text-white" />
          </div>
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
            backgroundColor: branchesOpen ? 'rgba(255,255,255,0.06)' : undefined,
            color: 'rgba(255,255,255,0.95)',
          }}
          onMouseEnter={e => { if (!branchesOpen) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)' }}
          onMouseLeave={e => { if (!branchesOpen) (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
        >
          <GitBranch className="h-5 w-5 shrink-0" />
          <span className="flex-1">Branches</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform shrink-0', branchesOpen && 'rotate-180')} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </button>

        {branchesOpen && (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
            {BRANCHES.map(({ value, label }) => (
              <Link
                key={value}
                href={`/${value}`}
                className="flex items-center gap-3 pl-12 pr-5 py-2.5 text-sm transition-colors"
                style={{
                  backgroundColor: pathname === `/${value}` ? 'rgba(255,255,255,0.12)' : undefined,
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
                backgroundColor: adminOpen ? 'rgba(255,255,255,0.06)' : undefined,
                color: 'rgba(255,255,255,0.95)',
              }}
              onMouseEnter={e => { if (!adminOpen) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!adminOpen) (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
            >
              <Settings className="h-5 w-5 shrink-0" />
              <span className="flex-1">Admin</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform shrink-0', adminOpen && 'rotate-180')} style={{ color: 'rgba(255,255,255,0.7)' }} />
            </button>

            {adminOpen && (
              <div style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 pl-12 pr-5 py-2.5 text-sm transition-colors"
                  style={{
                    backgroundColor: pathname === '/admin' ? 'rgba(255,255,255,0.12)' : undefined,
                    color: pathname === '/admin' ? '#ffffff' : 'rgba(255,255,255,0.8)',
                    fontWeight: pathname === '/admin' ? 600 : 400,
                  }}
                >
                  <UserCog className="h-4 w-4 mr-1 shrink-0" style={{ display: 'inline' }} />
                  Users
                </Link>
                <Link
                  href="/admin/clients"
                  className="flex items-center gap-3 pl-12 pr-5 py-2.5 text-sm transition-colors"
                  style={{
                    backgroundColor: pathname === '/admin/clients' ? 'rgba(255,255,255,0.12)' : undefined,
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
                    backgroundColor: pathname === '/admin/import' ? 'rgba(255,255,255,0.12)' : undefined,
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

      {/* User info + sign out */}
      <div className="px-4 py-4 border-t border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            {profile?.full_name?.[0] || profile?.email?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate leading-tight">
              {profile?.full_name || profile?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {profile?.role === 'admin' ? 'Admin' : 'Staff'}
              {profile?.depts?.length ? ' · ' + profile.depts.join(', ') : ''}
            </p>
          </div>
          {profile?.id && <NotificationBell userId={profile.id} />}
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 text-xs py-1.5 transition-opacity"
          style={{ color: 'rgba(255,255,255,0.65)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ffffff'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'}
        >
          <LogOut className="h-4 w-4 shrink-0" />
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
        backgroundColor: active ? 'rgba(255,255,255,0.12)' : undefined,
        color: active ? '#ffffff' : 'rgba(255,255,255,0.9)',
        fontWeight: active ? 600 : 400,
      }}
    >
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  )
}
