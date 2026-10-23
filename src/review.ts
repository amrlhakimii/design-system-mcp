// Heuristic linter: checks a JSX/HTML/CSS snippet against the design system rules.
// It reads class strings only, so it catches the common drift, not every possible one.

export interface Finding {
  rule: string
  severity: 'error' | 'warn'
  line: number
  message: string
  fix: string
}

interface Tag {
  name: string
  attrs: string
  classes: string
  dynamic: boolean
  line: number
}

const TAG_NAMES = new Set(['button', 'input', 'select', 'textarea', 'label', 'div', 'section', 'article', 'a', 'nav', 'span'])
const CLASS_RE = /class(?:Name)?=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{'([^']*)'\}|\{"([^"]*)"\})/s

function lineOf(code: string, index: number): number {
  return code.slice(0, index).split('\n').length
}

/** Read the attribute text of an opening tag, skipping braces and quotes so `=>` inside handlers does not end it. */
function readOpeningTag(code: string, start: number): { name: string; attrs: string } | null {
  const m = /^<([a-zA-Z][\w-]*)/.exec(code.slice(start, start + 40))
  if (!m || !TAG_NAMES.has(m[1])) return null
  let i = start + m[0].length
  let depth = 0
  let quote: string | null = null
  const from = i
  for (; i < code.length; i++) {
    const ch = code[i]
    if (quote) {
      if (ch === quote && code[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch
    else if (ch === '{') depth++
    else if (ch === '}') depth--
    else if (ch === '>' && depth <= 0) return { name: m[1], attrs: code.slice(from, i) }
  }
  return null
}

function extractTags(code: string): Tag[] {
  const tags: Tag[] = []
  for (let i = code.indexOf('<'); i !== -1; i = code.indexOf('<', i + 1)) {
    const t = readOpeningTag(code, i)
    if (!t) continue
    const cm = CLASS_RE.exec(t.attrs)
    const classes = cm ? (cm[1] ?? cm[2] ?? cm[3] ?? cm[4] ?? cm[5] ?? '') : ''
    // Classes built from variables (`${baseClass}`, `{cls}`) cannot be fully read, so absence checks are skipped.
    const raw = cm ? cm[0] : ''
    const dynamic = /\$\{[A-Za-z_][\w.]*(\[[^\]]*\])?\}/.test(raw) || (!cm && /className=\{[A-Za-z_]/.test(t.attrs))
    tags.push({ name: t.name, attrs: t.attrs, classes, dynamic, line: lineOf(code, i) })
  }
  return tags
}

const esc = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const has = (classes: string, token: string | RegExp) =>
  typeof token === 'string' ? new RegExp(`(?<![\\w:/-])${esc(token)}(?![\\w-])`).test(classes) : token.test(classes)

export function reviewUi(code: string, theme: 'dark' | 'light' = 'dark'): Finding[] {
  const out: Finding[] = []
  const add = (f: Finding) => out.push(f)

  for (const tag of extractTags(code)) {
    const c = tag.classes

    // Focus ring is banned everywhere: focus is a border colour change.
    if (/\bfocus(-visible)?:ring/.test(c)) {
      add({
        rule: 'input-focus-ring',
        severity: 'error',
        line: tag.line,
        message: 'Focus ring used. This system changes the border colour on focus instead of adding a ring.',
        fix: "Replace focus:ring-* with 'focus:border-brand-500 focus:bg-white focus:outline-none transition-colors'.",
      })
    }

    if (tag.name === 'button' || (/\bonClick\b/.test(tag.attrs) && !/stopPropagation/.test(tag.attrs))) {
      const scrim = /\bfixed\b/.test(c) && /\binset-0\b/.test(c)
      if (!tag.dynamic && !scrim && !has(c, 'cursor-pointer') && tag.name !== 'label') {
        add({
          rule: 'cursor-pointer',
          severity: 'warn',
          line: tag.line,
          message: 'Interactive element has no explicit cursor-pointer (Tailwind does not add it).',
          fix: 'Add cursor-pointer.',
        })
      }
    }

    if (tag.name === 'button') {
      const solidAccent = /\bbg-(brand|blue|indigo|pink|rose|violet|purple|teal|emerald|green)-(500|600|700)\b/.test(c)
      const cta = /\bbg-gradient-/.test(c) || /\bshadow-\[/.test(c) || solidAccent
      if (!tag.dynamic && cta && !/\bactive:scale-/.test(c)) {
        add({
          rule: 'button-press',
          severity: 'warn',
          line: tag.line,
          message: 'Button has no press animation.',
          fix: "Add 'active:scale-95 transition-all duration-150'.",
        })
      }
      if (!tag.dynamic && solidAccent && !/bg-gradient-/.test(c)) {
        add({
          rule: 'button-gradient',
          severity: 'warn',
          line: tag.line,
          message: 'Primary button uses a flat accent fill.',
          fix: "Use 'bg-gradient-to-r from-brand-500 to-brand-700' with an accent-tinted shadow-[0_4px_14px_rgba(...)].",
        })
      }
      if (cta && /\brounded(-md|-lg|-sm)?\b/.test(c) && !/\brounded-(xl|2xl|3xl|full)\b/.test(c) && !/\bpx-3 py-1\.5\b/.test(c)) {
        add({
          rule: 'button-rounding',
          severity: 'warn',
          line: tag.line,
          message: 'Button rounding is below rounded-xl.',
          fix: 'Use rounded-xl (rounded-lg is only for the sm size).',
        })
      }
    }

    if (tag.name === 'input' || tag.name === 'select' || tag.name === 'textarea') {
      const recessed = theme === 'dark' ? /\bbg-(\[#222831\]|primary)(?![\w-])/.test(c) : /\bbg-gray-50\b/.test(c)
      if (!tag.dynamic && !recessed) {
        add({
          rule: 'input-recessed',
          severity: 'warn',
          line: tag.line,
          message: 'Field is not recessed.',
          fix:
            theme === 'dark'
              ? "Use 'bg-[#222831] border border-[#393E46] text-[#EEEEEE]' (page background inside a secondary border)."
              : "Use 'bg-gray-50 border border-gray-200 focus:bg-white'.",
        })
      }
      if (!tag.dynamic && !/\brounded-xl\b/.test(c)) {
        add({
          rule: 'input-rounding',
          severity: 'warn',
          line: tag.line,
          message: 'Field should be rounded-xl.',
          fix: 'Use rounded-xl.',
        })
      }
    }

    if (tag.name === 'label' && !/label-eyebrow/.test(c) && !(/\buppercase\b/.test(c) && /\btracking-/.test(c))) {
      add({
        rule: 'label-eyebrow',
        severity: 'warn',
        line: tag.line,
        message: 'Label is not an eyebrow label.',
        fix:
          theme === 'dark'
            ? "Use 'block text-xs text-[#EEEEEE]/50 mb-1 uppercase tracking-wider'."
            : "Use 'label-eyebrow mb-1 block' (11px, semibold, tracking .08em, uppercase).",
      })
    }

    // Overlay / modal
    if (/\bfixed\b/.test(c) && /\binset-0\b/.test(c) && /\bbg-black\//.test(c) && !/\bbackdrop-blur/.test(c)) {
      add({
        rule: 'modal-overlay-blur',
        severity: 'warn',
        line: tag.line,
        message: 'Modal overlay has no blur.',
        fix: "Use 'bg-black/40 backdrop-blur-sm'.",
      })
    }
    if (/\bmax-w-(xs|sm|md|lg|xl|2xl)\b/.test(c) && /\bshadow-(xl|2xl)\b/.test(c) && !/\brounded-(3xl|\[20px\])\b/.test(c) && !/rounded-t-\[20px\]/.test(c)) {
      add({
        rule: 'modal-rounding',
        severity: 'warn',
        line: tag.line,
        message: 'Modal panel should be rounded-3xl with animate-modal-in.',
        fix: "Use 'rounded-3xl animate-modal-in'.",
      })
    }

    // Cards: any bordered + shadowed surface
    const looksLikeCard = /\bborder\b/.test(c) && /\bshadow(-|\b)/.test(c) && /\brounded-/.test(c) && !/\bfixed\b/.test(c) && tag.name !== 'button'
    if (looksLikeCard && !/max-w-/.test(c)) {
      const flat = /\bbg-(white|gray-\d+|slate-\d+|zinc-\d+|neutral-\d+|\[#[0-9a-fA-F]{3,8}\])(?![\w/])/.test(c)
      if (flat && !/\bbackdrop-blur/.test(c) && !/backdropFilter/.test(tag.attrs)) {
        add({
          rule: 'card-translucent',
          severity: 'warn',
          line: tag.line,
          message: 'Card is flat and opaque.',
          fix:
            theme === 'dark'
              ? "Use a translucent surface: rgba(57,62,70,0.6) + backdrop blur(8px) + 1px rgba(238,238,238,0.06) border."
              : "Use 'bg-white/90 backdrop-blur-sm border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]'.",
        })
      }
      if (!/\brounded-(2xl|3xl)\b/.test(c)) {
        add({
          rule: 'card-rounding',
          severity: 'warn',
          line: tag.line,
          message: 'Card should be rounded-2xl.',
          fix: 'Use rounded-2xl.',
        })
      }
    }
  }

  // Copy: bare empty states
  for (const m of code.matchAll(/>\s*(No (?:data|results?|items?|records?)(?: found| available)?|Nothing (?:here|found))\.?\s*</gi)) {
    add({
      rule: 'empty-state-copy',
      severity: 'warn',
      line: lineOf(code, m.index ?? 0),
      message: `Bare empty state "${m[1]}".`,
      fix: 'Show an emoji and one line of personality copy, e.g. a short friendly sentence.',
    })
  }

  return out.sort((a, b) => a.line - b.line)
}

export function formatFindings(findings: Finding[]): string {
  if (findings.length === 0) {
    return 'No design-system violations found by the heuristic checks. (This reads class strings only, so also eyeball spacing, fonts and copy.)'
  }
  const errors = findings.filter((f) => f.severity === 'error').length
  const head = `${findings.length} finding(s), ${errors} error(s):\n`
  return (
    head +
    findings
      .map((f) => `- line ${f.line} [${f.severity}] ${f.rule}: ${f.message}\n  fix: ${f.fix}`)
      .join('\n')
  )
}
