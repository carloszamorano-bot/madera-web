'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/types'
import ProjectCard from '@/components/projects/ProjectCard'
import CreateProjectDialog from '@/components/projects/CreateProjectDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const supabase = createClient()

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
    if (data) {
      setProjects(
        data.map((p) => ({
          id: p.id,
          userId: p.user_id,
          name: p.name,
          status: p.status,
          thumbnailUrl: p.thumbnail_url,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }))
      )
    }
    setLoading(false)
  }

  useEffect(() => { fetchProjects() }, [])

  const handleCreate = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('projects').insert({ name, user_id: user.id })
    fetchProjects()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este proyecto?')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  const handleDuplicate = async (id: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const project = projects.find((p) => p.id === id)
    if (!project) return
    await supabase.from('projects').insert({
      name: `${project.name} (copia)`,
      user_id: user.id,
      status: 'BORRADOR',
    })
    fetchProjects()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-[#E8401C] hover:bg-[#c73518]"
        >
          <Plus size={16} className="mr-1.5" /> Nuevo
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-52 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4">
          <p className="text-5xl">📁</p>
          <p className="text-gray-500 font-medium">Sin proyectos aún</p>
          <p className="text-gray-400 text-sm">Crea tu primer proyecto para empezar.</p>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#E8401C] hover:bg-[#c73518] mt-2"
          >
            <Plus size={16} className="mr-1.5" /> Crear proyecto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}
