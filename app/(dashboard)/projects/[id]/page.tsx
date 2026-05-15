'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Project, ProjectStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Trash2 } from 'lucide-react'

const STATUSES: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'BORRADOR', label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
  { value: 'COTIZADO', label: 'Cotizado', color: 'bg-blue-100 text-blue-700' },
  { value: 'EN_CONSTRUCCION', label: 'En construcción', color: 'bg-orange-100 text-orange-700' },
  { value: 'COMPLETADO', label: 'Completado', color: 'bg-green-100 text-green-700' },
]

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single()
      if (data) {
        setProject({
          id: data.id, userId: data.user_id, name: data.name,
          status: data.status, thumbnailUrl: data.thumbnail_url,
          createdAt: data.created_at, updatedAt: data.updated_at,
        })
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  const handleStatusChange = async (status: ProjectStatus) => {
    if (!project) return
    await supabase.from('projects').update({ status }).eq('id', project.id)
    setProject((prev) => prev ? { ...prev, status } : null)
  }

  const handleDelete = async () => {
    if (!project || !confirm('¿Eliminar este proyecto?')) return
    await supabase.from('projects').delete().eq('id', project.id)
    router.push('/projects')
  }

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />
  if (!project) return <p className="text-gray-500">Proyecto no encontrado.</p>

  const createdDate = new Date(project.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
  const updatedDate = new Date(project.updatedAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
      </div>

      {/* Status selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estado del proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => handleStatusChange(s.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
                  project.status === s.value
                    ? `${s.color} border-current scale-105`
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Información</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Creado</span>
            <span className="font-medium">{createdDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Actualizado</span>
            <span className="font-medium">{updatedDate}</span>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-100">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-red-600 text-sm">Eliminar proyecto</p>
            <p className="text-xs text-gray-400">Esta acción no se puede deshacer.</p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 size={14} className="mr-1.5" /> Eliminar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
