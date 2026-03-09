import { useState } from 'react'

// Generic matroid greedy visualization
// Uses the "uniform matroid of rank k" on elements with weights
interface Element {
  id: string
  weight: number
  status: 'pending' | 'current' | 'accepted' | 'rejected'
}

function GenericGreedyViz() {
  const initial: Omit<Element, 'status'>[] = [
    { id: 'x₁', weight: 9 },
    { id: 'x₂', weight: 7 },
    { id: 'x₃', weight: 5 },
    { id: 'x₄', weight: 4 },
    { id: 'x₅', weight: 3 },
    { id: 'x₆', weight: 1 },
  ]
  const MAX_SIZE = 3 // rank of matroid

  const sorted = [...initial].sort((a, b) => b.weight - a.weight)
  const [step, setStep] = useState(-1)
  const [elements, setElements] = useState<Element[]>(
    sorted.map(e => ({ ...e, status: 'pending' }))
  )
  const [currentA, setCurrentA] = useState<string[]>([])
  const [log, setLog] = useState<string[]>([
    `Matroide uniforme de rango k=${MAX_SIZE}: independiente = cualquier subconjunto de tamaño ≤ ${MAX_SIZE}`,
    `M.S ordenado por peso descendente: ${sorted.map(e => `${e.id}(${e.weight})`).join(', ')}`,
    `A = ∅. Iniciando GREEDY(M, w)...`
  ])
  const [done, setDone] = useState(false)

  const reset = () => {
    setStep(-1)
    setElements(sorted.map(e => ({ ...e, status: 'pending' })))
    setCurrentA([])
    setLog([
      `Matroide uniforme de rango k=${MAX_SIZE}: independiente = cualquier subconjunto de tamaño ≤ ${MAX_SIZE}`,
      `M.S ordenado por peso descendente: ${sorted.map(e => `${e.id}(${e.weight})`).join(', ')}`,
      `A = ∅. Iniciando GREEDY(M, w)...`
    ])
    setDone(false)
  }

  const nextStep = () => {
    const nextIdx = step + 1
    if (nextIdx >= sorted.length) { setDone(true); return }

    const x = sorted[nextIdx]

    // Check if A ∪ {x} ∈ M.I → just size check for uniform matroid
    const newA = [...currentA, x.id]
    const isIndependent = newA.length <= MAX_SIZE

    if (isIndependent) {
      setCurrentA(newA)
      setElements(prev => prev.map((e, i) =>
        i === nextIdx ? { ...e, status: 'accepted' } : e
      ))
      setLog(prev => [...prev,
        `→ Evaluando x = ${x.id} (w=${x.weight})`,
        `   A ∪ {${x.id}} = {${newA.join(',')}} tiene tamaño ${newA.length} ≤ ${MAX_SIZE} → ∈ M.I`,
        `✅ A = {${newA.join(',')}}`
      ])
    } else {
      setElements(prev => prev.map((e, i) =>
        i === nextIdx ? { ...e, status: 'rejected' } : e
      ))
      setLog(prev => [...prev,
        `→ Evaluando x = ${x.id} (w=${x.weight})`,
        `   A ∪ {${x.id}} tendría tamaño ${newA.length} > ${MAX_SIZE} → ∉ M.I`,
        `❌ ${x.id} rechazado. A sigue siendo {${currentA.join(',')}} `
      ])
    }

    setStep(nextIdx)
    if (nextIdx === sorted.length - 1) {
      const totalWeight = sorted
        .filter(e => isIndependent || (e.id !== x.id))
        .slice(0, MAX_SIZE)
        .reduce((s, e) => s + e.weight, 0)
      setLog(prev => [...prev, `\n🎉 Fin. A = {${[...currentA, ...(isIndependent ? [x.id] : [])].join(',')}} (peso total = ${sorted.slice(0, MAX_SIZE).reduce((s,e)=>s+e.weight,0)})`])
      setDone(true)
    }
  }

  const runAll = () => {
    const newA: string[] = []
    const newElements: Element[] = sorted.map(e => ({ ...e, status: 'pending' }))
    const logs: string[] = [
      `Matroide uniforme de rango k=${MAX_SIZE}`,
      `A = ∅. Ejecutando GREEDY(M, w)...`
    ]

    sorted.forEach((x, i) => {
      const candidate = [...newA, x.id]
      if (candidate.length <= MAX_SIZE) {
        newA.push(x.id)
        newElements[i] = { ...newElements[i], status: 'accepted' }
        logs.push(`✅ ${x.id}(w=${x.weight}) aceptado → A = {${newA.join(',')}}`)
      } else {
        newElements[i] = { ...newElements[i], status: 'rejected' }
        logs.push(`❌ ${x.id}(w=${x.weight}) rechazado`)
      }
    })

    const total = sorted.slice(0, MAX_SIZE).reduce((s,e) => s+e.weight, 0)
    logs.push(`\n🎉 A = {${newA.join(',')}} | peso total = ${total}`)

    setElements(newElements)
    setCurrentA(newA)
    setLog(logs)
    setStep(sorted.length - 1)
    setDone(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={nextStep} disabled={done} className="btn-primary text-sm">▶ Siguiente</button>
        <button onClick={runAll} disabled={done} className="btn-success text-sm">⏭ Ejecutar todo</button>
        <button onClick={reset} className="btn-secondary text-sm">↺ Reiniciar</button>
        <div className="ml-auto text-sm text-slate-400">
          Rank k = <span className="text-white font-bold">{MAX_SIZE}</span>
          <span className="mx-2">|</span>
          A = <span className="text-emerald-400 font-mono font-bold">{'{' + currentA.join(',') + '}'}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {elements.map(el => (
          <div
            key={el.id}
            className={`px-4 py-3 rounded-xl border text-center transition-all duration-300 ${
              el.status === 'accepted' ? 'bg-emerald-900/40 border-emerald-600/60' :
              el.status === 'rejected' ? 'bg-red-900/30 border-red-700/40 opacity-60' :
              el.status === 'current' ? 'bg-amber-900/30 border-amber-500/60 ring-1 ring-amber-400/30' :
              'bg-slate-800/30 border-slate-700/30'
            }`}
          >
            <p className={`font-mono font-bold text-sm ${
              el.status === 'accepted' ? 'text-emerald-300' :
              el.status === 'rejected' ? 'text-red-400' :
              'text-slate-300'
            }`}>{el.id}</p>
            <p className="text-xs text-slate-500 mt-0.5">w={el.weight}</p>
            <p className="text-xs mt-1">
              {el.status === 'accepted' ? '✅' :
               el.status === 'rejected' ? '❌' : '⬜'}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-3 max-h-40 overflow-y-auto">
        <div className="space-y-0.5">
          {log.map((l, i) => (
            <p key={i} className={`text-xs font-mono ${
              l.startsWith('✅') ? 'text-emerald-400' :
              l.startsWith('❌') ? 'text-red-400' :
              l.startsWith('🎉') ? 'text-blue-300 font-semibold' :
              l.startsWith('→') ? 'text-amber-300' :
              l.startsWith('   ') ? 'text-slate-500 ml-2' :
              'text-slate-400'
            }`}>{l}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

const CODE_LINES = [
  { line: 'GREEDY(M, w)', type: 'header' },
  { line: '1   A = ∅', type: 'code', note: 'Empezamos con la solución vacía' },
  { line: '2   sort M.S in decreasing order by weight w', type: 'code', note: 'Ordenamos S por peso, de mayor a menor' },
  { line: '3   for each x ∈ M.S (in decreasing order):', type: 'code', note: 'Recorremos cada elemento en ese orden' },
  { line: '4       if A ∪ {x} ∈ M.I', type: 'code', note: '¿Añadir x sigue siendo independiente?' },
  { line: '5           A = A ∪ {x}', type: 'code', note: 'Sí → lo añadimos (decisión greedy)' },
  { line: '6   return A', type: 'code', note: 'Devolvemos el subconjunto independiente de peso máximo' },
]

export default function GreedySection() {
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null)

  return (
    <section id="greedy" className="section-container">
      <div className="section-divider mb-16" />

      <div className="flex items-center gap-3 mb-2">
        <span className="tag-blue">Sección 5</span>
        <span className="tag-purple">Algoritmo</span>
      </div>
      <h2 className="section-title">El algoritmo GREEDY(M, w)</h2>
      <p className="section-subtitle">El algoritmo greedy general para matroides ponderadas</p>

      {/* Main explanation */}
      <div className="card p-6 mb-8">
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          Ahora que entendemos las matroides, podemos formular el algoritmo greedy general que{' '}
          <strong>garantiza la solución óptima</strong> para cualquier problema modelable como matroide ponderada.
          Este algoritmo encuentra el subconjunto independiente de <strong>mayor peso total</strong>.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pseudocode */}
          <div>
            <p className="text-xs text-slate-500 mb-3 font-medium font-mono">PSEUDOCÓDIGO — pasa el cursor sobre cada línea</p>
            <div className="bg-slate-950 border border-slate-700 rounded-xl overflow-hidden">
              {CODE_LINES.map((item, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHighlightedLine(i)}
                  onMouseLeave={() => setHighlightedLine(null)}
                  className={`px-4 py-2.5 font-mono text-sm transition-colors cursor-default ${
                    item.type === 'header'
                      ? 'bg-blue-950/50 text-blue-300 font-semibold border-b border-slate-700'
                      : highlightedLine === i
                      ? 'bg-slate-800/60 text-white'
                      : 'text-slate-300 hover:bg-slate-800/30'
                  }`}
                >
                  {item.line}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation panel */}
          <div className="space-y-3">
            {highlightedLine !== null && highlightedLine > 0 ? (
              <div className="highlight-box animate-slide-up">
                <p className="text-blue-300 font-semibold text-sm mb-1">
                  Línea {CODE_LINES[highlightedLine].line.trim().split(' ')[0]}
                </p>
                <p className="text-slate-300 text-sm">
                  {CODE_LINES[highlightedLine].note}
                </p>
              </div>
            ) : (
              <div className="highlight-box">
                <p className="text-slate-400 text-sm">
                  Pasa el cursor sobre una línea del pseudocódigo para ver su explicación.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {[
                {
                  icon: '🎯',
                  title: 'Decisión greedy',
                  text: 'En cada paso, el elemento con mayor peso disponible es incluido si mantiene la independencia. No hay reconsideración.',
                  color: 'blue',
                },
                {
                  icon: '🔒',
                  title: 'Condición de independencia',
                  text: 'La verificación "A ∪ {x} ∈ M.I" encapsula todas las restricciones del problema. Para MST: detectar ciclos. Para hospedajes: verificar tamaño.',
                  color: 'purple',
                },
                {
                  icon: '✅',
                  title: 'Garantía de optimalidad',
                  text: 'Si M es una matroide válida, este algoritmo siempre encuentra el subconjunto independiente de peso máximo.',
                  color: 'emerald',
                },
              ].map(item => (
                <div key={item.title} className={`card p-3 flex items-start gap-3`}>
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-white font-medium text-sm">{item.title}</p>
                    <p className="text-slate-400 text-xs mt-1">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How it applies */}
      <div className="card p-6 mb-8">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <span>🔄</span> ¿Cómo se aplica GREEDY(M, w) a nuestros problemas?
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4">
            <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
              <span>🌲</span> GREEDY aplicado al MST
            </h4>
            <p className="text-slate-400 text-xs mb-3">
              Para minimizar peso (no maximizar), invertimos el orden de clasificación:
            </p>
            <div className="space-y-2 text-xs">
              {[
                { from: 'M.S', to: 'Todas las aristas E' },
                { from: 'w(x)', to: 'Peso de la arista (queremos mínimo, so invertimos)' },
                { from: 'M.I', to: 'Subconjuntos acíclicos (bosques)' },
                { from: 'A ∪ {x} ∈ M.I', to: 'find(u) ≠ find(v) con Union-Find' },
                { from: 'Orden', to: 'Ascendente por peso (mínimo primero)' },
              ].map(row => (
                <div key={row.from} className="flex gap-3">
                  <span className="font-mono text-blue-400 w-28 shrink-0">{row.from}:</span>
                  <span className="text-slate-300">{row.to}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-slate-900/60 rounded-lg p-2 text-xs font-mono text-slate-500">
              → Equivalente al algoritmo de Kruskal
            </div>
          </div>

          <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-4">
            <h4 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
              <span>🏨</span> GREEDY aplicado a hospedajes
            </h4>
            <p className="text-slate-400 text-xs mb-3">
              Aquí queremos maximizar la suma:
            </p>
            <div className="space-y-2 text-xs">
              {[
                { from: 'M.S', to: 'Todos los n hospedajes' },
                { from: 'w(x)', to: 'Calificación del hospedaje' },
                { from: 'M.I', to: 'Subconjuntos de tamaño ≤ k' },
                { from: 'A ∪ {x} ∈ M.I', to: '|A| + 1 ≤ k (simplemente verificar tamaño)' },
                { from: 'Orden', to: 'Descendente por calificación (máximo primero)' },
              ].map(row => (
                <div key={row.from} className="flex gap-3">
                  <span className="font-mono text-purple-400 w-28 shrink-0">{row.from}:</span>
                  <span className="text-slate-300">{row.to}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-slate-900/60 rounded-lg p-2 text-xs font-mono text-slate-500">
              → Ordenar y tomar los primeros k
            </div>
          </div>
        </div>
      </div>

      {/* Interactive demo */}
      <div className="card p-6">
        <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
          <span>🎮</span> Visualización de GREEDY(M, w) genérico
        </h3>
        <div className="space-y-3 mb-5">
          <p className="text-slate-300 text-sm leading-relaxed">
            Para ver el algoritmo en acción necesitamos elegir una matroide concreta. Usamos la más simple posible:
            una <strong className="text-white">matroide uniforme de rango 3</strong>.
          </p>
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 text-xs space-y-2">
            <p className="text-slate-400">
              <strong className="text-blue-300">¿Qué es una matroide uniforme de rango k?</strong>{' '}
              Es aquella donde la regla de independencia es simplemente <em>"el subconjunto tiene a lo sumo k elementos"</em>.
              No importa qué elementos eliges, solo cuántos. Es equivalente al problema de hospedajes (top-k).
            </p>
            <p className="text-slate-400">
              <strong className="text-purple-300">¿Por qué rango 3?</strong>{' '}
              Elegimos k=3 como ejemplo. Esto significa que cualquier subconjunto de hasta 3 elementos es un independiente válido.
              Si agregas un 4.º elemento, ya no es válido. Con 6 elementos en S, el algoritmo aceptará los 3 de mayor peso
              y rechazará los otros 3.
            </p>
          </div>
          <p className="text-slate-400 text-sm">
            Avanza paso a paso y observa la condición de independencia en el log — en una matroide diferente (como la gráfica del MST),
            esa misma condición sería "¿crea ciclo?" en lugar de "¿supera el tamaño?".
          </p>
        </div>
        <GenericGreedyViz />
      </div>

      {/* Family of independent sets */}
      <div className="mt-8 card p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span>🧩</span> La familia de subconjuntos independientes como "restricciones"
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-4">
          La familia I identifica los subconjuntos que cumplen con las restricciones del problema.
          Si solo necesitáramos los elementos con mayor peso, la solución sería trivial. Pero lo interesante es
          que debemos elegir sujetos a condiciones específicas:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <span className="text-xl">🌲</span>
            <div>
              <p className="text-white font-medium text-sm">MST</p>
              <p className="text-slate-400 text-xs mt-1">
                No podemos proponer como solución un conjunto de aristas que no formen un árbol.
                Por eso I = conjuntos acíclicos. El greedy elige la arista más barata que forme un árbol unitario.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <span className="text-xl">🏨</span>
            <div>
              <p className="text-white font-medium text-sm">Hospedajes</p>
              <p className="text-slate-400 text-xs mt-1">
                El usuario quiere exactamente k lugares. Por eso I = subconjuntos de tamaño ≤ k.
                El greedy siempre añade el hospedaje con mejor calificación disponible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
