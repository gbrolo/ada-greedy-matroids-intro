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
function countNt(set: number[], t: number) { return set.filter(id => T(id).deadline <= t).length }
function isIndep(set: number[]): boolean {
  for (let t = 1; t <= 7; t++) if (countNt(set, t) > t) return false
  return true
}
function ntRow(set: number[]) {
  return Array.from({ length: 7 }, (_, i) => { const t = i + 1, nt = countNt(set, t); return { t, nt, fails: nt > t } })
}
function assignSlots(set: number[]): (number | null)[] {
  const slots: (number | null)[] = Array(7).fill(null)
  const sorted = [...set].sort((a, b) => { const d = T(b).deadline - T(a).deadline; return d !== 0 ? d : b - a })
  for (const id of sorted) { for (let s = T(id).deadline - 1; s >= 0; s--) { if (slots[s] === null) { slots[s] = id; break } } }
  return slots
}
function canonicalSlots(early: number[], late: number[]): (number | null)[] {
  const slots: (number | null)[] = Array(7).fill(null)
  const se = [...early].sort((a, b) => T(a).deadline - T(b).deadline || a - b)
  const sl = [...late].sort((a, b) => T(a).deadline - T(b).deadline || a - b)
  ;[...se, ...sl].forEach((id, i) => { slots[i] = id })
  return slots
}

// ─── Step data ────────────────────────────────────────────────────────────────

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
  story: string
  matroidNote: string
}

function buildSteps(): Step[] {
  const steps: Step[] = []
  let A: number[] = []

  steps.push({
    phase: 'init', id: null, A: [], candidate: [],
    slots: Array(7).fill(null), ntA: ntRow([]), ntC: ntRow([]),
    heading: 'Inicio: A = ∅ — preparando el planificador',
    story: 'Imagina que eres el planificador de un procesador que ejecuta exactamente una tarea por ciclo de reloj. Tienes 7 tareas pendientes. Cada una tarda 1 ciclo. Si una tarea no termina antes de su fecha límite (deadline), pagas una multa (penalización wᵢ). Tu meta: minimizar la suma de multas.\n\nLa estrategia Greedy es simple y poderosa: evalúa las tareas de mayor a menor penalización. Siempre intenta salvar primero las más costosas. Si una cabe en el calendario sin violar ningún deadline, la incluyes. Si no cabe, la ejecutas al final (y pagas su multa).',
    matroidNote: 'La familia de conjuntos independientes I = { A ⊆ S : Nₜ(A) ≤ t ∀t } forma una matroide. Esto garantiza matemáticamente que el enfoque greedy encontrará la solución óptima global.',
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
      const critEntry = ntC.reduce((best, e) => e.nt > 0 && e.nt / e.t > (best.nt / best.t) ? e : best, ntC[0])
      steps.push({
        phase: 'accept', id, A: [...A], candidate, slots: assignSlots(A), ntA, ntC,
        heading: `✅ ${task.label} aceptada — penalización ${task.weight}, deadline slot ${task.deadline}`,
        story: (() => {
          const range = Array.from({ length: task.deadline }, (_, i) => i + 1).join(', ')
          const tightStr = `N_${critEntry.t} = ${critEntry.nt}/${critEntry.t}${critEntry.nt === critEntry.t ? ' (al límite)' : ''}`
          const aLabels = A.map(i => T(i).label).join(', ')
          return `${task.label} tiene la ${ORDER.indexOf(id) === 0 ? 'penalización más alta' : `penalización ${task.weight}`} y su deadline es el slot ${task.deadline}. Eso significa que puede ejecutarse en cualquiera de los slots: ${range}.\n\n¿Cabe en el calendario actual? Revisamos cada ventana de tiempo: el caso más ajustado es t=${critEntry.t} (${tightStr} slots ocupados de ${critEntry.t} disponibles). Hay espacio suficiente. ✅\n\nA ahora contiene: { ${aLabels} }`
        })(),
        matroidNote: `A ∪ {${task.label}} es un conjunto independiente en la matroide: Nₜ ≤ t para todo t. El procesador puede calendarizar todas estas tareas a tiempo.`,
      })
    } else {
      steps.push({
        phase: 'reject', id, A: [...A], candidate, slots: assignSlots(A), ntA, ntC,
        failT: failEntry?.t, failNt: failEntry?.nt,
        heading: `❌ ${task.label} rechazada — deadline ${task.deadline}, no hay slot libre`,
        story: (() => {
          const existing = A.filter(i => T(i).deadline <= (failEntry?.t ?? 4)).map(i => T(i).label).join(', ')
          return `${task.label} tiene deadline ${task.deadline}, así que debe ejecutarse en uno de los slots 1 al ${task.deadline}. El problema: ya tenemos ${A.filter(i => T(i).deadline <= (failEntry?.t ?? 4)).length} tarea(s) con deadline ≤ ${failEntry?.t} en el conjunto A (${existing}). Si añadimos ${task.label}, tendríamos ${failEntry?.nt} tareas que deben entrar en los primeros ${failEntry?.t} slots. ¡Pero solo existen ${failEntry?.t} slots!\n\n${failEntry?.nt} tareas > ${failEntry?.t} slots disponibles → el procesador se satura. No hay forma de calendarizar todas a tiempo. ${task.label} pasa a la lista de tareas tardías (tₗ) y pagará su multa de ${task.weight}.`
        })(),
        matroidNote: `A ∪ {${task.label}} NO es independiente: N_${failEntry?.t}(A ∪ {${task.label}}) = ${failEntry?.nt} > ${failEntry?.t}. La matroide detecta que la ventana de tiempo [1..${failEntry?.t}] está sobrecargada.`,
      })
    }
  }

  const lateIds = ORDER.filter(id => !A.includes(id))
  const penalty = lateIds.reduce((s, id) => s + T(id).weight, 0)
  steps.push({
    phase: 'final', id: null, A, candidate: A,
    slots: canonicalSlots(A, lateIds),
    ntA: ntRow(A), ntC: ntRow(A),
    heading: `Calendarización canónica — Penalización mínima: ${penalty}`,
    story: `El algoritmo terminó. Las tareas aceptadas forman el conjunto tₑ (a tiempo): { ${A.map(id => T(id).label).join(', ')} }. Se ordenan por deadline ascendente (forma canónica) y se ejecutan en los primeros slots del procesador.\n\nLas tareas tardías tₗ = { ${lateIds.map(id => T(id).label).join(', ')} } se ejecutan al final. Su penalización total es ${lateIds.map(id => `w${id} (${T(id).weight})`).join(' + ')} = ${penalty}.\n\nEsta es la penalización mínima posible: ningún otro orden de ejecución produce un total menor.`,
    matroidNote: `Como (S, I) es una matroide ponderada, GREEDY(M, w) garantiza que el conjunto A encontrado maximiza la suma de penalizaciones "salvadas" — equivalentemente, minimiza la penalización total incurrida.`,
  })

  return steps
}

