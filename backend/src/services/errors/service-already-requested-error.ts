export class ServiceAlreadyRequestedError extends Error {
  readonly statusCode = 409
  constructor() {
    super('Service already requested.')
  }
}
