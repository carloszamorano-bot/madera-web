'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Project } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, Trash2, Copy, ArrowRight } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  BORRADOR: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  COTIZADO: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  EN_CONSTRUCCION: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  COMPLETADO: 'bg-green-100 text-green-700 hover:bg-green-100',
}

const STATUS_LABELS: Record<string, string> = {
  BORRADOR: 'Borrador',
  COTIZADO: 'Cotizado',
  EN_CONSTRUCCION: 'En construcción',
  COMPLETADO: 'Completado',
}

interface ProjectCardProps {
  project: Project
  onDelete: (id: number) => void
  onDuplicate: (id: number) => void
}

export default function ProjectCard({ project, onDelete, onDuplicate }: ProjectCardProps) {
  const initial = project.name.charAt(0).toUpperCase()
  const date = new Date(project.updatedAt).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="h-28 bg-gradient-to-br from-[#E8401C]/10 to-[#F5A623]/10 flex items-center justify-center relative">
          {project.thumbnailUrl ? (
            <img src={project.thumbnailUrl} alt={project.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-[#E8401C]/30">{initial}</span>
          )}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="h-7 w-7 flex items-center justify-center rounded-md bg-white/80 hover:bg-white border-0 cursor-pointer">
                <MoreVertical size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDuplicate(project.id)}>
                  <Copy size={14} className="mr-2" /> Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(project.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 size={14} className="mr-2" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{project.name}</h3>
          <div className="flex items-center justify-between">
            <Badge className={`text-xs ${STATUS_COLORS[project.status] ?? ''}`}>
              {STATUS_LABELS[project.status] ?? project.status}
            </Badge>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
          <Link href={`/projects/${project.id}`} className="flex items-center gap-1 text-xs text-[#E8401C] hover:underline font-medium">
            Ver detalle <ArrowRight size={12} />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
