import { useState } from 'react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const TASKS = [
  { id: 1, label: 'a₁', deadline: 4, weight: 70 },
  { id: 2, label: 'a₂', deadline: 2, weight: 60 },
  { id: 3, label: 'a₃', deadline: 4, weight: 50 },
  { id: 4, label: 'a₄', deadline: 3, weight: 40 },
  { id: 5, label: 'a₅', deadline: 1, weight: 30 },
  { id: 6, label: 'a₆', deadline: 4, weight: 20 },
  { id: 7, label: 'a₇', deadline: 6, weight: 10 },
]

const CLR: Record<number, string> = {
  1: '#60a5fa', 2: '#c084fc', 3: '#34d399',
  4: '#fbbf24', 5: '#f87171', 6: '#f472b6', 7: '#22d3ee',
}

const ORDER = [1, 2, 3, 4, 5, 6, 7]

function T(id: number) { return TASKS[id - 1] }

function countNt(set: number[], t: number) {
  return set.filter(id => T(id).deadline <= t).length
}

function isIndep(set: number[]): boolean {
  for (let t = 1; t <= 7; t++) if (countNt(set, t) > t) return false
  return true
}

function ntRow(set: number[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const t = i + 1, nt = countNt(set, t)
    return { t, nt, fails: nt > t }
  })
}

// Latest-first slot assignment (canonical in-progress display)
function assignSlots(set: number[]): (number | null)[] {
  const slots: (number | null)[] = Array(7).fill(null)
  const sorted = [...set].sort((a, b) => {
    const d = T(b).deadline - T(a).deadline
    return d !== 0 ? d : b - a
  })
  for (const id of sorted) {
    for (let s = T(id).deadline - 1; s >= 0; s--) {
      if (slots[s] === null) { slots[s] = id; break }
    }
  }
  return slots
}

// Final canonical slots: early sorted deadline asc/id asc, then late
function canonicalSlots(early: number[], late: number[]): (number | null)[] {
  const slots: (number | null)[] = Array(7).fill(null)
  const se = [...early].sort((a, b) => T(a).deadline - T(b).deadline || a - b)
  const sl = [...late].sort((a, b) => T(a).deadline - T(b).deadline || a - b)
  ;[...se, ...sl].forEach((id, i) => { slots[i] = id })
  return slots
}

// ─── Steps ────────────────────────────────────────────────────────────────────

interface Step {
  phase: 'init' | 'accept' | 'reject' | 'final'
  id: number | null
  A: number[]
  candidate: number[]
  slots: (number | null)[]
  ntA: { t: number; nt: number; fails: boolean }[]
  ntC: { t: number; nt: number; fails: boolean }[]
  failT?: number
  failNt?: number
  heading: string
  body: string
}

