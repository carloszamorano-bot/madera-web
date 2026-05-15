export default function QuoterPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cotizar materiales</h1>
        <p className="text-gray-500 text-sm mt-1">Próximamente — comparación de precios en tiendas chilenas.</p>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4 border-2 border-dashed border-gray-200 rounded-xl p-8">
        <p className="text-5xl">🏪</p>
        <p className="text-gray-500 font-medium">Cotizador en construcción</p>
        <p className="text-gray-400 text-sm max-w-xs">
          Esta función buscará precios de melamina, MDF y aglomerado en Sodimac, Easy e Imperial en tiempo real.
        </p>
      </div>
    </div>
  )
}
