import KruskalViz from '../components/KruskalViz'

export default function MSTSection() {
  return (
    <section id="mst" className="section-container">
      <div className="section-divider mb-16" />

      <div className="flex items-center gap-3 mb-2">
        <span className="tag-blue">Sección 2</span>
        <span className="tag-purple">Kruskal</span>
      </div>
      <h2 className="section-title">El problema del árbol de expansión mínima</h2>
      <p className="section-subtitle">Minimum Spanning Tree (MST)</p>

      {/* Concepts */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: '🌳',
            title: 'Árbol',
            definition: 'Un grafo no dirigido que es:',
            items: ['Acíclico (sin ciclos)', 'Conexo (desde cualquier vértice se llega a otro)', 'Simple (sin bucles ni aristas paralelas)'],
            color: 'blue',
          },
          {
            icon: '🌐',
            title: 'Árbol abarcador (Spanning Tree)',
            definition: 'Un árbol que toca TODOS los vértices de un grafo.',
            items: ['Contiene todos los n vértices', 'Tiene exactamente n-1 aristas', 'Es un subgrafo del grafo original'],
            color: 'purple',
          },
          {
            icon: '⚖️',
            title: 'MST (mínimo)',
            definition: 'El spanning tree con el MENOR peso posible.',
            items: ['El grafo debe ser ponderado', 'Suma de pesos de aristas es mínima', 'Puede no ser único si hay pesos iguales'],
            color: 'emerald',
          },
        ].map((card) => (
          <div key={card.title} className="card p-5">
            <div className="text-2xl mb-3">{card.icon}</div>
            <h3 className="text-white font-semibold mb-2">{card.title}</h3>
            <p className="text-slate-400 text-xs mb-3">{card.definition}</p>
            <ul className="space-y-1">
              {card.items.map(item => (
                <li key={item} className="text-slate-300 text-xs flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Forest definition callout */}
      <div className="mb-6 bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 flex items-start gap-3">
        <span className="text-2xl shrink-0">🌳</span>
        <div>
          <p className="text-amber-300 font-semibold text-sm mb-1">¿Qué es un <em>bosque</em>?</p>
          <p className="text-slate-300 text-sm leading-relaxed">
            Un <strong className="text-white">bosque</strong> (forest) es un grafo no dirigido <strong>acíclico</strong> —
            puede estar formado por uno o varios árboles desconectados entre sí.
            Al inicio de Kruskal, cada vértice es su propio árbol aislado: el bosque tiene <em>n</em> componentes y 0 aristas.
            Con cada arista que aceptamos, dos árboles se fusionan en uno, reduciendo el número de componentes.
            Cuando todos los vértices están en el mismo árbol, tenemos el MST.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Clave: cualquier subconjunto de aristas de un bosque también es un bosque (no puede aparecer un ciclo si quitas aristas). Esto es la <strong className="text-amber-300">propiedad hereditaria</strong> que veremos en matroides.
          </p>
        </div>
      </div>

      {/* Kruskal explanation */}
      <div className="card p-6 mb-8">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <span>🔑</span> El algoritmo de Kruskal — ¿cómo funciona?
        </h3>
        <p className="text-slate-400 text-sm mb-4 leading-relaxed">
          Kruskal resuelve el MST de forma greedy. La idea es simple:
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {[
              { num: '1', title: 'Ordena todas las aristas', desc: 'De menor a mayor peso. Esta es la clave greedy: siempre intentamos la arista más barata disponible.', color: 'bg-blue-500' },
              { num: '2', title: 'Inicializa un bosque vacío', desc: 'Cada vértice es su propio árbol aislado (n componentes, 0 aristas). El conjunto solución A = ∅ al inicio.', color: 'bg-purple-500' },
              { num: '3', title: 'Itera sobre las aristas', desc: 'Por cada arista en orden ascendente, verifica si conecta dos componentes distintos (i.e., no crearía ciclo).', color: 'bg-amber-500' },
              { num: '4', title: 'Acepta o rechaza', desc: 'Si no forma ciclo → acepta y fusiona los dos árboles. Si forma ciclo (ambos extremos en el mismo árbol) → rechaza.', color: 'bg-emerald-500' },
            ].map(step => (
              <div key={step.num} className="flex items-start gap-3">
                <div className={`step-indicator ${step.color} text-white text-sm`}>{step.num}</div>
                <div>
                  <p className="text-white font-medium text-sm">{step.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="highlight-box">
              <p className="text-blue-300 text-sm font-semibold mb-1">¿Por qué es greedy?</p>
              <p className="text-slate-300 text-xs leading-relaxed">
                En cada paso, tomamos la arista de <strong>menor peso disponible</strong> que no cree un ciclo.
                No miramos al futuro — simplemente tomamos lo mejor que podemos ahora.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs font-semibold mb-2 font-mono">// Pseudocódigo</p>
              <pre className="text-slate-300 text-xs font-mono leading-relaxed">{`I = ∅  // bosque vacío
sort edges by weight ↑

for each edge (u, v) in sorted order:
  if find(u) ≠ find(v):
    I = I ∪ {(u,v)}  // aceptar
    union(u, v)

return I  // MST`}</pre>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-800/40 rounded-xl p-3">
              <p className="text-emerald-300 text-xs font-semibold mb-1">Estructura de datos clave</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                El <strong className="text-slate-200">Union-Find (Disjoint Set Union)</strong> detecta ciclos eficientemente.
                Si dos vértices tienen la misma raíz, están en el mismo componente → añadirlos crearía un ciclo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="card p-6">
        <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
          <span>🎮</span> Visualización interactiva — Kruskal paso a paso
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          Observa cómo Kruskal construye el MST. Los colores de los nodos indican los componentes (árboles) actuales.
          Avanza paso a paso o ejecuta todo de una vez.
        </p>
        <KruskalViz />
      </div>

      {/* Key insight */}
      <div className="mt-8 highlight-box">
        <p className="text-blue-300 font-semibold mb-1">💡 Insight clave</p>
        <p className="text-slate-300 text-sm leading-relaxed">
          Nota que el conjunto de aristas del MST, junto con sus subconjuntos, forman un <strong>bosque</strong> (conjunto acíclico de árboles).
          Cualquier subconjunto acíclico de aristas también es un bosque. Esta estructura — donde los subconjuntos de conjuntos válidos también son válidos —
          es la propiedad <strong className="text-blue-300">hereditaria</strong> de una matroide. ¡Ya casi llegamos!
        </p>
      </div>
    </section>
  )
}
