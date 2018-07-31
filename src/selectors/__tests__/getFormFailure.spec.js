import createGetFormFailure from '../getFormFailure'
import plain from '../../structure/plain'
import plainExpectations from '../../structure/plain/__tests__/expectations'
import immutable from '../../structure/immutable'
import immutableExpectations from '../../structure/immutable/__tests__/expectations'

const describeGetFormFailure = (name, structure, setup) => {
  const getFormFailure = createGetFormFailure(structure)

  const { fromJS, getIn } = structure

  describe(name, () => {
    beforeAll(() => {
      setup()
    })

    it('should return a function', () => {
      expect(typeof getFormFailure('foo')).toBe('function')
    })

    it('should return failure when it is presented', () => {
      expect(
        getFormFailure('foo')(
          fromJS({
            form: {
              foo: {
                failure: 'Wow'
              }
            }
          })
        )
      ).toBe('Wow')
    })

    it('should return undefined when it is not presented', () => {
      expect(
        getFormFailure('foo')(
          fromJS({
            form: {}
          })
        )
      ).toBe(undefined)
    })

    it('should use getFormState if provided', () => {
      expect(
        getFormFailure('foo', state => getIn(state, 'someOtherSlice'))(
          fromJS({
            someOtherSlice: {
              foo: {
                failure: 'Wow'
              }
            }
          })
        )
      ).toBe('Wow')
    })
  })
}

describeGetFormFailure('getFormFailure.plain', plain, () =>
  expect.extend(plainExpectations)
)
describeGetFormFailure('getFormFailure.immutable', immutable, () =>
  expect.extend(immutableExpectations)
)
