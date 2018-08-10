// @flow
import isPromise from 'is-promise'
import type { Dispatch } from 'redux'
import type { Props } from './createReduxForm'
import SubmissionError from './SubmissionError'
import SubmissionFailureError from './SubmissionFailureError'

type SubmitFunction = {
  (values: any, dispatch: Dispatch<*>, props: Object): any
}

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
    let error
    if (submitError instanceof SubmissionError) {
      error = submitError.errors
    } else if (submitError instanceof SubmissionFailureError) {
      error = submitError.message
    }

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
    const errors = { ...asyncErrors, ...syncErrors }
    if (onSubmitFail) {
      onSubmitFail(errors, dispatch, null, props)
    }
    return errors
  }
}

export default handleSubmit
