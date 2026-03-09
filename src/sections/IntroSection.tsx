export default function IntroSection() {
  return (
    <section id="intro" className="section-container">
      {/* Divider */}
      <div className="section-divider mb-16" />

      <div className="flex items-center gap-3 mb-2">
        <span className="tag-blue">Sección 1</span>
        <span className="tag-emerald">Fundamentos</span>
      </div>
      <h2 className="section-title">¿Por qué usar algoritmos <em>greedy</em>?</h2>
      <p className="section-subtitle">Motivación y cuándo son óptimos</p>

      {/* Main explanation */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card-glow p-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl mb-4">
            🐢
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">El problema con programación dinámica</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Algunos problemas pueden resolverse con programación dinámica, pero esta puede incurrir en
            tiempos de ejecución <strong className="text-slate-200">peores que polinomiales</strong>.
            Cuando el espacio de estados es enorme, la tabla de DP se vuelve imposible de computar.
          </p>
        </div>

        <div className="card-glow p-6">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-2xl mb-4">
            ⚡
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">La solución <em>greedy</em></h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Los algoritmos greedy toman la <strong className="text-slate-200">mejor decisión local en cada paso</strong> sin
            reconsiderar decisiones pasadas. Son más rápidos, aunque no siempre producen la solución óptima…
            <em> al menos se produce más rápido.</em>
          </p>
        </div>
      </div>

      {/* Key insight */}
      <div className="highlight-box mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">💡</span>
          <div>
            <h3 className="text-blue-300 font-semibold mb-1">La buena noticia</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Hay una categoría especial de problemas para los que <strong>podemos garantizar</strong> que
              la solución greedy produce la <strong>solución óptima</strong>. Estos son los problemas
              que se pueden modelar como <strong className="text-blue-300">matroides ponderadas</strong>.
              En esta lección veremos dos ejemplos concretos y luego la teoría que los unifica.
            </p>
          </div>
        </div>
      </div>

      {/* What we'll see */}
      <h3 className="text-lg font-semibold text-white mb-4">¿Qué veremos en esta lección?</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '🌲', title: 'Árbol de expansión mínima', desc: 'El algoritmo de Kruskal como ejemplo greedy', color: 'blue' },
          { icon: '🏨', title: 'Problema de hospedajes', desc: 'Seleccionar los k mejores lugares', color: 'purple' },
          { icon: '⚡', title: 'Matroides ponderadas', desc: 'La estructura que unifica ambos problemas', color: 'amber' },
          { icon: '💻', title: 'Consola interactiva', desc: 'Implementa los algoritmos en TypeScript', color: 'emerald' },
        ].map((item) => (
          <div
            key={item.title}
            className="card p-4 flex flex-col gap-2 hover:border-slate-600/50 transition-colors"
          >
            <span className="text-2xl">{item.icon}</span>
            <p className="text-white font-medium text-sm">{item.title}</p>
            <p className="text-slate-500 text-xs">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Greedy decision */}
      <div className="mt-8 card p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span>🎯</span> ¿Cómo funciona un algoritmo greedy?
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { step: '1', text: 'Ante un conjunto de opciones, evalúa todas las disponibles', color: 'bg-blue-500' },
            { step: '2', text: 'Selecciona la que parece mejor en este momento (la de mayor valor, menor costo, etc.)', color: 'bg-purple-500' },
            { step: '3', text: 'Añade esa opción a la solución si cumple las restricciones', color: 'bg-emerald-500' },
            { step: '4', text: 'Repite hasta no poder añadir más. ¡Sin mirar atrás!', color: 'bg-amber-500' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4">
              <div className={`step-indicator ${item.color} text-white`}>{item.step}</div>
              <p className="text-slate-300 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
