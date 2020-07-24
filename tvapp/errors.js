export class AppError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AppError'
  }
}

export class LocalStorageError extends AppError {
  constructor(message) {
    super(message)
    this.name = 'LocalStorageError'
  }
}

export class SessionError extends AppError {
  constructor(message) {
    super(message)
    this.name = 'SessionError'
  }
}
