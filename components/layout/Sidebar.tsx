'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Scissors,
  ShoppingCart,
  Settings,
  Sofa,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/design', label: 'Diseñar', icon: Sofa },
  { href: '/projects', label: 'Proyectos', icon: LayoutDashboard },
  { href: '/quoter', label: 'Cotizar', icon: ShoppingCart },
  { href: '/settings', label: 'Ajustes', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-gray-200 py-6">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 mb-8">
        <span className="text-2xl">🪵</span>
        <span className="text-lg font-bold text-[#E8401C]">MaderaApp</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-[#E8401C]/10 text-[#E8401C]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 mt-4">
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  )
}
