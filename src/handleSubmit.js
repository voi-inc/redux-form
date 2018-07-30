// @flow
import { Iterable } from 'immutable'
import isPromise from 'is-promise'
import SubmissionError from './SubmissionError'
import type { Dispatch } from 'redux'
import type { Props } from './createReduxForm'

type SubmitFunction = {
  (values: any, dispatch: Dispatch<*>, props: Object): any
}

const mergeErrors = ({ asyncErrors, syncErrors }) =>
  asyncErrors && Iterable.isIterable(asyncErrors)
    ? asyncErrors.merge(syncErrors).toJS()
    : { ...asyncErrors, ...syncErrors }

const handleSubmit = (
  submit: SubmitFunction,
  props: Props,
  valid: boolean,
  asyncValidate: Function,
  fields: string[]
) => {
  const {
    dispatch,
    onSubmitFail,
    onSubmitSuccess,
    startSubmit,
    stopSubmit,
    setSubmitFailed,
    setSubmitSucceeded,
    syncErrors,
    asyncErrors,
    touch,
    values,
    persistentSubmitErrors
  } = props

  const handleSuccess = (result: any): any => {
    setSubmitSucceeded()
    if (onSubmitSuccess) {
      onSubmitSuccess(result, dispatch, props)
    }
    return result
  }

  const handleError = (submitError: any): any => {
    const error =
      submitError instanceof SubmissionError ? submitError.errors : undefined
    stopSubmit(error)
    setSubmitFailed(...fields)
    if (onSubmitFail) {
      onSubmitFail(error, dispatch, submitError, props)
    }
    // re-throw if unrecognized error and no onSubmitFail callback defined
    if (!error && !onSubmitFail) {
      throw submitError
    }
    return error
  }

  touch(...fields) // mark all fields as touched

  if (valid || persistentSubmitErrors) {
    const doSubmit = () => {
      let result
      try {
        result = submit(values, dispatch, props)
      } catch (submitError) {
        return handleError(submitError)
      }
      if (isPromise(result)) {
        startSubmit()
        return result.then(
          submitResult => {
            stopSubmit()
            return handleSuccess(submitResult)
          },
          submitError => {
            return handleError(submitError)
          }
        )
      }
      return handleSuccess(result)
    }

    const asyncValidateResult = asyncValidate && asyncValidate()
    if (asyncValidateResult) {
      return asyncValidateResult
        .then(asyncErrors => {
          if (asyncErrors) {
            throw asyncErrors
          }
          return doSubmit()
        })
        .catch(asyncErrors => {
          setSubmitFailed(...fields)
          if (onSubmitFail) {
            onSubmitFail(asyncErrors, dispatch, null, props)
          }
          return Promise.reject(asyncErrors)
        })
    } else {
      return doSubmit()
    }
  } else {
    setSubmitFailed(...fields)
    const errors = mergeErrors({ asyncErrors, syncErrors })
    if (onSubmitFail) {
      onSubmitFail(errors, dispatch, null, props)
    }
    return errors
  }
}

export default handleSubmit
