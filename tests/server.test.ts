import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

let client: Client

const textOf = (res: unknown) => ((res as { content: { text: string }[] }).content[0]?.text ?? '')

beforeAll(async () => {
  const transport = new StdioClientTransport({ command: 'node', args: ['dist/index.js'] })
  client = new Client({ name: 'test', version: '0.0.0' })
  await client.connect(transport)
})

afterAll(async () => {
  await client.close()
})

describe('mcp server (stdio)', () => {
  it('lists the tools', async () => {
    const { tools } = await client.listTools()
    expect(tools.map((t) => t.name).sort()).toEqual(
      ['generate_palette', 'get_component_rules', 'get_foundations', 'get_starter_css', 'list_components', 'review_ui'].sort(),
    )
  })

  it('generates a tailwind palette', async () => {
    const res = await client.callTool({ name: 'generate_palette', arguments: { accent_hex: '#00ADB5' } })
    expect(textOf(res)).toContain('--color-brand-500: #00adb5;')
  })

  it('returns Hootang button classes by default', async () => {
    const res = await client.callTool({ name: 'get_component_rules', arguments: { component: 'button' } })
    expect(textOf(res)).toContain('from-[#00ADB5] to-[#008f96]')
  })

  it('returns light variant on request and errors on unknown components', async () => {
    const light = await client.callTool({ name: 'get_component_rules', arguments: { component: 'card', theme: 'light' } })
    expect(textOf(light)).toContain('bg-white/90')
    const bad = await client.callTool({ name: 'get_component_rules', arguments: { component: 'carousel' } })
    expect((bad as { isError?: boolean }).isError).toBe(true)
  })

  it('reviews code', async () => {
    const res = await client.callTool({ name: 'review_ui', arguments: { code: '<input className="focus:ring-2" />' } })
    expect(textOf(res)).toContain('input-focus-ring')
  })

  it('serves the overview resource', async () => {
    const { resources } = await client.listResources()
    expect(resources.map((r) => r.uri)).toContain('design-system://overview')
    const res = await client.readResource({ uri: 'design-system://overview' })
    expect(res.contents[0].text).toContain('Hootang')
  })
})
