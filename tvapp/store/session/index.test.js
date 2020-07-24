import clearConfiguration from 'global-configuration/clear'
import setConfiguration from 'global-configuration/set'
import configuration from 'global-configuration'
import * as sessionModule from '../session'

beforeEach(() => {
  // Injecting custom session resolver
  const sessionGetter = jest.fn(() => Promise.resolve({ token: 'it-is' })) // Promise.resolve({ token: 'it-is' })
  setConfiguration({ sessionGetter }, { assign: true })
})

afterEach(() => {
  clearConfiguration()
})

describe('embed/store/session/guest', () => {
  it('withSession decorated fn should receive resolved session', async () => {
    const { sessionGetter } = configuration

    const decorated = sessionModule.withSession(({ session }) => session)
    const called = await decorated({ session: 'will-be-populated-here' })

    expect(called).toEqual({ token: 'it-is' })
    expect(sessionGetter).toHaveBeenCalledTimes(1)
  })
})
