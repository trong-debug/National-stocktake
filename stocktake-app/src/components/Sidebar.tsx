'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BRANCHES } from '@/lib/constants'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Upload,
  ChevronRight,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  profile: Profile | null
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="w-60 bg-blue-900 text-white flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-blue-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Package className="h-4 w-4 text-blue-900" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">National Stocktake</p>
            <p className="text-blue-300 text-xs">Be Cool Couriers</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <NavItem
          href="/"
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Dashboard"
          active={pathname === '/'}
        />

        <div className="pt-3 pb-1 px-2">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Branches</p>
        </div>

        {BRANCHES.map(({ value, label }) => (
          <NavItem
            key={value}
            href={`/${value}`}
            icon={<ChevronRight className="h-3 w-3" />}
            label={label}
            active={pathname === `/${value}`}
          />
        ))}

        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-2">
              <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Admin</p>
            </div>
            <NavItem
              href="/admin"
              icon={<Settings className="h-4 w-4" />}
              label="Admin Panel"
              active={pathname === '/admin'}
            />
            <NavItem
              href="/admin/import"
              icon={<Upload className="h-4 w-4" />}
              label="Import Data"
              active={pathname === '/admin/import'}
            />
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-blue-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold uppercase">
            {profile?.full_name?.[0] || profile?.email?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{profile?.full_name || 'Staff'}</p>
            <p className="text-blue-400 text-xs truncate">{profile?.dept || profile?.branch || 'No dept set'}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-blue-300 hover:text-white hover:bg-blue-800 h-8 px-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-3 w-3 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  )
}

function NavItem({
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
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
        active
          ? 'bg-blue-700 text-white font-medium'
          : 'text-blue-200 hover:bg-blue-800 hover:text-white'
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  )
}