const STEPS = buildSteps()
const FINAL_LATE = ORDER.filter(id => !STEPS[STEPS.length - 1].A.includes(id))

// ─── Terminology Legend ───────────────────────────────────────────────────────

function TerminologyLegend() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        {
          symbol: 'aᵢ', color: '#22d3ee', bg: '#083344',
          title: 'Nombre de la tarea',
          body: 'La etiqueta de cada tarea (a₁, a₂, …, a₇). El subíndice i solo indica su número. Podrías llamarlas "Tarea 1", "Tarea 2", etc. — es solo un nombre.',
          example: 'a₃ = Tarea 3',
        },
        {
          symbol: 'dᵢ', color: '#fbbf24', bg: '#451a03',
          title: 'Deadline (fecha límite)',
          body: 'El último slot de tiempo en que la tarea puede ejecutarse sin incurrir en penalización. Si dᵢ = 4, la tarea puede ir en el slot 1, 2, 3 o 4 sin problema.',
          example: 'd₃ = 4 → slots válidos: 1, 2, 3, 4',
        },
        {
          symbol: 'wᵢ', color: '#f87171', bg: '#450a0a',
          title: 'Penalización si llega tarde',
          body: 'La multa que se paga si la tarea no termina antes de su deadline. Queremos minimizar la suma total de estas penalizaciones. Una w alta = tarea importante.',
          example: 'w₁ = 70 → multa de 70 si a₁ llega tarde',
        },
      ].map(item => (
        <div
          key={item.symbol}
          className="rounded-xl border p-4 space-y-3"
          style={{ borderColor: `${item.color}30`, backgroundColor: `${item.bg}60` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-mono shrink-0 border"
              style={{ color: item.color, borderColor: `${item.color}40`, backgroundColor: `${item.color}15` }}
            >
              {item.symbol}
            </div>
            <p className="text-white font-semibold text-sm">{item.title}</p>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">{item.body}</p>
          <div className="rounded-lg px-3 py-2 text-xs font-mono" style={{ backgroundColor: `${item.color}10`, color: item.color }}>
            {item.example}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Greedy Code Panel ────────────────────────────────────────────────────────

function GreedyCodePanel({ step }: { step: Step }) {
  const isEval = step.phase === 'accept' || step.phase === 'reject'
  const taskLabel = step.id ? T(step.id).label : 'x'

  const lines = [
    {
      n: 1, code: 'A = ∅',
      note: 'Comenzamos sin ninguna tarea calendarizada',
      active: step.phase === 'init',
    },
    {
      n: 2, code: 'ordenar S por penalización (↓)',
      note: `Orden: ${ORDER.map(id => `${T(id).label}(${T(id).weight})`).join(' ≥ ')}`,
      active: step.phase === 'init',
    },
    {
      n: 3, code: `para cada x ∈ S: (evaluando ${isEval ? taskLabel : '…'})`,
      note: 'Iterar en orden de mayor a menor penalización',
      active: isEval,
    },
    {
      n: 4, code: `    si A ∪ {${isEval ? taskLabel : 'x'}} ∈ M.I  ← ¿es independiente?`,
      note: 'Verificar: ¿Nₜ(A ∪ {x}) ≤ t para todo t?',
      active: isEval,
      highlight: true,
    },
    {
      n: 5, code: `        A = A ∪ {${isEval ? taskLabel : 'x'}}  ${step.phase === 'accept' ? '← ¡SÍ! se añade' : step.phase === 'reject' ? '← NO se ejecuta' : ''}`,
      note: step.phase === 'accept' ? `${taskLabel} entra en el conjunto` : step.phase === 'reject' ? `${taskLabel} omitida — irá al final (tardía)` : 'Añadir x solo si pasa la verificación',
      active: step.phase === 'accept',
      skipped: step.phase === 'reject',
    },
    {
      n: 6, code: 'retornar A',
      note: 'El conjunto A es la calendarización óptima de tareas a tiempo',
      active: step.phase === 'final',
    },
  ]

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700/40 bg-slate-800/40">
        <span className="text-xs text-slate-400 font-mono font-semibold">GREEDY(M, w)</span>
        <span className="text-xs text-slate-600">— pseudocódigo (línea activa resaltada)</span>
      </div>
      <div className="p-3 space-y-0.5 font-mono text-xs">
        {lines.map(line => (
          <div
            key={line.n}
            className={`flex items-start gap-3 px-2 py-1.5 rounded-lg transition-all duration-300 ${
              line.active && line.highlight
                ? 'bg-amber-500/15 border border-amber-500/30'
                : line.active
                  ? 'bg-teal-500/10 border border-teal-500/20'
                  : line.skipped
                    ? 'opacity-30'
                    : 'opacity-50'
            }`}
          >
            <span className="text-slate-600 shrink-0 w-4 text-right">{line.n}</span>
            <div className="flex-1 min-w-0">
              <span className={`${
                line.active && line.highlight ? 'text-amber-300' : line.active ? 'text-teal-200' : 'text-slate-500'
              }`}>
                {line.code}
              </span>
              {(line.active || line.skipped) && (
                <p className={`text-xs mt-0.5 ${
                  line.active && line.highlight ? 'text-amber-400/80' : line.skipped ? 'text-red-400/70' : 'text-slate-400'
                }`}>
                  {'// '}{line.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Window Analysis (replaces Capacity Bars) ─────────────────────────────────

function WindowAnalysis({ step }: { step: Step }) {
  const showCandidate = step.phase === 'accept' || step.phase === 'reject'
  const task = step.id ? T(step.id) : null
  const changedTs = showCandidate
    ? step.ntA.map((e, i) => step.ntC[i].nt !== e.nt ? e.t : null).filter(Boolean) as number[]
    : []

  return (
    <div className="space-y-4">
      {/* What is Nₜ — always shown */}
      <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-sm shrink-0">N</div>
          <div className="space-y-1.5">
            <p className="text-white text-sm font-semibold">¿Qué es Nₜ(A)?</p>
            <p className="text-slate-300 text-xs leading-relaxed">
              <strong className="text-teal-300">Nₜ(A)</strong> = cantidad de tareas en A que tienen deadline ≤ t.
              Dicho de otro modo: cuántas tareas de A <strong className="text-white">deben ejecutarse dentro de los primeros t ciclos</strong>.
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              La regla de independencia exige <span className="text-emerald-300 font-mono font-semibold">Nₜ(A) ≤ t</span> para todo t.
              ¿Por qué? Porque hay exactamente t slots disponibles en los ciclos 1..t. Si más tareas necesitan esos slots de los que existen → imposible calendarizarlas todas a tiempo.
            </p>
            {showCandidate && task && changedTs.length > 0 && (
              <p className="text-amber-300 text-xs">
                Añadir {task.label} (deadline={task.deadline}) aumenta N_{changedTs.join(', N_')} en +1.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Window cards */}
      <div>
        <p className="text-xs text-slate-500 uppercase font-medium tracking-wide mb-3">
          Revisión por ventana de tiempo — ¿Nₜ ≤ t en cada ventana?
        </p>
        <div className="grid grid-cols-7 gap-2">
          {step.ntA.map((entry, i) => {
            const t = entry.t
            const ntBase = entry.nt
            const ntNew = showCandidate ? step.ntC[i].nt : ntBase
            const fails = showCandidate ? step.ntC[i].fails : false
            const atLimit = ntNew === t && !fails
            const isAffected = showCandidate && ntNew !== ntBase
            const isCritical = fails && t === step.failT

            const borderCol = isCritical ? '#ef4444' : fails ? '#7f1d1d' : atLimit ? '#d97706' : isAffected ? '#0d9488' : '#1e293b'
            const bgCol = isCritical ? '#450a0a40' : fails ? '#450a0a20' : atLimit ? '#45200a20' : isAffected ? '#0d948820' : 'transparent'
            const barFill = fails ? '#ef4444cc' : atLimit ? '#f59e0bcc' : ntNew > 0 ? '#10b981cc' : '#1e293b'
            const textCol = fails ? '#fca5a5' : atLimit ? '#fcd34d' : ntNew > 0 ? '#6ee7b7' : '#334155'

            return (
              <div
                key={t}
                className="rounded-xl border flex flex-col items-center gap-1.5 p-2 transition-all duration-300"
                style={{ borderColor: borderCol, backgroundColor: bgCol }}
              >
                {/* Window label */}
                <p className="text-xs font-mono text-slate-400">t={t}</p>

                {/* Bar */}
                <div
                  className="w-full rounded overflow-hidden relative"
                  style={{ height: 56, backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                >
                  {/* Base bar */}
                  <div
                    className="absolute bottom-0 w-full transition-all duration-500"
                    style={{ height: `${Math.min(100, (ntBase / t) * 100)}%`, backgroundColor: '#334155' }}
                  />
                  {/* Candidate bar */}
                  {isAffected && (
                    <div
                      className="absolute bottom-0 w-full transition-all duration-700"
                      style={{ height: `${Math.min(110, (ntNew / t) * 100)}%`, backgroundColor: barFill }}
                    />
                  )}
                  {/* Limit line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-600/80" style={{ top: 'calc(100% - 0px)' }} />
                  {/* Overflow flash */}
                  {fails && <div className="absolute inset-0 bg-red-600/20" />}
                </div>

                {/* Fraction */}
                <p className="text-xs font-mono font-bold" style={{ color: textCol }}>
                  {ntNew}<span className="text-slate-600">/{t}</span>
                </p>

                {/* Status label */}
                <p className="text-xs font-semibold text-center leading-none" style={{ color: textCol }}>
                  {fails ? '✗ lleno' : atLimit ? '⚠ límite' : ntNew > 0 ? '✓ ok' : '—'}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Explanation of what just happened */}
      {showCandidate && task && (
        <div className={`rounded-xl border px-4 py-3 text-xs leading-relaxed space-y-2 ${
          step.phase === 'reject'
            ? 'bg-red-950/20 border-red-800/40'
            : 'bg-emerald-950/20 border-emerald-800/40'
        }`}>
          {step.phase === 'reject' && step.failT != null ? (
            <>
              <p className="text-red-300 font-semibold">
                ✗ Ventana crítica t={step.failT} — ciclos 1 hasta {step.failT}
              </p>
              <p className="text-slate-300">
                En los ciclos 1 al {step.failT} hay exactamente <strong className="text-white">{step.failT} slots disponibles</strong>.
                El conjunto A ya tiene <strong className="text-white">{step.ntA[step.failT - 1].nt} tarea(s)</strong> que deben ejecutarse en esa ventana.
                Añadir {task.label} (deadline={task.deadline} ≤ {step.failT}) llevaría el total a <strong className="text-red-300">{step.failNt}</strong>.
              </p>
              <p className="text-red-400 font-mono">
                N_{step.failT}(A ∪ {'{' + task.label + '}'}) = {step.failNt} {'>'} {step.failT} → violación → {task.label} rechazada
              </p>
            </>
          ) : (
            <>
              <p className="text-emerald-300 font-semibold">
                ✓ Ninguna ventana se satura al añadir {task.label}
              </p>
              {changedTs.length > 0 ? (
                <p className="text-slate-300">
                  Añadir {task.label} (deadline={task.deadline}) afecta las ventanas{' '}
                  {changedTs.map(t => `t=${t} (N_${t}: ${step.ntA[t-1].nt} → ${step.ntC[t-1].nt}/${t})`).join(', ')}.
                  Todas siguen dentro del límite.
                </p>
              ) : (
                <p className="text-slate-300">
                  {task.label} tiene deadline={task.deadline} pero no aumenta ninguna ventana ya ocupada.
                </p>
              )}
              <p className="text-emerald-400 font-mono">
                Nₜ(A ∪ {'{' + task.label + '}'}) ≤ t para todo t → {task.label} aceptada
              </p>
            </>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: '#10b981cc' }} />Nₜ {'<'} t (hay espacio)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: '#f59e0bcc' }} />Nₜ = t (al límite)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: '#ef4444cc' }} />Nₜ {'>'} t — VIOLACIÓN ✗</span>
      </div>
    </div>
  )
}

// ─── Processor Grid ───────────────────────────────────────────────────────────

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
              {/* Slot number header */}
              <div
                className="w-full text-center text-xs font-mono py-0.5 rounded-t-md"
                style={{ color: task && !isLate ? color! : '#475569', backgroundColor: '#0f172a' }}
              >
                t={slotNum}
              </div>

              {/* Task cell */}
              <div
                className="w-full rounded-xl border-2 flex flex-col items-center justify-center relative transition-all duration-500"
                style={{
                  aspectRatio: '1',
                  borderColor: task ? (isLate ? '#ef4444' : color!) : '#1e293b',
                  borderStyle: task ? 'solid' : 'dashed',
                  backgroundColor: task ? (isLate ? '#ef444415' : `${color}18`) : 'transparent',
                  color: task ? (isLate ? '#fca5a5' : color!) : '#1e3a5f',
                  boxShadow: isNew ? `0 0 22px ${color}60, 0 0 8px ${color}30` : step.phase === 'final' && task && !isLate ? `0 0 10px ${color}25` : undefined,
                  transform: isNew ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {task ? (
                  <span className="font-bold text-sm">{task.label}</span>
                ) : (
                  <span className="text-slate-800 text-xs select-none">·</span>
                )}
                {isNew && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-bold px-1 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: `${color}30`, color: color ?? undefined }}>
                    nuevo
                  </span>
                )}
                {isLate && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">✗</span>
                )}
              </div>

              {/* Deadline badge */}
              {task && (
                <div
                  className="text-xs font-mono font-medium"
                  style={{ color: isLate ? '#fca5a5' : color! }}
                >
                  d={task.deadline}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Rejected task callout */}
      {step.phase === 'reject' && step.id && (
        <div className="mt-4 flex items-center gap-3 bg-red-950/20 border border-red-800/30 rounded-xl px-4 py-3">
          <div
            className="w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold text-sm shrink-0"
            style={{ borderColor: '#7f1d1d', color: CLR[step.id], backgroundColor: `${CLR[step.id]}10` }}
          >
            {T(step.id).label}
          </div>
          <div>
            <p className="text-red-300 text-xs font-semibold">{T(step.id).label} no puede ejecutarse a tiempo</p>
            <p className="text-red-500/70 text-xs">deadline = {T(step.id).deadline}, pero N_{step.failT} = {step.failNt} {'>'} {step.failT} → {step.failNt} tareas para {step.failT} slots</p>
          </div>
          <span className="ml-auto text-3xl text-red-700/40 font-black">✗</span>
        </div>
      )}
    </div>
  )
}

// ─── Task Queue ───────────────────────────────────────────────────────────────

function TaskQueue({ step, stepIdx }: { step: Step; stepIdx: number }) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <p className="text-xs text-slate-500 uppercase font-medium tracking-wide">
          Cola de tareas (mayor → menor penalización)
        </p>
        <p className="text-xs text-slate-600">w = penalización · d = deadline · slots = rango válido</p>
      </div>
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
              className="flex flex-col items-center gap-1.5 transition-all duration-300"
              style={{ opacity: isFuture ? 0.3 : isRejected ? 0.4 : 1, transform: isCurrent ? 'scale(1.15)' : 'scale(1)' }}
            >
              <div
                className="w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center relative transition-all duration-300"
                style={{
                  borderColor: isRejected ? '#3f3f46' : isCurrent || isAccepted ? color : '#1e293b',
                  backgroundColor: isCurrent ? `${color}28` : isAccepted ? `${color}15` : '#0f172a',
                  color: isRejected ? '#52525b' : isCurrent || isAccepted ? color : '#334155',
                  boxShadow: isCurrent ? `0 0 20px ${color}50` : undefined,
                }}
              >
                <span className="font-bold text-lg leading-none">{task.label}</span>
                {isRejected && <span className="text-red-600 text-sm leading-none mt-0.5">✗</span>}
                {isPast && isAccepted && <span className="text-xs leading-none mt-0.5" style={{ color }}>✓</span>}
                {isCurrent && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap"
                    style={{ backgroundColor: `${color}30`, color }}>
                    ← ahora
                  </span>
                )}
              </div>
              <div className="text-center space-y-0">
                <div className="text-xs font-semibold" style={{ color: isRejected ? '#52525b' : color }}>w={task.weight}</div>
                <div className="text-xs text-slate-600">d={task.deadline}</div>
                <div className="text-xs text-slate-700">slots 1–{task.deadline}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Current Task Card ────────────────────────────────────────────────────────

function CurrentTaskCard({ step }: { step: Step }) {
  if (!step.id || step.phase === 'init' || step.phase === 'final') return null
  const task = T(step.id)
  const color = CLR[step.id]
  const slots = Array.from({ length: task.deadline }, (_, i) => i + 1)
  const isAccept = step.phase === 'accept'

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{
        borderColor: isAccept ? '#065f4660' : '#450a0a60',
        backgroundColor: isAccept ? '#064e3b18' : '#450a0a18',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-14 h-14 rounded-xl border-2 flex items-center justify-center font-bold text-xl shrink-0"
          style={{ borderColor: color, backgroundColor: `${color}20`, color }}
        >
          {task.label}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-white font-semibold text-sm">¿Puede entrar {task.label} en el calendario?</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
              penalización = {task.weight}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-950/50 text-amber-300">
              deadline = slot {task.deadline}
            </span>
          </div>
        </div>
        <div
          className="text-2xl font-black shrink-0"
          style={{ color: isAccept ? '#34d399' : '#ef4444' }}
        >
          {isAccept ? '✅' : '❌'}
        </div>
      </div>

      {/* Valid slot range */}
      <div>
        <p className="text-xs text-slate-500 mb-1.5">Slots válidos para {task.label} (cualquiera de estos):</p>
        <div className="flex gap-1.5 flex-wrap">
          {slots.map(s => (
            <div
              key={s}
              className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold"
              style={{ borderColor: `${color}50`, backgroundColor: `${color}15`, color }}
            >
              {s}
            </div>
          ))}
          {task.deadline < 7 && (
            <div className="flex items-center px-2 text-xs text-slate-600">
              (slots {task.deadline + 1}–7 no son válidos → pasaría el deadline)
            </div>
          )}
        </div>
      </div>

      {/* Check result */}
      {step.phase === 'reject' && step.failT != null && (
        <div className="bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2 text-xs text-red-300">
          <strong>Razón del rechazo:</strong> Si incluimos {task.label}, N_{step.failT} = {step.failNt} — pero solo hay {step.failT} slots hasta t={step.failT}. No caben {step.failNt} tareas en {step.failT} slots.
        </div>
      )}
      {step.phase === 'accept' && (
        <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg px-3 py-2 text-xs text-emerald-300">
          <strong>¿Por qué cabe?</strong> Nₜ(A ∪ {'{'}{task.label}{'}'}) ≤ t para todo t. Ninguna ventana de tiempo queda saturada.
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
          <span className="text-xl">🔬</span>
          <div>
            <p className="text-white font-semibold text-sm">¿Por qué esta estructura es una matroide?</p>
            <p className="text-slate-400 text-xs mt-0.5">Prueba de propiedad hereditaria y de intercambio (clic para expandir)</p>
          </div>
        </div>
        <span className="text-slate-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-5 py-5 space-y-5 bg-slate-900/40">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="tag-emerald">Hereditaria</span>
              <span className="text-white text-sm font-semibold">Subconjuntos de independientes son independientes</span>
            </div>
            <div className="formula-box text-xs space-y-2">
              <p className="text-slate-300">Sea A independiente (Nₜ(A) ≤ t ∀t) y B ⊆ A. Como B ⊆ A:</p>
              <p className="text-blue-300 font-mono">Nₜ(B) ≤ Nₜ(A) ≤ t para todo t → B es independiente ✅</p>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="tag-purple">Intercambio</span>
              <span className="text-white text-sm font-semibold">Si |B| {'>'} |A|, podemos añadir un elemento de B a A</span>
            </div>
            <div className="formula-box text-xs space-y-2">
              <p className="text-slate-300">Sean A, B independientes con |B| {'>'} |A|. Como |B| {'>'} |A|, existe un t donde Nₜ(B) {'>'} Nₜ(A). Sea k el menor de esos t.</p>
              <p className="text-slate-300">Tomamos β ∈ B − A con deadline ≥ k + 1. Para A′ = A ∪ {'{'} β {'}'}:</p>
              <p className="text-blue-300 font-mono">Nⱼ(A′) = Nⱼ(A) ≤ j para j ≤ k (β no suma en esa ventana)</p>
              <p className="text-blue-300 font-mono">Nⱼ(A′) ≤ Nⱼ(B) ≤ j para j {'>'} k (B es independiente)</p>
              <p className="text-emerald-300">→ A′ es independiente. Propiedad de intercambio verificada. ✅</p>
            </div>
          </div>
          <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg px-4 py-3 text-xs text-teal-200">
            Como M = (S, I) es una matroide y estamos maximizando la suma de penalizaciones "salvadas" (función de peso w), GREEDY(M, w) produce siempre el conjunto independiente de peso máximo — es decir, la penalización mínima posible.
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Visualizer ──────────────────────────────────────────────────────────

function GreedySchedulingViz() {
  const [stepIdx, setStepIdx] = useState(0)
  const [showNtTable, setShowNtTable] = useState(false)
  const step = STEPS[stepIdx]

  const phaseBorder = step.phase === 'accept' ? 'border-emerald-800/50' : step.phase === 'reject' ? 'border-red-800/50' : step.phase === 'final' ? 'border-teal-700/50' : 'border-slate-700/40'
  const phaseBg = step.phase === 'accept' ? 'bg-emerald-950/20' : step.phase === 'reject' ? 'bg-red-950/20' : step.phase === 'final' ? 'bg-teal-950/20' : 'bg-slate-900/30'

  return (
    <div className="space-y-8">

      {/* Greedy pseudocode — always visible, shows current line */}
      <GreedyCodePanel step={step} />

      {/* Main narrative banner */}
      <div className={`rounded-xl border px-5 py-5 transition-all duration-500 ${phaseBorder} ${phaseBg}`}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <p className="font-bold text-white text-base leading-snug">{step.heading}</p>
          <span className="text-xs text-slate-500 shrink-0 mt-1 font-mono">{stepIdx + 1}/{STEPS.length}</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{step.story}</p>

        {/* A set chips */}
        {step.phase !== 'init' && (
          <div className="mt-4 pt-3 border-t border-slate-700/30 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">A =</span>
            {step.A.length === 0
              ? <span className="text-xs text-slate-500 font-mono">∅</span>
              : step.A.map(id => (
                <span key={id} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: `${CLR[id]}20`, color: CLR[id] }}>
                  {T(id).label}
                </span>
              ))
            }
            {step.phase === 'reject' && step.id && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-red-950/60 text-red-400">
                {T(step.id).label} → tardía (tₗ)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Matroid connection note */}
      <div className="flex items-start gap-3 bg-blue-950/20 border border-blue-800/20 rounded-xl px-4 py-3">
        <span className="text-blue-400 text-lg shrink-0 mt-0.5">⚡</span>
        <div>
          <p className="text-blue-300 text-xs font-semibold mb-0.5">Conexión con la matroide</p>
          <p className="text-blue-200/70 text-xs leading-relaxed">{step.matroidNote}</p>
        </div>
      </div>

      {/* Task queue */}
      <div className="card p-5">
        <TaskQueue step={step} stepIdx={stepIdx} />
      </div>

      {/* Current task card (only during evaluation) */}
      {(step.phase === 'accept' || step.phase === 'reject') && (
        <CurrentTaskCard step={step} />
      )}

      {/* Processor grid */}
      <div className="card p-5">
        <ProcessorGrid step={step} />
      </div>

      {/* Window analysis — replaces capacity bars */}
      <div className="card p-5">
        <WindowAnalysis step={step} />
      </div>

      {/* Raw Nt table (collapsible) */}
      <div>
        <button
          onClick={() => setShowNtTable(v => !v)}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
        >
          {showNtTable ? '▲' : '▼'} {showNtTable ? 'Ocultar' : 'Ver'} tabla numérica de Nₜ
        </button>
        {showNtTable && (
          <div className="mt-3 bg-slate-900/70 border border-slate-700/40 rounded-xl p-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <td className="pr-4 py-1.5 text-slate-500 font-medium">t →</td>
                  {step.ntA.map(e => <td key={e.t} className="text-center px-2 py-1.5 font-mono text-slate-500">{e.t}</td>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="pr-4 py-1.5 text-slate-400 font-medium whitespace-nowrap">Nₜ(A)</td>
                  {step.ntA.map(e => <td key={e.t} className="text-center px-2 py-1.5 font-mono text-slate-400">{e.nt}</td>)}
                </tr>
                {(step.phase === 'accept' || step.phase === 'reject') && step.id && (
                  <tr>
                    <td className="pr-4 py-1.5 text-slate-200 font-semibold whitespace-nowrap">Nₜ(A∪{'{'}{T(step.id).label}{'}'})</td>
                    {step.ntC.map(e => (
                      <td key={e.t} className={`text-center px-2 py-1.5 font-mono font-bold rounded ${e.fails ? 'text-red-300 bg-red-950/50' : step.ntA[e.t - 1].nt !== e.nt ? 'text-emerald-300' : 'text-slate-500'}`}>
                        {e.nt}{e.fails ? ' ✗' : ''}
                      </td>
                    ))}
                  </tr>
                )}
                <tr>
                  <td className="pr-4 py-1.5 text-slate-600">límite t</td>
                  {step.ntA.map(e => <td key={e.t} className="text-center px-2 py-1.5 font-mono text-slate-700">{e.t}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Final result cards */}
      {step.phase === 'final' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/15 p-4 space-y-2">
            <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wide">tₑ — A tiempo (penalización = 0)</p>
            <div className="flex flex-wrap gap-1.5">
              {step.A.slice().sort((a, b) => T(a).deadline - T(b).deadline || a - b).map(id => (
                <span key={id} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: `${CLR[id]}20`, color: CLR[id] }}>
                  {T(id).label} (d={T(id).deadline})
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-red-800/40 bg-red-950/15 p-4 space-y-2">
            <p className="text-red-300 text-xs font-semibold uppercase tracking-wide">tₗ — Tardías (penalizadas)</p>
            <div className="flex flex-wrap gap-1.5">
              {FINAL_LATE.map(id => (
                <span key={id} className="text-xs px-2.5 py-1 rounded-full bg-red-950/50 text-red-300 font-medium">
                  {T(id).label} +{T(id).weight}
                </span>
              ))}
            </div>
            <p className="text-red-400 text-sm font-bold">
              Total = {FINAL_LATE.map(id => T(id).weight).join(' + ')} = {FINAL_LATE.reduce((s, id) => s + T(id).weight, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
        <button
          onClick={() => setStepIdx(s => Math.max(0, s - 1))}
          disabled={stepIdx === 0}
          className="px-5 py-2.5 rounded-xl text-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 disabled:opacity-30 hover:bg-slate-600/50 transition-colors font-medium"
        >
          ← Anterior
        </button>
        <div className="flex gap-1.5 flex-1 justify-center flex-wrap">
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => setStepIdx(i)} title={s.heading}
              className={`rounded-full transition-all duration-200 ${
                i === stepIdx ? 'w-7 h-2.5 bg-teal-400' : i < stepIdx
                  ? s.phase === 'reject' ? 'w-2.5 h-2.5 bg-red-600' : 'w-2.5 h-2.5 bg-emerald-600'
                  : 'w-2.5 h-2.5 bg-slate-700'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setStepIdx(s => Math.min(STEPS.length - 1, s + 1))}
          disabled={stepIdx === STEPS.length - 1}
          className="px-5 py-2.5 rounded-xl text-sm bg-teal-600/30 border border-teal-500/30 text-teal-300 disabled:opacity-30 hover:bg-teal-600/50 transition-colors font-medium"
        >
          Siguiente →
        </button>
      </div>
      {stepIdx === STEPS.length - 1 && (
        <div className="text-center">
          <button onClick={() => setStepIdx(0)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">↺ Reiniciar demo</button>
        </div>
      )}
    </div>
  )
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function SchedulingSection() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <div className="relative overflow-hidden pt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/50 via-slate-950 to-cyan-950/30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="section-container relative text-center py-16">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1.5 text-teal-300 text-sm font-medium mb-6">
            <span>⏱</span>
            <span>Ejemplo Final · Matroides en acción · CLRS Cap. 16</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Calendarización de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              Tareas Unitarias
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Un procesador, 7 tareas, deadlines y penalizaciones. ¿Cómo la teoría de matroides nos
            garantiza la calendarización óptima con un simple algoritmo greedy?
          </p>
        </div>
      </div>

      <main className="section-container space-y-14 pt-4">

        {/* Real-world framing */}
        <div className="highlight-box" style={{ backgroundColor: '#0c1a2e', borderColor: '#1e3a5f' }}>
          <div className="flex items-start gap-4">
            <span className="text-3xl shrink-0">🖥️</span>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-base">El escenario</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Imagina que administras un servidor que procesa solicitudes. Cada solicitud (tarea) tarda
                exactamente <strong className="text-white">1 unidad de tiempo</strong>. Cada una tiene una{' '}
                <strong className="text-amber-300">fecha límite</strong> (después de la cual el cliente se molesta)
                y una <strong className="text-red-300">multa</strong> si la entregas tarde. Tu servidor solo puede
                procesar <strong className="text-white">una solicitud por ciclo</strong>.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                La pregunta: <strong className="text-teal-300">¿en qué orden procesas las solicitudes para minimizar las multas totales?</strong>{' '}
                La respuesta involucra matroides y algoritmos greedy.
              </p>
            </div>
          </div>
        </div>

        {/* Terminology */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="tag-teal">Notación</span>
            <h3 className="text-lg font-bold text-white">¿Qué significa cada símbolo?</h3>
          </div>
          <TerminologyLegend />
        </div>

        {/* Problem table */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="tag-amber">Datos del problema</span>
            <h3 className="text-lg font-bold text-white">Las 7 tareas a calendarizar</h3>
          </div>
          <div className="card p-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 pr-4 text-slate-500 font-medium">Tarea</td>
                  {TASKS.map(t => (
                    <td key={t.id} className="py-2 px-3 text-center font-bold" style={{ color: CLR[t.id] }}>{t.label}</td>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                <tr>
                  <td className="py-2.5 pr-4 text-slate-400 text-xs">
                    <span className="text-amber-300 font-semibold">dᵢ</span> — deadline
                  </td>
                  {TASKS.map(t => (
                    <td key={t.id} className="py-2.5 px-3 text-center text-slate-200">{t.deadline}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-slate-400 text-xs">
                    <span className="text-red-300 font-semibold">wᵢ</span> — penalización
                  </td>
                  {TASKS.map(t => (
                    <td key={t.id} className="py-2.5 px-3 text-center font-semibold" style={{ color: CLR[t.id] }}>{t.weight}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-slate-400 text-xs">Slots válidos</td>
                  {TASKS.map(t => (
                    <td key={t.id} className="py-2.5 px-3 text-center text-slate-500 text-xs">1–{t.deadline}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Main interactive demo */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="tag-teal">Interactivo</span>
            <h3 className="text-xl font-bold text-white">GREEDY(M, w) — paso a paso</h3>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Navega cada decisión del algoritmo. En cada paso verás <strong className="text-white">por qué</strong> se
            acepta o rechaza la tarea, qué pasa con el procesador y cómo el criterio de independencia Nₜ ≤ t
            detecta si hay espacio en el calendario.
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

        {/* Final answer */}
        <div className="bg-gradient-to-br from-teal-950/30 to-slate-900/50 border border-teal-800/30 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-white font-bold text-lg">Respuesta óptima — Ejercicio 13</p>
              <p className="text-slate-400 text-sm">La calendarización que minimiza penalizaciones</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <p className="text-slate-300 text-sm font-semibold">Orden canónico de ejecución:</p>
              <div className="flex flex-wrap gap-1.5 items-center">
                {[2, 4, 1, 3, 7, 5, 6].map((id, i) => {
                  const isLate = [5, 6].includes(id)
                  return (
                    <span key={i} className="flex items-center gap-1">
                      <span className="text-sm font-bold px-3 py-1.5 rounded-lg border transition-colors"
                        style={{ borderColor: isLate ? '#7f1d1d' : CLR[id], backgroundColor: isLate ? '#450a0a30' : `${CLR[id]}18`, color: isLate ? '#fca5a5' : CLR[id] }}>
                        {T(id).label}
                      </span>
                      {i < 6 && <span className="text-slate-700 text-xs">→</span>}
                    </span>
                  )
                })}
              </div>
              <p className="text-slate-500 text-xs font-mono">⟨a₂, a₄, a₁, a₃, a₇, a₅, a₆⟩</p>
              <p className="text-slate-500 text-xs">Los últimos 2 (en rojo) llegan tarde y pagan penalización.</p>
            </div>
            <div className="formula-box text-xs space-y-2">
              <p className="text-slate-400 font-semibold mb-2">Desglose de penalización:</p>
              <p className="text-emerald-300">tₑ = {'{'} a₂, a₄, a₁, a₃, a₇ {'}'}</p>
              <p className="text-slate-500 text-xs">→ ejecutadas a tiempo → penalización = 0</p>
              <p className="text-red-300 mt-2">tₗ = {'{'} a₅, a₆ {'}'}</p>
              <p className="text-slate-500 text-xs">→ tardías → w₅ + w₆ = 30 + 20</p>
              <div className="border-t border-slate-700 pt-2 mt-2">
                <p className="text-white font-bold text-base">Penalización mínima = 50</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm mt-16">
        <p>Laboratorio Interactivo · Análisis y Diseño de Algoritmos · Universidad del Valle de Guatemala</p>
        <p className="mt-1 text-xs text-slate-600">Basado en CLRS — Introduction to Algorithms, Cap. 16</p>
      </footer>

    </div>
  )
}
