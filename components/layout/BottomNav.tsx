'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Scissors, ShoppingCart, Settings, Sofa } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/design', label: 'Diseñar', icon: Sofa },
  { href: '/projects', label: 'Proyectos', icon: LayoutDashboard },
  { href: '/quoter', label: 'Cotizar', icon: ShoppingCart },
  { href: '/settings', label: 'Ajustes', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors',
              active ? 'text-[#E8401C]' : 'text-gray-500 hover:text-gray-900'
            )}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
