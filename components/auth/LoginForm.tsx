'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginValues) => {
    setLoading(true)
    setServerError(null)
    const fd = new FormData()
    fd.append('email', values.email)
    fd.append('password', values.password)
    const result = await login(fd)
    if (result?.error) {
      setServerError(result.error)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🪵</span>
          <span className="text-xl font-bold text-[#E8401C]">MaderaApp</span>
        </div>
        <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
        <CardDescription>Ingresa tu correo y contraseña</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {serverError && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{serverError}</p>
          )}
          <Button
            type="submit"
            className="w-full bg-[#E8401C] hover:bg-[#c73518]"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-[#E8401C] hover:underline font-medium">
            Regístrate
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
