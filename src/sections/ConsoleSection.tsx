import { useState, useRef } from 'react'
import CodeEditor from '../components/CodeEditor'

// ─── Matroid implementations (used for code generation + actual execution) ───

const MST_CODE = `// ═══════════════════════════════════════════════════════
// IMPLEMENTACIÓN: MST como Matroide Gráfica
// ═══════════════════════════════════════════════════════

// Interfaz de la Matroide
interface Matroid<T> {
  S: T[];              // Conjunto base con pesos
  weights: Map<T, number>;
  isIndependent: (subset: T[]) => boolean;
}

// Union-Find para detectar ciclos
class UnionFind {
  private parent: Map<string, string>;
  private rank: Map<string, number>;

  constructor(nodes: string[]) {
    this.parent = new Map(nodes.map(n => [n, n]));
    this.rank = new Map(nodes.map(n => [n, 0]));
  }

  find(x: string): string {
    if (this.parent.get(x) !== x) {
      this.parent.set(x, this.find(this.parent.get(x)!));
    }
    return this.parent.get(x)!;
  }

  union(x: string, y: string): boolean {
    const px = this.find(x), py = this.find(y);
    if (px === py) return false; // ya conectados
    const rx = this.rank.get(px)!, ry = this.rank.get(py)!;
    if (rx < ry) this.parent.set(px, py);
    else if (rx > ry) this.parent.set(py, px);
    else { this.parent.set(py, px); this.rank.set(px, rx + 1); }
    return true;
  }
}

// Tipo para aristas
type Edge = { from: string; to: string; weight: number; id: string };

// Construir la Matroide Gráfica para MST
function buildGraphicMatroid(nodes: string[], edges: Edge[]): Matroid<Edge> {
  const weights = new Map(edges.map(e => [e, e.weight]));

  // I = conjuntos acíclicos de aristas (bosques)
  const isIndependent = (subset: Edge[]): boolean => {
    const uf = new UnionFind(nodes);
    for (const edge of subset) {
      if (!uf.union(edge.from, edge.to)) return false; // ciclo!
    }
    return true;
  };

  return { S: edges, weights, isIndependent };
}

// GREEDY(M, w) — algoritmo general para matroides ponderadas
// (Para MST, usamos orden ASCENDENTE porque queremos mínimo)
function greedyMatroid<T>(matroid: Matroid<T>, maximize = true): T[] {
  const A: T[] = [];

  // Ordenar por peso (desc para maximizar, asc para minimizar)
  const sorted = [...matroid.S].sort((a, b) => {
    const wa = matroid.weights.get(a) ?? 0;
    const wb = matroid.weights.get(b) ?? 0;
    return maximize ? wb - wa : wa - wb;
  });

  console.log("Orden de evaluación:");

  for (const x of sorted) {
    const w = matroid.weights.get(x) ?? 0;
    const candidate = [...A, x];

    if (matroid.isIndependent(candidate)) {
      A.push(x);
      console.log(\`  ✅ Aceptado: peso=\${w}\`);
    } else {
      console.log(\`  ❌ Rechazado: peso=\${w} (crearía ciclo)\`);
    }
  }

  return A;
}

// ─── EJECUTAR EN EL GRAFO DE EJEMPLO ───
const nodes = ["A", "B", "C", "D", "E", "F"];
const edges: Edge[] = [
  { id: "AB", from: "A", to: "B", weight: 4 },
  { id: "AC", from: "A", to: "C", weight: 2 },
  { id: "BC", from: "B", to: "C", weight: 1 },
  { id: "BD", from: "B", to: "D", weight: 5 },
  { id: "CD", from: "C", to: "D", weight: 8 },
  { id: "CE", from: "C", to: "E", weight: 10 },
  { id: "DE", from: "D", to: "E", weight: 2 },
  { id: "DF", from: "D", to: "F", weight: 6 },
  { id: "EF", from: "E", to: "F", weight: 3 },
];

const graphMatroid = buildGraphicMatroid(nodes, edges);
console.log("=== MST via GREEDY(M, w) ===");
console.log(\`Grafo: \${nodes.length} nodos, \${edges.length} aristas\\n\`);

// Para MST usamos minimize (maximize = false)
const mst = greedyMatroid(graphMatroid, false);

console.log("\\n=== RESULTADO ===");
console.log(\`MST tiene \${mst.length} aristas:\`);
let totalWeight = 0;
for (const edge of mst) {
  console.log(\`  (\${edge.from}-\${edge.to}) peso=\${edge.weight}\`);
  totalWeight += edge.weight;
}
console.log(\`Peso total del MST: \${totalWeight}\`);
`

