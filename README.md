# design-system-mcp

An [MCP](https://modelcontextprotocol.io) server that exposes a personal design system to AI clients (Claude Code, Claude Desktop, Cursor, ...). It lets an AI build UI in a consistent style instead of default-looking output.

**Hootang** (dark, teal) is the reference implementation. **UbatLog** (light, pink) is the light variant of the same structure. The structure is the signature, not the colours: one accent hex drives the palette, everything else is shape, type, motion and micro-details.

## Tools

| Tool | What it does |
|---|---|
| `generate_palette` | One accent hex -> 8-stop scale (50-800), same hue/saturation. Output as Tailwind v4 `@theme`, CSS variables, or JSON. |
| `get_foundations` | Tokens, fonts, rounding scale, surfaces, glow, motion, micro-details, the eyebrow-label signature. |
| `list_components` | Components that have documented rules. |
| `get_component_rules` | Exact class strings and rules for button, card, modal, input, nav, tabs, badge, section-header, toast, empty-state, skeleton, avatar. `theme`: `dark` (default) or `light`. |
| `get_starter_css` | Ready `index.css` for a new Tailwind v4 project from an accent hex. |
| `review_ui` | Checks a JSX/HTML snippet against the rules and lists violations with fixes. |

Resource: `design-system://overview`.

### What `review_ui` checks

Focus rings (banned), missing `cursor-pointer`, call-to-action buttons without a press animation or gradient, flat opaque cards, wrong rounding, non-recessed inputs, non-eyebrow labels, modal overlays without blur, bare "No data" empty states.

It reads class strings only. Classes built from variables (`${baseClass}`) are skipped for absence checks rather than guessed. It is a linter for common drift, not a visual review. The Hootang components pass it cleanly (see `tests`).

## Use

```bash
npm install
npm run build
claude mcp add design-system -- node /absolute/path/to/design-system-mcp/dist/index.js
```

Then ask your assistant things like "build a settings page with the design system" or "review this component against the design system".

## Develop

```bash
npm test      # palette maths, linter rules, and an end-to-end stdio client against the built server
```

Rules live in `src/rules.ts`, the linter in `src/review.ts`, the palette generator in `src/palette.ts`.
