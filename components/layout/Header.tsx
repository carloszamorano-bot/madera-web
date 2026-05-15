'use client'

import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/design': 'Diseñar',
  '/projects': 'Proyectos',
  '/quoter': 'Cotizar',
  '/settings': 'Ajustes',
  '/cutting': 'Plan de Corte',
  '/viewer3d': 'Visor 3D',
}

function getTitle(pathname: string) {
  for (const [prefix, title] of Object.entries(titles)) {
    if (pathname.startsWith(prefix)) return title
  }
  return 'MaderaApp'
}

export default function Header() {
  const pathname = usePathname()
  const title = getTitle(pathname)

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 h-14 flex items-center">
      <div className="flex items-center gap-2">
        <span className="text-lg">🪵</span>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      </div>
    </header>
  )
}
