import * as core from './core'

describe('core', () => {
  describe('.distribute', () => {
    it('distributes the units', () => {
      expect(core.distribute(0, [1, 2, 3])).toEqual([0, 0, 0])
      expect(core.distribute(1, [1, 2, 3])).toEqual([1, 0, 0])
      expect(core.distribute(2, [1, 2, 3])).toEqual([1, 1, 0])
      expect(core.distribute(3, [1, 2, 3])).toEqual([1, 1, 1])
      expect(core.distribute(4, [1, 2, 3])).toEqual([1, 2, 1])
      expect(core.distribute(5, [1, 2, 3])).toEqual([1, 2, 2])
      expect(core.distribute(6, [1, 2, 3])).toEqual([1, 2, 3])
      expect(core.distribute(7, [1, 2, 3])).toEqual([1, 2, 3])
    })
  })
})
