import { useState, useEffect } from 'react'
import IntroSection from './sections/IntroSection'
import MSTSection from './sections/MSTSection'
import BookingSection from './sections/BookingSection'
import MatroidSection from './sections/MatroidSection'
import GreedySection from './sections/GreedySection'
import ConsoleSection from './sections/ConsoleSection'
import Day2Section from './sections/Day2Section'

const DAY1_NAV = [
  { id: 'intro', label: 'Intro', icon: '🌱' },
  { id: 'mst', label: 'MST', icon: '🌲' },
  { id: 'booking', label: 'Hospedajes', icon: '🏨' },
  { id: 'matroids', label: 'Matroides', icon: '⚡' },
  { id: 'greedy', label: 'GREEDY(M,w)', icon: '🔁' },
  { id: 'console', label: 'Consola', icon: '💻' },
]

export default function App() {
  const [day, setDay] = useState<1 | 2>(1)
  const [activeSection, setActiveSection] = useState('intro')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Reset scroll position and active section when switching days
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setActiveSection('intro')
  }, [day])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      if (day === 1) {
        const sections = DAY1_NAV.map(item => document.getElementById(item.id))
        const current = sections.reduce((acc, section) => {
          if (!section) return acc
          const rect = section.getBoundingClientRect()
          if (rect.top <= 120) return section.id
          return acc
        }, 'intro')
        setActiveSection(current)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [day])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-xl shadow-black/20'
            : 'bg-slate-900/80 backdrop-blur-sm border-b border-slate-800/50'
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
              ADA
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-slate-400 leading-none">Análisis y Diseño de Algoritmos</p>
              <p className="text-sm font-semibold text-white leading-tight">Greedy & Matroides</p>
            </div>
          </div>

          {/* Day tabs */}
          <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1 border border-slate-700/40">
            <button
              onClick={() => setDay(1)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                day === 1
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Día 1
            </button>
            <button
              onClick={() => setDay(2)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                day === 2
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Día 2
            </button>
          </div>

          {/* Day 1 section nav (only visible on day 1, md+) */}
          {day === 1 && (
            <nav className="hidden md:flex items-center gap-1">
              {DAY1_NAV.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                    activeSection === item.id
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          )}

          {day === 2 && (
            <div className="hidden md:flex items-center gap-2">
              <span className="tag-purple">Demostraciones formales</span>
              <span className="tag-emerald">Subestructura óptima</span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="pt-14">
        {day === 1 ? (
          <>
            {/* Day 1 Hero */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-slate-950 to-purple-950/50 pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="section-container relative text-center py-20">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-300 text-sm font-medium mb-6">
                  <span>📚</span>
                  <span>Día 1 · Laboratorio Interactivo · UVG</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                  Algoritmos{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    Greedy
                  </span>{' '}
                  y<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Matroides
                  </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                  Aprende cuándo los algoritmos greedy garantizan la solución óptima y cómo la estructura matemática de las matroides lo justifica.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={() => scrollTo('intro')} className="btn-primary text-base px-8 py-3">
                    Comenzar lección →
                  </button>
                  <button onClick={() => scrollTo('console')} className="btn-secondary text-base px-8 py-3">
                    Ir a la consola
                  </button>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
                  <span>🌲 Árbol de expansión mínima</span>
                  <span>🏨 Problema de hospedajes</span>
                  <span>⚡ Matroides ponderadas</span>
                  <span>💻 Consola interactiva</span>
                </div>
              </div>
            </div>

            {/* Day 1 sections */}
            <main>
              <IntroSection />
              <MSTSection />
              <BookingSection />
              <MatroidSection />
              <GreedySection />
              <ConsoleSection />
            </main>

            <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
              <p>Laboratorio Interactivo · Análisis y Diseño de Algoritmos · Universidad del Valle de Guatemala</p>
              <p className="mt-1 text-xs text-slate-600">Basado en CLRS — Introduction to Algorithms</p>
            </footer>
          </>
        ) : (
          <Day2Section />
        )}
      </div>
    </div>
  )
}
