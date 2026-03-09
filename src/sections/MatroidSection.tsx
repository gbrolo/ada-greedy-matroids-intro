import { useState } from 'react'

// Interactive hereditary property demo
function HereditaryDemo() {
  const [selected, setSelected] = useState<number[]>([0, 1, 2])

  const elements = [
    { id: 0, label: 'a', color: '#3b82f6' },
    { id: 1, label: 'b', color: '#a855f7' },
    { id: 2, label: 'c', color: '#10b981' },
    { id: 3, label: 'd', color: '#f59e0b' },
  ]

  // An independent set is valid if |set| <= 2 (for demo)
  const isIndependent = (set: number[]) => set.length <= 2

  const toggle = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const subsets = selected.length > 0
    ? Array.from({ length: Math.pow(2, selected.length) }, (_, mask) =>
        selected.filter((_, i) => mask & (1 << i))
      ).slice(1) // remove empty
    : []

  return (
    <div className="card p-5 space-y-4">
      <h4 className="text-white font-semibold text-sm">Demo: Propiedad Hereditaria</h4>
      <div className="space-y-2">
        <p className="text-slate-300 text-xs leading-relaxed">
          En una matroide, un conjunto se llama <strong className="text-emerald-300">independiente</strong> cuando
          cumple las restricciones del problema. Eso depende del problema concreto: en el MST, es independiente
          si no forma ciclos; en hospedajes, si tiene ≤ k elementos. La regla varía — lo que no varía es que la
          familia I de independientes siempre debe ser <em>hereditaria</em>.
        </p>
        <p className="text-slate-400 text-xs leading-relaxed bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/40">
          <strong className="text-amber-300">En esta demo</strong> usamos la regla más simple posible:{' '}
          un conjunto es independiente si tiene <strong className="text-white">2 o menos elementos</strong>.
          Esto es una <em>matroide uniforme de rango 2</em> — imagina que tienes un mochila con capacidad para 2 objetos.
          La regla abstracta podría ser cualquier otra (acíclico, ≤ k, etc.), pero el comportamiento hereditario
          es siempre el mismo.
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2 font-medium">SELECCIONA ELEMENTOS PARA A:</p>
        <div className="flex gap-2">
          {elements.map(el => (
            <button
              key={el.id}
              onClick={() => toggle(el.id)}
              className={`w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200 border ${
                selected.includes(el.id)
                  ? 'border-current shadow-md scale-110'
                  : 'border-slate-600 text-slate-500 bg-slate-800/50'
              }`}
              style={selected.includes(el.id) ? { color: el.color, borderColor: el.color, backgroundColor: `${el.color}22` } : {}}
            >
              {el.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2 font-medium">
          A = {'{'}
          {selected.map(id => elements[id].label).join(', ')}
          {'}'} →{' '}
          <span className={isIndependent(selected) ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
            {isIndependent(selected) ? '✅ Independiente' : '❌ No independiente'}
          </span>
        </p>
      </div>

      {isIndependent(selected) && selected.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2 font-medium">TODOS LOS SUBCONJUNTOS DE A (incluyendo ∅):</p>
          <div className="flex flex-wrap gap-2">
            <div className="px-2 py-1 rounded-lg bg-emerald-900/40 border border-emerald-700/40 text-xs text-emerald-300 font-mono">
              ∅ ✅
            </div>
            {subsets.map((subset, i) => (
              <div
                key={i}
                className="px-2 py-1 rounded-lg bg-emerald-900/40 border border-emerald-700/40 text-xs text-emerald-300 font-mono"
              >
                {'{'}
                {subset.map(id => elements[id].label).join(',')}
                {'}'} ✅
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-2">
            ✓ Todos los subconjuntos de un conjunto independiente también son independientes.
          </p>
        </div>
      )}
    </div>
  )
}

// Exchange property demo
function ExchangeDemo() {
  const elements = ['a', 'b', 'c', 'd', 'e']
  // I = subsets of size <= 2
  const [setA, setSetA] = useState<string[]>(['a'])
  const [setB, setSetB] = useState<string[]>(['b', 'c'])

  const isIndependent = (s: string[]) => s.length <= 2

  const difference = setB.filter(x => !setA.includes(x))
  const canAdd = difference.filter(x => isIndependent([...setA, x]))

  return (
    <div className="card p-5 space-y-4">
      <h4 className="text-white font-semibold text-sm">Demo: Propiedad de Intercambio</h4>
      <div className="space-y-2">
        <p className="text-slate-300 text-xs leading-relaxed">
          La propiedad de intercambio garantiza que si tienes dos independientes de distinto tamaño, siempre
          puedes "crecer" el pequeño tomando un elemento del grande — sin romper la independencia.
          Esto es lo que le permite a GREEDY seguir añadiendo elementos sin quedar atascado.
        </p>
        <p className="text-slate-400 text-xs leading-relaxed bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/40">
          <strong className="text-amber-300">En esta demo</strong> la regla de independencia sigue siendo:{' '}
          <strong className="text-white">tamaño ≤ 2</strong> (matroide uniforme de rango 2).
          Forma A (el pequeño) y B (el grande) y observa que siempre existe un elemento de B que puedes
          agregar a A sin sobrepasar el límite. En el MST la misma propiedad aparece: si un bosque A tiene
          menos aristas que otro B, hay al menos una arista de B que puedes agregar a A sin crear ciclo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-2">CONJUNTO A (el pequeño)</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {elements.map(el => (
              <button
                key={el}
                onClick={() => setSetA(prev =>
                  prev.includes(el)
                    ? prev.filter(x => x !== el)
                    : isIndependent([...prev, el]) ? [...prev, el] : prev
                )}
                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                  setA.includes(el)
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800/40 border-slate-600 text-slate-500'
                }`}
              >
                {el}
              </button>
            ))}
          </div>
          <p className="text-xs">
            <span className="text-slate-500">A = </span>
            <span className="font-mono text-blue-300">{'{' + setA.join(',') + '}'}</span>
            <span className={`ml-2 text-xs ${isIndependent(setA) ? 'text-emerald-400' : 'text-red-400'}`}>
              {isIndependent(setA) ? '✅' : '❌'}
            </span>
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-2">CONJUNTO B (el grande)</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {elements.map(el => (
              <button
                key={el}
                onClick={() => setSetB(prev =>
                  prev.includes(el)
                    ? prev.filter(x => x !== el)
                    : isIndependent([...prev, el]) ? [...prev, el] : prev
                )}
                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                  setB.includes(el)
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-slate-800/40 border-slate-600 text-slate-500'
                }`}
              >
                {el}
              </button>
            ))}
          </div>
          <p className="text-xs">
            <span className="text-slate-500">B = </span>
            <span className="font-mono text-purple-300">{'{' + setB.join(',') + '}'}</span>
            <span className={`ml-2 text-xs ${isIndependent(setB) ? 'text-emerald-400' : 'text-red-400'}`}>
              {isIndependent(setB) ? '✅' : '❌'}
            </span>
          </p>
        </div>
      </div>

      {isIndependent(setA) && isIndependent(setB) && setB.length > setA.length && (
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-3">
          <p className="text-amber-300 text-xs font-semibold mb-1">
            |B| = {setB.length} &gt; |A| = {setA.length} → Se puede extender A
          </p>
          <p className="text-slate-400 text-xs mb-1">
            B − A = {'{' + difference.join(',') + '}'}
          </p>
          {canAdd.length > 0 ? (
            <p className="text-emerald-400 text-xs">
              ✅ Podemos añadir {canAdd.map(x => `"${x}"`).join(' o ')} a A sin romper la independencia.
            </p>
          ) : (
            <p className="text-red-400 text-xs">Intenta otro ejemplo.</p>
          )}
        </div>
      )}

      {isIndependent(setA) && isIndependent(setB) && setB.length <= setA.length && (
        <div className="bg-slate-800/40 border border-slate-600/40 rounded-xl p-3">
          <p className="text-slate-400 text-xs">Para ver la propiedad de intercambio, necesitas |B| &gt; |A|.</p>
        </div>
      )}
    </div>
  )
}

export default function MatroidSection() {
  return (
    <section id="matroids" className="section-container">
      <div className="section-divider mb-16" />

      <div className="flex items-center gap-3 mb-2">
        <span className="tag-blue">Sección 4</span>
        <span className="tag-purple">Teoría</span>
      </div>
      <h2 className="section-title">Matroides ponderadas</h2>
      <p className="section-subtitle">La estructura que unifica ambos problemas</p>

      {/* The big question */}
      <div className="card p-6 mb-8 bg-gradient-to-br from-slate-800/60 to-purple-900/20 border-purple-700/30">
        <h3 className="text-white font-semibold text-lg mb-3">
          ¿Por qué funcionan el mismo tipo de solución en ambos problemas?
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          El MST y el problema de hospedajes son muy diferentes a simple vista, pero ambos se resuelven con
          el mismo patrón greedy: <em>ordenar por peso y seleccionar greedily mientras se respete una restricción</em>.
          La razón es que <strong className="text-purple-300">ambos se pueden modelar como matroides ponderadas</strong>.
        </p>
      </div>

      {/* Definition */}
      <div className="card p-6 mb-6">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <span>📐</span> Definición: Matroide ponderada
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-4">
          Una <strong className="text-white">matroide ponderada</strong> es una pareja{' '}
          <span className="font-mono text-purple-300">M = (S, I)</span> donde:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <p className="text-purple-300 font-mono font-semibold mb-2">S — Conjunto base</p>
            <p className="text-slate-400 text-sm">
              Un conjunto finito y no vacío de elementos. Cada elemento tiene asignado un{' '}
              <strong className="text-slate-200">peso positivo</strong> dado por una función{' '}
              <span className="font-mono text-blue-300">w: S → ℝ⁺</span>.
            </p>
            <div className="mt-3 text-xs font-mono text-slate-500">
              <p>// Ejemplos:</p>
              <p>S = aristas del grafo (con pesos)</p>
              <p>S = hospedajes (con calificaciones)</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <p className="text-blue-300 font-mono font-semibold mb-2">I — Familia de subconjuntos independientes</p>
            <p className="text-slate-400 text-sm">
              Una familia de subconjuntos de S llamados{' '}
              <strong className="text-slate-200">independientes</strong>, que representa todas las
              soluciones <em>parciales válidas</em>.
            </p>
            <div className="mt-3 text-xs font-mono text-slate-500">
              <p>// Ejemplos:</p>
              <p>I = subconjuntos acíclicos de aristas</p>
              <p>I = subconjuntos de ≤ k hospedajes</p>
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-4 font-semibold">
          Para que (S, I) sea una matroide, I debe cumplir dos propiedades:
        </p>

        {/* Properties */}
        <div className="space-y-4">
          {/* Property 1 */}
          <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="step-indicator bg-blue-600 text-white">1</div>
              <div>
                <h4 className="text-blue-300 font-semibold">Propiedad Hereditaria</h4>
                <p className="text-slate-500 text-xs">I es hereditary</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              <strong>Todo subconjunto de un conjunto independiente también es independiente.</strong>{' '}
              Si A es válido, cualquier subconjunto de A también es válido.
            </p>
            <div className="formula-box text-blue-300">
              Si A ∈ I  y  B ⊆ A  →  B ∈ I
            </div>
            <div className="mt-3 grid md:grid-cols-2 gap-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <span className="text-blue-400">🌲</span>
                <span>MST: Si un conjunto de aristas es acíclico (bosque), cualquier subconjunto también lo es.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">🏨</span>
                <span>Hospedajes: Si seleccionar m lugares es válido (m ≤ k), seleccionar menos también lo es.</span>
              </div>
            </div>
          </div>

          {/* Property 2 */}
          <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="step-indicator bg-purple-600 text-white">2</div>
              <div>
                <h4 className="text-purple-300 font-semibold">Propiedad de Intercambio</h4>
                <p className="text-slate-500 text-xs">Exchange property</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              Si B es un conjunto independiente <strong>más grande</strong> que A (otro independiente),
              entonces existe al menos un elemento en B que no está en A que podemos agregar a A y
              seguir siendo independientes.
            </p>
            <div className="formula-box text-purple-300">
              {'Si A, B ∈ I  y  |B| > |A|  →  ∃x ∈ (B − A) : (A ∪ {x}) ∈ I'}
            </div>
            <div className="mt-3 grid md:grid-cols-2 gap-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <span className="text-blue-400">🌲</span>
                <span>MST: Si un bosque tiene más aristas que otro, siempre podemos agregar una arista del mayor al menor sin crear ciclo.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">🏨</span>
                <span>Hospedajes: Si una selección tiene más lugares que otra (y ambas ≤ k), podemos añadir uno más.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive demos */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <HereditaryDemo />
        <ExchangeDemo />
      </div>

      {/* Mapping section */}
      <div className="card p-6">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <span>🗺️</span> ¿Cómo se mapea cada problema a una matroide?
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* MST matroid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🌲</span>
              <h4 className="text-blue-300 font-semibold">MST como matroide gráfica</h4>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { key: 'S', val: 'Todas las aristas E del grafo G(V, E)' },
                { key: 'w(e)', val: 'Peso de la arista e' },
                { key: 'I', val: 'Todos los subconjuntos acíclicos de aristas (bosques)' },
                { key: 'Hereditario', val: 'Sub-bosque de un bosque = bosque ✅' },
                { key: 'Intercambio', val: 'Si un bosque A tiene menos aristas que B, hay una arista de B que extiende A sin crear ciclo ✅' },
              ].map(row => (
                <div key={row.key} className="flex gap-3">
                  <span className="font-mono text-blue-400 w-24 shrink-0 text-xs mt-0.5">{row.key}:</span>
                  <span className="text-slate-300 text-xs">{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking matroid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏨</span>
              <h4 className="text-purple-300 font-semibold">Hospedajes como matroide uniforme</h4>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { key: 'S', val: 'Todos los n hospedajes' },
                { key: 'w(h)', val: 'Calificación del hospedaje h' },
                { key: 'I', val: 'Todos los subconjuntos de tamaño ≤ k (0 ≤ k ≤ n)' },
                { key: 'Hereditario', val: 'Sub-selección de una selección válida = válida ✅' },
                { key: 'Intercambio', val: 'Si |A| < |B| ≤ k, podemos añadir cualquier elemento de B-A a A ✅' },
              ].map(row => (
                <div key={row.key} className="flex gap-3">
                  <span className="font-mono text-purple-400 w-24 shrink-0 text-xs mt-0.5">{row.key}:</span>
                  <span className="text-slate-300 text-xs">{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Maximal / optimal */}
      <div className="mt-6 card p-6 bg-gradient-to-br from-emerald-950/30 to-slate-800/50 border-emerald-800/40">
        <h3 className="text-emerald-300 font-semibold mb-3 flex items-center gap-2">
          <span>⭐</span> Subconjunto independiente óptimo = maximal
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          En una matroide ponderada, un subconjunto independiente <strong>óptimo</strong> (el de mayor peso total)
          es necesariamente <strong>maximal</strong>, es decir, no es subconjunto de ningún otro independiente más grande.
        </p>
        <p className="text-slate-400 text-sm leading-relaxed">
          ¿Por qué? Porque los pesos son siempre positivos: mientras más elementos independientes incluyamos,
          más peso total tendremos. El algoritmo greedy siempre incluirá el mayor número posible de elementos.
        </p>
      </div>
    </section>
  )
}
