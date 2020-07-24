import { filterCurrentInViewport, sortByOtherArray } from './utils'

describe('embed/store/utils', () => {
  it('should filter object of in viewport ids', () => {
    const inViewportIds = {
      id1: false,
      id2: true,
      id3: true
    }
    const filtered = filterCurrentInViewport(inViewportIds)
    expect(filtered).toEqual(['id2', 'id3'])
  })

  it('should sort array by other array', () => {
    const reference = [1, 2, 3, 4, 5]
    const arr = [5, 3]
    const sorted = sortByOtherArray(arr, reference)

    expect(sorted).toEqual([3, 5])
  })
})
