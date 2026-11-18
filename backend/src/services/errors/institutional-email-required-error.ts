export class InstitutionalEmailRequiredError extends Error {
  constructor() {
    super('O cadastro é permitido apenas com e-mail institucional @ifce.edu.br.')
  }
}
