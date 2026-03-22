import { useState } from 'react'

// ─── Reusable reveal component ───────────────────────────────────────────────

interface RevealBoxProps {
  hints: string[]
  answer: React.ReactNode
  answerTitle?: string
}

function RevealBox({ hints, answer, answerTitle = 'Ver demostración completa' }: RevealBoxProps) {
  const [shownHints, setShownHints] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <div className="space-y-3 mt-4">
      {/* Hints */}
      <div className="space-y-2">
        {hints.slice(0, shownHints).map((hint, i) => (
          <div key={i} className="flex items-start gap-2 bg-amber-950/30 border border-amber-800/30 rounded-lg px-4 py-3">
            <span className="text-amber-400 text-sm shrink-0">💡</span>
            <p className="text-amber-200 text-sm leading-relaxed">{hint}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {shownHints < hints.length && !showAnswer && (
          <button
            onClick={() => setShownHints(h => h + 1)}
            className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            {shownHints === 0 ? '🔍 Ver pista' : `🔍 Siguiente pista (${shownHints}/${hints.length})`}
          </button>
        )}
        {!showAnswer && (
          <button
            onClick={() => setShowAnswer(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/50 transition-colors"
          >
            {answerTitle} →
          </button>
        )}
        {showAnswer && (
          <button
            onClick={() => { setShowAnswer(false); setShownHints(0) }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:bg-slate-600/50 transition-colors"
          >
            ↩ Ocultar
          </button>
        )}
      </div>

      {showAnswer && (
        <div className="bg-slate-900/60 border border-slate-600/40 rounded-xl p-5 space-y-3 animate-in">
          {answer}
        </div>
      )}
    </div>
  )
}

// ─── Greedy Choice Property visualization ────────────────────────────────────

function GreedyChoiceViz() {
  const elements = [
    { id: 'x', weight: 9, label: 'x', color: '#f59e0b', note: 'Primer elemento independiente (mayor peso)' },
    { id: 'b1', weight: 7, label: 'b₁', color: '#a855f7', note: 'En B óptimo' },
    { id: 'b2', weight: 5, label: 'b₂', color: '#a855f7', note: 'En B óptimo' },
    { id: 'b3', weight: 3, label: 'b₃', color: '#a855f7', note: 'En B óptimo' },
  ]
  const [step, setStep] = useState(0)

  const steps = [
    { title: 'Paso 1: Ordenar S por peso (desc)', desc: 'El algoritmo greedy ordena todos los elementos de mayor a menor peso. El primero que forme un conjunto independiente será x.' },
    { title: 'Paso 2: x es el primero que es independiente', desc: 'x = {x} ∈ I (es independiente por sí solo). Ningún elemento con mayor peso forma un independiente en este punto.' },
    { title: 'Paso 3: Supón que existe B óptimo sin x', desc: 'Suponemos que hay un B óptimo que no incluye a x. Como w(b) ≤ w(x) para todo b ∈ B (porque x fue el primero), ningún elemento de B tiene mayor peso que x.' },
    { title: 'Paso 4: Intercambio — reemplazar un elemento de B por x', desc: 'Por la propiedad de intercambio, podemos insertar x en A (que empieza como {x}) e ir añadiendo elementos de B hasta que |A| = |B|. En cada paso, el elemento que sacamos (y) tiene w(y) ≤ w(x). Entonces w(A) = w(B) − w(y) + w(x) ≥ w(B).' },
    { title: 'Conclusión: A también es óptimo y contiene a x ✅', desc: 'Como w(B) ≤ w(A) (B era óptimo) y w(A) ≤ w(B) (lo demostramos), entonces w(A) = w(B). Esto significa que A también es óptimo. ¡x siempre puede estar en algún conjunto independiente óptimo!' },
  ]

  return (
    <div className="card p-5 space-y-4">
      {/* Element strip */}
      <div>
        <p className="text-xs text-slate-500 mb-2 uppercase font-medium tracking-wide">S ordenado por peso (mayor → menor)</p>
        <div className="flex gap-2 flex-wrap">
          {elements.map((el, i) => (
            <div
              key={el.id}
              className="flex flex-col items-center gap-1 transition-all duration-300"
              style={{ opacity: step >= 1 && el.id === 'x' ? 1 : step >= 2 && el.id !== 'x' ? 0.6 : 0.9 }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all"
                style={{
                  borderColor: el.color,
                  backgroundColor: step >= 1 && el.id === 'x' ? `${el.color}33` : `${el.color}11`,
                  color: el.color,
                  transform: step >= 1 && el.id === 'x' ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {el.label}
              </div>
              <span className="text-xs text-slate-400 font-mono">w={el.weight}</span>
              {step >= 1 && el.id === 'x' && (
                <span className="text-xs text-amber-400 font-bold">← x</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sets visualization */}
      {step >= 2 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-950/30 border border-amber-700/30 rounded-lg p-3">
            <p className="text-amber-300 text-xs font-semibold mb-2">A (construido con x)</p>
            <div className="flex gap-1 flex-wrap">
              {['x', ...(step >= 4 ? ['b₁', 'b₂'] : [])].map(el => (
                <span key={el} className="text-xs bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded font-mono">{el}</span>
              ))}
            </div>
            {step >= 4 && <p className="text-amber-400 text-xs mt-2">w(A) = 9 + 7 + 5 = <strong>21</strong></p>}
          </div>
          <div className="bg-purple-950/30 border border-purple-700/30 rounded-lg p-3">
            <p className="text-purple-300 text-xs font-semibold mb-2">B (óptimo sin x)</p>
            <div className="flex gap-1 flex-wrap">
              {['b₁', 'b₂', 'b₃'].map(el => (
                <span key={el} className={`text-xs px-2 py-0.5 rounded font-mono transition-all ${step >= 4 && el === 'b₃' ? 'bg-red-500/20 text-red-300 line-through' : 'bg-purple-500/20 text-purple-200'}`}>{el}</span>
              ))}
              {step >= 4 && <span className="text-xs bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded font-mono">x</span>}
            </div>
            <p className="text-purple-400 text-xs mt-2">w(B) = 7 + 5 + 3 = <strong>15</strong>{step >= 4 ? ' → reemplazando b₃ por x: 7+5+9=21' : ''}</p>
          </div>
        </div>
      )}

      {/* Step explanation */}
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/40">
        <p className="text-blue-300 text-xs font-semibold mb-1">{steps[step].title}</p>
        <p className="text-slate-300 text-xs leading-relaxed">{steps[step].desc}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 disabled:opacity-30 hover:bg-slate-600/50 transition-colors"
        >
          ← Anterior
        </button>
        <span className="text-xs text-slate-500">{step + 1} / {steps.length}</span>
        <button
          onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
          className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/30 border border-blue-500/30 text-blue-300 disabled:opacity-30 hover:bg-blue-600/50 transition-colors"
        >
          Siguiente →
        </button>
        {step === steps.length - 1 && (
          <button onClick={() => setStep(0)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors ml-auto">
            ↺ Reiniciar
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Demo 9: Unit sets ────────────────────────────────────────────────────────

function Demo9Viz() {
  const [selected, setSelected] = useState<string>('a')
  const setA = ['a', 'b', 'c']

  return (
    <div className="card p-5 space-y-4">
      <p className="text-slate-300 text-sm">
        Sea <strong className="text-blue-300">A = {'{'} a, b, c {'}'} ∈ I</strong>. Por la propiedad hereditaria,
        cualquier subconjunto de A también debe estar en I. En particular, los subconjuntos unitarios {'{x}'} para cada x ∈ A.
      </p>
      <div>
        <p className="text-xs text-slate-500 mb-2 uppercase font-medium">Elige un elemento x ∈ A:</p>
        <div className="flex gap-2">
          {setA.map(el => (
            <button
              key={el}
              onClick={() => setSelected(el)}
              className={`w-10 h-10 rounded-lg font-bold text-sm border-2 transition-all ${
                selected === el
                  ? 'border-blue-400 bg-blue-500/20 text-blue-200 scale-110'
                  : 'border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              {el}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
          <span className="text-emerald-400">✓</span>
          <p className="text-sm text-slate-300">
            <span className="font-mono text-blue-300">A = {'{'} a, b, c {'}'} ∈ I</span> (dado, es independiente)
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
          <span className="text-emerald-400">✓</span>
          <p className="text-sm text-slate-300">
            <span className="font-mono text-amber-300">{'{'}{selected}{'}'} ⊆ A</span>{' '}
            y A ∈ I, entonces por <strong>propiedad hereditaria</strong>:{' '}
            <span className="font-mono text-emerald-300">{'{'}{selected}{'}'} ∈ I</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-3">
          <span className="text-2xl">🎯</span>
          <p className="text-sm text-emerald-200">
            Esto vale para <em>cualquier</em> x ∈ A, por lo tanto cada elemento de A forma un conjunto unitario independiente. ✅
          </p>
        </div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-3">
        <p className="text-xs text-slate-400">
          <strong className="text-white">¿Por qué importa esto?</strong> El algoritmo GREEDY(M,w) solo agrega {'{'}{selected}{'}'} a A
          si es independiente. Esta demostración garantiza que la condición inicial del algoritmo es válida:
          el elemento con mayor peso siempre puede ser probado como candidato unitario.
        </p>
      </div>
    </div>
  )
}

// ─── Demo 10: Maximal independents same size ──────────────────────────────────

function Demo10Viz() {
  // Two maximal independent sets that must have same size
  // S = {a,b,c,d,e}, uniform matroid rank 3
  const elements = ['a', 'b', 'c', 'd', 'e']
  const [setA, setSetA] = useState(['a', 'b', 'c'])
  const [setB, setSetB] = useState(['c', 'd', 'e'])
  const [step, setStep] = useState(0)

  const aMinusB = setA.filter(x => !setB.includes(x))
  const bMinusA = setB.filter(x => !setA.includes(x))
  const canAdd = bMinusA.length > 0 && setA.length < setB.length

  const steps = [
    {
      title: 'Situación inicial',
      desc: `A y B son dos independientes maximales. Si |B| > |A|, por la propiedad de intercambio existe xᵢ ∈ (B − A) tal que A ∪ {xᵢ} ∈ I.`,
    },
    {
      title: 'Contradicción con maximalidad',
      desc: `Pero si A ∪ {xᵢ} ∈ I, entonces A no era maximal (porque podemos añadirle un elemento y seguir en I). ¡Contradicción!`,
    },
    {
      title: 'Conclusión',
      desc: `Por contradicción, no puede ser que |B| > |A| (ni |A| > |B|). Entonces todos los independientes maximales deben tener el mismo tamaño. ✅`,
    },
  ]

  return (
    <div className="card p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs text-blue-300 font-semibold uppercase tracking-wide">A (maximal)</p>
          <div className="flex gap-1 flex-wrap min-h-8">
            {setA.map(el => (
              <span key={el} className={`text-sm px-3 py-1 rounded-lg font-mono font-bold border transition-all ${
                aMinusB.includes(el) && step >= 1
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-blue-500/20 border-blue-500/40 text-blue-200'
              }`}>{el}</span>
            ))}
          </div>
          <p className="text-xs text-slate-500">|A| = {setA.length}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-purple-300 font-semibold uppercase tracking-wide">B (maximal)</p>
          <div className="flex gap-1 flex-wrap min-h-8">
            {setB.map(el => (
              <span key={el} className={`text-sm px-3 py-1 rounded-lg font-mono font-bold border transition-all ${
                bMinusA.includes(el) && step >= 1
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-purple-500/20 border-purple-500/40 text-purple-200'
              }`}>{el}</span>
            ))}
          </div>
          <p className="text-xs text-slate-500">|B| = {setB.length}</p>
        </div>
      </div>

      {step >= 1 && bMinusA.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-3">
          <p className="text-amber-200 text-xs">
            B − A = {'{'} {bMinusA.join(', ')} {'}'} → podemos añadir <strong>{bMinusA[0]}</strong> a A sin romper independencia
          </p>
          <p className="text-xs text-red-300 mt-1">
            ⚡ A ∪ {'{'}{bMinusA[0]}{'}'} = {'{'} {[...setA, bMinusA[0]].join(', ')} {'}'} ∈ I → ¡A no era maximal! Contradicción.
          </p>
        </div>
      )}

      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/40">
        <p className="text-blue-300 text-xs font-semibold mb-1">{steps[Math.min(step, steps.length - 1)].title}</p>
        <p className="text-slate-300 text-xs leading-relaxed">{steps[Math.min(step, steps.length - 1)].desc}</p>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 disabled:opacity-30 hover:bg-slate-600/50 transition-colors">
          ← Anterior
        </button>
        <span className="text-xs text-slate-500">{step + 1} / {steps.length}</span>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1}
          className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/30 border border-blue-500/30 text-blue-300 disabled:opacity-30 hover:bg-blue-600/50 transition-colors">
          Siguiente →
        </button>
        {step === steps.length - 1 && (
          <button onClick={() => setStep(0)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors ml-auto">↺ Reiniciar</button>
        )}
      </div>
    </div>
  )
}

// ─── Demo 11: Optimal substructure ───────────────────────────────────────────

function Demo11Viz() {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: 'El algoritmo elige x (elemento de mayor peso)',
      desc: 'GREEDY elige x, el elemento con mayor peso que puede agregarse independientemente. Esta decisión define el subproblema.',
      visual: (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl px-4 py-3 text-center">
            <p className="text-amber-300 font-mono font-bold text-lg">x</p>
            <p className="text-amber-200 text-xs">w(x) = 9</p>
            <p className="text-xs text-amber-400 mt-1">elegido por GREEDY</p>
          </div>
          <span className="text-slate-500 text-2xl">→</span>
          <div className="bg-slate-800/50 border border-slate-600/40 rounded-xl px-4 py-3 text-center">
            <p className="text-slate-300 text-xs mb-1">Matroide original M</p>
            <p className="text-slate-400 text-xs font-mono">S = {'{'} x, a, b, c, d {'}'}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Se define el subproblema: matroide M′ = (S′, I′)',
      desc: "S′ son los elementos que pueden unirse a x preservando independencia. I′ son los subconjuntos B ⊂ S−{x} tales que B ∪ {x} ∈ I.",
      visual: (
        <div className="space-y-2">
          <div className="bg-blue-950/30 border border-blue-700/30 rounded-lg p-3 font-mono text-xs text-blue-200">
            S′ = {'{'} y ∈ S : {'{'} x {'}'} ∪ {'{'} y {'}'} ∈ I {'}'}
          </div>
          <div className="bg-purple-950/30 border border-purple-700/30 rounded-lg p-3 font-mono text-xs text-purple-200">
            I′ = {'{'} B ⊂ S − {'{'} x {'}'} : B ∪ {'{'} x {'}'} ∈ I {'}'}
          </div>
          <p className="text-slate-400 text-xs">
            Básicamente: el subproblema es "¿qué más puedo agregar al MST/solución ahora que x ya está fijo?"
          </p>
        </div>
      ),
    },
    {
      title: 'Si A′ es óptimo en M′, entonces A = A′ ∪ {x} es óptimo en M',
      desc: 'w(A) = w(A′) + w(x). Maximizar w(A) requiere maximizar w(A′), porque w(x) es fijo (ya lo elegimos). El subproblema tiene la misma estructura que el problema original.',
      visual: (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 border border-slate-600/40 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-2">Problema original</p>
            <p className="text-white font-mono text-sm">max w(A)</p>
            <p className="text-slate-400 text-xs mt-1">A ∈ I en M</p>
          </div>
          <div className="bg-emerald-950/30 border border-emerald-700/30 rounded-lg p-3">
            <p className="text-emerald-400 text-xs mb-2">Subproblema (misma forma)</p>
            <p className="text-white font-mono text-sm">max w(A′)</p>
            <p className="text-slate-400 text-xs mt-1">A′ ∈ I′ en M′</p>
            <p className="text-emerald-300 text-xs mt-2">w(A) = w(A′) + w(x) ✅</p>
          </div>
        </div>
      ),
    },
    {
      title: '¿Por qué es subestructura óptima? 🎯',
      desc: 'Porque la solución óptima al problema completo contiene la solución óptima al subproblema. Si pudiéramos mejorar A′, también mejoraríamos A — contradicción con que A es óptimo.',
      visual: (
        <div className="bg-emerald-950/30 border border-emerald-700/30 rounded-xl p-4 space-y-2">
          <p className="text-emerald-300 text-sm font-semibold">Argumento por contradicción:</p>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex gap-2"><span className="text-emerald-400 shrink-0">1.</span> Supón que A′ NO es óptimo en M′ → existe B′ mejor (w(B′) &gt; w(A′))</li>
            <li className="flex gap-2"><span className="text-emerald-400 shrink-0">2.</span> Entonces B = B′ ∪ {'{'} x {'}'} tiene w(B) = w(B′) + w(x) &gt; w(A′) + w(x) = w(A)</li>
            <li className="flex gap-2"><span className="text-emerald-400 shrink-0">3.</span> Pero eso contradice que A es óptimo en M. ✗</li>
            <li className="flex gap-2"><span className="text-emerald-400 shrink-0">∴</span> A′ debe ser óptimo en M′. ✅</li>
          </ul>
        </div>
      ),
    },
  ]

  return (
    <div className="card p-5 space-y-4">
      {steps[step].visual}
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/40">
        <p className="text-blue-300 text-xs font-semibold mb-1">{steps[step].title}</p>
        <p className="text-slate-300 text-xs leading-relaxed">{steps[step].desc}</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 disabled:opacity-30 hover:bg-slate-600/50 transition-colors">
          ← Anterior
        </button>
        <span className="text-xs text-slate-500">{step + 1} / {steps.length}</span>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1}
          className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/30 border border-blue-500/30 text-blue-300 disabled:opacity-30 hover:bg-blue-600/50 transition-colors">
          Siguiente →
        </button>
        {step === steps.length - 1 && (
          <button onClick={() => setStep(0)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors ml-auto">↺ Reiniciar</button>
        )}
      </div>
    </div>
  )
}

// ─── Main Day 2 Section ───────────────────────────────────────────────────────

export default function Day2Section() {
  return (
    <div className="min-h-screen">
      {/* Hero for Day 2 */}
      <div className="relative overflow-hidden pt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-slate-950 to-emerald-950/30 pointer-events-none" />
        <div className="section-container relative text-center py-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-purple-300 text-sm font-medium mb-6">
            <span>📐</span>
            <span>Día 2 · Demostraciones formales</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Matroides{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Ponderadas
            </span>
            <br />y Optimalidad de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
              Greedy
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            ¿Por qué greedy siempre funciona en matroides ponderadas? Hoy demostramos la propiedad de
            elección greedy y la subestructura óptima — los dos ingredientes de la prueba de corrección.
          </p>
        </div>
      </div>

      <main className="section-container space-y-16 pt-0">

        {/* ── Section: Greedy choice property ── */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="tag-purple">Teorema</span>
            <span className="tag-blue">Visualización</span>
          </div>
          <h2 className="section-title">Propiedad de Elección Greedy</h2>
          <p className="section-subtitle">El primer elemento que greedy elige siempre puede pertenecer a una solución óptima</p>

          <div className="highlight-box mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <h3 className="text-blue-300 font-semibold mb-2">La idea intuitiva</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Imagina que ordenas todos los elementos de mayor a menor peso. El primero que puedes
                  "poner en tu bolsa" (que sea independiente por sí solo) <strong className="text-white">siempre va a aparecer
                  en alguna solución óptima</strong>. Si hubiera una solución óptima que no lo incluye, puedes hacer
                  un "intercambio" — sacar otro elemento de menor o igual peso y meter el tuyo — sin
                  empeorar el resultado total. ¡El greedy nunca se equivoca en su primera decisión!
                </p>
              </div>
            </div>
          </div>

          <div className="mb-2">
            <p className="text-slate-400 text-sm mb-4">
              La siguiente visualización muestra el argumento paso a paso con conjuntos concretos:
            </p>
            <GreedyChoiceViz />
          </div>

          <div className="mt-6 formula-box">
            <p className="text-slate-400 text-xs mb-3 uppercase font-medium tracking-wide">Enunciado formal</p>
            <p className="text-slate-200 text-sm leading-relaxed">
              Sea M = (S, I) una matroide ponderada con w : S → ℝ⁺. Sea x el primer elemento en S ordenado
              descendientemente tal que {'{'} x {'}'} ∈ I. Entonces existe un independiente óptimo A* tal que x ∈ A*.
            </p>
            <div className="mt-3 space-y-1 text-xs text-slate-400">
              <p><span className="text-emerald-300">Prueba:</span> Toma cualquier independiente óptimo B. Si x ∈ B, listo.</p>
              <p>Si x ∉ B: como {'{'} x {'}'} ∈ I y B ∈ I, y |B| &gt; |{'{'} x {'}'}|, por intercambio podemos ir añadiendo
                elementos de B a {'{'} x {'}'} hasta |A| = |B|. En cada paso, el elemento y que queda fuera satisface w(y) ≤ w(x),
                por lo que w(A) ≥ w(B). Como B era óptimo, w(A) = w(B) y A* = A contiene x. ✅</p>
            </div>
          </div>
        </div>

        {/* ── Section: Demostración 9 ── */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="tag-emerald">Ejercicio 9</span>
            <span className="tag-blue">Demostración directa</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Todo elemento de un independiente forma un conjunto unitario independiente
          </h2>
          <p className="text-slate-400 mb-6 text-base">
            Dado cualquier A ∈ I, para cada x ∈ A se tiene que {'{'} x {'}'} ∈ I.
          </p>

          <div className="highlight-box mb-4">
            <p className="text-blue-200 text-sm leading-relaxed">
              <strong className="text-white">¿Por qué importa en el algoritmo?</strong> GREEDY(M,w) incluye en su primera línea la condición{' '}
              <span className="font-mono text-emerald-300">if {'{'} x {'}'} ∈ I then A ← A ∪ {'{'} x {'}'}</span>.
              Esta demostración justifica que esa condición es la correcta para empezar: cualquier elemento que
              queramos agregar debe poder estar solo en un independiente.
            </p>
          </div>

          <Demo9Viz />
        </div>

        {/* ── Section: Demostración 10 ── */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="tag-purple">Ejercicio 10</span>
            <span className="tag-emerald">Por contradicción</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Todos los independientes maximales tienen el mismo tamaño
          </h2>
          <p className="text-slate-400 mb-6 text-base">
            En cualquier matroide M = (S, I), si A y B son independientes maximales, entonces |A| = |B|.
          </p>

          <div className="highlight-box mb-4">
            <p className="text-blue-200 text-sm leading-relaxed">
              <strong className="text-white">¿Por qué importa?</strong> Esto garantiza que el algoritmo GREEDY siempre termina
              con un independiente del mismo tamaño, sin importar qué camino tome. No hay "independientes grandes" escondidos
              que GREEDY podría haber encontrado — todos los maximales son igual de "grandes".
            </p>
          </div>

          <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎯</span>
              <p className="text-amber-300 font-semibold text-sm">Intenta demostrarlo primero</p>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-2">
              La estrategia es por <strong className="text-white">contradicción</strong>: suponer que |B| &gt; |A|
              y usar la propiedad de intercambio para llegar a una contradicción con la maximalidad de A.
            </p>
            <p className="text-slate-400 text-sm">
              ¿Puedes completar el argumento? Usa las pistas si te trabas, o muestra la demostración directamente.
            </p>
          </div>

          <RevealBox
            hints={[
              'Supón por contradicción que existen A, B ∈ I maximales con |B| > |A|.',
              'Aplica la propiedad de intercambio: como |B| > |A|, existe algún xᵢ ∈ (B − A) tal que A ∪ {xᵢ} ∈ I.',
              'Pero si A ∪ {xᵢ} ∈ I, eso significa que A tiene un elemento que se le puede agregar y el resultado sigue en I. ¿Qué dice eso sobre la maximalidad de A?',
            ]}
            answerTitle="Ver demostración completa"
            answer={
              <div className="space-y-4">
                <p className="text-white font-semibold text-sm">Demostración por contradicción:</p>
                <Demo10Viz />
                <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
                  <p><strong className="text-purple-300">Supuesto:</strong> Existen A, B ∈ I independientes maximales con |B| &gt; |A|.</p>
                  <p><strong className="text-blue-300">Aplicamos intercambio:</strong> Como |B| &gt; |A|, por la propiedad de intercambio
                    de matroides, existe x₁ ∈ (B − A) tal que A ∪ {'{'} x₁ {'}'} ∈ I.</p>
                  <p><strong className="text-red-300">Contradicción:</strong> Si A ∪ {'{'} x₁ {'}'} ∈ I, entonces A no es maximal,
                    porque podemos añadirle x₁ y el resultado sigue siendo independiente. Esto contradice la hipótesis de que A es maximal.</p>
                  <p><strong className="text-emerald-300">Conclusión:</strong> No puede existir tal par (A, B) con |B| &gt; |A|.
                    Por simetría tampoco |A| &gt; |B|. Luego |A| = |B| para cualquier par de independientes maximales. ✅</p>
                </div>
              </div>
            }
          />
        </div>

        {/* ── Section: Demostración 11 ── */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="tag-purple">Ejercicio 11</span>
            <span className="tag-emerald">Subestructura óptima</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Las matroides ponderadas exhiben subestructura óptima
          </h2>
          <p className="text-slate-400 mb-6 text-base">
            Si GREEDY elige x y define el subproblema M′ = (S′, I′), entonces la solución óptima de M contiene la solución óptima de M′.
          </p>

          <div className="highlight-box mb-4">
            <p className="text-blue-200 text-sm leading-relaxed">
              <strong className="text-white">¿Por qué importa?</strong> Subestructura óptima es uno de los dos ingredientes que
              justifican usar programación dinámica <em>o</em> greedy. En matroides, cada decisión greedy
              crea un subproblema de la misma forma que el original — y la solución óptima del subproblema
              construye la solución óptima del total.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="card p-4 space-y-2">
              <p className="text-sm font-semibold text-white">Definición formal de M′</p>
              <div className="formula-box text-xs space-y-2">
                <p className="text-slate-300">Tras elegir x, el subproblema es:</p>
                <p className="text-blue-300 font-mono">S′ = {'{'} y ∈ S : {'{'} x {'}'} ∪ {'{'} y {'}'} ∈ I {'}'}</p>
                <p className="text-purple-300 font-mono">I′ = {'{'} B ⊂ S−{'{'} x {'}'} : B ∪ {'{'} x {'}'} ∈ I {'}'}</p>
              </div>
            </div>
            <div className="card p-4 space-y-2">
              <p className="text-sm font-semibold text-white">Relación de pesos</p>
              <div className="formula-box text-xs space-y-2">
                <p className="text-slate-300">Si A* es óptimo en M y A′ = A* − {'{'} x {'}'}, entonces:</p>
                <p className="text-emerald-300 font-mono">w(A*) = w(A′) + w(x)</p>
                <p className="text-slate-400">Maximizar w(A*) ≡ maximizar w(A′)</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎯</span>
              <p className="text-amber-300 font-semibold text-sm">Intenta demostrarlo primero</p>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-2">
              La estrategia es por <strong className="text-white">contradicción</strong>: suponer que el subproblema
              tiene una solución mejor que A′ = A* − {'{'} x {'}'} y ver que eso contradice la optimalidad de A*.
            </p>
            <p className="text-slate-400 text-sm">
              Mira la visualización si necesitas orientación antes de ver la demostración completa.
            </p>
          </div>

          <Demo11Viz />

          <RevealBox
            hints={[
              'Sea A* el óptimo en M con x ∈ A*. Define A′ = A* − {x}. Por definición de M′, A′ ∈ I′.',
              'Supón por contradicción que A′ no es óptimo en M′. Entonces existe B′ ∈ I′ con w(B′) > w(A′).',
              'Si B′ ∈ I′, por definición de I′ se tiene que B′ ∪ {x} ∈ I. Calcula w(B′ ∪ {x}) y compáralo con w(A*). ¿Qué contradicción obtienes?',
            ]}
            answerTitle="Ver demostración completa"
            answer={
              <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                <p className="text-white font-semibold">Demostración por contradicción:</p>
                <p><strong className="text-amber-300">Setup:</strong> Sea A* un independiente óptimo de M con x ∈ A* (sabemos que existe por la propiedad de elección greedy).
                  Define A′ = A* − {'{'} x {'}'}. Como A* ∈ I y A′ ⊂ A*, por herencia A′ ∈ I. Además, A′ ⊂ S − {'{'} x {'}'} y
                  A′ ∪ {'{'} x {'}'} = A* ∈ I, así que A′ ∈ I′.</p>
                <p><strong className="text-blue-300">Supuesto:</strong> Supón que A′ NO es óptimo en M′. Entonces existe B′ ∈ I′ con w(B′) &gt; w(A′).</p>
                <p><strong className="text-purple-300">Construcción:</strong> Como B′ ∈ I′, por definición tenemos B′ ∪ {'{'} x {'}'} ∈ I.
                  Entonces:</p>
                <div className="formula-box text-xs">
                  <p className="text-emerald-300">w(B′ ∪ {'{'} x {'}'}) = w(B′) + w(x) &gt; w(A′) + w(x) = w(A*)</p>
                </div>
                <p><strong className="text-red-300">Contradicción:</strong> Encontramos B′ ∪ {'{'} x {'}'} ∈ I con mayor peso que A*, pero A* era óptimo. Contradicción. ✗</p>
                <p><strong className="text-emerald-300">Conclusión:</strong> A′ debe ser óptimo en M′. La solución óptima al problema original contiene la solución óptima al subproblema. Esto es subestructura óptima. ✅</p>
              </div>
            }
          />
        </div>

        {/* ── Exercises for Day 2 ── */}
        <div className="card p-6">
          <div className="flex items-start gap-3 mb-5">
            <span className="text-2xl">📝</span>
            <div>
              <h3 className="text-white font-semibold text-lg">Ejercicios para entregar hoy</h3>
              <p className="text-slate-400 text-sm mt-1">
                Razonamiento formal sobre matroides. Usa{' '}
                <span className="text-emerald-300 font-medium">ChatGPT u otro LLM</span> para verificar tus argumentos,
                pero escribe primero tu propia respuesta.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Proof exercises */}
            <div className="space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2 text-sm border-b border-slate-700/50 pb-2">
                <span>📐</span> Ejercicios de demostración
              </h4>
              <ol className="space-y-3">
                {[
                  {
                    q: 'Enuncia con tus palabras (sin fórmulas) la propiedad de elección greedy. ¿Qué garantiza? ¿Por qué necesitas la propiedad de intercambio para probarla?',
                    hint: '💡 Pista: piensa en qué pasaría si solo tuvieras la propiedad hereditaria, ¿podrías hacer el argumento de intercambio?',
                  },
                  {
                    q: 'Considera la matroide uniforme U(4, 2) — S tiene 4 elementos, rango 2. Lista todos los independientes maximales. Verifica que todos tienen el mismo tamaño (Ejercicio 10).',
                    hint: '💡 Pista: los independientes de U(n, k) son todos los subconjuntos de S con tamaño ≤ k. Los maximales son los de tamaño exactamente k.',
                  },
                  {
                    q: 'En la matroide gráfica del MST, ¿cuáles son los independientes maximales? ¿Qué significa en términos del grafo que todos tengan el mismo tamaño?',
                    hint: '💡 Pista: los independientes de la matroide gráfica son los bosques (conjuntos acíclicos de aristas). Los maximales son los spanning trees. Todos tienen |V|−1 aristas.',
                  },
                  {
                    q: 'Explica con un ejemplo concreto (inventado por ti) cómo GREEDY define el subproblema M′ = (S′, I′) tras elegir el primer elemento x. Usa cualquier matroide simple.',
                    hint: '💡 Pista: elige la matroide uniforme U(5,3). ¿Qué pasa con S′ e I′ cuando x es el elemento de mayor peso?',
                  },
                  {
                    q: '[Síntesis] Usando los tres resultados del día (Ej. 9, 10, 11 + propiedad de elección greedy), explica en 3-4 oraciones por qué GREEDY(M,w) produce siempre la solución óptima para cualquier matroide ponderada.',
                    hint: '💡 Pista: necesitas los cuatro ingredientes: elección greedy (primer elemento correcto) + subestructura óptima (el subproblema se resuelve de la misma forma) + misma estructura (M′ también es matroide) + inducción.',
                  },
                ].map((ex, i) => (
                  <li key={i} className="flex items-start gap-3 bg-slate-900/40 rounded-xl p-3 border border-slate-700/30">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <div className="space-y-1.5">
                      <p className="text-slate-200 text-xs leading-relaxed">{ex.q}</p>
                      <p className="text-slate-500 text-xs italic">{ex.hint}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Applied exercises */}
            <div className="space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2 text-sm border-b border-slate-700/50 pb-2">
                <span>💻</span> Ejercicios aplicados
              </h4>
              <ol className="space-y-3">
                {[
                  {
                    q: 'Ve a la consola del Día 1 (pestaña MST). Traza manualmente los pasos de GREEDY con el grafo original. Para cada arista (en orden de peso), determina si crea ciclo o no ANTES de ejecutar el código. Luego ejecuta y compara.',
                    hint: '💡 Pista: dibuja los componentes conexos después de cada arista aceptada. Una arista crea ciclo si sus dos extremos ya están en el mismo componente.',
                  },
                  {
                    q: 'En la consola de Hospedajes, cambia la función isIndependent para modelar una matroide de partición: los hoteles están divididos en 2 grupos (ids 1-4 y 5-8) y solo puedes tomar máximo 2 de cada grupo. Implementa esto y ejecuta.',
                    hint: '💡 Pista: isIndependent recibe el subset completo. Puedes contar cuántos ids ≤ 4 hay y cuántos ≥ 5 hay en el subset. Pregúntale a ChatGPT cómo hacer el conteo con filter.',
                  },
                  {
                    q: 'Para la matroide del Ejercicio 2 (partición), verifica manualmente que cumple la propiedad hereditaria: toma un independiente A de tamaño 4 y lista todos sus subconjuntos. ¿Todos son independientes?',
                    hint: '💡 Pista: con la restricción de máximo 2 por grupo, un subconjunto de un válido también cumple la restricción (al sacar elementos no la viola).',
                  },
                  {
                    q: 'Vuelve a la consola MST. Agrega un nodo aislado "G" (sin aristas). Ejecuta. ¿El MST cambia? ¿Cuántas aristas tiene ahora el MST? ¿Tiene sentido con la propiedad |E_MST| = |V| − 1?',
                    hint: '💡 Pista: un nodo aislado no tiene aristas, así que GREEDY nunca lo considera. Pero sí cambia la estructura del grafo.',
                  },
                  {
                    q: '[Reflexión] Ahora que conoces la propiedad de elección greedy y la subestructura óptima, ¿por qué el algoritmo de GREEDY(M,w) del Día 1 NO necesita backtracking? Escribe un párrafo y verifica con ChatGPT.',
                    hint: '💡 Pista: backtracking es necesario cuando una decisión local puede ser incorrecta. ¿La elección greedy puede ser incorrecta en una matroide?',
                  },
                ].map((ex, i) => (
                  <li key={i} className="flex items-start gap-3 bg-slate-900/40 rounded-xl p-3 border border-slate-700/30">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <div className="space-y-1.5">
                      <p className="text-slate-200 text-xs leading-relaxed">{ex.q}</p>
                      <p className="text-slate-500 text-xs italic">{ex.hint}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* AI encouragement */}
          <div className="mt-5 flex items-start gap-3 bg-emerald-950/30 border border-emerald-800/30 rounded-xl p-4">
            <span className="text-xl">🤖</span>
            <div>
              <p className="text-emerald-300 text-xs font-semibold mb-0.5">Usa IA a tu favor</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Para los ejercicios de demostración, escribe tu argumento primero y luego pídele a ChatGPT:{' '}
                <em className="text-slate-300">"¿Mi demostración es correcta? ¿Me falta algo o hay un error lógico?"</em>.
                Para los aplicados, puedes pedir ayuda con la sintaxis TypeScript, pero intenta
                entender la lógica por tu cuenta antes de preguntar.
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-purple-950/40 via-slate-800/40 to-emerald-950/30 border border-purple-800/30 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <span>🎓</span> Resumen del Día 2
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🔢', title: 'Ej. 9: Unitarios', desc: 'Si A ∈ I y x ∈ A, entonces {x} ∈ I. Justifica el paso base de GREEDY.' },
              { icon: '📏', title: 'Ej. 10: Mismo tamaño', desc: 'Todos los independientes maximales tienen el mismo tamaño. Garantiza que GREEDY no "se queda corto".' },
              { icon: '🔗', title: 'Ej. 11: Subestructura', desc: 'La solución óptima contiene la solución óptima del subproblema. Greedy puede aplicarse inductivamente.' },
              { icon: '✅', title: 'Elección greedy correcta', desc: 'El primer elemento elegido siempre pertenece a algún óptimo. Greedy nunca comete un error irrecuperable.' },
            ].map(item => (
              <div key={item.title} className="flex flex-col gap-2">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-white font-medium text-sm">{item.title}</p>
                <p className="text-slate-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm mt-16">
        <p>Laboratorio Interactivo · Análisis y Diseño de Algoritmos · Universidad del Valle de Guatemala</p>
        <p className="mt-1 text-xs text-slate-600">Basado en CLRS — Introduction to Algorithms, Cap. 16</p>
      </footer>
    </div>
  )
}
