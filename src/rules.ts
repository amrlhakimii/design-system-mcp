// The design system as data. Hootang (dark, teal) is the primary reference;
// UbatLog (light, pink) is the light variant of the same structure.

export type Theme = 'dark' | 'light'

export const DARK_TOKENS = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#00ADB5',
  accentDeep: '#008f96',
  accentBright: '#00c2cb',
  light: '#EEEEEE',
  modalSheet: '#2d3440',
}

export const FOUNDATIONS = {
  principle:
    'The structure is the signature, not the specific colours. One accent hex drives the palette; everything else is shape, type, motion and micro-details. Hootang (dark, teal) is the reference implementation.',
  tokensDark: {
    '--color-primary': `${DARK_TOKENS.primary}  (page background, recessed fields, tab tracks)`,
    '--color-secondary': `${DARK_TOKENS.secondary}  (cards base, borders, scrollbar thumb)`,
    '--color-accent': `${DARK_TOKENS.accent}  (single accent; 8-stop scale via generate_palette)`,
    '--color-light': `${DARK_TOKENS.light}  (text; use /60 for headings-muted, /50 labels, /30 sub-copy)`,
  },
  palette:
    'One accent hex -> 8-stop HSL scale (50, 100, 200, 300, 500, 600, 700, 800), same hue and saturation throughout. 50~96%L, 100~90%L, 200~80%L, 300~70%L, 500/600 = base, 700 = base minus 15%L, 800 = base minus 30%L.',
  fonts: {
    body: "Clean sans: Satoshi (Fontshare) in Hootang, or Plus Jakarta Sans via Google Fonts as a drop-in.",
    display: "Bold, extrabold, tight-tracking display font for headings and the wordmark: Syne 400/600/700/800 (Google Fonts). Apply to h1-h3.",
    tailwind: "--font-sans: 'Satoshi', system-ui, sans-serif;\n--font-display: 'Syne', system-ui, sans-serif;",
  },
  rounding: {
    'rounded-xl': 'buttons, inputs, tab tracks',
    'rounded-2xl': 'cards',
    'rounded-[20px]': 'modals (rounded-3xl in the light variant)',
    'rounded-full': 'pills, avatars, nav, badges, circular close buttons, toasts',
  },
  surfaces:
    'Never flat opaque cards. Translucent background + backdrop blur + hairline border + soft ambient shadow. Dark: rgba(57,62,70,0.6) + blur(8px) + 1px rgba(238,238,238,0.06). Light: bg-white/90 + backdrop-blur-sm + border-black/5.',
  glow: 'Accent shadows are tinted with the accent RGB (0.3 opacity at rest). Active nav items get a gradient fill and a 16px accent glow.',
  motion:
    'Quick, springy, short. Hootang uses small GSAP entrances (navbar fade from -14px, floating nav back.out(1.7), modals scale .96 + y10 over 0.28s power2.out, mobile sheets slide up 0.38s). For small apps prefer CSS keyframes: fade-up (0.3s ease-out, translateY 8px) and modal-in (0.18s ease-out, scale .97). Add skeleton-shimmer for loading. Do not pull in GSAP or framer-motion unless the project is genuinely animation-heavy.',
  microDetails: [
    'Thin accent-hover custom scrollbar (4px, thumb secondary, hover accent).',
    '-webkit-tap-highlight-color: transparent on everything.',
    'touch-action: manipulation on button, a and [role=button].',
    'Explicit cursor-pointer on every interactive element (Tailwind does not default this).',
    'Inputs use font-size 16px (prevents iOS zoom on focus).',
    'Touch targets: min-h-11 on mobile, sm:min-h-0 on desktop.',
    'Escape closes modals; mobile modals are bottom sheets (rounded-t-[20px]), desktop are centred.',
    'Floating pill nav at the bottom, respecting env(safe-area-inset-bottom).',
  ],
  signature:
    'The uppercase tracked-out "eyebrow" label above every field and section is a key signature of this system.',
} as const

export interface ComponentRule {
  name: string
  summary: string
  classes: Record<Theme, string>
  rules: string[]
}

