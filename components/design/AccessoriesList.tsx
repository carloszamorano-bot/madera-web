'use client'

import type { AccessoriesSummary } from '@/lib/algorithms/accessories'

interface AccessoriesListProps {
  accessories: AccessoriesSummary
}

const ITEMS = [
  { key: 'hinges',    label: 'Bisagras',                   icon: '🔩', unit: 'unid.' },
  { key: 'handles',   label: 'Agarraderas',                icon: '🪝', unit: 'unid.' },
  { key: 'slides',    label: 'Correderas (par)',            icon: '↔️', unit: 'pares' },
  { key: 'camLocks',  label: 'Minifix / Cam locks',         icon: '⚙️', unit: 'unid.' },
  { key: 'screws',    label: 'Tornillos (estimado)',        icon: '🔧', unit: 'unid.' },
] as const

export default function AccessoriesList({ accessories }: AccessoriesListProps) {
  const withValues = ITEMS.filter((item) => accessories[item.key] > 0)

  if (withValues.length === 0) return null

  return (
    <div className="space-y-2">
      {withValues.map((item) => (
        <div key={item.key} className="flex items-center justify-between text-sm bg-gray-50 rounded-md px-3 py-2">
          <span className="flex items-center gap-2 text-gray-700">
            <span>{item.icon}</span>
            {item.label}
          </span>
          <span className="font-bold text-[#F5A623]">
            {accessories[item.key]} <span className="font-normal text-gray-400 text-xs">{item.unit}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
