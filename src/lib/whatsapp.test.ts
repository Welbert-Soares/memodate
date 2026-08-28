import { afterEach, describe, expect, test, vi } from 'vitest'
import { sendWhatsapp } from './whatsapp'

describe('sendWhatsapp', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('resolves true when the CallMeBot request succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    const result = await sendWhatsapp('5511999999999', 'apikey123', 'Olá!')

    expect(result).toBe(true)
  })

  test('resolves false when the CallMeBot request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    const result = await sendWhatsapp('5511999999999', 'apikey123', 'Olá!')

    expect(result).toBe(false)
  })
})