const BOOKING_CODE = `// ═══════════════════════════════════════════════════════
// IMPLEMENTACIÓN: Hospedajes como Matroide Uniforme
// ═══════════════════════════════════════════════════════

// Interfaz de la Matroide
interface Matroid<T> {
  S: T[];
  weights: Map<T, number>;
  isIndependent: (subset: T[]) => boolean;
}

// Tipo para hospedaje
type Hotel = { id: number; name: string; rating: number };

// Construir Matroide Uniforme de rango k
// I = todos los subconjuntos de tamaño <= k
function buildUniformMatroid(hotels: Hotel[], k: number): Matroid<Hotel> {
  const weights = new Map(hotels.map(h => [h, h.rating]));

  // I = cualquier subconjunto de tamaño <= k
  const isIndependent = (subset: Hotel[]): boolean => subset.length <= k;

  return { S: hotels, weights, isIndependent };
}

// GREEDY(M, w) — algoritmo general para matroides ponderadas
function greedyMatroid<T>(matroid: Matroid<T>, maximize = true): T[] {
  const A: T[] = [];

  const sorted = [...matroid.S].sort((a, b) => {
    const wa = matroid.weights.get(a) ?? 0;
    const wb = matroid.weights.get(b) ?? 0;
    return maximize ? wb - wa : wa - wb;
  });

  console.log("Evaluando en orden de calificación (mayor a menor):");

  for (const x of sorted) {
    const w = matroid.weights.get(x) ?? 0;
    if (matroid.isIndependent([...A, x])) {
      A.push(x);
      console.log(\`  ✅ Seleccionado: peso=\${w}\`);
    } else {
      console.log(\`  ❌ Saltado: ya tenemos k=\${A.length} seleccionados\`);
    }
  }

  return A;
}

// ─── DATOS Y EJECUCIÓN ───
const k = 3; // Cambiar este valor para probar con diferente k

const hotels: Hotel[] = [
  { id: 1, name: "Hotel Sol Dorado", rating: 4.8 },
  { id: 2, name: "Posada El Tigre", rating: 3.2 },
  { id: 3, name: "Resort Azul", rating: 4.5 },
  { id: 4, name: "Hostal El Quetzal", rating: 2.7 },
  { id: 5, name: "Gran Hotel Tikal", rating: 4.9 },
  { id: 6, name: "Casa del Viajero", rating: 3.8 },
  { id: 7, name: "Villa Xocomil", rating: 4.2 },
  { id: 8, name: "Bungalows Río", rating: 1.9 },
];

const uniformMatroid = buildUniformMatroid(hotels, k);
console.log(\`=== Problema de Hospedajes via GREEDY(M, w) ===\`);
console.log(\`Buscando los mejores k=\${k} hospedajes de \${hotels.length} disponibles\`);
console.log("");

const selected = greedyMatroid(uniformMatroid, true);

console.log("\\n=== RESULTADO ===");
console.log(\`Top-\${k} hospedajes seleccionados:\`);
let totalRating = 0;
for (const h of selected) {
  console.log(\`  \${h.name}: ⭐ \${h.rating}\`);
  totalRating += h.rating;
}
console.log(\`\\nSuma total de calificaciones: \${totalRating.toFixed(1)}\`);
console.log(\`Promedio: \${(totalRating / k).toFixed(2)}\`);
`

// Strip TypeScript syntax so the code can run as plain JavaScript
function stripTypeScript(code: string): string {
  return code
    // 1. Remove interface blocks — handles generics: interface Foo<T> { ... }
    .replace(/\binterface\s+\w+(\s*<[^>]*>)?\s*\{[^{}]*\}/gs, '')
    // 2. Remove type aliases with object bodies: type X = { ... };
    .replace(/\btype\s+\w+(\s*<[^>]*>)?\s*=\s*\{[^}]*\};?/gm, '')
    // 3. Remove simple type aliases: type X = A | B;
    .replace(/\btype\s+\w+(\s*<[^>]*>)?\s*=[^;{][^\n]*;/gm, '')
    // 4. Remove generics from function declarations: function foo<T>(...)
    .replace(/\b(function\s+\w+)\s*<[^>]+>/g, '$1')
    // 5. Remove access modifiers
    .replace(/\b(private|protected|public|readonly)\s+/g, '')
    // 6. Remove return type annotations before { or =>
    //    e.g. ): Matroid<Edge> {  or  ): boolean => {
    .replace(/\)\s*:\s*[\w<>[\], |&.]+(?=\s*(?:=>)?\s*[\n{])/g, ')')
    // 7. Remove type annotations with generics: : Map<K, V>, : Matroid<T>, etc.
    .replace(/:\s*\w+\s*<[^>]+>(\s*\[\])?/g, '')
    // 8. Remove primitive type annotations: : string, : number[], etc.
    .replace(/:\s*(string|number|boolean|void|any|never|unknown)(\s*\[\])?/g, '')
    // 9. Remove remaining custom type annotations (PascalCase): : Edge[], : T[], etc.
    .replace(/:\s*[A-Z]\w*(\s*\[\])?/g, '')
    // 10. Remove TypeScript non-null assertions: expr! → expr (keep !== and !=)
    .replace(/([)\]}\w])!(?!=)/g, '$1')
}

