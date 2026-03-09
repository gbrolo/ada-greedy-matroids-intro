import { useState, useCallback } from 'react'

interface Hotel {
  id: number
  name: string
  rating: number
  emoji: string
  selected: boolean
  rank?: number
}

const HOTELS_DATA: Omit<Hotel, 'selected' | 'rank'>[] = [
  { id: 1, name: 'Hotel Sol Dorado', rating: 4.8, emoji: '🌟' },
  { id: 2, name: 'Posada El Tigre', rating: 3.2, emoji: '🐯' },
  { id: 3, name: 'Resort Azul', rating: 4.5, emoji: '🌊' },
  { id: 4, name: 'Hostal El Quetzal', rating: 2.7, emoji: '🦜' },
  { id: 5, name: 'Gran Hotel Tikal', rating: 4.9, emoji: '🏛️' },
  { id: 6, name: 'Casa del Viajero', rating: 3.8, emoji: '🧳' },
  { id: 7, name: 'Villa Xocomil', rating: 4.2, emoji: '🌺' },
  { id: 8, name: 'Bungalows Río', rating: 1.9, emoji: '🏕️' },
]

type Phase = 'initial' | 'sorted' | 'selecting' | 'done'

export default function BookingViz() {
  const [k, setK] = useState(3)
  const [phase, setPhase] = useState<Phase>('initial')
  const [hotels, setHotels] = useState<Hotel[]>(
    HOTELS_DATA.map(h => ({ ...h, selected: false }))
  )
  const [currentSelecting, setCurrentSelecting] = useState(-1)
  const [selectStep, setSelectStep] = useState(0)
  const [log, setLog] = useState<string[]>(['Ajusta k y presiona "Ordenar" para comenzar.'])

  const reset = useCallback(() => {
    setPhase('initial')
    setHotels(HOTELS_DATA.map(h => ({ ...h, selected: false })))
    setCurrentSelecting(-1)
    setSelectStep(0)
    setLog(['Ajusta k y presiona "Ordenar" para comenzar.'])
  }, [])

  const sortHotels = useCallback(() => {
    if (phase !== 'initial') return
    const sorted = [...hotels].sort((a, b) => b.rating - a.rating)
    setHotels(sorted.map(h => ({ ...h, selected: false })))
    setPhase('sorted')
    setLog(prev => [
      ...prev,
      `📊 Paso 1: Ordenando ${hotels.length} hoteles por calificación (descendente)...`,
      ...sorted.map((h, i) => `   ${i + 1}. ${h.name} → ⭐ ${h.rating}`),
    ])
  }, [phase, hotels])

  const selectNext = useCallback(() => {
    if (phase === 'sorted' && selectStep === 0) {
      setPhase('selecting')
      setLog(prev => [...prev, `\n🎯 Paso 2: Seleccionando los ${k} mejores hoteles...`])
    }

    if (selectStep >= k) return

    setCurrentSelecting(selectStep)
    setHotels(prev => prev.map((h, i) => {
      if (i === selectStep) return { ...h, selected: true, rank: selectStep + 1 }
      return h
    }))
    setLog(prev => [...prev, `✅ Seleccionando #${selectStep + 1}: ${hotels[selectStep].name} (⭐ ${hotels[selectStep].rating})`])

    if (selectStep + 1 >= k) {
      setPhase('done')
      const total = hotels.slice(0, k).reduce((sum, h) => sum + h.rating, 0)
      setLog(prev => [...prev, `\n🎉 ¡Listo! Los ${k} mejores hoteles tienen una suma de calificaciones de ${total.toFixed(1)}`])
    }

    setSelectStep(prev => prev + 1)
  }, [phase, selectStep, k, hotels])

  const selectAll = useCallback(() => {
    if (phase === 'initial') return
    const sorted = hotels

    const newHotels = sorted.map((h, i) => ({
      ...h,
      selected: i < k,
      rank: i < k ? i + 1 : undefined,
    }))
    setHotels(newHotels)
    setPhase('done')
    setSelectStep(k)

    const total = newHotels.filter(h => h.selected).reduce((sum, h) => sum + h.rating, 0)
    const logs: string[] = [
      `📊 Ordenados por calificación (descendente):`,
      ...sorted.map((h, i) => `   ${i + 1}. ${h.name} → ⭐ ${h.rating}`),
      `\n🎯 Seleccionando los ${k} mejores:`,
      ...sorted.slice(0, k).map((h, i) => `✅ #${i + 1}: ${h.name} (⭐ ${h.rating})`),
      `\n🎉 Suma total: ${total.toFixed(1)} | Esta es la mayor suma posible para k=${k}`,
    ]
    setLog(logs)
    setCurrentSelecting(-1)
  }, [phase, hotels, k])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="text-slate-400 text-sm font-medium">k =</label>
          <input
            type="range"
            min={1} max={HOTELS_DATA.length}
            value={k}
            onChange={e => { setK(+e.target.value); reset() }}
            className="w-32 accent-blue-500"
          />
          <span className="text-white font-bold w-6 text-center">{k}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={sortHotels} disabled={phase !== 'initial'} className="btn-primary text-sm">
            📊 Paso 1: Ordenar
          </button>
          <button onClick={selectNext} disabled={phase === 'initial' || phase === 'done'} className="btn-primary text-sm">
            ▶ Paso 2: Seleccionar siguiente
          </button>
          <button onClick={selectAll} disabled={phase === 'initial' || phase === 'done'} className="btn-success text-sm">
            ⏭ Seleccionar todos
          </button>
          <button onClick={reset} className="btn-secondary text-sm">
            ↺ Reiniciar
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Hotel cards */}
        <div className="lg:col-span-3">
          <p className="text-xs text-slate-500 mb-3 font-medium">
            {phase === 'initial' ? 'HOTELES (ORDEN ORIGINAL)' : 'HOTELES (ORDENADOS POR CALIFICACIÓN ↓)'}
          </p>
          <div className="space-y-2">
            {hotels.map((hotel, i) => (
              <div
                key={hotel.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
                  hotel.selected
                    ? 'bg-emerald-900/40 border-emerald-600/50 shadow-lg shadow-emerald-900/20'
                    : i === currentSelecting && phase === 'selecting'
                    ? 'bg-amber-900/30 border-amber-500/50 ring-1 ring-amber-400/30'
                    : 'bg-slate-800/30 border-slate-700/30'
                }`}
              >
                <span className="text-xl">{hotel.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${hotel.selected ? 'text-white' : 'text-slate-300'}`}>
                    {hotel.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={`text-xs ${hotel.rating >= star ? 'text-amber-400' : 'text-slate-600'}`}>
                        ★
                      </span>
                    ))}
                    <span className="text-slate-400 text-xs ml-1">{hotel.rating}</span>
                  </div>
                </div>

                {/* Rating bar */}
                <div className="w-24 hidden sm:block">
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        hotel.selected ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${(hotel.rating / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <span className="text-lg">
                  {hotel.selected ? `✅ #${hotel.rank}` :
                   i === currentSelecting ? '👀' :
                   phase !== 'initial' && i >= k ? '—' : '⬜'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats + explanation */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary card */}
          <div className="card p-4">
            <p className="text-xs text-slate-500 mb-3 font-medium">RESUMEN</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total hoteles (n)</span>
                <span className="text-white font-bold">{HOTELS_DATA.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Seleccionados (k)</span>
                <span className="text-blue-400 font-bold">{k}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Seleccionados hasta ahora</span>
                <span className="text-emerald-400 font-bold">{hotels.filter(h => h.selected).length}</span>
              </div>
              {phase === 'done' && (
                <>
                  <hr className="border-slate-700" />
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Suma de calificaciones</span>
                    <span className="text-amber-400 font-bold">
                      {hotels.filter(h => h.selected).reduce((s, h) => s + h.rating, 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Promedio</span>
                    <span className="text-amber-300 font-bold">
                      {(hotels.filter(h => h.selected).reduce((s, h) => s + h.rating, 0) / k).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Why greedy works */}
          <div className="highlight-box">
            <p className="text-blue-300 text-xs font-semibold mb-2">¿Por qué funciona la estrategia greedy aquí?</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Para maximizar la <strong className="text-slate-200">suma de k calificaciones</strong>, necesitamos
              los k valores más altos. Si tomáramos un hotel con calificación menor en lugar de uno mayor,
              la suma solo podría disminuir — nunca mejorar. ∴ La decisión greedy (siempre tomar el mejor disponible) es óptima.
            </p>
          </div>

          {/* Phase indicator */}
          <div className="card p-4">
            <p className="text-xs text-slate-500 mb-3 font-medium">FASE ACTUAL</p>
            <div className="space-y-2">
              {[
                { label: 'Datos iniciales', active: phase === 'initial', done: phase !== 'initial' },
                { label: 'Ordenar por calificación ↓', active: phase === 'sorted', done: phase === 'selecting' || phase === 'done' },
                { label: `Seleccionar top-${k}`, active: phase === 'selecting', done: phase === 'done' },
                { label: '¡Solución encontrada!', active: phase === 'done', done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.done ? 'bg-emerald-500 text-white' :
                    item.active ? 'bg-blue-500 text-white animate-pulse' :
                    'bg-slate-700 text-slate-500'
                  }`}>
                    {item.done ? '✓' : i + 1}
                  </div>
                  <span className={item.active ? 'text-blue-300 font-medium' : item.done ? 'text-emerald-400' : 'text-slate-500'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Log */}
      <div className="card p-4">
        <p className="text-xs text-slate-500 mb-2 font-medium">REGISTRO</p>
        <div className="space-y-0.5 max-h-36 overflow-y-auto">
          {log.map((entry, i) => (
            <p key={i} className={`text-xs font-mono ${
              entry.startsWith('✅') ? 'text-emerald-400' :
              entry.startsWith('🎉') ? 'text-blue-300 font-semibold' :
              entry.startsWith('📊') || entry.startsWith('🎯') ? 'text-amber-300' :
              entry.startsWith('   ') ? 'text-slate-400 ml-2' :
              'text-slate-400'
            }`}>
              {entry}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
