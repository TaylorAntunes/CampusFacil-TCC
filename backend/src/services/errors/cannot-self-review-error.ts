export class CannotSelfReviewError extends Error {
  constructor() {
    super('Cannot self-review an advertisement.')
  }
}
