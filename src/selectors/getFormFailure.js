// @flow
import type { Structure, GetFormState } from '../types'
import type { GetFormFailureInterface } from './getFormFailure.types'

const createGetFormFailure = ({ getIn }: Structure<*, *>) => (
  form: string,
  getFormState: ?GetFormState
): GetFormFailureInterface => (state: any) => {
  const nonNullGetFormState: GetFormState =
    getFormState || (state => getIn(state, 'form'))
  return getIn(nonNullGetFormState(state), `${form}.failure`)
}

export default createGetFormFailure
