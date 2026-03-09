import { useState, useCallback } from 'react'

interface Edge {
  id: string
  from: string
  to: string
  weight: number
  status: 'pending' | 'accepted' | 'rejected' | 'current'
}

interface Node {
  id: string
  x: number
  y: number
  component: number
}

// Union-Find
class UnionFind {
  private parent: Record<string, string> = {}
  private rank: Record<string, number> = {}

  constructor(nodes: string[]) {
    nodes.forEach(n => { this.parent[n] = n; this.rank[n] = 0 })
  }

  find(x: string): string {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x])
    return this.parent[x]
  }

  union(x: string, y: string): boolean {
    const px = this.find(x), py = this.find(y)
    if (px === py) return false
    if (this.rank[px] < this.rank[py]) this.parent[px] = py
    else if (this.rank[px] > this.rank[py]) this.parent[py] = px
    else { this.parent[py] = px; this.rank[px]++ }
    return true
  }

  getComponents(): Record<string, number> {
    const comps: Record<string, number> = {}
    const roots: Record<string, number> = {}
    let nextId = 0
    Object.keys(this.parent).forEach(n => {
      const root = this.find(n)
      if (!(root in roots)) roots[root] = nextId++
      comps[n] = roots[root]
    })
    return comps
  }
}

const INITIAL_NODES: Node[] = [
  { id: 'A', x: 120, y: 80, component: 0 },
  { id: 'B', x: 280, y: 60, component: 1 },
  { id: 'C', x: 200, y: 200, component: 2 },
  { id: 'D', x: 370, y: 180, component: 3 },
  { id: 'E', x: 430, y: 80, component: 4 },
  { id: 'F', x: 310, y: 300, component: 5 },
]

const EDGES_DATA: Omit<Edge, 'status'>[] = [
  { id: 'BC', from: 'B', to: 'C', weight: 1 },
  { id: 'AС', from: 'A', to: 'C', weight: 2 },
  { id: 'DE', from: 'D', to: 'E', weight: 2 },
  { id: 'EF', from: 'E', to: 'F', weight: 3 },
  { id: 'AB', from: 'A', to: 'B', weight: 4 },
  { id: 'BD', from: 'B', to: 'D', weight: 5 },
  { id: 'DF', from: 'D', to: 'F', weight: 6 },
  { id: 'CD', from: 'C', to: 'D', weight: 8 },
  { id: 'CE', from: 'C', to: 'E', weight: 10 },
]

const COMPONENT_COLORS = [
  '#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4',
]

function getNodePos(id: string, nodes: Node[]) {
  return nodes.find(n => n.id === id)!
}

