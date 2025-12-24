import { describe, it, expect } from 'vitest'
import { debounce, clamp } from 'lodash'

describe('lodash utilities', () => {
  it('debounce delays function execution', async () => {
    let callCount = 0
    const fn = debounce(() => {
      callCount++
    }, 50)

    fn()
    fn()
    fn()

    expect(callCount).toBe(0)

    await new Promise(resolve => setTimeout(resolve, 100))
    expect(callCount).toBe(1)
  })

  it('clamp restricts value to range', () => {
    expect(clamp(-10, 0, 100)).toBe(0)
    expect(clamp(50, 0, 100)).toBe(50)
    expect(clamp(150, 0, 100)).toBe(100)
  })
})

describe('coordinate formatting', () => {
  it('formats longitude correctly', () => {
    const lng = -74.0242
    expect(lng.toFixed(4)).toBe('-74.0242')
  })

  it('formats latitude correctly', () => {
    const lat = 40.6941
    expect(lat.toFixed(4)).toBe('40.6941')
  })

  it('formats zoom correctly', () => {
    const zoom = 10.12
    expect(zoom.toFixed(2)).toBe('10.12')
  })
})
