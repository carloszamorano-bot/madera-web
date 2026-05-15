import { z } from 'zod'
import type { FurnitureType } from '@/types'
import { FURNITURE_DISPLAY_INFO } from '@/lib/algorithms/furniture-pieces'

export const dimensionSchema = z.object({
  widthMm: z.number().min(300).max(3600),
  heightMm: z.number().min(300).max(2700),
  depthMm: z.number().min(150).max(800),
})

export type DimensionErrors = {
  widthMm?: string
  heightMm?: string
  depthMm?: string
}

export function validateDimensions(
  type: FurnitureType,
  widthMm: number,
  heightMm: number,
  depthMm: number
): DimensionErrors {
  const info = FURNITURE_DISPLAY_INFO[type]
  const errors: DimensionErrors = {}

  if (widthMm < info.minWidth || widthMm > info.maxWidth) {
    errors.widthMm = `Ancho debe estar entre ${info.minWidth} y ${info.maxWidth} mm`
  }
  if (heightMm < info.minHeight || heightMm > info.maxHeight) {
    errors.heightMm = `Alto debe estar entre ${info.minHeight} y ${info.maxHeight} mm`
  }
  if (depthMm < info.minDepth || depthMm > info.maxDepth) {
    errors.depthMm = `Profundidad debe estar entre ${info.minDepth} y ${info.maxDepth} mm`
  }

  return errors
}

export function hasErrors(errors: DimensionErrors): boolean {
  return Object.keys(errors).length > 0
}
