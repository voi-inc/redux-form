import actions from '../../actions'
const { clearFailure } = actions

const describeClearFailure = (reducer, expect, { fromJS }) => () => {
  it('should do nothing on clear failure with no previous state', () => {
    const state = reducer(undefined, clearFailure('foo'))
    expect(state).toEqualMap({
      foo: {}
    })
  })

  it('should clear failure with previous state', () => {
    const state = reducer(
      fromJS({
        foo: {
          doesnt: 'matter',
          should: 'notchange',
          failure: 'failure'
        }
      }),
      clearFailure('foo')
    )
    expect(state).toEqualMap({
      foo: {
        doesnt: 'matter',
        should: 'notchange'
      }
    })
  })
}

export default describeClearFailure
