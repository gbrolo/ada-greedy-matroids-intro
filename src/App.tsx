import { useState, useEffect } from 'react'
import IntroSection from './sections/IntroSection'
import MSTSection from './sections/MSTSection'
import BookingSection from './sections/BookingSection'
import MatroidSection from './sections/MatroidSection'
import GreedySection from './sections/GreedySection'
import ConsoleSection from './sections/ConsoleSection'

const NAV_ITEMS = [
  { id: 'intro', label: 'Intro', icon: '🌱' },
  { id: 'mst', label: 'MST', icon: '🌲' },
  { id: 'booking', label: 'Hospedajes', icon: '🏨' },
  { id: 'matroids', label: 'Matroides', icon: '⚡' },
  { id: 'greedy', label: 'GREEDY(M,w)', icon: '🔁' },
  { id: 'console', label: 'Consola', icon: '💻' },
]

export default function App() {
  const [activeSection, setActiveSection] = useState('intro')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      // Update active section based on scroll position
      const sections = NAV_ITEMS.map(item => document.getElementById(item.id))
      const current = sections.reduce((acc, section) => {
        if (!section) return acc
        const rect = section.getBoundingClientRect()
        if (rect.top <= 120) return section.id
        return acc
      }, 'intro')
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
              ADA
            </div>
            <div>
              <p className="text-xs text-slate-400 leading-none">Análisis y Diseño de Algoritmos</p>
              <p className="text-sm font-semibold text-white leading-tight">Greedy & Matroides</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
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
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-slate-950 to-purple-950/50 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="section-container relative text-center py-20">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-300 text-sm font-medium mb-6">
            <span>📚</span>
            <span>Laboratorio Interactivo · UVG</span>
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

      {/* Main content */}
      <main>
        <IntroSection />
        <MSTSection />
        <BookingSection />
        <MatroidSection />
        <GreedySection />
        <ConsoleSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>Laboratorio Interactivo · Análisis y Diseño de Algoritmos · Universidad del Valle de Guatemala</p>
        <p className="mt-1 text-xs text-slate-600">Basado en CLRS — Introduction to Algorithms</p>
      </footer>
    </div>
  )
}