// Execute JavaScript code safely and capture output
function executeCode(code: string): { output: string[]; error: string | null } {
  const captured: string[] = []
  const originalLog = console.log

  console.log = (...args: unknown[]) => {
    captured.push(args.map(a => {
      if (typeof a === 'object') return JSON.stringify(a, null, 2)
      return String(a)
    }).join(' '))
  }

  try {
    const jsCode = stripTypeScript(code)
    // eslint-disable-next-line no-new-func
    const fn = new Function(jsCode)
    fn()
    return { output: captured, error: null }
  } catch (err) {
    return {
      output: captured,
      error: err instanceof Error ? err.message : String(err)
    }
  } finally {
    console.log = originalLog
  }
}

interface TabProps {
  label: string
  icon: string
  active: boolean
  onClick: () => void
}

function Tab({ label, icon, active, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2 ${
        active
          ? 'text-blue-300 border-blue-500 bg-slate-800/60'
          : 'text-slate-400 border-transparent hover:text-slate-300 hover:border-slate-600'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

export default function ConsoleSection() {
  const [activeTab, setActiveTab] = useState<'mst' | 'booking'>('mst')
  const [mstCode, setMstCode] = useState(MST_CODE.trim())
  const [bookingCode, setBookingCode] = useState(BOOKING_CODE.trim())
  const [mstOutput, setMstOutput] = useState<string[]>([])
  const [bookingOutput, setBookingOutput] = useState<string[]>([])
  const [mstError, setMstError] = useState<string | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  const code = activeTab === 'mst' ? mstCode : bookingCode
  const setCode = activeTab === 'mst' ? setMstCode : setBookingCode
  const output = activeTab === 'mst' ? mstOutput : bookingOutput
  const error = activeTab === 'mst' ? mstError : bookingError

  const run = () => {
    setRunning(true)
    setTimeout(() => {
      const result = executeCode(code)
      if (activeTab === 'mst') {
        setMstOutput(result.output)
        setMstError(result.error)
      } else {
        setBookingOutput(result.output)
        setBookingError(result.error)
      }
      setRunning(false)
      setTimeout(() => {
        outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' })
      }, 50)
    }, 100)
  }

  const reset = () => {
    if (activeTab === 'mst') {
      setMstCode(MST_CODE.trim())
      setMstOutput([])
      setMstError(null)
    } else {
      setBookingCode(BOOKING_CODE.trim())
      setBookingOutput([])
      setBookingError(null)
    }
  }

  return (
    <section id="console" className="section-container">
      <div className="section-divider mb-16" />

      <div className="flex items-center gap-3 mb-2">
        <span className="tag-blue">Sección 6</span>
        <span className="tag-emerald">Interactivo</span>
      </div>
      <h2 className="section-title">Consola TypeScript interactiva</h2>
      <p className="section-subtitle">Implementaciones de ambos problemas usando matroides</p>

      {/* Intro */}
      <div className="highlight-box mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💻</span>
          <div>
            <h3 className="text-blue-300 font-semibold mb-1">¿Qué hay en la consola?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Aquí encontrarás implementaciones completas en TypeScript de ambos problemas utilizando
              la abstracción de <strong>matroides ponderadas</strong> y el algoritmo genérico{' '}
              <span className="font-mono">GREEDY(M, w)</span>. Puedes modificar el código — por ejemplo,
              cambiar los pesos de las aristas o el valor de <span className="font-mono">k</span> — y
              ejecutarlo para ver los resultados en tiempo real.
            </p>
            <p className="text-slate-400 text-xs mt-2">
              💡 Tip: usa <kbd className="bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded text-xs font-mono">Ctrl+Enter</kbd> para ejecutar rápido.
            </p>
          </div>
        </div>
      </div>

      {/* Main console */}
      <div className="card overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-0 px-4 pt-3 bg-slate-800/30 border-b border-slate-700/50">
          <Tab
            label="MST (Kruskal)"
            icon="🌲"
            active={activeTab === 'mst'}
            onClick={() => setActiveTab('mst')}
          />
          <Tab
            label="Hospedajes (Top-k)"
            icon="🏨"
            active={activeTab === 'booking'}
            onClick={() => setActiveTab('booking')}
          />
          <div className="ml-auto flex items-center gap-2 pb-2">
            <button
              onClick={reset}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              ↺ Restaurar
            </button>
            <button
              onClick={run}
              disabled={running}
              className="btn-success text-sm flex items-center gap-2"
            >
              {running ? (
                <>
                  <span className="animate-spin inline-block">⟳</span>
                  Ejecutando...
                </>
              ) : (
                <>▶ Ejecutar</>
              )}
            </button>
          </div>
        </div>

        {/* Editor area */}
        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-700/50">
          {/* Code editor */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/40 border-b border-slate-700/30">
              <span className="text-slate-500 text-xs font-mono">
                {activeTab === 'mst' ? 'mst-matroid.ts' : 'booking-matroid.ts'}
              </span>
              <span className="ml-auto text-slate-600 text-xs">{code.split('\n').length} líneas</span>
            </div>
            <CodeEditor value={code} onChange={setCode} onRun={run} minHeight={480} />
          </div>

          {/* Output */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/40 border-b border-slate-700/30">
              <span className="text-slate-500 text-xs font-mono">Salida de consola</span>
              {output.length > 0 && (
                <span className="ml-auto text-slate-600 text-xs">{output.length} líneas</span>
              )}
            </div>
            <div
              ref={outputRef}
              className="flex-1 bg-slate-950/60 p-4 overflow-auto font-mono text-xs leading-5"
              style={{ minHeight: 480 }}
            >
              {output.length === 0 && !error ? (
                <div className="text-slate-600 flex flex-col items-center justify-center h-full gap-2">
                  <span className="text-3xl">▶</span>
                  <p>Presiona "Ejecutar" para ver la salida</p>
                </div>
              ) : (
                <>
                  {output.map((line, i) => (
                    <p
                      key={i}
                      className={`${
                        line.includes('✅') ? 'text-emerald-400' :
                        line.includes('❌') ? 'text-red-400' :
                        line.includes('===') ? 'text-blue-300 font-semibold' :
                        line.includes('⭐') ? 'text-amber-300' :
                        line.startsWith('  ') ? 'text-slate-400' :
                        'text-slate-200'
                      }`}
                    >
                      {line || '\u00A0'}
                    </p>
                  ))}
                  {error && (
                    <div className="mt-2 p-3 bg-red-950/40 border border-red-800/50 rounded-lg">
                      <p className="text-red-400 font-semibold text-xs mb-1">Error:</p>
                      <p className="text-red-300 text-xs">{error}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="mt-8 card p-6">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <span>🏋️</span> Ejercicios para practicar
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              tab: 'mst',
              icon: '🌲',
              title: 'MST',
              exercises: [
                'Cambia los pesos de las aristas y observa cómo cambia el MST.',
                'Agrega una nueva arista y verifica si entra al MST.',
                'Modifica el grafo para que tenga pesos iguales. ¿Qué pasa?',
                '(Avanzado) Implementa el algoritmo de Prim usando una matroide diferente.',
              ]
            },
            {
              tab: 'booking',
              icon: '🏨',
              title: 'Hospedajes',
              exercises: [
                'Cambia el valor de k (línea: const k = 3) y ejecuta.',
                'Agrega un nuevo hotel con calificación 5.0 y verifica.',
                'Prueba con k = 0 y k = hotels.length.',
                '(Avanzado) Modifica isIndependent para una restricción diferente.',
              ]
            }
          ].map(section => (
            <div key={section.tab} className="space-y-3">
              <h4 className="text-white font-medium flex items-center gap-2 text-sm">
                <span>{section.icon}</span>
                Ejercicios — {section.title}
              </h4>
              <ul className="space-y-2">
                {section.exercises.map((ex, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-blue-500 mt-0.5 shrink-0">{i + 1}.</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setActiveTab(section.tab as 'mst' | 'booking')}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Ir a {section.title} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 bg-gradient-to-br from-blue-950/40 via-slate-800/40 to-purple-950/40 border border-blue-800/30 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <span>🎓</span> Resumen de la lección
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '⚡', title: 'Greedy = rápido', desc: 'Toma la mejor decisión local en cada paso sin revisar el pasado.' },
            { icon: '🌲', title: 'MST es greedy', desc: 'Kruskal ordena aristas y acepta las que no crean ciclos.' },
            { icon: '🏨', title: 'Hospedajes es greedy', desc: 'Ordena por calificación y toma los primeros k.' },
            { icon: '⭐', title: 'Matroides garantizan optimalidad', desc: 'Si el problema tiene estructura de matroide, greedy es óptimo.' },
          ].map(item => (
            <div key={item.title} className="flex flex-col gap-2">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-white font-medium text-sm">{item.title}</p>
              <p className="text-slate-400 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
