import { describe, expect, it } from 'vitest'
import { reviewUi } from '../src/review.js'

const rules = (code: string, theme: 'dark' | 'light' = 'dark') => reviewUi(code, theme).map((f) => f.rule)

describe('review_ui', () => {
  it('flags focus rings and unrecessed rounded-lg inputs', () => {
    const r = rules('<input className="rounded-lg border focus:ring-2 focus:ring-blue-500" />')
    expect(r).toContain('input-focus-ring')
    expect(r).toContain('input-recessed')
    expect(r).toContain('input-rounding')
  })

  it('accepts a Hootang-style input', () => {
    const code =
      '<input className="w-full bg-[#222831] border border-[#393E46] text-[#EEEEEE] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ADB5] transition-colors" />'
    expect(rules(code)).toEqual([])
  })

  it('flags flat buttons without press animation', () => {
    const r = rules('<button onClick={go} className="bg-blue-600 text-white rounded-md px-4 py-2">Go</button>')
    expect(r).toContain('cursor-pointer')
    expect(r).toContain('button-press')
    expect(r).toContain('button-gradient')
  })

  it('accepts a Hootang-style button', () => {
    const code =
      '<button className="inline-flex items-center gap-2 transition-all duration-150 cursor-pointer active:scale-95 bg-gradient-to-r from-[#00ADB5] to-[#008f96] rounded-xl px-4 py-2">Save</button>'
    expect(rules(code)).toEqual([])
  })

  it('flags flat opaque cards and small rounding', () => {
    const r = rules('<div className="rounded-lg border bg-white shadow-md p-4">x</div>')
    expect(r).toContain('card-translucent')
    expect(r).toContain('card-rounding')
  })

  it('accepts a light-variant card', () => {
    const code = '<div className="rounded-2xl border border-black/5 bg-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm">x</div>'
    expect(rules(code, 'light')).toEqual([])
  })

  it('flags modal overlay without blur and bare empty state', () => {
    expect(rules('<div className="fixed inset-0 bg-black/50 flex">x</div>')).toContain('modal-overlay-blur')
    expect(rules('<p>No data</p>')).toContain('empty-state-copy')
  })

  it('flags non-eyebrow labels', () => {
    expect(rules('<label className="text-sm font-bold">Name</label>')).toContain('label-eyebrow')
    expect(rules('<label className="block text-xs mb-1 uppercase tracking-wider">Name</label>')).toEqual([])
  })
})
