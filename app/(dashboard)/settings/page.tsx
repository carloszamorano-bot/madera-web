'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logout } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setFullName(data.full_name ?? '')
        setCompany(data.company ?? '')
        setPhone(data.phone ?? '')
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      company: company || null,
      phone: phone || null,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Ajustes</h1>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Correo electrónico</Label>
            <Input value={email} disabled className="bg-gray-50 text-gray-500" />
          </div>
          <div className="space-y-1">
            <Label>Nombre completo</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div className="space-y-1">
            <Label>Empresa (opcional)</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Tu empresa" />
          </div>
          <div className="space-y-1">
            <Label>Teléfono (opcional)</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9 ..." />
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-[#E8401C] hover:bg-[#c73518]"
          >
            {saved ? '✓ Guardado' : loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <form action={logout}>
            <Button type="submit" variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
              <LogOut size={16} className="mr-2" /> Cerrar sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
