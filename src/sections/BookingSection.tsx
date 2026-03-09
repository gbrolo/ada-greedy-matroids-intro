import BookingViz from '../components/BookingViz'

export default function BookingSection() {
  return (
    <section id="booking" className="section-container">
      <div className="section-divider mb-16" />

      <div className="flex items-center gap-3 mb-2">
        <span className="tag-blue">Sección 3</span>
        <span className="tag-emerald">Greedy Simple</span>
      </div>
      <h2 className="section-title">El problema de los hospedajes</h2>
      <p className="section-subtitle">Un ejemplo más sencillo de algoritmo greedy</p>

      {/* Problem statement */}
      <div className="card p-6 mb-8">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>📋</span> Enunciado del problema
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          Imagina una página <em>web</em> para encontrar hospedaje. Cada lugar tiene una{' '}
          <strong>calificación</strong> calculada a partir de retroalimentación de clientes.
          Un usuario ingresa un número <span className="font-mono text-blue-300">k</span> y quiere
          obtener los <span className="font-mono text-blue-300">k</span> lugares de hospedaje cuya{' '}
          <strong>suma de calificaciones sea la más alta</strong>.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs font-mono font-semibold mb-2">ENTRADA</p>
            <ul className="text-slate-300 text-sm space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Un conjunto <span className="font-mono text-blue-300 mx-1">S</span> de n lugares de hospedaje
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Una calificación <span className="font-mono text-blue-300 mx-1">w(h)</span> por cada lugar
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Un número <span className="font-mono text-blue-300 mx-1">k</span> (1 ≤ k ≤ n)
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs font-mono font-semibold mb-2">SALIDA</p>
            <ul className="text-slate-300 text-sm space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                Un subconjunto <span className="font-mono text-emerald-300 mx-1">A ⊆ S</span> con |A| = k
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                Tal que <span className="font-mono text-emerald-300 mx-1">∑ w(h)</span> para h ∈ A sea máxima
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Solution */}
      <div className="card p-6 mb-8">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span>💡</span> Solución greedy
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              La solución es inmediata: <strong className="text-slate-200">ordenar todos los lugares descendentemente
              por calificación y tomar los primeros k elementos</strong>.
            </p>
            <div className="space-y-3">
              {[
                { step: '1', text: 'Ordenar S por w(h) de mayor a menor', color: 'bg-blue-500' },
                { step: '2', text: 'Tomar los primeros k elementos', color: 'bg-emerald-500' },
                { step: '3', text: '¡Eso es todo! La suma es máxima', color: 'bg-amber-500' },
              ].map(s => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className={`step-indicator ${s.color} text-white`}>{s.step}</div>
                  <p className="text-slate-300 text-sm">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="highlight-box">
              <p className="text-blue-300 text-sm font-semibold mb-1">¿Por qué es óptimo?</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Si tenemos que elegir k elementos y queremos la mayor suma posible, debemos tomar los k
                más grandes. Reemplazar cualquier elemento seleccionado por uno no seleccionado solo puede
                <strong className="text-slate-200"> disminuir o mantener igual</strong> la suma, nunca mejorarla.
              </p>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-800/40 rounded-xl p-4">
              <p className="text-emerald-300 text-xs font-semibold mb-2">Decisión greedy en cada paso</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Al construir el conjunto resultado, en cada paso tomamos el lugar con la
                <strong className="text-slate-200"> calificación más alta entre los restantes</strong>.
                Esa es exactamente la decisión greedy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="card p-6">
        <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
          <span>🎮</span> Visualización interactiva — Top-k hospedajes
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          Ajusta el valor de k y observa cómo el algoritmo greedy selecciona los mejores hospedajes.
          Puedes ir paso a paso o ejecutar todo de una vez.
        </p>
        <BookingViz />
      </div>

      {/* Comparison */}
      <div className="mt-8 card p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span>🔍</span> ¿Qué tienen en común MST y hospedajes?
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Conjunto base S', mst: 'Aristas del grafo E', booking: 'Todos los n hospedajes' },
            { label: 'Función de peso w', mst: 'Peso de cada arista', booking: 'Calificación de cada lugar' },
            { label: 'Conjuntos válidos (I)', mst: 'Subconjuntos acíclicos de aristas (bosques)', booking: 'Subconjuntos de k o menos lugares' },
            { label: 'Propiedad hereditaria', mst: 'Sub-bosque de un bosque = bosque', booking: 'Sub-selección de una selección válida = válida' },
            { label: 'Propiedad de intercambio', mst: 'Se puede extender bosque pequeño a grande', booking: 'Podemos añadir más lugares si k lo permite' },
            { label: 'Objetivo', mst: 'Minimizar peso total', booking: 'Maximizar suma de calificaciones' },
          ].map((row) => (
            <div key={row.label} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
              <p className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">{row.label}</p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 text-xs mt-0.5">🌲</span>
                  <span className="text-slate-300 text-xs">{row.mst}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 text-xs mt-0.5">🏨</span>
                  <span className="text-slate-300 text-xs">{row.booking}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 highlight-box">
          <p className="text-blue-300 font-semibold text-sm mb-1">¡Ambos son matroides!</p>
          <p className="text-slate-400 text-sm">
            Esta similitud estructural no es coincidencia — ambos problemas se pueden modelar como{' '}
            <strong className="text-slate-200">matroides ponderadas</strong>. En la siguiente sección
            veremos formalmente qué es una matroide y por qué esta estructura garantiza que el algoritmo greedy sea óptimo.
          </p>
        </div>
      </div>
    </section>
  )
}