export const COMPONENTS: Record<string, ComponentRule> = {
  button: {
    name: 'button',
    summary: 'Gradient accent button with a glow-tinted shadow and a press animation.',
    classes: {
      dark:
        "primary: 'bg-gradient-to-r from-[#00ADB5] to-[#008f96] hover:from-[#00c2cb] hover:to-[#00ADB5] text-[#222831] font-semibold shadow-[0_4px_14px_rgba(0,173,181,0.3)]'\n" +
        "secondary: 'bg-[#393E46]/80 hover:bg-[#44494f] text-[#EEEEEE] border border-white/8'\n" +
        "danger: 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20'\n" +
        "ghost: 'bg-transparent hover:bg-white/5 text-[#EEEEEE]/60 hover:text-[#EEEEEE]'\n" +
        "base: 'inline-flex items-center gap-2 transition-all duration-150 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'\n" +
        "sizes: sm 'px-3 py-1.5 min-h-11 sm:min-h-0 text-sm rounded-lg', md 'px-4 py-2 min-h-11 sm:min-h-0 text-sm rounded-xl', lg 'px-6 py-3 text-base rounded-xl'",
      light:
        "primary: 'bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-[0_4px_14px_rgba(R,G,B,0.35)] hover:shadow-[0_6px_18px_rgba(R,G,B,0.45)] hover:brightness-105'\n" +
        "secondary: 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'\n" +
        "ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-800'\n" +
        "danger: 'bg-red-600 text-white shadow-[0_4px_14px_rgba(220,38,38,0.3)] hover:bg-red-700'\n" +
        "base: 'inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100'",
    },
    rules: [
      'Primary is a gradient, never a flat fill. Dark: accent -> deeper accent with dark text. Light: brand-500 -> brand-700 with white text.',
      'Shadow is tinted with the accent RGB at ~30-35% opacity.',
      'transition-all duration-150, cursor-pointer, active:scale-95; disabled = opacity-50 + cursor-not-allowed.',
      'rounded-xl for md/lg; rounded-lg only for sm.',
      'Secondary/danger use translucent tints with a hairline border.',
    ],
  },
  card: {
    name: 'card',
    summary: 'Translucent, blurred, softly shadowed surface.',
    classes: {
      dark:
        "'rounded-2xl p-5' + style { background: 'rgba(57,62,70,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(238,238,238,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }\n" +
        "clickable: add 'cursor-pointer transition-all hover:border-[#00ADB5]/40'",
      light: "'rounded-2xl border border-black/5 bg-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm'",
    },
    rules: [
      'rounded-2xl, never rounded-lg for cards.',
      'Translucent background plus backdrop blur, hairline border, soft ambient shadow. No flat opaque cards.',
      'Clickable cards brighten the border to the accent at ~40% on hover.',
    ],
  },
  modal: {
    name: 'modal',
    summary: 'Blurred scrim, rounded sheet with an accent-tinted border, fade+scale entrance (bottom sheet on mobile).',
    classes: {
      dark:
        "wrapper: 'fixed inset-0 flex items-end md:items-center justify-center md:p-6' zIndex 9999, closes on backdrop click and Escape\n" +
        "scrim: style { background: 'rgba(10,14,20,0.6)', backdropFilter: 'blur(6px)' }\n" +
        "sheet: 'relative w-full md:max-w-md rounded-t-[20px] md:rounded-[20px]' style { background: '#2d3440', border: '1px solid rgba(0,173,181,0.2)', boxShadow: '0 -8px 40px rgba(0,0,0,0.6)', overflow: 'hidden' }\n" +
        "entrance: desktop scale .96 + y10 -> 1 in 0.28s power2.out; mobile slides up from 100% in 0.38s power3.out\n" +
        "close: circular X icon button top-right",
      light:
        "overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm'\n" +
        "panel: 'w-full max-w-sm animate-modal-in rounded-3xl border border-black/5 bg-white p-6 shadow-2xl'\n" +
        "title: 'font-display text-lg font-bold text-gray-900'\n" +
        "close: 'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700'",
    },
    rules: [
      'Scrim is blurred. Panel is large-rounded (20px dark / rounded-3xl light).',
      'Dark sheet border is the accent at 20% opacity.',
      'Mobile: bottom sheet. Desktop: centred. Escape and backdrop click close it.',
      'Circular X close button top-right; heading in the display font.',
    ],
  },
  input: {
    name: 'input',
    summary: 'Recessed field with a border-only focus and an eyebrow label above it.',
    classes: {
      dark:
        "input: 'w-full bg-[#222831] border border-[#393E46] text-[#EEEEEE] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ADB5] transition-colors placeholder:text-[#EEEEEE]/30' (font-size 16px)\n" +
        "label: 'block text-xs text-[#EEEEEE]/50 mb-1 uppercase tracking-wider'\n" +
        "textarea: add 'resize-none'",
      light:
        "input: 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none transition-colors'\n" +
        "label: 'label-eyebrow mb-1 block'  (.6875rem, 600, tracking .08em, uppercase, text-gray-500)",
    },
    rules: [
      'Recessed: dark uses the page-background colour inside a secondary-colour border; light uses bg-gray-50.',
      'No focus ring. focus:outline-none and change the border colour to the accent.',
      'Every field gets an uppercase tracked-out eyebrow label above it.',
      'rounded-xl; 16px font to avoid iOS zoom.',
    ],
  },
  nav: {
    name: 'nav',
    summary: 'Floating glass pill (dark) or sticky glassy bar (light) with a glowing active state.',
    classes: {
      dark:
        "container: 'fixed left-1/2 -translate-x-1/2 z-50' bottom: calc(20px + env(safe-area-inset-bottom))\n" +
        "pill: 'flex items-center gap-1 p-1.5 rounded-full' style { background: 'rgba(34,40,49,0.65)', backdropFilter: 'blur(28px) saturate(160%)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset' }\n" +
        "item: 'relative flex items-center justify-center rounded-full w-11 h-11 transition-all duration-200', icon size 18, strokeWidth 2.5 active / 1.75 idle\n" +
        "active fill: absolute inset-0 rounded-full, background linear-gradient(145deg, #00C9D2, #008f96), boxShadow 0 0 16px rgba(0,173,181,0.5); icon colour #222831 (idle rgba(238,238,238,0.45))\n" +
        "entrance: y 80 -> 0, opacity, 0.6s back.out(1.7)",
      light:
        "bar: 'sticky top-0 z-30 rounded-b-[2rem] bg-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md'\n" +
        "wordmark: 'font-display text-lg font-extrabold tracking-tight' first syllable text-brand-600, rest text-gray-900\n" +
        "link: 'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors'\n" +
        "active: 'bg-brand-50 text-brand-700'  idle: 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'",
    },
    rules: [
      'Always glassy: translucent background plus heavy backdrop blur.',
      'Active state is a rounded-full pill with a gradient (dark: plus a 16px accent glow).',
      'Split-colour wordmark: first syllable accent, second neutral, in the display font.',
      'Respect safe-area insets on mobile.',
    ],
  },
  tabs: {
    name: 'tabs',
    summary: 'Recessed track with a solid accent active tab.',
    classes: {
      dark:
        "track: 'flex gap-1 bg-[#222831] rounded-xl p-1 overflow-x-auto'\n" +
        "tab: 'shrink-0 flex-1 px-3 py-2 min-h-11 sm:min-h-0 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap'\n" +
        "active: 'bg-[#00ADB5] text-[#222831]'  idle: 'text-[#EEEEEE]/50 hover:text-[#EEEEEE]'",
      light: "same structure on a bg-gray-100 track; active 'bg-white text-brand-700 shadow-sm'",
    },
    rules: ['Track is recessed, active tab is the accent, rounded-xl track with rounded-lg tabs.'],
  },
  badge: {
    name: 'badge',
    summary: 'Small tinted pill for status.',
    classes: {
      dark:
        "base: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'\n" +
        "accent 'bg-[#00ADB5]/20 text-[#00ADB5]'; success 'bg-green-500/20 text-green-400'; warning 'bg-yellow-500/20 text-yellow-400'; danger 'bg-red-500/20 text-red-400'; muted 'bg-[#EEEEEE]/10 text-[#EEEEEE]/50'",
      light: "same shapes with bg-{colour}-100 text-{colour}-700",
    },
    rules: ['Tinted background at ~20% with matching text colour. rounded-full.'],
  },
  'section-header': {
    name: 'section-header',
    summary: 'Eyebrow section title with a muted subtitle.',
    classes: {
      dark:
        "title: 'text-[#EEEEEE]/60 text-xs font-semibold uppercase tracking-widest'\nsubtitle: 'text-[#EEEEEE]/30 text-xs mt-0.5'\npage title: display font, 'text-xl md:text-2xl font-extrabold tracking-tight'",
      light: "title: 'label-eyebrow'  page title: font-display font-extrabold",
    },
    rules: ['Section titles are uppercase tracked-out eyebrows, never big bold headings.'],
  },
  toast: {
    name: 'toast',
    summary: 'Dark glassy pill, regardless of the app base theme.',
    classes: {
      dark: "'rounded-full px-5 py-3 text-[#EEEEEE] backdrop-blur-md' style background rgba(20,20,24,0.85), border 1px solid rgba(255,255,255,0.08); entrance toast-in (translateY -10px + scale .96 -> 1)",
      light:
        "'fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 animate-fade-up items-center gap-2 rounded-full px-5 py-3 text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md' style background rgba(20,20,24,0.85); border 1px solid rgba(255,255,255,0.08)",
    },
    rules: ['Always dark glass, even on light apps.', 'rounded-full pill, auto-dismiss ~1.8s.'],
  },
  'empty-state': {
    name: 'empty-state',
    summary: 'Icon tile or emoji plus one line of personality copy.',
    classes: {
      dark:
        "wrapper: 'flex flex-col items-center justify-center py-16 text-center select-none'\n" +
        "icon tile: 'w-20 h-20 rounded-2xl flex items-center justify-center text-5xl mb-4' style { background: 'rgba(0,173,181,0.08)', border: '1px solid rgba(0,173,181,0.12)' }\n" +
        "title: 'text-[#EEEEEE]/70 font-semibold text-base mb-1'  description: 'text-[#EEEEEE]/30 text-sm max-w-xs'",
      light: "wrapper 'flex flex-col items-center gap-2 py-12 text-center', emoji 'text-3xl', copy 'text-sm text-gray-400'",
    },
    rules: ['Never a bare "No data". Emoji or accent-tinted icon tile plus one line with personality.'],
  },
  skeleton: {
    name: 'skeleton',
    summary: 'Shimmer placeholder for loading content.',
    classes: {
      dark:
        ".skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 37%, rgba(255,255,255,0.04) 63%); background-size: 400% 100%; animation: skeleton-shimmer 1.6s ease infinite; }\n@keyframes skeleton-shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }",
      light: "same shimmer using rgba(0,0,0,0.04) / rgba(0,0,0,0.08)",
    },
    rules: ['Use shimmer skeletons instead of spinners for content areas.'],
  },
  avatar: {
    name: 'avatar',
    summary: 'Coloured initial-letter circles for lists of named things.',
    classes: {
      dark: "'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold' cycling tinted pairs from the accent family (bg-accent/20 text-accent, then lighter and deeper steps of the scale)",
      light: "same, cycling brand-100/brand-700, brand-200/brand-800, brand-50/brand-600",
    },
    rules: ['Use for any list of named things (products, people, categories).', 'Cycle a small accent-family palette by index.'],
  },
}

