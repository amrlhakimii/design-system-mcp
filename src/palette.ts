// One accent hex -> 8-stop scale with the same hue and saturation throughout.

export type Stop = 50 | 100 | 200 | 300 | 500 | 600 | 700 | 800

const STOPS: Stop[] = [50, 100, 200, 300, 500, 600, 700, 800]

export interface Hsl {
  h: number
  s: number
  l: number
}

export function normalizeHex(input: string): string {
  let hex = input.trim().replace(/^#/, '')
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error(`Invalid hex colour "${input}". Use #rgb or #rrggbb.`)
  }
  return `#${hex.toLowerCase()}`
}

export function hexToHsl(hex: string): Hsl {
  const n = normalizeHex(hex).slice(1)
  const r = parseInt(n.slice(0, 2), 16) / 255
  const g = parseInt(n.slice(2, 4), 16) / 255
  const b = parseInt(n.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  let s = 0
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s: s * 100, l: l * 100 }
}

export function hslToHex({ h, s, l }: Hsl): string {
  const sat = s / 100
  const lig = l / 100
  const c = (1 - Math.abs(2 * lig - 1)) * sat
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lig - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Lightness per stop: tints are fixed lightness values, shades step down from the base. */
function lightnessFor(stop: Stop, base: number): number {
  switch (stop) {
    case 50: return 96
    case 100: return 90
    case 200: return 80
    case 300: return 70
    case 500:
    case 600: return base
    case 700: return clamp(base - 15, 5, 95)
    case 800: return clamp(base - 30, 3, 90)
  }
}

export function generatePalette(accentHex: string): Record<Stop, string> {
  const hsl = hexToHsl(accentHex)
  const out = {} as Record<Stop, string>
  for (const stop of STOPS) {
    out[stop] = hslToHex({ h: hsl.h, s: hsl.s, l: lightnessFor(stop, hsl.l) })
  }
  return out
}

export function paletteAsCssVars(palette: Record<Stop, string>, name = 'brand'): string {
  return STOPS.map((s) => `  --color-${name}-${s}: ${palette[s]};`).join('\n')
}

export function paletteAsTailwindTheme(palette: Record<Stop, string>, name = 'brand'): string {
  return `@theme {\n${paletteAsCssVars(palette, name)}\n}`
}
