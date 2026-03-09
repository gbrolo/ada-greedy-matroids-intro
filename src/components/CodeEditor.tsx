import { useRef, useCallback } from 'react'

// ── Tokenizer ──────────────────────────────────────────────────────────────

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'class', 'return', 'if', 'else',
  'for', 'while', 'do', 'new', 'this', 'typeof', 'instanceof', 'in', 'of',
  'import', 'export', 'default', 'interface', 'type', 'extends', 'implements',
  'private', 'public', 'protected', 'readonly', 'static', 'abstract',
  'async', 'await', 'try', 'catch', 'finally', 'throw', 'break', 'continue',
  'switch', 'case', 'true', 'false', 'null', 'undefined', 'void', 'never',
])

const BUILTIN_TYPES = new Set([
  'string', 'number', 'boolean', 'any', 'unknown', 'object', 'symbol',
  'Map', 'Set', 'Array', 'Promise', 'Record', 'Partial', 'Required',
])

type TokenType =
  | 'keyword' | 'type' | 'string' | 'template' | 'comment'
  | 'number' | 'classname' | 'fn' | 'other'

interface Token { type: TokenType; value: string }

function tokenize(code: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < code.length) {
    // Line comment
    if (code[i] === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i)
      const value = end === -1 ? code.slice(i) : code.slice(i, end)
      tokens.push({ type: 'comment', value })
      i += value.length
      continue
    }

    // Block comment
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2)
      const value = end === -1 ? code.slice(i) : code.slice(i, end + 2)
      tokens.push({ type: 'comment', value })
      i += value.length
      continue
    }

    // Template literal
    if (code[i] === '`') {
      let j = i + 1
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue }
        if (code[j] === '`') { j++; break }
        j++
      }
      tokens.push({ type: 'template', value: code.slice(i, j) })
      i = j
      continue
    }

    // Double-quoted string
    if (code[i] === '"') {
      let j = i + 1
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue }
        if (code[j] === '"') { j++; break }
        j++
      }
      tokens.push({ type: 'string', value: code.slice(i, j) })
      i = j
      continue
    }

    // Single-quoted string
    if (code[i] === "'") {
      let j = i + 1
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue }
        if (code[j] === "'") { j++; break }
        j++
      }
      tokens.push({ type: 'string', value: code.slice(i, j) })
      i = j
      continue
    }

    // Number
    if (/[0-9]/.test(code[i]) && (i === 0 || !/[\w$]/.test(code[i - 1]))) {
      let j = i
      while (j < code.length && /[0-9._]/.test(code[j])) j++
      tokens.push({ type: 'number', value: code.slice(i, j) })
      i = j
      continue
    }

    // Identifier / keyword / type / class / function call
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i
      while (j < code.length && /[\w$]/.test(code[j])) j++
      const word = code.slice(i, j)
      let type: TokenType = 'other'
      if (KEYWORDS.has(word))          type = 'keyword'
      else if (BUILTIN_TYPES.has(word)) type = 'type'
      else if (/^[A-Z]/.test(word))    type = 'classname'
      else if (code[j] === '(')        type = 'fn'
      tokens.push({ type, value: word })
      i = j
      continue
    }

    tokens.push({ type: 'other', value: code[i] })
    i++
  }

  return tokens
}

// VS Code Dark+ inspired palette
const TOKEN_COLOR: Record<TokenType, string> = {
  keyword:   '#569cd6',   // blue
  type:      '#4ec9b0',   // teal
  string:    '#ce9178',   // orange
  template:  '#ce9178',   // orange
  comment:   '#6a9955',   // green
  number:    '#b5cea8',   // light green
  classname: '#4ec9b0',   // teal (types / class names)
  fn:        '#dcdcaa',   // yellow
  other:     '',          // default (#d4d4d4 via CSS)
}

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlight(code: string): string {
  return tokenize(code).map(({ type, value }) => {
    const escaped = escHtml(value)
    const color = TOKEN_COLOR[type]
    return color ? `<span style="color:${color}">${escaped}</span>` : escaped
  }).join('')
}

// ── Component ──────────────────────────────────────────────────────────────

interface CodeEditorProps {
  value: string
  onChange: (v: string) => void
  onRun?: () => void
  minHeight?: number
}

export default function CodeEditor({ value, onChange, onRun, minHeight = 480 }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const lineCount = value.split('\n').length

  const syncScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop
      preRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.currentTarget
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = value.substring(0, start) + '  ' + value.substring(end)
      onChange(next)
      setTimeout(() => { el.selectionStart = el.selectionEnd = start + 2 }, 0)
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onRun?.()
    }
  }

  const FONT = "'JetBrains Mono', Consolas, 'Courier New', monospace"
  const FONT_SIZE = 12
  const LINE_H = 20

  return (
    <div style={{ display: 'flex', fontFamily: FONT, fontSize: FONT_SIZE, lineHeight: `${LINE_H}px` }}>
      {/* Line numbers */}
      <div
        className="select-none bg-slate-950/60 border-r border-slate-700/30 text-right shrink-0"
        style={{ padding: '16px 10px 16px 8px', minWidth: 44 }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} style={{ color: '#4b5563', lineHeight: `${LINE_H}px` }}>{i + 1}</div>
        ))}
      </div>

      {/* Highlighted layer + transparent textarea overlay */}
      <div className="relative flex-1" style={{ minHeight, backgroundColor: 'rgba(2,6,23,0.4)' }}>
        {/* Highlighted pre — sits behind, pointer-events none */}
        <pre
          ref={preRef}
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            margin: 0, padding: 16,
            fontFamily: FONT, fontSize: FONT_SIZE, lineHeight: `${LINE_H}px`,
            color: '#d4d4d4',
            background: 'transparent',
            whiteSpace: 'pre',
            wordBreak: 'normal',
            overflowWrap: 'normal',
            overflow: 'auto',
            pointerEvents: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: highlight(value) + '\u200b' }}
        />

        {/* Editable textarea — transparent text, white caret */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            padding: 16, margin: 0,
            fontFamily: FONT, fontSize: FONT_SIZE, lineHeight: `${LINE_H}px`,
            color: 'transparent',
            caretColor: '#ffffff',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            whiteSpace: 'pre',
            overflowWrap: 'normal',
            overflow: 'auto',
          }}
        />
      </div>
    </div>
  )
}