export default function KruskalViz() {
  const sortedEdges = [...EDGES_DATA].sort((a, b) => a.weight - b.weight)

  const [step, setStep] = useState(-1)
  const [edges, setEdges] = useState<Edge[]>(
    sortedEdges.map(e => ({ ...e, status: 'pending' as const }))
  )
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES)
  const [uf, setUf] = useState(() => new UnionFind(INITIAL_NODES.map(n => n.id)))
  const [mstWeight, setMstWeight] = useState(0)
  const [log, setLog] = useState<string[]>(['Listo para comenzar. Presiona "Siguiente paso" para ver el algoritmo de Kruskal.'])
  const [done, setDone] = useState(false)

  const reset = useCallback(() => {
    setStep(-1)
    setEdges(sortedEdges.map(e => ({ ...e, status: 'pending' as const })))
    setNodes(INITIAL_NODES.map(n => ({ ...n })))
    setUf(new UnionFind(INITIAL_NODES.map(n => n.id)))
    setMstWeight(0)
    setLog(['Listo para comenzar. Presiona "Siguiente paso" para ver el algoritmo de Kruskal.'])
    setDone(false)
  }, [])

  const nextStep = useCallback(() => {
    const nextIdx = step + 1
    if (nextIdx >= sortedEdges.length) {
      setDone(true)
      return
    }

    const edge = sortedEdges[nextIdx]

    setEdges(prev => prev.map((e, i) => {
      if (i === nextIdx) return { ...e, status: 'current' }
      if (i < nextIdx && e.status === 'current') return { ...e, status: 'pending' }
      return e
    }))

    // Check if adding creates cycle
    const canAdd = uf.find(edge.from) !== uf.find(edge.to)

    if (canAdd) {
      uf.union(edge.from, edge.to)
      const comps = uf.getComponents()
      setNodes(prev => prev.map(n => ({ ...n, component: comps[n.id] })))
      setMstWeight(prev => prev + edge.weight)
      setEdges(prev => prev.map((e, i) => {
        if (i === nextIdx) return { ...e, status: 'accepted' }
        return e
      }))
      setLog(prev => [...prev, `✅ Arista (${edge.from}-${edge.to}, w=${edge.weight}) ACEPTADA → no forma ciclo. Peso MST: ${mstWeight + edge.weight}`])
    } else {
      setEdges(prev => prev.map((e, i) => {
        if (i === nextIdx) return { ...e, status: 'rejected' }
        return e
      }))
      setLog(prev => [...prev, `❌ Arista (${edge.from}-${edge.to}, w=${edge.weight}) RECHAZADA → formaría un ciclo`])
    }

    setStep(nextIdx)

    if (nextIdx === sortedEdges.length - 1) {
      setDone(true)
      setLog(prev => [...prev, '🎉 ¡Algoritmo terminado! Se encontró el árbol de expansión mínima.'])
    }
  }, [step, uf, mstWeight, sortedEdges])

  const runAll = useCallback(() => {
    let currentStep = step
    const newUf = new UnionFind(INITIAL_NODES.map(n => n.id))
    // Reapply accepted edges from previous steps
    sortedEdges.slice(0, currentStep + 1).forEach(e => {
      const prev = edges.find(edge => edge.id === e.id)
      if (prev?.status === 'accepted') newUf.union(e.from, e.to)
    })
    let weight = mstWeight
    const newEdges = [...edges]
    const logs: string[] = [...log]

    for (let i = currentStep + 1; i < sortedEdges.length; i++) {
      const edge = sortedEdges[i]
      const canAdd = newUf.find(edge.from) !== newUf.find(edge.to)
      if (canAdd) {
        newUf.union(edge.from, edge.to)
        weight += edge.weight
        newEdges[i] = { ...newEdges[i], status: 'accepted' }
        logs.push(`✅ Arista (${edge.from}-${edge.to}, w=${edge.weight}) ACEPTADA`)
      } else {
        newEdges[i] = { ...newEdges[i], status: 'rejected' }
        logs.push(`❌ Arista (${edge.from}-${edge.to}, w=${edge.weight}) RECHAZADA`)
      }
    }
    logs.push(`🎉 ¡Algoritmo terminado! Peso total MST: ${weight}`)

    const comps = newUf.getComponents()
    setNodes(INITIAL_NODES.map(n => ({ ...n, component: comps[n.id] })))
    setEdges(newEdges)
    setMstWeight(weight)
    setLog(logs)
    setStep(sortedEdges.length - 1)
    setDone(true)
    setUf(newUf)
  }, [step, edges, log, mstWeight, sortedEdges])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={nextStep} disabled={done} className="btn-primary text-sm">
          ▶ Siguiente paso
        </button>
        <button onClick={runAll} disabled={done} className="btn-success text-sm">
          ⏭ Ejecutar todo
        </button>
        <button onClick={reset} className="btn-secondary text-sm">
          ↺ Reiniciar
        </button>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-slate-400">Paso:</span>
          <span className="text-white font-bold">{step + 1} / {sortedEdges.length}</span>
          {mstWeight > 0 && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Peso MST:</span>
              <span className="text-emerald-400 font-bold">{mstWeight}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Graph visualization */}
        <div className="lg:col-span-3 card p-4">
          <p className="text-xs text-slate-500 mb-3 font-medium">GRAFO G(V, E)</p>
          <svg viewBox="0 0 560 380" className="w-full" style={{ minHeight: 250 }}>
            {/* Background */}
            <rect width="560" height="380" fill="transparent" />

            {/* Edges */}
            {edges.map((edge) => {
              const from = getNodePos(edge.from, nodes)
              const to = getNodePos(edge.to, nodes)
              const mx = (from.x + to.x) / 2
              const my = (from.y + to.y) / 2

              const color =
                edge.status === 'accepted' ? '#10b981' :
                edge.status === 'rejected' ? '#ef4444' :
                edge.status === 'current' ? '#f59e0b' :
                '#334155'

              const strokeWidth =
                edge.status === 'accepted' ? 3 :
                edge.status === 'current' ? 2.5 :
                1.5

              const opacity = edge.status === 'pending' ? 0.4 : 1

              return (
                <g key={edge.id}>
                  <line
                    x1={from.x} y1={from.y}
                    x2={to.x} y2={to.y}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                    strokeDasharray={edge.status === 'rejected' ? '5,3' : undefined}
                    className={edge.status === 'accepted' ? 'edge-animate' : ''}
                  />
                  {/* Weight label */}
                  <rect
                    x={mx - 11} y={my - 10}
                    width={22} height={18}
                    rx={4}
                    fill={edge.status === 'accepted' ? '#064e3b' :
                          edge.status === 'rejected' ? '#450a0a' :
                          edge.status === 'current' ? '#451a03' :
                          '#1e293b'}
                    stroke={color}
                    strokeWidth={1}
                    opacity={opacity}
                  />
                  <text
                    x={mx} y={my + 3}
                    textAnchor="middle"
                    fontSize={10}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="600"
                    fill={color}
                    opacity={opacity}
                  >
                    {edge.weight}
                  </text>
                </g>
              )
            })}

            {/* Nodes */}
            {nodes.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.x} cy={node.y} r={20}
                  fill={`${COMPONENT_COLORS[node.component % COMPONENT_COLORS.length]}22`}
                  stroke={COMPONENT_COLORS[node.component % COMPONENT_COLORS.length]}
                  strokeWidth={2}
                />
                <text
                  x={node.x} y={node.y + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight="700"
                  fill="white"
                  fontFamily="Inter, sans-serif"
                >
                  {node.id}
                </text>
              </g>
            ))}
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3 text-xs">
            {[
              { color: '#10b981', label: 'Añadida al MST', dash: false },
              { color: '#ef4444', label: 'Rechazada (ciclo)', dash: true },
              { color: '#f59e0b', label: 'Evaluando ahora', dash: false },
              { color: '#334155', label: 'No evaluada aún', dash: false },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <svg width={20} height={10}>
                  <line
                    x1={0} y1={5} x2={20} y2={5}
                    stroke={item.color}
                    strokeWidth={2}
                    strokeDasharray={item.dash ? '4,2' : undefined}
                  />
                </svg>
                <span className="text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edge list (sorted) */}
        <div className="lg:col-span-2 card p-4">
          <p className="text-xs text-slate-500 mb-3 font-medium">ARISTAS ORDENADAS POR PESO ↑</p>
          <div className="space-y-1.5">
            {edges.map((edge, i) => (
              <div
                key={edge.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                  edge.status === 'accepted' ? 'bg-emerald-900/40 border border-emerald-700/50' :
                  edge.status === 'rejected' ? 'bg-red-900/30 border border-red-800/50 opacity-60' :
                  edge.status === 'current' ? 'bg-amber-900/40 border border-amber-600/50 ring-1 ring-amber-500/30' :
                  'bg-slate-800/30 border border-slate-700/30'
                }`}
              >
                <span className="text-slate-500 w-4 text-xs text-right">{i + 1}.</span>
                <span className="font-mono font-semibold text-white">
                  {edge.from}–{edge.to}
                </span>
                <span className={`ml-auto font-mono font-bold ${
                  edge.status === 'accepted' ? 'text-emerald-400' :
                  edge.status === 'rejected' ? 'text-red-400' :
                  edge.status === 'current' ? 'text-amber-400' :
                  'text-slate-400'
                }`}>
                  w={edge.weight}
                </span>
                <span className="text-lg">
                  {edge.status === 'accepted' ? '✅' :
                   edge.status === 'rejected' ? '❌' :
                   edge.status === 'current' ? '👀' : '⬜'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log */}
      <div className="card p-4">
        <p className="text-xs text-slate-500 mb-2 font-medium">REGISTRO DE EJECUCIÓN</p>
        <div className="space-y-1 max-h-36 overflow-y-auto">
          {log.map((entry, i) => (
            <p key={i} className={`text-xs font-mono ${
              entry.startsWith('✅') ? 'text-emerald-400' :
              entry.startsWith('❌') ? 'text-red-400' :
              entry.startsWith('🎉') ? 'text-blue-300 font-semibold' :
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