function buildSteps(): Step[] {
  const steps: Step[] = []
  let A: number[] = []

  steps.push({
    phase: 'init', id: null, A: [], candidate: [],
    slots: Array(7).fill(null),
    ntA: ntRow([]), ntC: ntRow([]),
    heading: 'Inicio: A = ∅',
    body: 'Ordenamos las 7 tareas de mayor a menor penalización: a₁(70) ≥ a₂(60) ≥ a₃(50) ≥ a₄(40) ≥ a₅(30) ≥ a₆(20) ≥ a₇(10). Greedy irá evaluando cada una e intentará incorporarla al conjunto A de tareas "a tiempo".',
  })

  for (const id of ORDER) {
    const task = T(id)
    const candidate = [...A, id]
    const accept = isIndep(candidate)
    const ntA = ntRow(A)
    const ntC = ntRow(candidate)
    const failEntry = ntC.find(e => e.fails)

    if (accept) {
      A = candidate
      steps.push({
        phase: 'accept', id, A: [...A], candidate,
        slots: assignSlots(A), ntA, ntC,
        heading: `✅ ${task.label} aceptada — penalización ${task.weight}, deadline ${task.deadline}`,
        body: `A ∪ {${task.label}} es independiente: Nₜ(A ∪ {${task.label}}) ≤ t para todo t. Ningún intervalo de tiempo queda sobrecargado. ${task.label} entra en tₑ (a tiempo).`,
      })
    } else {
      steps.push({
        phase: 'reject', id, A: [...A], candidate,
        slots: assignSlots(A), ntA, ntC,
        failT: failEntry?.t, failNt: failEntry?.nt,
        heading: `❌ ${task.label} rechazada — penalización ${task.weight}, deadline ${task.deadline}`,
        body: `A ∪ {${task.label}} NO es independiente: N_${failEntry?.t}(A ∪ {${task.label}}) = ${failEntry?.nt} > ${failEntry?.t}. Hay ${failEntry?.nt} tareas con deadline ≤ ${failEntry?.t} pero solo ${failEntry?.t} slots disponibles. ${task.label} queda como tardía (tₗ).`,
      })
    }
  }

  const lateIds = ORDER.filter(id => !A.includes(id))
  const penalty = lateIds.reduce((s, id) => s + T(id).weight, 0)
  steps.push({
    phase: 'final', id: null, A, candidate: A,
    slots: canonicalSlots(A, lateIds),
    ntA: ntRow(A), ntC: ntRow(A),
    heading: `Calendarización canónica — Penalización total: ${penalty}`,
    body: `tₑ = {${A.map(id => T(id).label).join(', ')}} → a tiempo (deadline asc)\ntₗ = {${lateIds.map(id => T(id).label).join(', ')}} → tardías, penalizadas\nTotal = ${lateIds.map(id => `${T(id).weight}`).join(' + ')} = ${penalty}`,
  })

  return steps
}

const STEPS = buildSteps()
const FINAL_LATE = ORDER.filter(id => !STEPS[STEPS.length - 1].A.includes(id))

// ─── ProcessorGrid ────────────────────────────────────────────────────────────

