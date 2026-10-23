import { describe, expect, it } from 'vitest'
import { generatePalette, hexToHsl, hslToHex, normalizeHex } from '../src/palette.js'

describe('palette', () => {
  it('normalises hex', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc')
    expect(normalizeHex('00adb5')).toBe('#00adb5')
    expect(() => normalizeHex('nope')).toThrow(/Invalid hex/)
  })

  it('round-trips hex through hsl', () => {
    for (const hex of ['#00adb5', '#ff4081', '#393e46', '#222831']) {
      const back = hslToHex(hexToHsl(hex))
      expect(back).toBe(hex)
    }
  })

  it('keeps hue and saturation across stops and steps lightness', () => {
    const base = hexToHsl('#00adb5')
    const p = generatePalette('#00adb5')
    expect(Object.keys(p)).toEqual(['50', '100', '200', '300', '500', '600', '700', '800'])
    for (const stop of Object.values(p)) {
      const h = hexToHsl(stop)
      expect(Math.abs(h.h - base.h)).toBeLessThan(2)
    }
    expect(p[500]).toBe('#00adb5')
    expect(p[600]).toBe('#00adb5')
    expect(Math.round(hexToHsl(p[50]).l)).toBeGreaterThanOrEqual(95)
    expect(hexToHsl(p[700]).l).toBeLessThan(hexToHsl(p[500]).l)
    expect(hexToHsl(p[800]).l).toBeLessThan(hexToHsl(p[700]).l)
  })
})
