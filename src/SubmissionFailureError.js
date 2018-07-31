// @flow
import ExtendableError from 'es6-error'

// SubmissionFailureError does not extend functionality. It is defined as a
// mechanism to determine error type in `handleSumit`
class SubmissionFailureError extends ExtendableError {}
export default SubmissionFailureError
