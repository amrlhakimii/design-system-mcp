#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { generatePalette, paletteAsCssVars, paletteAsTailwindTheme, normalizeHex, hexToHsl } from './palette.js'
import { COMPONENTS, FOUNDATIONS, DARK_TOKENS, globalCss, listComponents, type Theme } from './rules.js'
import { reviewUi, formatFindings } from './review.js'

const server = new McpServer({ name: 'design-system-mcp', version: '0.1.0' })

const themeSchema = z.enum(['dark', 'light']).default('dark').describe('dark = Hootang (default reference), light = UbatLog variant')

const text = (t: string) => ({ content: [{ type: 'text' as const, text: t }] })
const fail = (t: string) => ({ content: [{ type: 'text' as const, text: t }], isError: true })

function overview(): string {
  const f = FOUNDATIONS
  return [
    '# Personal design system',
    '',
    f.principle,
    '',
    '## Core tokens (dark, Hootang)',
    ...Object.entries(f.tokensDark).map(([k, v]) => `- ${k}: ${v}`),
    '',
    '## Palette',
    f.palette,
    '',
    '## Fonts',
    `- Body: ${f.fonts.body}`,
    `- Display: ${f.fonts.display}`,
    '',
    '## Rounding scale',
    ...Object.entries(f.rounding).map(([k, v]) => `- ${k}: ${v}`),
    '',
    '## Surfaces',
    f.surfaces,
    '',
    '## Glow',
    f.glow,
    '',
    '## Motion',
    f.motion,
    '',
    '## Micro-details',
    ...f.microDetails.map((d) => `- ${d}`),
    '',
    '## Signature',
    f.signature,
    '',
    `Components: ${listComponents().join(', ')}. Use get_component_rules for exact class strings.`,
  ].join('\n')
}

server.registerTool(
  'generate_palette',
  {
    title: 'Generate palette',
    description:
      'Turn one accent hex into the 8-stop brand scale (50-800) with the same hue and saturation. Returns CSS variables, a Tailwind v4 @theme block, or JSON.',
    inputSchema: {
      accent_hex: z.string().describe('Accent colour, e.g. #ff4081 or #0d9488'),
      format: z.enum(['css', 'tailwind', 'json']).default('tailwind').describe('Output format'),
      name: z.string().default('brand').describe('Token name prefix'),
    },
  },
  async ({ accent_hex, format, name }) => {
    try {
      const palette = generatePalette(accent_hex)
      if (format === 'json') return text(JSON.stringify(palette, null, 2))
      if (format === 'css') return text(`:root {\n${paletteAsCssVars(palette, name)}\n}`)
      return text(paletteAsTailwindTheme(palette, name))
    } catch (e) {
      return fail((e as Error).message)
    }
  },
)

server.registerTool(
  'get_foundations',
  {
    title: 'Get foundations',
    description: 'Fonts, rounding scale, surfaces, motion, micro-details and the eyebrow-label signature.',
    inputSchema: {},
  },
  async () => text(overview()),
)

server.registerTool(
  'list_components',
  { title: 'List components', description: 'Names of the components that have documented rules.', inputSchema: {} },
  async () => text(listComponents().join('\n')),
)

server.registerTool(
  'get_component_rules',
  {
    title: 'Get component rules',
    description: 'Exact class strings and rules for a component (button, card, modal, input, nav, tabs, badge, section-header, toast, empty-state, skeleton, avatar) in the dark Hootang theme or the light variant.',
    inputSchema: {
      component: z.string().describe('Component name, see list_components'),
      theme: themeSchema,
    },
  },
  async ({ component, theme }) => {
    const c = COMPONENTS[component.trim().toLowerCase()]
    if (!c) return fail(`Unknown component "${component}". Available: ${listComponents().join(', ')}`)
    return text([`# ${c.name} (${theme})`, c.summary, '', 'Classes:', c.classes[theme as Theme], '', 'Rules:', ...c.rules.map((r) => `- ${r}`)].join('\n'))
  },
)

server.registerTool(
  'get_starter_css',
  {
    title: 'Get starter CSS',
    description:
      'A ready index.css for a new Tailwind v4 project: theme tokens from an accent hex, fonts, keyframes, tap-highlight, scrollbar, skeleton shimmer and (light) the eyebrow-label class. Defaults to the Hootang dark theme.',
    inputSchema: {
      accent_hex: z.string().default(DARK_TOKENS.accent).describe('Accent colour, default Hootang teal #00ADB5'),
      theme: themeSchema,
    },
  },
  async ({ accent_hex, theme }) => {
    try {
      const palette = generatePalette(accent_hex)
      const hsl = hexToHsl(normalizeHex(accent_hex))
      const css = globalCss(paletteAsCssVars(palette), theme as Theme)
      return text(`${css}\n/* accent ${normalizeHex(accent_hex)} = hsl(${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%) */\n`)
    } catch (e) {
      return fail((e as Error).message)
    }
  },
)

server.registerTool(
  'review_ui',
  {
    title: 'Review UI',
    description:
      'Check a JSX/HTML snippet against the design system and list violations with fixes (flat cards, focus rings, missing press animation, bare empty states, etc.). Reads class strings only.',
    inputSchema: { code: z.string().describe('JSX, TSX or HTML snippet to review'), theme: themeSchema },
  },
  async ({ code, theme }) => text(formatFindings(reviewUi(code, theme as Theme))),
)

server.registerResource(
  'design-system-overview',
  'design-system://overview',
  { title: 'Design system overview', description: 'Foundations and principles in one document', mimeType: 'text/markdown' },
  async (uri) => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: overview() }] }),
)

const transport = new StdioServerTransport()
await server.connect(transport)
