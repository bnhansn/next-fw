import * as helpersModule from './helpers'

describe('embed/store/session/helpers', () => {
  it('isExpired should return true if date is expired', () => {
    const minute = 60 * 1000
    const expiredDate = new Date(new Date().getTime() - minute)
    expect(helpersModule.isExpired(expiredDate)).toBe(true)
    expect(helpersModule.isExpired(false)).toBe(true)
  })

  it('isExpired should return false if date is not expired', () => {
    const minute = 60 * 1000
    const expiredDate = new Date(new Date().getTime() + minute)
    expect(helpersModule.isExpired(expiredDate)).toBe(false)
  })
})
