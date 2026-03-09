# Algoritmos Greedy y Matroides — Laboratorio Interactivo

> Laboratorio educativo interactivo para el curso de **Análisis y Diseño de Algoritmos (ADA)** — Universidad del Valle de Guatemala.

Basado en el material de *Introduction to Algorithms* (CLRS), este laboratorio enseña cuándo los algoritmos greedy garantizan la solución óptima y cómo la estructura matemática de las **matroides ponderadas** lo justifica.

---

## Vista previa

| Sección | Descripción |
|---|---|
| 🌱 **Introducción** | Motivación para algoritmos greedy vs. programación dinámica |
| 🌲 **MST — Kruskal** | Visualización paso a paso del algoritmo con Union-Find y detección de ciclos |
| 🏨 **Hospedajes** | Problema top-k con animación de ordenamiento y selección greedy |
| ⚡ **Matroides** | Definición formal, propiedades hereditaria e intercambio con demos interactivas |
| 🔁 **GREEDY(M, w)** | Algoritmo genérico con pseudocódigo interactivo y visualización |
| 💻 **Consola TypeScript** | Editor con syntax highlighting (tema VS Code Dark+) y ejecución en vivo |

---

## Tecnologías

- **React 18** + **Vite 5**
- **TypeScript 5**
- **Tailwind CSS 3**
- Visualizaciones con **SVG nativo**
- Ejecución de TypeScript en browser (transpilación en tiempo real con stripeo de tipos)
- Sin dependencias de librerías de UI externas

---

## Instalación y uso local

```bash
# Clonar el repositorio
git clone https://github.com/gbrolo/ada-greedy-matroids-intro.git
cd ada-greedy-matroids-intro

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

### Otros comandos

```bash
npm run build     # Build de producción → ./dist
npm run preview   # Previsualizar el build de producción
```

---

## Estructura del proyecto

```
src/
├── App.tsx                        # Layout principal + navegación sticky
├── index.css                      # Estilos globales (Tailwind + custom)
├── main.tsx                       # Punto de entrada React
│
├── sections/                      # Secciones de la lección (en orden)
│   ├── IntroSection.tsx           # Sección 1 — Introducción
│   ├── MSTSection.tsx             # Sección 2 — MST & Kruskal
│   ├── BookingSection.tsx         # Sección 3 — Problema de hospedajes
│   ├── MatroidSection.tsx         # Sección 4 — Matroides ponderadas
│   ├── GreedySection.tsx          # Sección 5 — GREEDY(M, w)
│   └── ConsoleSection.tsx         # Sección 6 — Consola interactiva
│
└── components/
    ├── KruskalViz.tsx             # Visualización del algoritmo de Kruskal
    ├── BookingViz.tsx             # Visualización del problema top-k
    └── CodeEditor.tsx             # Editor con syntax highlighting
```

---

## Funcionalidades destacadas

### Visualización de Kruskal (MST)

- Grafo con 6 nodos y 9 aristas renderizado en SVG
- Aristas ordenadas por peso y evaluadas una a una
- Colores por componente (Union-Find visual): cada árbol del bosque tiene un color distinto
- Aristas: verde = aceptada al MST, rojo = rechazada (crea ciclo), amarillo = evaluando ahora
- Controles: paso a paso, ejecutar todo, reiniciar
- Log en tiempo real de cada decisión greedy

### Visualización de Hospedajes (Top-k)

- 8 hoteles con calificaciones
- Slider para ajustar `k` (1–8) dinámicamente
- Animación de las dos fases: ordenamiento → selección
- Avance paso a paso o ejecución completa

### Demos interactivas de Matroides

- **Propiedad hereditaria**: selecciona elementos, verifica que todos sus subconjuntos también son independientes
- **Propiedad de intercambio**: construye conjuntos A y B, observa qué elemento de B-A puede extender A

### Consola TypeScript con syntax highlighting

El editor implementa un tokenizador propio con el tema **VS Code Dark+**:

| Token | Color |
|---|---|
| Keywords (`const`, `function`, `interface`…) | `#569cd6` azul |
| Tipos primitivos (`string`, `number`…) | `#4ec9b0` teal |
| Strings y template literals | `#ce9178` naranja |
| Comentarios | `#6a9955` verde |
| Números | `#b5cea8` verde claro |
| Nombres de clase/tipo (PascalCase) | `#4ec9b0` teal |
| Llamadas a función | `#dcdcaa` amarillo |

La ejecución en browser funciona mediante:
1. Stripeo de sintaxis TypeScript (interfaces, type aliases, anotaciones de tipo, generics, modificadores de acceso, non-null assertions)
2. Ejecución con `new Function()` en un contexto aislado
3. Captura de `console.log` para mostrar la salida

Ambas implementaciones (MST y Hospedajes) usan la misma interfaz de **matroide ponderada** y el mismo algoritmo `GREEDY(M, w)`.

---

## Conceptos cubiertos

### Algoritmos Greedy
- Qué son y cuándo son óptimos
- Decisión greedy como selección del elemento de mayor peso en cada paso

### Árbol de Expansión Mínima (MST)
- Definición de árbol, spanning tree, MST
- Algoritmo de Kruskal con Union-Find
- Complejidad: O(E log E) por el ordenamiento

### Problema de Hospedajes (Top-k)
- Selección de k elementos con mayor suma de pesos
- Solución: ordenar descendentemente y tomar los primeros k

### Matroides Ponderadas `M = (S, I)`
- **S**: conjunto base con función de pesos `w: S → ℝ⁺`
- **I**: familia de subconjuntos independientes
- **Propiedad hereditaria**: `A ∈ I, B ⊆ A ⟹ B ∈ I`
- **Propiedad de intercambio**: `A, B ∈ I, |B| > |A| ⟹ ∃x ∈ (B-A) : A∪{x} ∈ I`

### Algoritmo GREEDY(M, w)
```
A = ∅
sort M.S in decreasing order by weight w
for each x ∈ M.S:
    if A ∪ {x} ∈ M.I:
        A = A ∪ {x}
return A
```
Garantiza el subconjunto independiente de **máximo peso total** para cualquier matroide válida.

---

## Deploy en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Vercel detecta automáticamente Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. ¡Listo!

O desde la CLI:
```bash
npx vercel
```

---

## Créditos

- Contenido basado en **CLRS** — *Introduction to Algorithms*, 3rd Edition (Cormen, Leiserson, Rivest, Stein)
- Desarrollado para el curso **Análisis y Diseño de Algoritmos** — Universidad del Valle de Guatemala