export function listComponents(): string[] {
  return Object.keys(COMPONENTS)
}

export function globalCss(brandVars: string, theme: Theme): string {
  if (theme === 'dark') {
    return `@import "tailwindcss";

@theme {
  --color-primary: ${DARK_TOKENS.primary};
  --color-secondary: ${DARK_TOKENS.secondary};
  --color-accent: ${DARK_TOKENS.accent};
  --color-light: ${DARK_TOKENS.light};
${brandVars}
  --font-sans: 'Satoshi', system-ui, sans-serif;
  --font-display: 'Syne', system-ui, sans-serif;
}

body {
  margin: 0;
  background-color: var(--color-primary);
  color: var(--color-light);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-synthesis: none;
  min-height: 100dvh;
}

h1, h2, h3 { font-family: var(--font-display); }

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
button, a, [role='button'] { touch-action: manipulation; cursor: pointer; }

/* Prevent iOS zoom on input focus */
input, select, textarea { font-size: 16px !important; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-secondary); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-accent); }

@keyframes toast-in {
  from { opacity: 0; transform: translateY(-10px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes skeleton-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 37%, rgba(255,255,255,0.04) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.6s ease infinite;
}
`
  }
  return `@import "tailwindcss";

@theme {
${brandVars}
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-display: 'Sora', system-ui, sans-serif;

  --animate-fade-up: fade-up 0.3s ease-out;
  --animate-modal-in: modal-in 0.18s ease-out;

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes modal-in {
    from { opacity: 0; transform: scale(0.97) translateY(6px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
}

body { margin: 0; font-family: var(--font-sans); -webkit-font-smoothing: antialiased; min-height: 100dvh; }
h1, h2, h3 { font-family: var(--font-display); }
* { -webkit-tap-highlight-color: transparent; }
button, a, [role='button'] { touch-action: manipulation; cursor: pointer; }

.label-eyebrow {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-gray-500);
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-brand-200); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-brand-500); }
`
}