function ProcessorGrid({ step }: { step: Step }) {
  const lateInFinal = step.phase === 'final' ? FINAL_LATE : []

  return (
    <div>
      <p className="text-xs text-slate-500 uppercase font-medium tracking-wide mb-3">
        Procesador — 7 ciclos de reloj
      </p>
      <div className="grid grid-cols-7 gap-2">
        {step.slots.map((taskId, i) => {
          const slotNum = i + 1
          const task = taskId != null ? T(taskId) : null
          const color = task ? CLR[taskId!] : null
          const isNew = taskId === step.id && step.phase === 'accept'
          const isLate = taskId != null && lateInFinal.includes(taskId)

          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-full rounded-xl border-2 flex items-center justify-center font-bold text-base transition-all duration-500 relative`}
                style={{
                  aspectRatio: '1',
                  borderColor: task
                    ? isLate ? '#ef4444' : color!
                    : '#1e293b',
                  borderStyle: task ? 'solid' : 'dashed',
                  backgroundColor: task
                    ? isLate ? '#ef444415' : `${color}18`
                    : 'transparent',
                  color: task ? (isLate ? '#fca5a5' : color!) : '#1e3a5f',
                  boxShadow: isNew
                    ? `0 0 20px ${color}55, 0 0 8px ${color}30`
                    : step.phase === 'final' && task && !isLate
                      ? `0 0 10px ${color}30`
                      : undefined,
                  transform: isNew ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {task ? (
                  <span>{task.label}</span>
                ) : (
                  <span className="text-slate-800 text-sm select-none">·</span>
                )}
                {isLate && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none font-bold">✗</span>
                )}
              </div>
              <div className="text-center space-y-0.5">
                <div className="text-xs text-slate-600 font-mono">t={slotNum}</div>
                {task && (
                  <div className="text-xs font-medium" style={{ color: isLate ? '#fca5a5' : (color || 'white') }}>
                    d={task.deadline}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Rejected task overlay */}
      {step.phase === 'reject' && step.id && (
        <div className="mt-4 flex items-center gap-3 bg-red-950/20 border border-red-800/30 rounded-xl px-4 py-3">
          <div
            className="w-10 h-10 rounded-lg border-2 border-red-500/60 flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ color: CLR[step.id], backgroundColor: `${CLR[step.id]}15` }}
          >
            {T(step.id).label}
          </div>
          <div>
            <p className="text-red-300 text-xs font-semibold">No hay slot disponible para {T(step.id).label}</p>
            <p className="text-red-400/70 text-xs">deadline = {T(step.id).deadline}, pero N_{step.failT} = {step.failNt} {'>'} {step.failT} → violación de independencia</p>
          </div>
          <span className="ml-auto text-2xl text-red-500/60">✗</span>
        </div>
      )}
    </div>
  )
}

// ─── Nt Table ─────────────────────────────────────────────────────────────────

function NtTable({ step }: { step: Step }) {
  const showCandidate = step.phase === 'accept' || step.phase === 'reject'
  const task = step.id ? T(step.id) : null

  return (
    <div>
      <p className="text-xs text-slate-500 uppercase font-medium tracking-wide mb-2">
        Criterio de independencia — Nₜ(A) ≤ t para todo t
      </p>
      <div className="bg-slate-900/70 border border-slate-700/40 rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-xs min-w-full">
          <thead>
            <tr>
              <td className="pr-4 py-1.5 text-slate-500 font-medium whitespace-nowrap">t →</td>
              {step.ntA.map(e => (
                <td key={e.t} className="text-center px-2 py-1.5 font-mono text-slate-500">{e.t}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="pr-4 py-1.5 text-slate-400 whitespace-nowrap font-medium">Nₜ(A)</td>
              {step.ntA.map(e => (
                <td key={e.t} className="text-center px-2 py-1.5 font-mono text-slate-400">{e.nt}</td>
              ))}
            </tr>

            {showCandidate && task && (
              <tr>
                <td className="pr-4 py-1.5 text-slate-200 whitespace-nowrap font-semibold">
                  Nₜ(A∪{'{' + task.label + '}'})
                </td>
                {step.ntC.map((e, i) => {
                  const changed = e.nt !== step.ntA[i].nt
                  return (
                    <td
                      key={e.t}
                      className={`text-center px-2 py-1.5 font-mono font-bold rounded transition-all ${
                        e.fails
                          ? 'text-red-300 bg-red-950/60'
                          : changed
                            ? 'text-emerald-300'
                            : 'text-slate-500'
                      }`}
                    >
                      {e.nt}{e.fails ? ' ✗' : ''}
                    </td>
                  )
                })}
              </tr>
            )}

            <tr>
              <td className="pr-4 py-1.5 text-slate-600 whitespace-nowrap">límite t</td>
              {step.ntA.map(e => (
                <td key={e.t} className="text-center px-2 py-1.5 font-mono text-slate-700">{e.t}</td>
              ))}
            </tr>
          </tbody>
        </table>

        {step.phase === 'reject' && step.failT != null && (
          <div className="mt-3 flex items-start gap-2 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
            <span className="text-red-400 text-sm mt-0.5">⚠</span>
            <p className="text-red-300 text-xs leading-relaxed">
              <strong>N_{step.failT} = {step.failNt} {'>'} {step.failT}</strong> — Solo hay {step.failT} slot{step.failT > 1 ? 's' : ''} para tareas con deadline ≤ {step.failT}, pero hay {step.failNt}. No es posible calendarizarlas todas a tiempo.
            </p>
          </div>
        )}
        {step.phase === 'accept' && (
          <div className="mt-3 flex items-center gap-2 bg-emerald-950/30 border border-emerald-900/40 rounded-lg px-3 py-2">
            <span className="text-emerald-400 text-sm">✓</span>
            <p className="text-emerald-300 text-xs">Nₜ ≤ t para todo t — conjunto sigue siendo independiente en la matroide</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Task Queue ───────────────────────────────────────────────────────────────

function TaskQueue({ step, stepIdx }: { step: Step; stepIdx: number }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase font-medium tracking-wide mb-3">
        Tareas ordenadas por penalización (mayor → menor)
      </p>
      <div className="flex flex-wrap gap-3">
        {ORDER.map((id, orderIdx) => {
          const task = T(id)
          const color = CLR[id]
          const greedyStep = orderIdx + 1
          const isPast = greedyStep < stepIdx
          const isCurrent = greedyStep === stepIdx
          const isAccepted = step.A.includes(id)
          const isRejected = isPast && !isAccepted
          const isFuture = greedyStep > stepIdx

          return (
            <div
              key={id}
              className="flex flex-col items-center gap-1 transition-all duration-300"
              style={{
                opacity: isFuture ? 0.35 : isRejected ? 0.45 : 1,
                transform: isCurrent ? 'scale(1.12)' : 'scale(1)',
              }}
            >
              <div
                className="w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center relative transition-all duration-300"
                style={{
                  borderColor: isRejected ? '#3f3f46' : isCurrent || isAccepted ? color : '#1e293b',
                  backgroundColor: isCurrent ? `${color}28` : isAccepted ? `${color}18` : '#0f172a',
                  color: isRejected ? '#52525b' : isCurrent || isAccepted ? color : '#334155',
                  boxShadow: isCurrent ? `0 0 18px ${color}50` : undefined,
                }}
              >
                <span className="font-bold text-base leading-none">{task.label}</span>
                {isRejected && <span className="text-red-500 text-xs mt-0.5">✗</span>}
                {isPast && isAccepted && <span className="text-xs mt-0.5" style={{ color }}>✓</span>}
                {isCurrent && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap"
                    style={{ backgroundColor: `${color}30`, color }}>
                    ← eval
                  </span>
                )}
              </div>
              <div className="text-center space-y-0">
                <div className="text-xs font-semibold" style={{ color: isRejected ? '#52525b' : color }}>
                  w={task.weight}
                </div>
                <div className="text-xs text-slate-600">d={task.deadline}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Visualizer ──────────────────────────────────────────────────────────

function GreedySchedulingViz() {
  const [stepIdx, setStepIdx] = useState(0)
  const step = STEPS[stepIdx]

  const phaseBorder = step.phase === 'accept'
    ? 'border-emerald-800/50'
    : step.phase === 'reject'
      ? 'border-red-800/50'
      : step.phase === 'final'
        ? 'border-indigo-700/50'
        : 'border-slate-700/40'

  const phaseBg = step.phase === 'accept'
    ? 'bg-emerald-950/20'
    : step.phase === 'reject'
      ? 'bg-red-950/20'
      : step.phase === 'final'
        ? 'bg-indigo-950/20'
        : 'bg-slate-900/30'

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className={`rounded-xl border px-5 py-4 transition-all duration-500 ${phaseBorder} ${phaseBg}`}>
        <div className="flex items-start justify-between gap-4 mb-2">
          <p className="font-bold text-white text-base leading-snug">{step.heading}</p>
          <span className="text-xs text-slate-500 shrink-0 mt-1">{stepIdx + 1} / {STEPS.length}</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{step.body}</p>
        {step.phase !== 'init' && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">A =</span>
            <span className="font-mono text-xs text-slate-300">
              {'{'}
              {step.A.length > 0
                ? step.A.map(id => T(id).label).join(', ')
                : '∅'}
              {'}'}
            </span>
            {step.phase === 'accept' && step.id && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: `${CLR[step.id]}20`, color: CLR[step.id] }}
              >
                + {T(step.id).label} añadida
              </span>
            )}
            {step.phase === 'reject' && step.id && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-950/60 text-red-300">
                {T(step.id).label} → tₗ
              </span>
            )}
          </div>
        )}
      </div>

      {/* Core visualizations */}
      <TaskQueue step={step} stepIdx={stepIdx} />
      <ProcessorGrid step={step} />
      <NtTable step={step} />

      {/* Final result panels */}
      {step.phase === 'final' && (
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/15 p-4 space-y-2">
            <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wide">tₑ — Tareas a tiempo</p>
            <div className="flex flex-wrap gap-1.5">
              {step.A
                .slice()
                .sort((a, b) => T(a).deadline - T(b).deadline || a - b)
                .map(id => (
                  <span
                    key={id}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${CLR[id]}20`, color: CLR[id] }}
                  >
                    {T(id).label} (d={T(id).deadline})
                  </span>
                ))}
            </div>
            <p className="text-emerald-400 text-xs font-medium">Penalización = 0</p>
          </div>
          <div className="rounded-xl border border-red-800/40 bg-red-950/15 p-4 space-y-2">
            <p className="text-red-300 text-xs font-semibold uppercase tracking-wide">tₗ — Tareas tardías (penalizadas)</p>
            <div className="flex flex-wrap gap-1.5">
              {FINAL_LATE.map(id => (
                <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-red-950/60 text-red-300 font-medium">
                  {T(id).label} (w={T(id).weight})
                </span>
              ))}
            </div>
            <p className="text-red-400 text-xs font-bold">
              Penalización = {FINAL_LATE.map(id => T(id).weight).join(' + ')} = {FINAL_LATE.reduce((s, id) => s + T(id).weight, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setStepIdx(s => Math.max(0, s - 1))}
          disabled={stepIdx === 0}
          className="px-4 py-2 rounded-lg text-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 disabled:opacity-30 hover:bg-slate-600/50 transition-colors"
        >
          ← Anterior
        </button>

        <div className="flex gap-1.5 flex-1 justify-center flex-wrap">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setStepIdx(i)}
              title={s.heading}
              className={`rounded-full transition-all duration-200 ${
                i === stepIdx
                  ? 'w-6 h-2 bg-blue-400'
                  : i < stepIdx
                    ? s.phase === 'reject'
                      ? 'w-2 h-2 bg-red-600'
                      : 'w-2 h-2 bg-emerald-600'
                    : 'w-2 h-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setStepIdx(s => Math.min(STEPS.length - 1, s + 1))}
          disabled={stepIdx === STEPS.length - 1}
          className="px-4 py-2 rounded-lg text-sm bg-blue-600/30 border border-blue-500/30 text-blue-300 disabled:opacity-30 hover:bg-blue-600/50 transition-colors"
        >
          Siguiente →
        </button>
      </div>

      {stepIdx === STEPS.length - 1 && (
        <div className="text-center">
          <button onClick={() => setStepIdx(0)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ↺ Reiniciar demo
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Matroid Proof Panel ──────────────────────────────────────────────────────

function MatroidProofPanel() {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-slate-700/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-800/40 hover:bg-slate-700/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🔬</span>
          <div>
            <p className="text-white font-semibold text-sm">¿Por qué esta estructura es una matroide?</p>
            <p className="text-slate-400 text-xs mt-0.5">Verificación de propiedad hereditaria y de intercambio</p>
          </div>
        </div>
        <span className="text-slate-400 text-lg">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 py-5 space-y-5 bg-slate-900/40">
          {/* Hereditary */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="tag-emerald">Hereditaria</span>
              <span className="text-white text-sm font-semibold">Si A ∈ I y B ⊆ A, entonces B ∈ I</span>
            </div>
            <div className="formula-box text-xs space-y-2">
              <p className="text-slate-300">Sea A independiente, es decir Nₜ(A) ≤ t para todo t. Sea B ⊆ A.</p>
              <p className="text-slate-300">Como B ⊆ A, cada tarea contada en B también está en A, así que:</p>
              <p className="text-blue-300 font-mono">Nₜ(B) ≤ Nₜ(A) ≤ t para todo t</p>
              <p className="text-emerald-300">→ B también es independiente. ✅</p>
            </div>
          </div>

          {/* Exchange */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="tag-purple">Intercambio</span>
              <span className="text-white text-sm font-semibold">Si |B| {'>'} |A|, existe b ∈ B − A tal que A ∪ {'{'} b {'}'} ∈ I</span>
            </div>
            <div className="formula-box text-xs space-y-2">
              <p className="text-slate-300">
                Sean A, B independientes con |B| {'>'} |A|. Como |B| {'>'} |A|, debe existir algún
                t con Nₜ(B) {'>'} Nₜ(A). Sea k el menor de esos t.
              </p>
              <p className="text-slate-300">
                Tomamos β ∈ B − A con <strong className="text-amber-300">deadline ≥ k + 1</strong> (existe porque el "cuello de botella"
                está en t = k, pero B tiene elementos en t {'>'} k que A no tiene).
              </p>
              <p className="text-slate-300">
                Para A′ = A ∪ {'{'} β {'}'}: Nⱼ(A′) = Nⱼ(A) ≤ j para j = 0,…,k (no cambia porque β tiene deadline {'>'} k).
                Para j {'>'} k: como B es independiente, Nⱼ(B) ≤ j, y por construcción Nⱼ(A′) ≤ Nⱼ(B) ≤ j.
              </p>
              <p className="text-emerald-300">→ A′ = A ∪ {'{'} β {'}'} es independiente. Propiedad de intercambio verificada. ✅</p>
            </div>
            <div className="mt-3 bg-amber-950/20 border border-amber-800/30 rounded-lg px-4 py-3">
              <p className="text-amber-300 text-xs font-semibold mb-1">¿Por qué exigimos deadline ≥ k + 1?</p>
              <p className="text-slate-300 text-xs leading-relaxed">
                Si tomáramos un b con deadline c ≤ k y Nᶜ(A) = c (el límite exacto), añadirlo daría
                Nᶜ(A′) = c + 1 {'>'} c, violando independencia. Por eso solo podemos usar elementos de B
                con deadlines posteriores a k.
              </p>
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-800/30 rounded-lg px-4 py-3">
            <p className="text-indigo-300 text-xs font-semibold mb-1">Conclusión</p>
            <p className="text-slate-300 text-xs leading-relaxed">
              M = (S, I) donde I = {'{'} A ⊆ S : Nₜ(A) ≤ t para todo t {'}'} es una matroide. Por tanto,
              GREEDY(M, w) produce la calendarización de penalización mínima. ✅
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Section Export ───────────────────────────────────────────────────────────

export default function SchedulingSection() {
  return (
    <section className="py-16 border-t border-slate-800/60">
      <div className="section-container space-y-12">

        {/* Section header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="tag-purple">Último ejemplo</span>
            <span className="tag-blue">Ejercicio 13</span>
            <span className="tag-emerald">Matroide</span>
          </div>
          <h2 className="section-title">Calendarización de Tareas Unitarias</h2>
          <p className="section-subtitle">
            Un procesador ejecuta tareas de duración 1. Cada tarea tiene un deadline y una penalización
            si se entrega tarde. El objetivo es minimizar la penalización total.
          </p>
        </div>

        {/* Problem setup */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-sm">S</div>
              <p className="text-white font-semibold text-sm">Tareas</p>
            </div>
            <div className="formula-box text-xs space-y-1.5">
              <p className="text-blue-300 font-mono">S = {'{'} a₁, …, a₇ {'}'}</p>
              <p className="text-slate-400">7 tareas unitarias (cada una toma 1 ciclo de reloj)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr className="text-slate-500">
                    <td className="py-1 pr-2">aᵢ</td>
                    {TASKS.map(t => <td key={t.id} className="py-1 px-2 text-center font-mono" style={{ color: CLR[t.id] }}>{t.label}</td>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 pr-2 text-slate-400">dᵢ</td>
                    {TASKS.map(t => <td key={t.id} className="py-1 px-2 text-center text-slate-300">{t.deadline}</td>)}
                  </tr>
                  <tr>
                    <td className="py-1 pr-2 text-slate-400">wᵢ</td>
                    {TASKS.map(t => <td key={t.id} className="py-1 px-2 text-center text-slate-300">{t.weight}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-sm">↓</div>
              <p className="text-white font-semibold text-sm">Forma Canónica</p>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Toda calendarización puede transformarse en <strong className="text-white">forma canónica</strong> sin empeorar su penalización:
            </p>
            <div className="space-y-2">
              <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg px-3 py-2 text-xs">
                <p className="text-emerald-300 font-semibold">tₑ — tareas a tiempo</p>
                <p className="text-slate-400">Ejecutadas antes o en su deadline. Ordenadas por deadline ascendente. Penalización = 0.</p>
              </div>
              <div className="bg-red-950/30 border border-red-800/30 rounded-lg px-3 py-2 text-xs">
                <p className="text-red-300 font-semibold">tₗ — tareas tardías</p>
                <p className="text-slate-400">Ejecutadas después de su deadline. Incurren penalización wᵢ. Se agregan al final.</p>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-sm">I</div>
              <p className="text-white font-semibold text-sm">Conjunto Independiente</p>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Un conjunto A de tareas es <strong className="text-white">independiente</strong> si puede calendarizarse sin penalización:
            </p>
            <div className="formula-box text-xs space-y-2">
              <p className="text-slate-400">Para todo t = 0, 1, …, n:</p>
              <p className="text-blue-300 font-mono text-sm">Nₜ(A) ≤ t</p>
              <p className="text-slate-400">donde Nₜ(A) = |{'{'} a ∈ A : dₐ ≤ t {'}'}|</p>
              <p className="text-slate-400 pt-1 border-t border-slate-700/40">
                Intuición: no hay más tareas con deadline ≤ t que slots disponibles hasta t.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive demo */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="tag-amber">Interactivo</span>
            <span className="text-slate-400 text-sm">Paso a paso</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">GREEDY(M, w) en acción</h3>
          <p className="text-slate-400 text-sm mb-6">
            Navega cada decisión del algoritmo. Observa cómo se verifican los Nₜ y cómo el procesador
            va llenándose en forma canónica.
          </p>
          <div className="card p-6">
            <GreedySchedulingViz />
          </div>
        </div>

        {/* Matroid proof */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Fundamento matemático</h3>
          <MatroidProofPanel />
        </div>

        {/* Final answer box */}
        <div className="bg-indigo-950/20 border border-indigo-800/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-white font-bold text-base">Respuesta — Ejercicio 13</p>
              <p className="text-slate-400 text-sm">Calendarización óptima que minimiza penalización</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-slate-300 text-sm font-semibold">Orden de ejecución canónico:</p>
              <div className="flex flex-wrap gap-2 items-center">
                {[2, 4, 1, 3, 7, 5, 6].map((id, i) => {
                  const isLate = [5, 6].includes(id)
                  return (
                    <span key={i} className="flex items-center gap-1">
                      <span
                        className="text-sm font-bold px-3 py-1.5 rounded-lg border"
                        style={{
                          borderColor: isLate ? '#7f1d1d' : CLR[id],
                          backgroundColor: isLate ? '#450a0a30' : `${CLR[id]}18`,
                          color: isLate ? '#fca5a5' : CLR[id],
                        }}
                      >
                        {T(id).label}
                      </span>
                      {i < 6 && <span className="text-slate-600">→</span>}
                    </span>
                  )
                })}
              </div>
              <p className="text-slate-500 text-xs">⟨a₂, a₄, a₁, a₃, a₇, a₅, a₆⟩</p>
            </div>

            <div className="space-y-2">
              <p className="text-slate-300 text-sm font-semibold">Desglose de penalización:</p>
              <div className="formula-box text-xs space-y-1.5">
                <p className="text-emerald-300">tₑ = {'{'} a₂, a₄, a₁, a₃, a₇ {'}'} → penalización = 0</p>
                <p className="text-red-300">tₗ = {'{'} a₅, a₆ {'}'} → w₅ + w₆ = 30 + 20 = 50</p>
                <p className="text-white font-bold text-sm pt-1 border-t border-slate-700/40">
                  Penalización total mínima = 50
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
