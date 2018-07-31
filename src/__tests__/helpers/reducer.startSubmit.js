import actions from '../../actions'
const { startSubmit } = actions

const describeStartSubmit = (reducer, expect, { fromJS }) => () => {
  it('should set submitting and delete failure on startSubmit', () => {
    const state = reducer(
      fromJS({
        foo: {
          doesnt: 'matter',
          should: 'notchange',
          failure: 'failure'
        }
      }),
      startSubmit('foo')
    )
    expect(state).toEqualMap({
      foo: {
        doesnt: 'matter',
        should: 'notchange',
        submitting: true
      }
    })
  })

  it('should set submitting on startSubmit, and NOT reset submitFailed', () => {
    const state = reducer(
      fromJS({
        foo: {
          doesnt: 'matter',
          should: 'notchange',
          submitFailed: true
        }
      }),
      startSubmit('foo')
    )
    expect(state).toEqualMap({
      foo: {
        doesnt: 'matter',
        should: 'notchange',
        submitting: true,
        submitFailed: true
      }
    })
  })
}

export default describeStartSubmit
